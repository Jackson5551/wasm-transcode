<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import axios from "axios";
import Utils from "../utils";

const search = ref('')
const selectedMedia = ref(null)

const tableHeaders = [
  {title: "Name", key: "job.file_name"},
  // {title: 'File Name', key: 'name'},
  {title: 'Format', key: 'format'},
  {title: 'Size', key: 'size'},
  {title: 'Actions', key: 'actions', sortable: false},
]

function downloadMedia(item) {
  window.open(item.path, '_blank')
}

const tableData = ref({
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  data: []
})

const files = computed(() => {
  return tableData.value.data;
})

const loading = ref(false);
const fetchMedia = async ({page, itemsPerPage}) => {
  console.log(page);
  console.log(itemsPerPage);
  await axios.get(`http://localhost:8900/api/files?page=${page}&limit=${itemsPerPage}`).then((response) => {
    console.log(response.data)
    tableData.value = response.data
  }).catch(error => console.log(error))
}

onMounted(() => {
  fetchMedia({page: tableData.value.currentPage, itemsPerPage: 10});
})
</script>
<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title>
        My Media / Storage
      </v-card-title>

      <v-card-text>
<!--        <v-text-field v-model="search" label="Search files" prepend-icon="mdi-magnify" clearable class="mb-4"/>-->

        <v-data-table-server :headers="tableHeaders" :items="files" class="elevation-1" :items-per-page="10"
                             :items-length="tableData.totalItems" :page="tableData.currentPage" :loading="loading"
                             @update:options="fetchMedia">
          <template #item.format="{item}">
            {{`${item.job.input_format} -> ${item.job.output_format}`}}
          </template>
          <template #item.size="{value}">
            {{Utils.formatFileSize(value)}}
          </template>
          <template #item.actions="{ item }">
            <v-btn icon @click="downloadMedia(item)">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>
