<script setup lang="ts">
import type {ReadonlyHeaders} from '../types/ReadOnlyHeaders';
import {ref} from "vue";
import * as yup from 'yup';
import {useField, useForm} from "vee-validate";


const headers: ReadonlyHeaders = [
  {
    title: "Job ID",
    key: "id",
    sortable: false,
  },
  {
    title: "Input File",
    key: "file",
    sortable: false,
  },
  {
    title: "Target Format",
    key: "target",
    sortable: false,
  },
  {
    title: "Worker",
    key: "worker",
    sortable: false,
  },
  {
    title: "Status",
    key: "status",
    sortable: false,
  },
  {
    title: "Submitted",
    key: "submitted",
    sortable: false,
  },
  {
    title: "Progress",
    key: "progress",
    sortable: false,
  },
]

const loading = ref<boolean>(false);

</script>
<template>
  <v-container>
    <v-card>
      <v-toolbar density="compact" title="Queue">
        <template #prepend>
          <v-icon class="ml-2">mdi-playlist-check</v-icon>
        </template>
        <template #append>
          <v-btn icon @click="submitJobDialog = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-toolbar>
      <v-card-text>
        <v-data-table :headers>

        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>

</template>