import reportJobStatus from "./reportJobStatus";

export async function handleRequest(req: Request): Promise<Response> {
    console.log('Handling request to /finished...');
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { job_id, output_url } = await req.json();

        console.log(`[PROCESS-FINISHED] Job ${job_id} completed.`);
        console.log(`[OUTPUT URL] ${output_url}`);

        await reportJobStatus(job_id, 'completed', 'Job completed');

        return new Response(
            JSON.stringify({ received: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("[PROCESS-FINISHED ERROR]", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
