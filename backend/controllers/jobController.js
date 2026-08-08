const { Job, Recruiter, Application } = require('../models');
const { Op } = require('sequelize');

// Converts '' or undefined to null so Sequelize doesn't try to insert an empty
// string into an INTEGER column (MySQL rejects it and throws instead of coercing).
const toNullableInt = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

// POST /api/jobs (recruiter only)
const createJob = async (req, res) => {
  try {
    const { title, description, location, jobType, salaryMin, salaryMax, skillsRequired, experienceRequired } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'title and description are required' });
    }

    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(403).json({ message: 'No recruiter profile found for this account' });
    }

    const job = await Job.create({
      title,
      description,
      location,
      jobType,
      salaryMin: toNullableInt(salaryMin),
      salaryMax: toNullableInt(salaryMax),
      skillsRequired,
      experienceRequired,
      recruiterId: recruiter.id,
    });

    return res.status(201).json({ job });
  } catch (err) {
    console.error('createJob error:', err.message);
    return res.status(400).json({ message: 'Could not create job. Check your input values.' });
  }
};

// GET /api/jobs (public — with optional filters)
// ?search=react&location=remote&jobType=internship&page=1&limit=10
const getJobs = async (req, res) => {
  const { search, location, jobType, page = 1, limit = 10 } = req.query;

  const where = { status: 'open' };
  if (search) where.title = { [Op.like]: `%${search}%` };
  if (location) where.location = { [Op.like]: `%${location}%` };
  if (jobType) where.jobType = jobType;

  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows } = await Job.findAndCountAll({
    where,
    include: [{ model: Recruiter, attributes: ['companyName'] }],
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
  });

  return res.json({
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit)),
    jobs: rows,
  });
};

// GET /api/jobs/:id (public)
const getJobById = async (req, res) => {
  const job = await Job.findByPk(req.params.id, {
    include: [{ model: Recruiter, attributes: ['companyName', 'companyWebsite'] }],
  });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  return res.json({ job });
};

// PUT /api/jobs/:id (recruiter, owner only)
const updateJob = async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter || job.recruiterId !== recruiter.id) {
    return res.status(403).json({ message: 'You do not own this job posting' });
  }

  const { title, description, location, jobType, salaryMin, salaryMax, status, skillsRequired, experienceRequired } = req.body;
  await job.update({
    title, description, location, jobType, status, skillsRequired, experienceRequired,
    salaryMin: toNullableInt(salaryMin),
    salaryMax: toNullableInt(salaryMax),
  });

  return res.json({ job });
};

// DELETE /api/jobs/:id (recruiter, owner only)
const deleteJob = async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter || job.recruiterId !== recruiter.id) {
    return res.status(403).json({ message: 'You do not own this job posting' });
  }

  await job.destroy(); // cascades to applications+interviews via onDelete: CASCADE
  return res.json({ message: 'Job deleted' });
};

// GET /api/jobs/my/postings (recruiter only — their own jobs regardless of status)
const getMyJobs = async (req, res) => {
  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter) return res.status(403).json({ message: 'No recruiter profile found' });

  const jobs = await Job.findAll({
    where: { recruiterId: recruiter.id },
    include: [{ model: Application, attributes: ['id', 'status'] }],
    order: [['createdAt', 'DESC']],
  });

  return res.json({ jobs });
};
// GET /api/jobs/my/stats (recruiter only) — aggregate counts for the recruiter dashboard
const getMyJobStats = async (req, res) => {
  const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
  if (!recruiter) return res.status(403).json({ message: 'No recruiter profile found' });

  const jobs = await Job.findAll({ where: { recruiterId: recruiter.id }, attributes: ['id', 'status'] });
  const jobIds = jobs.map((j) => j.id);

  const [totalApplications, shortlistedCount] = await Promise.all([
    jobIds.length ? Application.count({ where: { jobId: jobIds } }) : 0,
    jobIds.length ? Application.count({ where: { jobId: jobIds, status: 'shortlisted' } }) : 0,
  ]);

  const activeJobListings = jobs.filter((j) => j.status === 'open').length;

  return res.json({
    activeJobListings,
    totalPostings: jobs.length,
    totalApplications,
    shortlistedCount,
  });
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs, getMyJobStats };
