const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function cloneRepo(repoUrl, repoId) {
  const targetDir = path.join(os.tmpdir(), 'repos', repoId.toString());
  
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const git = simpleGit();
  await git.clone(repoUrl, targetDir);

  return targetDir;
}

module.exports = { cloneRepo };
