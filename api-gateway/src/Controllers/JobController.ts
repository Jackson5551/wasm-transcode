import {Request, RequestHandler, Response} from "express";
import JobService from "../Services/JobService";
import {IJobForm, Job} from "../Models/Job";
import DataSanitizer from "../utils/DataSanitizer";
import S3Service from "../Services/S3Service";
import * as crypto from "node:crypto";
import {log} from "../Logger"
import path from "path";
import MimeTypeUtils from "../utils/MimeTypeUtils";

class JobController {
    public async index(req: Request, res: Response) {
        try {
            const itemsPerPage = parseInt(req.query.limit as string) || 50;
            const page = parseInt(req.query.page as string) || 1;
            const sort = (req.query.sort as string) ?? '';
            const search = (req.query.search as string) ?? '';

            const result = JobService.paginateJobs(itemsPerPage, page, sort, search);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                error: `Could not fetch jobs. ${error}`,
            })
        }
    }

    public async store(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({msg: "No file uploaded"});

            const jobData = req.body ?? {};
            const allowedKeys: (keyof IJobForm)[] = ["input_format", "output_format"];
            const filteredData = DataSanitizer.filterAllowedKeys<IJobForm>(jobData, allowedKeys);

            // 1. Create job first
            const [success, job, error] = await JobService.createJob(filteredData);

            if (!success || !job) {
                return res.status(500).json({error: `Could not create job. ${error}`});
            }

            // 2. Generate S3 key using job.id

            // const extension = file.mimetype.split("/")[1];
            const extension = path.extname(file.originalname).replace('.', '') || 'bin';
            const inputKey = `jobs/${job.id}/${crypto.randomBytes(20).toString('hex')}.${extension}`;
            const contentType = file.mimetype;

            log("cyan", "UPLOAD", "Starting upload to s3");
            const [s3_success, s3_file_info, s3_error] = await S3Service.uploadFile(file, inputKey);
            log("cyan", "UPLOAD", "Finished upload to s3");

            if (!s3_success || !s3_file_info) {
                return res.status(500).json({error: `S3 upload failed: ${s3_error}`});
            }

            // 3. Generate presigned GET URL for input file
            const [signedOk, signedInfo, signedError] = await S3Service.generatePresignedUrl(inputKey);
            if (!signedOk || !signedInfo) {
                return res.status(500).json({error: `Could not sign input file: ${signedError}`});
            }

            // 4. Update job with input_path
            const fileUrl = signedInfo.url;
            console.log(fileUrl);
            const [updateSuccess, updatedJob, updateError] = await JobService.setInputFile(job.id, fileUrl);
            if (!updateSuccess || !updatedJob) {
                return res.status(500).json({error: `Failed to update job: ${updateError}`});
            }
            console.log("Job updated with signed Input URL");

            // 5. Generate presigned PUT URL for output
            const ext = job.output_format?.toLowerCase() || 'bin';
            console.log(ext);
            const outputMime = MimeTypeUtils.getMimeFromExtension(ext) || 'application/octet-stream';
            log("cyan", "MIME", `Resolved output MIME type: ${outputMime}`);
            const outputKey = `jobs/${job.id}/output.${job.output_format}`;
            console.log(outputMime, outputKey);
            const [putOk, putInfo, putErr] = await S3Service.generatePutPresignedUrl(outputKey, outputMime);
            console.log(putOk, putInfo, outputMime);
            if (!putOk || !putInfo) {
                return res.status(500).json({error: `Could not generate output URL: ${putErr}`});
            }

            // 6. Optional: store outputKey or URL if needed
            const [setOutputSuccess, finalJobObject, setOutputError] = await JobService.setOutputFile(job.id, putInfo.url);
            console.log(setOutputSuccess, finalJobObject?.output_path);

            if (!setOutputSuccess || !finalJobObject) {
                return res.status(500).json({error: `Failed to update job: ${setOutputError}`});
            }

            // 7. Mark job as ready to be processed
            await Job.update({ready: true}, {
                where: {
                    id: finalJobObject.id
                }
            });

            return res.status(201).json({
                job_id: job.id,
                input_url: updatedJob.input_path,
                output_url: putInfo.url,
            });

        } catch (error) {
            return res.status(500).json({error: `Could not create job. ${error}`});
        }
    }


    public async show(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const [success, job, error] = await JobService.getJobById(id);

            if (!success) {
                return res.status(500).json({error: `Could not find job. ${error}`});
            }

            if (!job) {
                return res.status(404).json({error: 'Job not found.'});
            }

            return res.status(200).json({job});
        } catch (error) {
            return res.status(500).json({error: `Could not find job. ${error}`});
        }
    }

    public async update(req: Request, res: Response) {
    }

    public async delete(req: Request, res: Response) {
    }

    public async status(req: Request, res: Response) {
    }
}

export default new JobController();