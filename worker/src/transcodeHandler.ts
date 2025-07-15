export async function handleRequest(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body = await req.json();
        const { job_id, input_path, output_path, input_format, output_format, api_gateway_url} = body;

        console.log(`[SPIN WORKER] Forwarding job ${job_id} to native worker...`);

        // Fire and forget: Send job to native worker
        const workerRes = await fetch('http://localhost:8081/transcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_id,
                input_path,
                output_path,
                input_format,
                output_format,
                api_gateway_url
            })
        });

        // if (!workerRes.ok) {
        //     const errText = await workerRes.text();
        //     console.error('[NATIVE WORKER ERROR]', errText);
        //     return new Response(errText, { status: 500 });
        // }

        // ✔️ Return success immediately (don't wait for processing)
        console.log(`[SPIN WORKER] Job ${job_id} dispatched.`);
        return new Response(JSON.stringify({ status: "accepted", job_id }), {
            status: 202,
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
