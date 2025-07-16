// WorkerManager.ts
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

export type WorkerMeta = {
    id: string;
    job_id?: string;
    status?: string;
    last_seen?: number;
};

export class WorkerManager {
    private _wss: WebSocketServer;
    private _workers: Map<WebSocket, WorkerMeta> = new Map();

    constructor(server: http.Server) {
        this._wss = new WebSocketServer({ server });
        this.setup();
    }

    private setup(): void {
        this._wss.on('connection', (ws) => {
            console.log('Worker connected.');

            ws.on('message', (msg: string) => {
                try {
                    const data = JSON.parse(msg.toString());
                    switch (data.type) {
                        case 'register':
                            this.registerWorker(ws, data);
                            break;
                        case 'heartbeat':
                            this.updateHeartbeat(ws, data);
                            break;
                        case 'job_complete':
                            this.handleJobComplete(ws, data);
                            break;
                        case 'job_error':
                            this.handleJobError(ws, data);
                            break;
                        default:
                            console.warn('Unknown message type:', data.type);
                    }
                } catch (e) {
                    console.error('Invalid JSON from worker:', e);
                }
            });

            ws.on('close', () => {
                this.unregisterWorker(ws);
            });
        });
    }

    private registerWorker(ws: WebSocket, data: { id: string; job_id?: string; status?: string }) {
        this._workers.set(ws, {
            id: data.id,
            job_id: data.job_id,
            status: data.status,
            last_seen: Date.now(),
        });
        console.log(`Registered worker: ${data.id}`);
    }

    private updateHeartbeat(ws: WebSocket, data: { id: string; job_id?: string; status?: string }) {
        const worker = this._workers.get(ws);
        if (worker) {
            worker.job_id = data.job_id;
            worker.status = data.status;
            worker.last_seen = Date.now();
            console.log(`Heartbeat from ${worker.id}`);
        }
    }

    private handleJobComplete(ws: WebSocket, data: any) {
        const worker = this._workers.get(ws);
        if (worker) {
            worker.status = 'idle';
            worker.job_id = undefined;
            console.log(`Job complete from ${worker.id}:`, data);
        }
    }

    private handleJobError(ws: WebSocket, data: any) {
        const worker = this._workers.get(ws);
        if (worker) {
            worker.status = 'error';
            console.error(`Job error from ${worker.id}:`, data);
        }
    }

    private unregisterWorker(ws: WebSocket) {
        const worker = this._workers.get(ws);
        if (worker) {
            console.log(`Worker disconnected: ${worker.id}`);
        }
        this._workers.delete(ws);
    }

    public getActiveWorkers(): WorkerMeta[] {
        return Array.from(this._workers.values());
    }

    public dispatchJob(workerId: string, job: any): boolean {
        const ws = [...this._workers.entries()].find(([_, meta]) => meta.id === workerId)?.[0];
        if (!ws || ws.readyState !== WebSocket.OPEN) return false;

        ws.send(JSON.stringify({ type: 'run_job', ...job }));
        console.log(`Job dispatched to ${workerId}`);
        return true;
    }
}


// import { Server as SocketServer, Socket } from "socket.io";
//
// type WorkerMeta = {
//     id: string,
//     job_id?: string;
//     status?: string;
//     last_seen?: number;
// }
//
// export class WorkerManager {
//     private _io: SocketServer;
//     private _workers: Map<string, WorkerMeta> = new Map();
//
//     constructor(io: SocketServer) {
//         this._io = io;
//         this.setup();
//     }
//
//     private setup(): void {
//         this._io.on('connection', (socket: Socket) => {
//             console.log(`Worker connected: ${socket.id}`);
//
//             socket.on('register', (data: { id: string, job_id: string; status: string }) => {
//                 this.registerWorker(socket, data);
//             });
//
//             socket.on('heartbeat', (data: { id: string, job_id: string; status: string }) => {
//                 this.updateHeartbeat(socket, data);
//             });
//
//             socket.on('disconnect', () => {
//                 this.unregisterWorker(socket);
//             });
//         });
//     }
//
//     private registerWorker(socket: Socket, data: { id: string, job_id: string; status: string }): void {
//         this._workers.set(socket.id, {
//             id: data.id,
//             job_id: data.job_id,
//             status: data.status,
//             last_seen: Date.now(),
//         });
//
//         console.log(`Registered worker: ${data.id}`);
//     }
//
//     private updateHeartbeat(socket: Socket, data: { id: string, job_id: string; status: string }): void {
//         const worker = this._workers.get(socket.id);
//         if (worker) {
//             worker.last_seen = Date.now();
//             worker.id = data.id;
//             worker.job_id = data.job_id;
//             worker.status = data.status;
//             console.log(`Heartbeat received from ${worker.id}`);
//         }
//     }
//
//     private unregisterWorker(socket: Socket): void {
//         const worker = this._workers.get(socket.id);
//         if (worker) {
//             console.log(`Worker disconnected: ${worker.id}`);
//         }
//         this._workers.delete(socket.id);
//     }
//
//     public getActiveWorkers(): WorkerMeta[] {
//         return Array.from(this._workers.values());
//     }
//
//     public getWorkerById(workerId: string): WorkerMeta | undefined {
//         return [...this._workers.values()].find((w) => w.id === workerId);
//     }
// }