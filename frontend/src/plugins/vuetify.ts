/**
 * Plugin initialization for Vuetify.
 * Don't modify this file unless you know what you're doing.
 *
 * @author Jackson Bingham (jackson@onlineimage.com)
 * May 2025
 */

import "@mdi/font/css/materialdesignicons.css";
//@ts-ignore
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { md3 } from "vuetify/blueprints/md3";
import type { App } from "vue";

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const vuetify = createVuetify({
    blueprint: md3,
    components,
    directives,
    theme: {
        defaultTheme: prefersDark ? "dark" : "light",
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: "#0071ce",
                    secondary: "#202945",
                },
            },
            dark: {
                dark: true,
                colors: {
                    primary: "#0071ce",
                    secondary: "#202945",
                },
            },
        },
    },
    icons: {
        defaultSet: "mdi", // This is already the default value - only for display purposes
    },
    defaults: {
        VBtn: { color: "default" },
        VCheckbox: { color: "primary", density: "compact" },
        VTextField: { density: "compact", variant: "outlined" },
        VSelect: { density: "compact", variant: "outlined" },
        VCombobox: { density: "compact", variant: "outlined" },
        VTextarea: { density: "compact", variant: "outlined" },
    },
});

const vuetifyPlugin = {
    install(app: App) {
        app.use(vuetify);
    },
};

export default vuetifyPlugin;