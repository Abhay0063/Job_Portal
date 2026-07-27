const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to MySQL established.');

    // alter:true updates existing tables to match models without dropping data.
    // Use force:true only when you want to wipe and recreate everything.
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced: users, recruiters, candidates, jobs, applications, interviews.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Unable to sync database:', err);
    process.exit(1);
  }
})();
