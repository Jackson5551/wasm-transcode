import { spawn } from "bun";
import { writeFile, readFile, rm, access, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import MimeTypeUtils from "./MimeTypeUtils.ts";

/**
 * Transcodes a file using native ffmpeg
 */
Bun.serve({
    port: 8081,
    async fetch(req) {
        if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

        //@ts-ignore
        const { job_id, input_path, output_path, input_format, output_format } = await req.json();

        console.log(`[NATIVE WORKER] Received job ${job_id}`);

        const inputName = `input.${input_format}`;
        const outputName = `output.${output_format}`;
        const tmpDir = await mkdtemp(join(tmpdir(), "transcode-"));
        const inputFile = join(tmpDir, inputName);
        const outputFile = join(tmpDir, outputName);

        try {
            const inputRes = await fetch(input_path);
            if (!inputRes.ok) throw new Error(`Failed to fetch input file: ${inputRes.statusText}`);
            const inputBuffer = Buffer.from(await inputRes.arrayBuffer());

            await writeFile(inputFile, inputBuffer);

            console.log(`[FFMPEG] Running: ${inputFile} → ${outputFile}`);
            const ffmpeg = spawn({
                cmd: ["ffmpeg", "-y", "-i", inputFile, outputFile],
                stdout: "inherit",
                stderr: "inherit"
            });

            //@ts-ignore
            const { code } = await ffmpeg.exited;
            console.log(`[FFMPEG] exited with code: ${code}`);
            try {
                await access(outputFile); // throws if file doesn't exist
            } catch {
                throw new Error(`ffmpeg exited with code ${code}, and no output was produced`);
            }


            await access(outputFile);

            const outputBuffer = await readFile(outputFile);

            console.log(`[UPLOAD] PUT → ${output_path}`);
            const mimeType = MimeTypeUtils.getMimeFromExtension(output_format);
            console.log(`[UPLOAD] Mime Type: ${mimeType}`);
            const uploadRes = await fetch(output_path, {
                method: "PUT",
                headers: {
                    "Content-Type": mimeType
                },
                body: outputBuffer,
            });

            if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);

            return new Response(JSON.stringify({ status: "ok", job_id }), {
                headers: { "Content-Type": "application/json" }
            });

        } catch (err) {
            console.error(`[WORKER ERROR] ${err}`);
            return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
        } finally {
            await rm(tmpDir, { recursive: true, force: true });
        }
    }
});
