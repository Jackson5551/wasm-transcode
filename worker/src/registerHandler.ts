import { registerWorker } from './workerManager';

export async function handleRequest(request: Request): Promise<Response> {
    const body = await request.json();
    const { id, address } = body;

    if (!id || !address) {
        return new Response("Missing 'id' or 'address'", { status: 400 });
    }

    await registerWorker(id, address);
    return new Response("Worker registered");
}
