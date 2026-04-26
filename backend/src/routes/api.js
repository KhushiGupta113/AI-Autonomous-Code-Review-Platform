const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

router.post('/analyze-repo', repoController.analyzeRepo);
router.get('/analysis/:id', repoController.getAnalysis);
router.get('/issues/:repoId', repoController.getIssues);

module.exports = router;
