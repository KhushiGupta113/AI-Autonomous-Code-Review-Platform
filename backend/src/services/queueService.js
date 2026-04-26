const { Queue } = require('bullmq');

const connection = { 
  host: process.env.REDIS_HOST || '127.0.0.1', 
  port: process.env.REDIS_PORT || 6379 
};

const repoQueue = new Queue('repo-analysis', { connection });

async function addRepoToQueue(repoId, repoUrl) {
  await repoQueue.add('analyze', { repoId, repoUrl }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
}

module.exports = { addRepoToQueue };
