<script setup>
import {ref} from 'vue'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const files = ref([])
const targetFormats = ref([])
const availableFormats = ['mp3', 'wav', 'mp4', 'ogg']

function onFileSelect(files) {
  // Optional: Validate or process file info
  console.log('Selected files:', files)
}

async function submitUploads() {
  console.log('Submitting files:', files.value)
  console.log('Target formats:', targetFormats.value)
  // TODO: Call API to POST /transcode with files + targetFormats
  // Then update recentUploads or trigger refresh
  for (const file of files.value) {
    const inputFormat = file.name.split('.').pop() ?? 'bin'
    const fileName = file.name

    for (const outputFormat of targetFormats.value) {
      try {
        const form = new FormData()
        form.append('file', file, fileName)
        form.append('input_format', inputFormat)
        form.append('output_format', outputFormat)

        const res = await fetch(`http://${apiBaseUrl}/api/jobs`, {
          method: 'POST',
          body: form,
        })

        if (!res.ok) throw new Error('Upload failed')

        const { job_id, input_url, output_url } = await res.json()
        console.log(`Job created:`, { job_id, input_url, output_url })

      } catch (err) {
        console.log(err)
      }
      }
    }
  }
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title>
        Upload Media File
      </v-card-title>

      <v-card-text>
        <v-file-input v-model="files" label="Select or drop media files" multiple show-size
                      prepend-icon="mdi-cloud-upload" accept="audio/*,video/*" @change="onFileSelect"/>

        <v-select v-model="targetFormats" :items="availableFormats" label="Target Format(s)" multiple chips
                  class="mt-4"/>

        <v-btn :disabled="!files.length || !targetFormats.length" color="primary" class="mt-4"
               @click="submitUploads">
          Submit
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>


  
