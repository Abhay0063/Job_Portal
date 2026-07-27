const { fn, col } = require('sequelize');
const { User, Recruiter, Candidate, Job, Application, Interview, sequelize } = require('../models');

// GET /api/admin/dashboard (admin only) — everything the dashboard needs in one call
const getDashboard = async (req, res) => {
  const [totalUsers, totalRecruiters, totalCandidates, totalJobs, totalApplications, activeJobs] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'recruiter' } }),
    User.count({ where: { role: 'candidate' } }),
    Job.count(),
    Application.count(),
    Job.count({ where: { status: 'open' } }),
  ]);

  // User growth by month (signups over time)
  const userGrowthRaw = await User.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: ['month'],
    order: [[col('month'), 'ASC']],
    raw: true,
  });

  // Applications per month
  const applicationsPerMonthRaw = await Application.findAll({
    attributes: [
      [fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: ['month'],
    order: [[col('month'), 'ASC']],
    raw: true,
  });

  // Jobs posted, grouped by recruiter (company name)
  const jobsByRecruiterRaw = await Job.findAll({
    attributes: [
      'recruiterId',
      [fn('COUNT', col('Job.id')), 'count'],
    ],
    include: [{ model: Recruiter, attributes: ['companyName'] }],
    group: ['recruiterId', 'Recruiter.id'],
    order: [[fn('COUNT', col('Job.id')), 'DESC']],
  });

  return res.json({
    stats: { totalUsers, totalRecruiters, totalCandidates, totalJobs, totalApplications, activeJobs },
    userGrowth: userGrowthRaw.map((r) => ({ month: r.month, count: Number(r.count) })),
    applicationsPerMonth: applicationsPerMonthRaw.map((r) => ({ month: r.month, count: Number(r.count) })),
    jobsByRecruiter: jobsByRecruiterRaw.map((r) => ({
      company: r.Recruiter?.companyName || 'Unknown',
      count: Number(r.get('count')),
    })),
  });
};

// GET /api/admin/users (admin only)
const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
  return res.json({ users });
};

// DELETE /api/admin/users/:id (admin only)
const deleteUser = async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'You cannot delete your own admin account' });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await user.destroy(); // cascades to Recruiter/Candidate profile via onDelete: CASCADE
  return res.json({ message: 'User deleted' });
};

module.exports = { getDashboard, getAllUsers, deleteUser };
