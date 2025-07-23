<template>
  <v-card class="mx-auto my-4" max-width="1000">
    <v-card-title>Active Workers</v-card-title>
    <v-data-table
        :items="workers"
        :headers="headers"
        :loading="loading"
        class="elevation-1"
        item-value="id"
    >
      <template #item.last_seen="{ item }">
        <span>{{ formatRelativeTime(item.last_seen) }}</span>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VCard, VCardTitle, VDataTable, VChip } from 'vuetify/components';

interface WorkerMeta {
  id: string;
  job_id: string;
  status: string;
  last_seen: number;
}

const workers = ref<WorkerMeta[]>([]);
const loading = ref(true);

const headers = [
  { title: 'Worker ID', key: 'id' },
  { title: 'Job ID', key: 'job_id' },
  { title: 'Status', key: 'status' },
  { title: 'Last Seen', key: 'last_seen' },
];

function statusColor(status: string): string {
  switch (status) {
    case 'idle':
      return 'blue';
    case 'working':
      return 'green';
    case 'failed':
      return 'red';
    default:
      return 'grey';
  }
}

function formatRelativeTime(timestamp: number): string {
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  return `${Math.floor(secondsAgo / 3600)}h ago`;
}

async function fetchWorkers() {
  try {
    const res = await fetch('http://10.10.1.2:8900/workers');
    if (!res.ok) throw new Error('Failed to fetch workers');
    workers.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchWorkers();
  setInterval(fetchWorkers, 5000); // Refresh every 5s
});
</script>
