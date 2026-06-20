const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 5000;

// Sync database and start server
const startServer = async () => {
  try {
    // Sync models to database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('Failed to sync database or start server:', error);
    process.exit(1);
  }
};

startServer();
