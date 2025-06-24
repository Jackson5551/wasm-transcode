<script setup lang="ts">
import SideNav from "../components/SideNav.vue";
import TopBar from "../components/TopBar.vue";
import { ref } from "vue";

const drawer = ref<boolean>(true)

</script>
<template>
    <SideNav v-model="drawer"></SideNav>
    <TopBar @toggle-drawer="drawer = !drawer"></TopBar>
    <v-main>
        <v-container>
            <slot />
        </v-container>
    </v-main>
</template>
