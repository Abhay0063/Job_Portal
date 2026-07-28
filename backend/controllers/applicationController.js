const { Application, Job, Candidate, Recruiter, User, Interview } = require('../models');

// POST /api/applications (candidate only)
const applyToJob = async (req, res) => {
  const { jobId, coverLetter } = req.body;
  if (!jobId) return res.status(400).json({ message: 'jobId is required' });

  const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
  if (!candidate) return res.status(403).json({ message: 'No candidate profile found for this account' });

  const job = await Job.findByPk(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ message: 'This job is no longer accepting applications' });

  const existing = await Application.findOne({ where: { jobId, candidateId: candidate.id } });
  if (existing) return res.status(409).json({ message: 'You have already applied to this job' });

  const application = await Application.create({ jobId, candidateId: candidate.id, coverLetter });
  return res.status(201).json({ application });
};

// GET /api/applications/my (candidate only)
const getMyApplications = async (req, res) => {
  const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
  if (!candidate) return res.status(403).json({ message: 'No candidate profile found for this account' });

  const applications = await Application.findAll({
    where: { candidateId: candidate.id },
    include: [{ model: Job, attributes: ['id', 'title', 'location', 'status'] }],
    order: [['createdAt', 'DESC']],
  });
  return res.json({ applications });
};

// GET /api/applications/job/:jobId (recruiter, owner only)
const getApplicantsForJob = async (req, res) => {
  const job = await Job.findByPk(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter || job.recruiterId !== recruiter.id) {
    return res.status(403).json({ message: 'You do not own this job posting' });
  }

  const applications = await Application.findAll({
    where: { jobId: job.id },
    include: [
      {
        model: Candidate,
        include: [{ model: User, attributes: ['name', 'email'] }],
      },
      Interview,
    ],
    order: [['createdAt', 'ASC']],
  });
  return res.json({ applications });
};

// PUT /api/applications/:id/status (recruiter, owner only)
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const application = await Application.findByPk(req.params.id, { include: [Job] });
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter || application.Job.recruiterId !== recruiter.id) {
    return res.status(403).json({ message: 'You do not own the job this application belongs to' });
  }

  await application.update({ status });
  return res.json({ application });
};

module.exports = { applyToJob, getMyApplications, getApplicantsForJob, updateApplicationStatus };
