// Run once: node seedAdmin.js
// Creates a single admin account. Admins are never created via /api/auth/register —
// that endpoint intentionally only accepts recruiter/candidate, so someone can't
// just sign up as an admin through the public form.
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

const ADMIN_EMAIL = 'admin@jobportal.com';
const ADMIN_PASSWORD = 'AdminPass123!'; // change this after first login in a real deployment

(async () => {
  try {
    await sequelize.authenticate();

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log('ℹ️  Admin already exists:', ADMIN_EMAIL);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: 'Platform Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin created.');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   Log in at /login, then change this password if this were a real deployment.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Could not create admin:', err.message);
    process.exit(1);
  }
})();
