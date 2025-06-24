<script setup lang="ts">
import { useRouter } from "vue-router";

const emit = defineEmits(['toggle-drawer']);

</script>
<template>
    <v-app-bar>
        <v-app-bar-nav-icon @click="emit('toggle-drawer')"></v-app-bar-nav-icon>
        <v-app-bar-title>Wasm Transcode</v-app-bar-title>
        <template #append>
            <v-list density="compact">
                <v-menu>
                    <template #activator="{ props }">
                        <v-btn icon v-bind="props">
                            <!-- <UserAvatar :user="auth?.authState?.user as User" /> -->
                        </v-btn>
                    </template>
                    <v-list density="compact" nav>
                        <!-- <v-list-item :title="auth?.authState?.user?.fullName"
                            :subtitle="auth?.authState?.user?.email"></v-list-item>
                        <v-list-item :href="USER_PROFILE_URL" target="_blank" prepend-icon="mdi-account"
                            title="My Account"></v-list-item> -->
                        <!-- <v-divider class="my-2"></v-divider> -->
                        <v-list-item @click="" prepend-icon="mdi-logout" title="Log Out"></v-list-item>
                    </v-list>
                </v-menu>
            </v-list>
        </template>
    </v-app-bar>
</template>