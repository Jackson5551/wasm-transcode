import express, {Router, Request, Response} from "express";
import multer from "multer";
import JobController from "../Controllers/JobController";
import {Job, File} from "../Models";
import {log} from "../Logger";
import MimeTypeUtils from "../utils/MimeTypeUtils";

const router: Router = express.Router();

const upload = multer({
    limits: {fileSize: 10 * 1000 * 1000},
    dest: __dirname + "/uploads/",
}); // Temporary Storage

//@ts-ignore
router.post("/", upload.single("file"), JobController.store);
//@ts-ignore
router.get("/", JobController.index);
//@ts-ignore
router.post('/job-status', async (req, res) => {
    const {job_id, status, message} = req.body;
    console.log("[PROCESS-FINISHED] Job status", status);
    // Update job in DB
    await Job.update({status}, {where: {id: job_id}});
    log("cyan", `[STATUS]`, `Job ${job_id} → ${status}: ${message}`);

    if (status === 'completed') {
        const job = await Job.findOne({where: {id: job_id}});
        if (!job) {
            return res.status(404)
        }

        const public_s3_url = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/jobs/${job_id}/output.${job.output_format}`;
        console.log(public_s3_url);
        const response = await fetch(public_s3_url, {method: 'HEAD'});
        if (!response.ok) {
            return res.status(404).json({ error: 'Object not found in S3' });
        }
        const size = Number(response.headers.get('content-length'));
        console.log("[PROCESS-FINISHED] Job size", size);
        const newFile = await File.create({
            job_id: job_id,
            type: "output",
            path: public_s3_url,
            size: size,
            mimetype: MimeTypeUtils.getMimeFromExtension(job.output_format),
        });

        return res.sendStatus(201).json({file: newFile});
    }

    if (status === 'failed') {
        return res.sendStatus(200);
    }

});

export default router as Router;