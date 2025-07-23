import cron from 'node-cron';
import {Job, JobStatusUpdate, sequelize} from "../Models";
import {log} from "../Logger";
import axios from "axios";
import {JobStatus} from "../Enums/JobStatus";
import {manager} from "../index";

/**
 * Cron that sends ready jobs to the workers.
 * Runs every 5 seconds.
 *
 */
cron.schedule('*/5 * * * * *', async () => {
    try {
        const result = await sequelize.transaction(async (t) => {
            // Lock a queued job
            const jobs = await Job.findAll({
                where: {
                    status: 'queued',
                    ready: true,
                },
                order: [['created_at', 'ASC']],
                limit: 1,
                lock: t.LOCK.UPDATE,
                transaction: t,
            });

            if (jobs.length === 0) {
                // console.log('[QUEUE] No jobs found');
                return null;
            }

            const job = jobs[0];

            // Mark as processing
            job.status = JobStatus.PROCESSING;
            job.updated_at = new Date();
            await job.save({ transaction: t });

            // Insert status update
            await JobStatusUpdate.create(
                {
                    job_id: job.id,
                    status: 'processing',
                    created_at: new Date(),
                },
                { transaction: t }
            );

            log('cyan', 'processing', 'Job locked and marked as processing');

            return job;
        });

        if (!result) return;

        const job = result;

        const workers = manager.getActiveWorkers();

        for (const worker of workers) {
            if(worker.status === 'idle') {
                // Send job to Spin
                const res = await axios.post(
                    worker.address! + '/process',
                    {
                        job_id: job.id,
                        input_format: job.input_format,
                        output_format: job.output_format,
                        input_path: job.input_path,
                        output_path: job.output_path,
                        api_gateway_url: process.env.API_GATEWAY_URL,
                    }
                );

                if (res.status >= 200 && res.status < 300) {
                    log('cyan', 'dispatched', 'Job sent to Spin worker successfully');
                } else {
                    throw new Error(`Spin responded with status ${res.status}`);
                }
            }
        }
    } catch (err) {
        console.error('[ERROR]', err);
    }
});