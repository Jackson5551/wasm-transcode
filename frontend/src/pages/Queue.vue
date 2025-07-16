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
const submitJobDialog = ref<boolean>(false);

const { handleSubmit, resetForm } = useForm({
  validationSchema: yup.object({
    file: yup.mixed<File>().required("Please select a file"),
    output_format: yup.string().required("Choose a target format"),
  }),
});

const fileUpload = useField<File>("file");
const output_format = useField<string>("mp3");

const submitJob = handleSubmit(async (values) => {
  console.log("submitJob");
  loading.value = true;
  try {
    // Example API call (adjust for your backend)
    const formData = new FormData();
    formData.append("file", values.fileUpload);
    formData.append("input_format", values.fileUpload.name.split('.').pop()?.toLowerCase());
    formData.append("output_format", values.output_format);

    const res = await fetch("http://localhost:8900/api/jobs", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Job submission failed");

    // Optional: Update job list or notify user
    submitJobDialog.value = false;
    resetForm();
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  } finally {
    loading.value = false;
  }
});

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
  <v-dialog scrollable persistent v-model="submitJobDialog" width="auto">
    <v-card title="Submit a Job" width="400">
      <v-card-text>
        <v-file-input
            v-model="fileUpload.value.value"
            label="Select a file to transcode"
            density="compact"
            accept="audio/*,video/*"
            :error-messages="fileUpload.errorMessage.value"
        ></v-file-input>
        <v-select
            v-model="output_format.value.value"
            label="Target format"
            :items="['mp3', 'aac', 'wav']"
            :error-messages="output_format.errorMessage.value"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="submitJobDialog = false" :disabled="loading">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="submitJob()" color="primary" variant="flat" :loading="loading">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>