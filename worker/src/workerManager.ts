type WorkerMeta = {
    id: string;
    address: string;
    status: 'idle' | 'working';
};

type Job = {
    job_id: string;
    input_path: string;
    output_path: string;
    input_format: string;
    output_format: string;
};

const workers: Map<string, WorkerMeta> = new Map();
const jobQueue: Job[] = [];

export async function registerWorker(id: string, address: string) {
    workers.set(id, { id, address, status: 'idle' });
    console.log("Worker registered with id ", id);
    await tryDispatch();
}

export function updateWorkerStatus(id: string, status: 'idle' | 'working') {
    const worker = workers.get(id);
    if (worker) {
        worker.status = status;
    }
}

export async function addJob(job: Job) {
    jobQueue.push(job);
    await tryDispatch();
}

export function getWorkers(): WorkerMeta[] {
    return Array.from(workers.values());
}

async function tryDispatch() {
    console.log("Trying dispatch");
    console.log(jobQueue);
    console.log(workers);
    if (jobQueue.length === 0) return;

    for (const [id, worker] of workers) {
        if (worker.status === 'idle') {
            const job = jobQueue.shift();
            if (!job) return;

            worker.status = 'working';

            try {
                console.log(worker.address + "/transcode");
                const res = await fetch(worker.address + "/transcode", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(job),
                });

                if (!res.ok) throw new Error(`Dispatch failed: ${res.statusText}`);
            } catch (err) {
                console.error(`[DISPATCH ERROR]`, err);
                jobQueue.unshift(job); // requeue
                worker.status = 'idle';
            }
        }
    }
}


