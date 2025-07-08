import dotenv from 'dotenv';
import axios from 'axios';
import { getConnection } from './db.js';
import { logStatus } from './utils.js';

dotenv.config();

async function pollAndDispatch() {
    const conn = await getConnection();

    try {
        await conn.beginTransaction();

        // Lock a queued job
        const [rows] = await conn.execute(`
      SELECT * FROM Jobs
      WHERE status = 'queued'
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE;
    `);

        if (rows.length === 0) {
            await conn.commit();
            console.log('[QUEUE] No jobs found');
            return;
        }

        const job = rows[0];

        // Mark as processing
        await conn.execute(`
      UPDATE Jobs
      SET status = 'processing', updated_at = NOW()
      WHERE id = ?
    `, [job.id]);

        // Insert status update
        await conn.execute(`
      INSERT INTO JobStatusUpdates (job_id, status, message, created_at)
      VALUES (?, ?, ?, NOW())
    `, [job.id, 'processing', `Dispatched to Spin by ${process.env.WORKER_ID}`]);

        await conn.commit();
        logStatus(job.id, 'processing', 'Job locked and marked as processing');

        // Send job to Spin
        const res = await axios.post(process.env.SPIN_ENDPOINT, {
            job_id: job.id,
            input_format: job.input_format,
            output_format: job.output_format,
            input_path: job.input_path,
        });

        if (res.status >= 200 && res.status < 300) {
            logStatus(job.id, 'dispatched', 'Job sent to Spin worker successfully');
        } else {
            throw new Error(`Spin responded with status ${res.status}`);
        }
    } catch (err) {
        await conn.rollback();
        console.error('[ERROR]', err);
    } finally {
        await conn.end();
    }
}

// ⏲️ Poll every 5 seconds
setInterval(() => {
    pollAndDispatch().catch(console.error);
}, 5000);
