<script setup lang="ts">
import { useNavItems } from "../composables/useNavItems.ts";
import Logo from "./Logo.vue";
// import CRMLogo from "./CRMLogo.vue";

const model = defineModel<boolean>();
const navItems = useNavItems();
</script>

<template>
    <v-navigation-drawer v-model="model">
        <template #prepend>
            <v-list>
                <v-list-item>
                    <Logo/>
                </v-list-item>
                <v-divider></v-divider>
            </v-list>
        </template>
        <v-list nav>
            <v-list-item v-for="(item, index) in navItems" :key="index" :title="item.title" :prepend-icon="item.icon"
                :to="item.to"></v-list-item>
            <v-divider class="my-2"></v-divider>
        </v-list>
    </v-navigation-drawer>
</template>