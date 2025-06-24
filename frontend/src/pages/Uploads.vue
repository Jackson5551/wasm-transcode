<script setup>
import { ref } from 'vue'

const files = ref([])
const targetFormats = ref([])
const availableFormats = ['mp3', 'wav', 'mp4', 'ogg']

const recentUploads = ref([
    // Example data; replace with API-loaded jobs
    { id: 'job123', name: 'song.wav', status: 'queued', outputUrl: '' },
    { id: 'job124', name: 'video.mp4', status: 'done', outputUrl: 'https://example.com/output/video.mp4' },
])

const tableHeaders = [
    { title: 'Job ID', key: 'id' },
    { title: 'File Name', key: 'name' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions', sortable: false },
]

function onFileSelect(files) {
    // Optional: Validate or process file info
    console.log('Selected files:', files)
}

function submitUploads() {
    console.log('Submitting files:', files.value)
    console.log('Target formats:', targetFormats.value)
    // TODO: Call API to POST /transcode with files + targetFormats
    // Then update recentUploads or trigger refresh
}

function viewJob(item) {
    console.log('View job details:', item)
    // TODO: Navigate to job detail page or open dialog
}

function downloadOutput(item) {
    if (item.outputUrl) {
        window.open(item.outputUrl, '_blank')
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
                    prepend-icon="mdi-cloud-upload" accept="audio/*,video/*" @change="onFileSelect" />

                <v-select v-model="targetFormats" :items="availableFormats" label="Target Format(s)" multiple chips
                    class="mt-4" />

                <v-btn :disabled="!files.length || !targetFormats.length" color="primary" class="mt-4"
                    @click="submitUploads">
                    Submit
                </v-btn>
            </v-card-text>
        </v-card>

        <v-card class="mt-6">
            <v-card-title>
                Recent Uploads
            </v-card-title>
            <v-data-table :headers="tableHeaders" :items="recentUploads" class="elevation-1">
                <template #item.actions="{ item }">
                    <v-btn icon @click="viewJob(item)">
                        <v-icon>mdi-eye</v-icon>
                    </v-btn>
                    <v-btn icon @click="downloadOutput(item)" :disabled="!item.outputUrl">
                        <v-icon>mdi-download</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>


  
