import { Request, RequestHandler, Response } from "express";
import JobService from "../Services/JobService";
import { IJobForm } from "../Models/Job";
import DataSanitizer from "../utils/DataSanitizer";
import S3Service from "../Services/S3Service";
import * as crypto from "node:crypto";
import { log } from "../Logger"

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
            if (!file) return res.status(400).json({ msg: "No file uploaded" });

            const jobData = req.body ?? {};
            const allowedKeys: (keyof IJobForm)[] = ["input_format", "output_format"];
            const filteredData = DataSanitizer.filterAllowedKeys<IJobForm>(jobData, allowedKeys);

            // 1. Create job first
            const [success, job, error] = await JobService.createJob(filteredData);

            if (!success || !job) {
                return res.status(500).json({ error: `Could not create job. ${error}` });
            }

            // 2. Generate S3 key using job.id
            const extension = file.mimetype.split("/")[1];
            const key = `jobs/${job.id}/${crypto.randomBytes(20).toString('hex')}.${extension}`;

            log("cyan", "UPLOAD", "Starting upload to s3");
            // 3. Upload file to S3
            const [s3_success, s3_file_info, s3_error] = await S3Service.uploadFile(file, key);
            log("cyan", "UPLOAD", "Finished upload to s3");
            if (!s3_success || !s3_file_info) {
                return res.status(500).json({ error: `S3 upload failed: ${s3_error}` });
            }

            // 4. Update job with input_file URL
            const fileUrl = s3_file_info.url; // or your logic for URL generation
            const [updateSuccess, updatedJob, updateError] = await JobService.setInputFile(job.id, fileUrl);

            if (!updateSuccess || !updatedJob) {
                return res.status(500).json({ error: `Failed to update job: ${updateError}` });
            }

            // await fetch('http://localhost:3000/process', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         job_id: updatedJob.id,
            //         input_url: updatedJob.input_path,
            //         input_format: updatedJob.input_format,
            //         output_format: updatedJob.output_format,
            //     }),
            // });

            return res.status(201).json({ job: updatedJob });

        } catch (error) {
            return res.status(500).json({ error: `Could not create job. ${error}` });
        }
    }


    public async show(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const [success, job, error] = await JobService.getJobById(id);

            if (!success) {
                return res.status(500).json({ error: `Could not find job. ${error}` });
            }

            if (!job) {
                return res.status(404).json({ error: 'Job not found.' });
            }

            return res.status(200).json({ job });
        } catch (error) {
            return res.status(500).json({ error: `Could not find job. ${error}` });
        }
    }

    public async update(req: Request, res: Response) { }

    public async delete(req: Request, res: Response) { }

    public async status(req: Request, res: Response) { }
}

export default new JobController();