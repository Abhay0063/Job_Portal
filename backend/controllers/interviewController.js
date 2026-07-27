const { Interview, Application, Job, Recruiter, Candidate, User } = require('../models');

// POST /api/interviews (recruiter, owner of the job the application belongs to)
const scheduleInterview = async (req, res) => {
  const { applicationId, scheduledAt, mode, meetingLink } = req.body;
  if (!applicationId || !scheduledAt) {
    return res.status(400).json({ message: 'applicationId and scheduledAt are required' });
  }

  const application = await Application.findByPk(applicationId, { include: [Job] });
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter || application.Job.recruiterId !== recruiter.id) {
    return res.status(403).json({ message: 'You do not own the job this application belongs to' });
  }

  const existing = await Interview.findOne({ where: { applicationId } });
  if (existing) {
    return res.status(409).json({ message: 'An interview is already scheduled for this application' });
  }

  const interview = await Interview.create({
    applicationId,
    scheduledAt,
    mode: mode || 'online',
    meetingLink,
  });

  return res.status(201).json({ interview });
};

// GET /api/interviews/my (candidate only — interviews across all their applications)
const getMyInterviews = async (req, res) => {
  const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
  if (!candidate) return res.status(403).json({ message: 'No candidate profile found' });

  const interviews = await Interview.findAll({
    include: [{
      model: Application,
      where: { candidateId: candidate.id },
      include: [{ model: Job, attributes: ['title', 'location'] }],
    }],
    order: [['scheduledAt', 'ASC']],
  });

  return res.json({ interviews });
};

// PUT /api/interviews/:id (recruiter, owner only) — reschedule, mark completed/cancelled, add feedback
const updateInterview = async (req, res) => {
  const { scheduledAt, mode, meetingLink, status, feedback } = req.body;

  const interview = await Interview.findByPk(req.params.id, {
    include: [{ model: Application, include: [Job] }],
  });
  if (!interview) return res.status(404).json({ message: 'Interview not found' });

  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter || interview.Application.Job.recruiterId !== recruiter.id) {
    return res.status(403).json({ message: 'You do not own the job this interview belongs to' });
  }

  const updates = {};
  if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt;
  if (mode !== undefined) updates.mode = mode;
  if (meetingLink !== undefined) updates.meetingLink = meetingLink;
  if (status !== undefined) updates.status = status;
  if (feedback !== undefined) updates.feedback = feedback;

  await interview.update(updates);
  return res.json({ interview });
};

module.exports = { scheduleInterview, getMyInterviews, updateInterview };
