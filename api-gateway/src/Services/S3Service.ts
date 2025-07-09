import {
    GetObjectCommand,
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { Readable } from "stream";
import { log } from "../Logger";

interface UploadedFileInfo {
    url: string;
    key: string;
}

interface FetchedFile {
    content: string;
    key: string;
}

interface DeletedFileInfo {
    success: boolean;
    key: string;
}

/**
 * A service for interacting with AWS S3. Includes methods for uploading, retrieving,
 * deleting, and replacing files. Each method returns a tuple in the form:
 *   [success: boolean, result?: T, error?: Error]
 *
 * For missing files (404), the method still returns success=true,
 * but with result=undefined and an error describing the missing file.
 */
class S3Service {
    private _s3: S3Client;
    private readonly _bucket: string;

    constructor() {
        this._s3 = new S3Client({
            credentials: {
                accessKeyId: process.env.S3_KEY!,
                secretAccessKey: process.env.S3_SECRET!,
            },
            endpoint: process.env.S3_ENDPOINT!,
            region: process.env.S3_REGION!,
            forcePathStyle: true
        });

        this._bucket = process.env.S3_BUCKET!;
        log("brightYellow", "S3", `S3Service initialized for bucket: ${this._bucket}`);
    }

    /**
     * Uploads a file to S3.
     * @param file - The file object (e.g. from Multer).
     * @param key - The desired key (path + filename) in S3.
     * @returns A tuple:
     * - `[true, {url, key}]` on success,
     * - `[false, undefined, Error]` on failure.
     *
     * @example
     * const [success, data, error] = await s3.uploadFile(req.file, 'uploads/avatar.png');
     */
    public async uploadFile(file: any, key: string): Promise<[boolean, UploadedFileInfo?, Error?]> {
        try {
            const params = {
                Bucket: this._bucket,
                Key: key,
                Body: fs.createReadStream(file.path),
                ContentType: file.mimetype,
            };

            const data = await new Upload({
                client: this._s3,
                params,
            }).done();

            const url: string = data.Location || '';

            log("green", "UPLOAD", `File uploaded to S3: ${key}`);
            return [true, { url, key }];
        } catch (error: any) {
            log("red", "UPLOAD", `Upload failed for ${key}: ${error.message}`);
            return [false, undefined, error];
        }
    }

    /**
     * Retrieves the content of a file from S3 as a UTF-8 string.
     * @param key - The key of the file in S3.
     * @returns A tuple:
     * - `[true, {content, key}]` if file exists,
     * - `[true, undefined, Error("File ... not found!")]` if not found (404-like),
     * - `[false, undefined, Error]` if another error occurred.
     *
     * @example
     * const [success, file, err] = await s3.getFile('templates/welcome.html');
     */
    public async getFile(key: string): Promise<[boolean, FetchedFile?, Error?]> {
        try {
            const command = new GetObjectCommand({
                Bucket: this._bucket,
                Key: key,
            });

            const response = await this._s3.send(command);

            const stream = response.Body as Readable;
            const chunks: Uint8Array[] = [];

            for await (const chunk of stream) {
                chunks.push(chunk as Uint8Array);
            }

            const content = Buffer.concat(chunks).toString("utf-8");
            log("green", "FETCH", `File fetched from S3: ${key}`);
            return [true, { content, key }];
        } catch (error: any) {
            if (error.name === "NoSuchKey" || error.$metadata.httpStatusCode === 404) {
                log("yellow", "FETCH", `File not found: ${key}`);
                return [true, undefined, new Error(`File ${key} not found!`)];
            }

            log("red", "FETCH", `Failed to fetch file ${key}: ${error.message}`);
            return [false, undefined, error];
        }
    }

    /**
     * Deletes a file from S3.
     * @param key - The key of the file to delete.
     * @returns A tuple:
     * - `[true, {success, key}]` if file was deleted,
     * - `[true, undefined, Error("File ... not found!")]` if not found (404-like),
     * - `[false, undefined, Error]` if another error occurred.
     *
     * @example
     * const [success, info, err] = await s3.deleteFile('uploads/avatar.png');
     */
    public async deleteFile(key: string): Promise<[boolean, DeletedFileInfo?, Error?]> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this._bucket,
                Key: key,
            });

            await this._s3.send(command);

            log("brightYellow", "DELETE", `Deleted file from S3: ${key}`);
            return [true, { success: true, key }];
        } catch (error: any) {
            if (error.name === "NoSuchKey" || error.$metadata.httpStatusCode === 404) {
                log("yellow", "DELETE", `File not found (nothing to delete): ${key}`);
                return [true, undefined, new Error(`File ${key} not found!`)];
            }

            log("red", "DELETE", `Delete failed for ${key}: ${error.message}`);
            return [false, undefined, error];
        }
    }

    /**
     * Replaces a file in S3 by deleting it first, then uploading the new file.
     * @param file - The new file to upload (e.g. from Multer).
     * @param key - The S3 key to overwrite.
     * @returns A tuple:
     * - `[true, UploadedFileInfo]` if file was replaced,
     * - `[false, undefined, Error]` if deletion or upload failed.
     *
     * Note: If the original file does not exist, this still succeeds as an upload-only.
     *
     * @example
     * const [success, result, err] = await s3.replaceFile(req.file, 'users/avatar.png');
     */
    public async replaceFile(file: any, key: string): Promise<[boolean, UploadedFileInfo?, Error?]> {
        const [deleted, _, delErr] = await this.deleteFile(key);

        if (!deleted && delErr) {
            log("red", "REPLACE", `Failed to delete existing file before replace: ${key}`);
            return [false, undefined, delErr];
        }

        const [uploaded, result, uploadErr] = await this.uploadFile(file, key);

        if (!uploaded) {
            log("red", "REPLACE", `Replace failed — upload error for ${key}`);
            return [false, undefined, uploadErr];
        }

        log("green", "REPLACE", `Replaced file in S3: ${key}`);
        return [true, result];
    }

    /**
     * Generates a presigned GET URL for downloading a file from S3.
     * @param key - The S3 key of the file.
     * @param expiresIn - Expiration time in seconds (default: 3600).
     * @returns [success, {url, key}] or [false, undefined, Error]
     */
    public async generatePresignedUrl(
        key: string,
        expiresIn: number = 3600
    ): Promise<[boolean, UploadedFileInfo?, Error?]> {
        try {
            const command = new GetObjectCommand({
                Bucket: this._bucket,
                Key: key,
            });

            // @ts-ignore
            const url = await getSignedUrl(this._s3, command, { expiresIn });

            return [true, { url, key }];
        } catch (error: any) {
            log("red", "SIGNED-URL", `Failed to generate GET presigned URL for ${key}: ${error.message}`);
            return [false, undefined, error];
        }
    }

    public async generatePutPresignedUrl(
        key: string,
        contentType: string,
        expiresIn: number = 3600
    ): Promise<[boolean, UploadedFileInfo?, Error?]> {
        try {
            const command = new PutObjectCommand({
                Bucket: this._bucket,
                Key: key,
                ContentType: contentType,
            });

            // @ts-ignore
            const url = await getSignedUrl(this._s3, command, { expiresIn });

            return [true, { url, key }];
        } catch (error: any) {
            log("red", "SIGNED-URL", `Failed to generate PUT presigned URL for ${key}: ${error.message}`);
            return [false, undefined, error];
        }
    }
}

export default new S3Service();