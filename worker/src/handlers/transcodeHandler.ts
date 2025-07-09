export async function handleRequest(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json(); // <-- Fails if body was already consumed

    const { job_id, input_path, output_path, input_format, output_format } = body;

    try {
        console.log(input_path);
        // Step 1: Download input file
        const inputRes = await fetch(input_path);
        if (!inputRes.ok) throw new Error(`Failed to download input file: ${inputRes.statusText}`);
        const inputBuffer = await inputRes.arrayBuffer();

        // Step 2: "Transcode" (placeholder logic here)
        const outputBuffer = await fakeTranscode(inputBuffer, input_format, output_format);

        // Step 3: Upload to output_url
        const uploadRes = await fetch(output_path, {
            method: "PUT",
            headers: {
                "Content-Type": getMimeType(output_format),
                "Content-Length": outputBuffer.byteLength.toString(),
            },
            body: outputBuffer,
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }

        return new Response(JSON.stringify({ status: "ok", job_id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: String(err), job_id }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Dummy transcode step (replace with WASM or ffmpeg.wasm logic)
async function fakeTranscode(buf: ArrayBuffer, inputFmt: string, outputFmt: string): Promise<ArrayBuffer> {
    console.log(`Simulating transcode: ${inputFmt} -> ${outputFmt}`);
    return buf; // No actual processing for now
}

// Basic MIME resolution
function getMimeType(ext: string): string {
    const map: Record<string, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
    };

    return map[ext.toLowerCase()] || "application/octet-stream";
}
