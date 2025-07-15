import {spawn} from "bun";
import {writeFile, readFile, rm, access, mkdtemp} from "fs/promises";
import {tmpdir} from "os";
import {join} from "path";
import MimeTypeUtils from "./MimeTypeUtils.ts";

// const JOB_STATUS_URL = Bun.env.JOB_STATUS_URL ?? "http://localhost:3000/job-status"; // Spin API Gateway
//
// // Helper to update job status
// async function reportJobStatus(job_id: string, status: "completed" | "failed", message?: string) {
//     try {
//         await fetch(JOB_STATUS_URL, {
//             method: "POST",
//             headers: {"Content-Type": "application/json"},
//             body: JSON.stringify({job_id, status, message}),
//         });
//         console.log(`[JOB STATUS] Reported '${status}' for job ${job_id}`);
//     } catch (err) {
//         console.error(`[JOB STATUS ERROR] Failed to report job ${job_id}:`, err);
//     }
// }

async function processJob({
                              job_id,
                              input_path,
                              output_path,
                              input_format,
                              output_format,
                          }: {
    job_id: string;
    input_path: string;
    output_path: string;
    input_format: string;
    output_format: string;
}): Promise<void> {
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
            stderr: "inherit",
        });

        //@ts-ignore
        const {code} = await ffmpeg.exited;
        console.log(`[FFMPEG] exited with code: ${code}`);

        try {
            await access(outputFile);
        } catch {
            throw new Error(`ffmpeg exited with code ${code}, and no output was produced`);
        }

        const outputBuffer = await readFile(outputFile);

        const mimeType = MimeTypeUtils.getMimeFromExtension(output_format);
        console.log(`[UPLOAD] PUT → ${output_path} (type: ${mimeType})`);
        const uploadRes = await fetch(output_path, {
            method: "PUT",
            headers: {
                "Content-Type": mimeType,
            },
            body: outputBuffer,
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }
        console.log(`[UPLOAD] Upload successfully`);

        // await reportJobStatus(job_id, "completed");
        await fetch('http://127.0.0.1:3000/finished', {
            method: "POST",
            body: JSON.stringify({
                job_id,
                output_url: output_path
            }),
        }).then((response) => console.log(response)).catch(error => console.log(error));
    } catch (err) {
        console.error(`[PROCESS ERROR] Job ${job_id}:`, err);
        await fetch('http://127.0.0.1:3000/failed', {
            method: "POST",
            body: JSON.stringify({
                job_id,
                error: err,
                attempt: 0
            })
        }).catch(error => console.log(error));
        // await reportJobStatus(job_id, "failed", String(err));
    } finally {
        await rm(tmpDir, {recursive: true, force: true});
    }
}

// Bun server handler
Bun.serve({
    port: 8081,
    async fetch(req) {
        if (req.method !== "POST") {
            return new Response("Method Not Allowed", {status: 405});
        }

        try {
            const body: any = await req.json();
            await processJob(body);
            return new Response(JSON.stringify({status: "processing", job_id: body.job_id}), {
                headers: {"Content-Type": "application/json"},
            });
        } catch (err) {
            console.error(`[WORKER ERROR]`, err);
            return new Response(JSON.stringify({error: String(err)}), {
                status: 500,
                headers: {"Content-Type": "application/json"},
            });
        }
    },
});
