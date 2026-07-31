const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, uploadResumeFile, saveJob, unsaveJob, getSavedJobs } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadResume');

router.get('/me', protect, authorize('candidate'), getMyProfile);
router.put('/me', protect, authorize('candidate'), updateMyProfile);
router.post('/me/resume', protect, authorize('candidate'), uploadResume.single('resume'), uploadResumeFile);
router.post('/me/saved-jobs', protect, authorize('candidate'), saveJob);
router.delete('/me/saved-jobs/:jobId', protect, authorize('candidate'), unsaveJob);
router.get('/me/saved-jobs', protect, authorize('candidate'), getSavedJobs);

module.exports = router;
