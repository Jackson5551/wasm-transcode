import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import vuetifyPlugin from "./plugins/vuetify";
import routerPlugin from './plugins/router';

const app = createApp(App);

app.use(vuetifyPlugin);
app.use(routerPlugin);

app.mount("#app");
