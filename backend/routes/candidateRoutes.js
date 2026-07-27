const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, uploadResumeFile } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/uploadResume');

router.get('/me', protect, authorize('candidate'), getMyProfile);
router.put('/me', protect, authorize('candidate'), updateMyProfile);
router.post('/me/resume', protect, authorize('candidate'), uploadResume.single('resume'), uploadResumeFile);

module.exports = router;
