<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const showPreview = ref(false)
const selectedMedia = ref(null)

const mediaFiles = ref([
    // Example data — replace with API data
    { id: 'm1', name: 'song-transcoded.mp3', type: 'audio/mpeg', format: 'mp3', size: '3 MB', url: 'https://example.com/song.mp3' },
    { id: 'm2', name: 'clip-transcoded.mp4', type: 'video/mp4', format: 'mp4', size: '10 MB', url: 'https://example.com/clip.mp4' },
])

const tableHeaders = [
    { title: 'File Name', key: 'name' },
    { title: 'Format', key: 'format' },
    { title: 'Size', key: 'size' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const filteredMedia = computed(() => {
    if (!search.value) return mediaFiles.value
    return mediaFiles.value.filter(file =>
        file.name.toLowerCase().includes(search.value.toLowerCase())
    )
})

function previewMedia(item) {
    selectedMedia.value = item
    showPreview.value = true
}

function downloadMedia(item) {
    window.open(item.url, '_blank')
}

function deleteMedia(item) {
    console.log('Delete media:', item)
    // TODO: API call to delete + refresh mediaFiles
    mediaFiles.value = mediaFiles.value.filter(f => f.id !== item.id)
}
</script>
<template>
    <v-container>
        <v-card class="pa-4">
            <v-card-title>
                My Media / Storage
            </v-card-title>

            <v-card-text>
                <v-text-field v-model="search" label="Search files" prepend-icon="mdi-magnify" clearable class="mb-4" />

                <v-data-table :headers="tableHeaders" :items="filteredMedia" class="elevation-1" :items-per-page="10">
                    <template #item.actions="{ item }">
                        <v-btn icon @click="previewMedia(item)">
                            <v-icon>mdi-eye</v-icon>
                        </v-btn>
                        <v-btn icon @click="downloadMedia(item)">
                            <v-icon>mdi-download</v-icon>
                        </v-btn>
                        <v-btn icon color="error" @click="deleteMedia(item)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <!-- Preview Dialog -->
        <v-dialog v-model="showPreview" max-width="600">
            <v-card>
                <v-card-title>Preview: {{ selectedMedia?.name }}</v-card-title>
                <v-card-text>
                    <template v-if="selectedMedia?.type.startsWith('audio')">
                        <audio :src="selectedMedia.url" controls style="width:100%"></audio>
                    </template>
                    <template v-else-if="selectedMedia?.type.startsWith('video')">
                        <video :src="selectedMedia.url" controls style="width:100%"></video>
                    </template>
                    <template v-else>
                        <p>Unsupported media type</p>
                    </template>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="showPreview = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
