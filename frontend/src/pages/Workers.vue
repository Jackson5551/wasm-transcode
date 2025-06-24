<script setup lang="ts">
import type { ReadonlyHeaders } from '../types/ReadOnlyHeaders';

const headers: ReadonlyHeaders = [
    {
        title: "Worker ID",
        key: "id",
        sortable: false,
    },
    {
        title: "Health",
        key: "health",
        sortable: false,
    },
    {
        title: "Uptime",
        key: "uptime",
        sortable: false,
    },
    {
        title: "Active Jobs",
        key: "jobs",
        sortable: false,
    },
    {
        title: "Last Check-in",
        key: "check-in",
        sortable: false,
    },
]
</script>
<template>
    <v-container>
        <v-card>
            <v-toolbar density="compact" title="Workers">
                <template #prepend>
                    <v-icon class="ml-2">mdi-server</v-icon>
                </template>
            </v-toolbar>
            <v-card-text>
                <v-data-table :headers>

                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>