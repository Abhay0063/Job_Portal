const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  applyToJob, getMyApplications, getApplicantsForJob, updateApplicationStatus, withdrawApplication,
} = require('../controllers/applicationController');

router.post('/', protect, authorize('candidate'), applyToJob);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter'), getApplicantsForJob);
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);
router.delete('/:id', protect, authorize('candidate'), withdrawApplication);

module.exports = router;
