import reportJobStatus from "./reportJobStatus";

export async function handleRequest(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { job_id, error, attempt } = await req.json();

        console.error(`[PROCESS-FAILED] Job ${job_id} failed on attempt ${attempt}`);
        console.error(`[ERROR] ${error}`);

        await reportJobStatus(job_id, 'failed', 'Job failed');
        return new Response(
            JSON.stringify({ acknowledged: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("[PROCESS-FAILED ERROR]", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
