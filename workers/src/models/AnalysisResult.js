const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema({
  repo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
  bug_count: { type: Number, default: 0 },
  security_issues: { type: Number, default: 0 },
  performance_issues: { type: Number, default: 0 },
  complexity_score: { type: Number, default: 0 },
  quality_score: { type: Number, default: 0 },
  detailed_issues: { type: Array, default: [] }, // Array of objects { type, description, file, line }
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
