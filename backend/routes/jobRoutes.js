const express = require('express');
const router = express.Router();
const {
  createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Order matters: /my/postings must come before /:id or Express will treat "my" as an id
router.get('/my/postings', protect, authorize('recruiter'), getMyJobs);

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
