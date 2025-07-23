// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import {AutoRouter} from 'itty-router';
import * as transcodeHandler from "./transcodeHandler"
import * as processFinishedHandler from "./processFinishedHandler";
import * as processFailedHandler from "./processFailedHandler";
import * as registerHandler from "./registerHandler";

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get('/', () => new Response('Hello, Spin!'))
    .post('/register', registerHandler.handleRequest)
    .post('/process', transcodeHandler.handleRequest)
    .post('/finished', processFinishedHandler.handleRequest)
    .post('/failed', processFailedHandler.handleRequest)

let started = false;

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});

