const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, Recruiter, Candidate } = require('../models');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role, companyName, resumeUrl } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required' });
  }
  if (!['recruiter', 'candidate'].includes(role)) {
    return res.status(400).json({ message: 'role must be recruiter or candidate' }); // admin created manually, not via signup
  }

  const t = await sequelize.transaction();
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role }, { transaction: t });

    if (role === 'recruiter') {
      await Recruiter.create({ userId: user.id, companyName: companyName || 'Unnamed Company' }, { transaction: t });
    } else {
      await Candidate.create({ userId: user.id, resumeUrl: resumeUrl || null }, { transaction: t });
    }

    await t.commit();

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

// GET /api/auth/me (protected)
const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { register, login, getMe };
