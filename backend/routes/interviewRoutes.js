const express = require('express');
const router = express.Router();
const { scheduleInterview, getMyInterviews, updateInterview } = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('recruiter'), scheduleInterview);
router.get('/my', protect, authorize('candidate'), getMyInterviews);
router.put('/:id', protect, authorize('recruiter'), updateInterview);

module.exports = router;
