import {spawn} from "bun";
import {writeFile, readFile, rm, access, mkdtemp} from "fs/promises";
import {tmpdir} from "os";
import {join} from "path";
import MimeTypeUtils from "./MimeTypeUtils.ts";
import {io} from "socket.io-client";

const SOCKET_URL = Bun.env.SOCKET_URL ?? "http://localhost:3000";
const WORKER_ID = crypto.randomUUID();
const WORKER_ADDRESS = Bun.env.PUBLIC_URL ?? "http://localhost:8081";
let currentJobId = "";
let currentStatus = "idle";

const socket = io(SOCKET_URL, {
    transports: ["websocket"],
});

socket.on("connect", () => {
    console.log(`[SOCKET] Connected as ${socket.id}`);
    socket.emit("register", {
        id: WORKER_ID,
        address: WORKER_ADDRESS,
        job_id: currentJobId,
        status: currentStatus,
    });
});

setInterval(() => {
    socket.emit("heartbeat", {
        id: WORKER_ID,
        address: WORKER_ADDRESS,
        job_id: currentJobId,
        status: currentStatus,
    });
}, 5000);

socket.on("disconnect", () => {
    console.log(`[SOCKET] Disconnected`);
});

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

    currentJobId = job_id;
    currentStatus = "processing";

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
        currentStatus = "idle";
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
