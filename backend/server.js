const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('express-async-errors'); // makes async route errors reach the error handler instead of crashing the process

const { sequelize } = require('./models');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Serve uploaded resumes as static files, e.g. http://localhost:5000/uploads/resumes/xyz.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Job Portal API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Last-resort error handler. Any error not already caught by a controller's
// own try/catch lands here instead of crashing the whole process.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  // Multer validation errors (wrong file type, too large) are client mistakes, not server failures
  if (err.name === 'MulterError' || err.message.includes('Only PDF, DOC')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
  });
