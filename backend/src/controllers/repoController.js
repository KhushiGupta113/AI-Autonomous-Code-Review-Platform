const Repository = require('../models/Repository');
const AnalysisResult = require('../models/AnalysisResult');
const { addRepoToQueue } = require('../services/queueService');

exports.analyzeRepo = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });
    
    const repo = new Repository({ repo_url: repoUrl, analysis_status: 'pending' });
    await repo.save();
    
    await addRepoToQueue(repo._id, repo.repo_url);
    
    res.status(202).json({ message: 'Repository submitted for analysis successfully', repoId: repo._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = await Repository.findById(id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    
    let result = null;
    if (repo.analysis_status === 'completed') {
      result = await AnalysisResult.findOne({ repo_id: id });
    }
    
    res.status(200).json({ repository: repo, analysis: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { repoId } = req.params;
    const result = await AnalysisResult.findOne({ repo_id: repoId });
    if (!result) return res.status(404).json({ error: 'Issues not found for the given repository' });
    
    res.status(200).json({ issues: result.detailed_issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
