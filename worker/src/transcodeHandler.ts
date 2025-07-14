export async function handleRequest(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body = await req.json();
        const { job_id, input_path, output_path, input_format, output_format } = body;

        console.log(`[SPIN WORKER] Forwarding job ${job_id} to native worker...`);

        // 🔁 Send job to native worker (Bun service)
        const workerRes = await fetch('http://localhost:8081/transcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_id,
                input_path,
                output_path,
                input_format,
                output_format
            })
        });

        if (!workerRes.ok) {
            const errText = await workerRes.text();
            console.error('[NATIVE WORKER ERROR]', errText);
            return new Response(errText, { status: 500 });
        }

        console.log(`[SPIN WORKER] Job ${job_id} complete.`);
        return new Response(JSON.stringify({ status: "ok", job_id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("[SPIN WORKER ERROR]", err);
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}


// import { transcode } from './transcode';
//
// export async function handleRequest(req: Request): Promise<Response> {
//     if (req.method !== "POST") {
//         return new Response("Method not allowed", { status: 405 });
//     }
//
//     try {
//         const body = await req.json();
//
//         const { job_id, input_path, output_path, input_format, output_format } = body;
//
//         console.log(`[TRANSWORKER] Processing job ${job_id}`);
//         console.log(`[INPUT] ${input_format} from ${input_path}`);
//         console.log(`[OUTPUT] ${output_format} → ${output_path}`);
//
//         // Run actual transcoding logic
//         await transcode(input_path, output_path, input_format, output_format);
//
//         return new Response(JSON.stringify({ status: "ok", job_id }), {
//             status: 200,
//             headers: { "Content-Type": "application/json" },
//         });
//
//     } catch (err) {
//         console.error("[WORKER ERROR]", err);
//         return new Response(JSON.stringify({ error: String(err) }), {
//             status: 500,
//             headers: { "Content-Type": "application/json" },
//         });
//     }
// }
