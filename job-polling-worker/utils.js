export function logStatus(jobId, status, message) {
  const time = new Date().toISOString();
  console.log(`[${time}] [${status.toUpperCase()}] Job ${jobId} - ${message}`);
}
