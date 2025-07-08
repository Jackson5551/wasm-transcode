
// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';

let router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
  .get('/', () => new Response('Hello, Spin!'))
  .get('/hello/:name', ({ name }) => `Hello, ${name}!`)
  .post('/process', async (request) => {
    const job = await request.json();

    // Simulate processing
    console.log('[SPIN] Received job:', job);

    // (Optional) Send progress/status back to API
    await fetch('http://localhost:8900/api/jobs/job-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: job.job_id,
        status: 'processing',
        message: 'Started transcoding',
      }),
    });

    // Perform the actual work...

    return new Response('Job received');
  });

//@ts-ignore
addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request));
});

