const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  repositories_analyzed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
