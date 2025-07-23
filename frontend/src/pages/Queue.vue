<script setup lang="ts">
import type {ReadonlyHeaders} from '../types/ReadOnlyHeaders';
import {computed, onMounted, ref} from "vue";
import * as yup from 'yup';
import {useField, useForm} from "vee-validate";
import axios from "axios";

interface Job {
  id: string;
  file_name: string;
  input_format: string;
  output_format: string;
  input_path: string;
  output_path: string;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  ready: boolean;
}

const headers: ReadonlyHeaders = [
  { title: 'File', key: 'file_name' },
  { title: 'Input', key: 'input_format' },
  { title: 'Output', key: 'output_format' },
  { title: 'Status', key: 'status' },
  { title: 'Created', key: 'created_at' },
]

const tableData = ref({
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  data: []
})

const jobs = computed(() => {
  return tableData.value.data;
})

const loading = ref<boolean>(false);

const getJobs = async ({page, itemsPerPage}) => {
  console.log(page);
  console.log(itemsPerPage);
  await axios.get(`http://10.10.1.2:8900/api/jobs?page=${page}&limit=${itemsPerPage}`).then((response) => {
    console.log(response.data)
    tableData.value = response.data
  }).catch(error => console.log(error))
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString();
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'green';
    case 'failed':
      return 'red';
    case 'processing':
      return 'blue';
    case 'queued':
      return 'orange';
    default:
      return 'grey';
  }
}

onMounted(async () => {
  await getJobs({page: 1, itemsPerPage: 10});
})

</script>
<template>
  <v-container>
    <v-card class="my-4">
      <v-card-title>Transcode Jobs</v-card-title>

      <v-data-table-server
          :items="jobs"
          :headers="headers"
          class="elevation-1"
          :items-per-page="10"
          :loading="loading"
          :page="tableData.currentPage"
          :items-length="tableData.totalItems"
          @update:options="getJobs"
      >
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>

</template>