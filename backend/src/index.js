const app = require('./app');
const sequelize = require('./config/database');
require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Mở port ngay lập tức để Render quét thấy thành công (Tránh lỗi Port scan timeout)
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
      await sequelize.authenticate();
      console.log('Database connected successfully.');
      
      // Ghi chú: Chạy sync({ alter: true }) qua Connection Pooler của Supabase thường bị treo (hang)
      // nên chúng ta sẽ không dùng await để tránh block server, hoặc tốt nhất là chỉ dùng sync() thường
      sequelize.sync().then(() => {
        console.log('Models synced.');
      }).catch(err => {
        console.error('Model sync error:', err.message);
      });

    } catch (error) {
      console.error('Unable to connect to database:', error.message);
    }
  });
};

startServer();
