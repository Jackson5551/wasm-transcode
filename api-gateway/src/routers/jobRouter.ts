import express, {Router, Request, Response} from "express";
import multer from "multer";
import JobController from "../Controllers/JobController";
import { Job } from "../Models";
import { log } from "../Logger";

const router: Router = express.Router();

const upload = multer({
    limits: {fileSize: 10 * 1000 * 1000},
    dest: __dirname + "/uploads/",
}); // Temporary Storage


//@ts-ignore
router.post("/", upload.single("file"), JobController.store);
//@ts-ignore
router.post('/job-status', async (req, res) => {
  const { job_id, status, message } = req.body;
  console.log("[PROCESS-FINISHED] Job status", status);
  // Update job in DB
  await Job.update({ status }, { where: { id: job_id } });
  log("cyan",`[STATUS]`, `Job ${job_id} → ${status}: ${message}`);
  return res.sendStatus(200);
});

export default router as Router;