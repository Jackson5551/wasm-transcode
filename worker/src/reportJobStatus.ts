async function reportJobStatus(
    job_id: string,
    status: "completed" | "failed",
    message?: string
) {
    await fetch("http://localhost:8900/api/jobs/job-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            job_id,
            status,
            message,
        }),
    }).catch(err => {
        console.error("[JOB-STATUS ERROR]", err);
        console.error(`[JOB-STATUS ERROR] Failed to report job ${job_id}:`, err);
    });
}

export default reportJobStatus;