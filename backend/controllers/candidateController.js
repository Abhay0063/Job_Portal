const fs = require('fs');
const path = require('path');
const { Candidate, User } = require('../models');

// GET /api/candidates/me (candidate only)
const getMyProfile = async (req, res) => {
  const candidate = await Candidate.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, attributes: ['name', 'email'] }],
  });
  if (!candidate) return res.status(404).json({ message: 'No candidate profile found' });
  return res.json({ candidate });
};

// PUT /api/candidates/me (candidate only) — update skills, education, experience
const updateMyProfile = async (req, res) => {
  const { skills, education, experienceYears } = req.body;

  const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
  if (!candidate) return res.status(404).json({ message: 'No candidate profile found' });

  const updates = {};
  if (skills !== undefined) updates.skills = skills;
  if (education !== undefined) updates.education = education;
  if (experienceYears !== undefined) {
    const n = Number(experienceYears);
    updates.experienceYears = Number.isNaN(n) ? candidate.experienceYears : n;
  }

  await candidate.update(updates);
  return res.json({ candidate });
};

// POST /api/candidates/me/resume (candidate only) — multipart file upload
const uploadResumeFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
  if (!candidate) {
    fs.unlinkSync(req.file.path); // clean up the orphaned upload
    return res.status(404).json({ message: 'No candidate profile found' });
  }

  // Delete the previous resume file, if one exists, so uploads don't pile up on disk
  if (candidate.resumeUrl) {
    const oldPath = path.join(__dirname, '..', 'uploads', 'resumes', path.basename(candidate.resumeUrl));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  await candidate.update({ resumeUrl });

  return res.json({ resumeUrl });
};

module.exports = { getMyProfile, updateMyProfile, uploadResumeFile };
