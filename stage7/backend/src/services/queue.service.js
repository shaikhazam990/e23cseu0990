
const pendingQueue = [];


const queueNotification = async (notificationData) => {
  const job = {
    id: `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    payload: notificationData,
    status: "pending",
    createdAt: new Date(),
  };

  pendingQueue.push(job);

  console.log(`[Queue] Job queued → ${job.id} | type: ${notificationData.type}`);

  return job;
};

const processNotification = async () => {
  if (pendingQueue.length === 0) {
    return { message: "Queue is empty" };
  }

  const job = pendingQueue.shift(); // FIFO
  job.status = "processing";

  await new Promise((resolve) => setTimeout(resolve, 100));

  job.status = "completed";
  job.processedAt = new Date();

  console.log(`[Queue] Job processed → ${job.id}`);

  return job;
};

const getQueueLength = () => pendingQueue.length;

module.exports = { queueNotification, processNotification, getQueueLength };
