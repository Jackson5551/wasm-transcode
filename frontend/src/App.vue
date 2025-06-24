<script setup lang="ts">
import Dashboard from "./pages/Dashboard.vue"
import AppLayout from "./layouts/AppLayout.vue"
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";
import { computed } from "vue";
const route = useRoute();

const theme = useTheme();

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function updateTheme(e: MediaQueryListEvent | MediaQueryList) {
  theme.global.name.value = e.matches ? 'dark' : 'light'
}

// Initial theme sync
updateTheme(mediaQuery)

// Listen for future changes
mediaQuery.addEventListener('change', updateTheme)

const layoutComponent = computed(() => {
  const layout = route.meta.layout ?? 'app'

  if (layout === 'none') return null
  return AppLayout
})

</script>
<template>
  <v-app>
    <component :is="layoutComponent" v-if="layoutComponent">
      <router-view />
    </component>
    <router-view v-else />
  </v-app>

  <!-- <AppLayout>
    <Dashboard></Dashboard>
  </AppLayout> -->

</template>