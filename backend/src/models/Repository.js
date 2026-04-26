const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  repo_url: { type: String, required: true },
  analysis_status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Repository', repositorySchema);
