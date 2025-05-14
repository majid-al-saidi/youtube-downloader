<template>
  <div class="max-h-screen bg-gray-50 text-gray-800 p-6">
    <div class="max-w-lg mx-auto bg-white shadow rounded p-6">

      <!-- URL Input -->
      <div class="flex min-h-full flex-col justify-center  lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
          <img class="mx-auto h-40 w-auto" src="/images/youtube.png" alt="Your Company">
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div class="space-y-6">
            <div>
              <div class="mt-2">
                <input v-model="youtubeUrl" type="text" placeholder="Paste YouTube URL"
                  class="block w-full rounded-md border-0 bg-white/5 py-1.5 font-medium px-4 py-2 text-cyan-600 shadow-sm ring-1 ring-inset ring-red-500 focus:ring-2 focus:ring-inset focus:ring-balck sm:text-sm sm:leading-6">
              </div>
            </div>

            <div>
              <button @click="fetchInfo" :disabled="loading" :class="[
                'w-full flex items-center justify-center text-white py-2 rounded-md transition',
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600']">
                Check Youtube URL</button>
              <div v-if="loading">
              <span class="flex items-center justify-center">
                <img src="/svg/tube-spinner.svg" class="w-20" alt="">
              </span>
              </div>
              
            </div>
          </div>

        </div>
      </div>

      <!-- Video Info -->
      <div v-if="info" class="space-y-4 py-4">
        <hr>
        <div class="flex items-start gap-4">
          <img :src="info.thumbnail" alt="Thumbnail" class="w-24 h-16 object-cover rounded" />
          <div>
            <h2 class="text-lg font-semibold">{{ info.title }}</h2>
            <p class="text-gray-500 text-sm">By: {{ info.author }}</p>
          </div>
        </div>

        <!-- Format selection -->
        <div class="space-y-2">
          <label for="format" class="block text-sm font-medium text-gray-700">Select format</label>
          <select id="format" v-model="selectedFormat" class="w-full p-2 border border-gray-300 rounded">
            <option v-for="format in info.formats" :key="format.format_id" :value="format.format_id">
              {{ format.resolution }} ({{ format.ext }})
            </option>
          </select>

          <button @click="startDownload" :disabled="!selectedFormat"
            class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const youtubeUrl = ref('')
const info = ref(null)
const error = ref(null)
const selectedFormat = ref('')
const loading = ref(false)

const fetchInfo = async () => {

  error.value = ''
  info.value = null
  selectedFormat.value = ''
  loading.value = true

  if (!isValidYoutubeUrl(youtubeUrl.value)) {
    error.value = 'Please enter a valid YouTube URL.'
    loading.value = false
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: youtubeUrl.value })
    })

    if (!res.ok) throw new Error('Invalid response')

    info.value = await res.json()
    selectedFormat.value = info.value.formats[0]?.format_id || ''

  } catch (e) {
    console.error(e)
    error.value = 'Failed to fetch video info.'
  } finally {
    loading.value = false
  }
}

const startDownload = () => {
  const url = `http://localhost:3000/api/download?url=${encodeURIComponent(youtubeUrl.value)}&format=${selectedFormat.value}`
  window.open(url, '_blank')
}

const isValidYoutubeUrl = (url) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
  return pattern.test(url)
}
</script>
