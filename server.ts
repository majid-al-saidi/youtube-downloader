import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { exec } from "child_process";
import { spawn } from "child_process";
import { promisify } from "util";
import { stream } from "hono/streaming";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

const execAsync = promisify(exec);
const app = new Hono();

// 🧠 Get YouTube video info + available formats
app.post("/api/info", async (c) => {
  try {
    const { url } = await c.req.json();
    if (!url || !url.includes("youtube")) {
      return c.text("Invalid URL", 400);
    }

    const { stdout } = await execAsync(`yt-dlp -j "${url}"`);
    const data = JSON.parse(stdout);

    const formats = data.formats.map((f: any) => ({
      format_id: f.format_id,
      ext: f.ext,
      resolution: f.format_note || f.height || "audio",
      filesize: f.filesize,
      acodec: f.acodec,
      vcodec: f.vcodec,
    }));

    return c.json({
      title: data.title,
      author: data.uploader,
      thumbnail: data.thumbnail,
      formats,
    });
  } catch (err: any) {
    console.error("❌ yt-dlp failed:", err);
    return c.text("Internal Server Error", 500);
  }
});

// 📥 Download selected format and stream it back

app.get("/api/download", async (c) => {
  const url = c.req.query("url");
  const format = c.req.query("format");

  if (!url || !format) {
    return c.text("Missing url or format", 400);
  }

  try {
    // Get title, extension, and resolution
    const { stdout } = await execAsync(
      `yt-dlp --print title --print ext --print format_note -f ${format} "${url}"`
    );
    const [titleRaw, extRaw, resolutionRaw] = stdout.trim().split("\n");

    const safeTitle = titleRaw.replace(/[\\/:*?"<>|]/g, "-").trim();
    const ext = extRaw.trim() || "mp4";
    const resolution =
      resolutionRaw?.trim().replace(/[\\/:*?"<>|]/g, "-") || "video";

    const filename = `${safeTitle}-${resolution}.${ext}`;

    const yt = spawn("yt-dlp", ["-f", format, "-o", "-", url], {
      stdio: ["ignore", "pipe", "inherit"],
    });

    saveToHistory({
      url,
      title: safeTitle,
      format_id: format,
      resolution,
      ext,
      filename,
      date: new Date().toISOString(),
    });

    return stream(c, async (streamWriter) => {
      c.header("Content-Disposition", `attachment; filename="${filename}"`);
      c.header("Content-Type", "application/octet-stream");

      for await (const chunk of yt.stdout!) {
        streamWriter.write(chunk);
      }

      streamWriter.close();
    });
  } catch (err: any) {
    console.error("❌ Failed to prepare download:", err);
    return c.text("Error preparing download", 500);
  }
});

// add history
app.get("/api/history", (c) => {
  const history = readHistory();
  return c.json(history);
});

const historyPath = path.join(process.cwd(), "history.json");

// Read the JSON file
function readHistory(): any[] {
  if (!existsSync(historyPath)) return [];
  const raw = readFileSync(historyPath, "utf-8");
  return JSON.parse(raw);
}

// Append a new entry
function saveToHistory(entry: any) {
  const history = readHistory();
  history.unshift(entry); // add newest to top
  writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");
}

// 🏠 Serve static files

// 🚀 Start server
serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("🚀 Server is running at http://localhost:3000");
});
