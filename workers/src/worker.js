require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

const Repository = require('./models/Repository');
const AnalysisResult = require('./models/AnalysisResult');
const { cloneRepo } = require('./utils/gitClone');
const { parseCode } = require('./analyzer/astScanner');
const { analyzeWithLLM } = require('./analyzer/llmAnalyzer');

const connection = { 
  host: process.env.REDIS_HOST || '127.0.0.1', 
  port: process.env.REDIS_PORT || 6379 
};

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-code-review';
  await mongoose.connect(uri);
  console.log('Worker connected to MongoDB');
}

function calculateScore(issues) {
  let bug_count = 0;
  let security_issues = 0;
  let performance_issues = 0;
  let complexity_score = 100;

  issues.forEach(iss => {
    if (iss.type === 'bug') bug_count++;
    if (iss.type === 'security') security_issues++;
    if (iss.type === 'performance') performance_issues++;
    if (iss.type === 'complexity') complexity_score -= 5;
    if (iss.type === 'maintainability') complexity_score -= 2;
  });

  complexity_score = Math.max(0, complexity_score);
  const penalty = (bug_count * 10) + (security_issues * 15) + (performance_issues * 5);
  let quality_score = 100 - penalty;
  quality_score = Math.max(0, Math.min(100, quality_score));

  return { bug_count, security_issues, performance_issues, complexity_score, quality_score };
}

const worker = new Worker('repo-analysis', async job => {
  const { repoId, repoUrl } = job.data;
  console.log(`Processing job ${job.id} for repo ${repoUrl}`);

  await Repository.findByIdAndUpdate(repoId, { analysis_status: 'processing' });

  try {
    const repoPath = await cloneRepo(repoUrl, repoId);

    const files = await glob('**/*.{js,jsx,ts,tsx}', {
      cwd: repoPath,
      ignore: ['node_modules/**', 'dist/**', 'build/**', 'package-lock.json', '*.test.js']
    });

    let allIssues = [];
    let aiCallsCount = 0;
    const MAX_AI_CALLS = 15; // Token Saver: Limit AI analysis to the 15 most important files

    // Sort files by size to prioritize analyzing larger (usually more complex) files first
    const sortedFiles = files.sort((a, b) => {
       const statA = fs.statSync(path.join(repoPath, a));
       const statB = fs.statSync(path.join(repoPath, b));
       return statB.size - statA.size;
    });

    for (const file of sortedFiles) {
      const filePath = path.join(repoPath, file);
      const code = fs.readFileSync(filePath, 'utf-8');

      // 1. Always run FREE AST static analysis on every file
      const astIssues = parseCode(code, file);
      allIssues = allIssues.concat(astIssues);

      // 2. Run AI Analysis only on important files to save tokens
      // Only call AI if:
      // - We haven't hit the MAX_AI_CALLS limit
      // - The file has content
      // - The AST already found some complexity OR the file is substantial (> 100 chars)
      const isImportant = astIssues.some(i => i.type === 'complexity') || code.length > 500;

      if (isImportant && aiCallsCount < MAX_AI_CALLS && (process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY)) {
        console.log(`[AI] Analyzing high-risk file: ${file}`);
        const llmIssues = await analyzeWithLLM(code.substring(0, 4000), file);
        allIssues = allIssues.concat(llmIssues);
        aiCallsCount++;
      }
    }

    const stats = calculateScore(allIssues);

    const analysisResult = new AnalysisResult({
      repo_id: repoId,
      ...stats,
      detailed_issues: allIssues
    });

    await analysisResult.save();
    await Repository.findByIdAndUpdate(repoId, { analysis_status: 'completed' });
    
    fs.rmSync(repoPath, { recursive: true, force: true });
    console.log(`Job ${job.id} completed. AI calls made: ${aiCallsCount}`);
  } catch (err) {
    console.error(`Job ${job.id} failed:`, err);
    await Repository.findByIdAndUpdate(repoId, { analysis_status: 'failed' });
    throw err;
  }
}, { connection });

connectDB();
console.log('Worker is running with Token-Saver mode active...');
