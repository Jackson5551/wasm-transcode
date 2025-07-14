import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * Transcodes a file using native ffmpeg binary
 */
export async function transcode(
    inputPath: string,
    outputPath: string,
    inputExt: string,
    outputExt: string
): Promise<void> {
    const inputName = `input.${inputExt}`;
    const outputName = `output.${outputExt}`;

    // Download input file
    const inputRes = await fetch(inputPath);
    if (!inputRes.ok) throw new Error(`Failed to fetch input file: ${inputRes.statusText}`);
    const inputBuffer = Buffer.from(await inputRes.arrayBuffer());

    // Create temp directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ffmpeg-transcode-'));
    const inputFile = path.join(tmpDir, inputName);
    const outputFile = path.join(tmpDir, outputName);

    try {
        // Save input file
        await fs.writeFile(inputFile, inputBuffer);

        // Transcode using native ffmpeg
        console.log(`[FFMPEG] Running: ${inputFile} → ${outputFile}`);
        await runFFmpeg(['-y', '-i', inputFile, outputFile]);

        // Ensure output file exists
        const outputExists = await fileExists(outputFile);
        if (!outputExists) {
            throw new Error(`FFmpeg did not produce output file: ${outputName}`);
        }

        // Read output file
        const outputBuffer = await fs.readFile(outputFile);

        // Upload to outputPath via PUT
        console.log(`[UPLOAD] PUT → ${outputPath}`);
        const uploadRes = await fetch(outputPath, {
            method: 'PUT',
            body: outputBuffer,
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }

        console.log('[TRANSCODE] Completed successfully.');
    } finally {
        // Clean up temp files
        try {
            await fs.rm(tmpDir, { recursive: true, force: true });
        } catch (e) {
            console.warn('[CLEANUP] Failed to remove temp directory:', e);
        }
    }
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', args, { stdio: 'inherit' });

        ffmpeg.on('error', reject);
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        });
    });
}
