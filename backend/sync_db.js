const { User, Jar, FoodItem } = require('./src/models');
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function syncDB() {
  try {
    console.log('🔄 Đang khởi tạo lại toàn bộ bảng dữ liệu...');
    
    // Force sync deletes existing tables and recreates them
    await User.sequelize.sync({ force: true });
    
    console.log('✅ Chúc mừng! Toàn bộ bảng dữ liệu (Người dùng, Hũ đồ ăn, Món ăn) đã được tạo thành công.');
    console.log('🚀 Bây giờ bạn có thể khởi động Backend và bắt đầu sử dụng.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng:', error.message);
    process.exit(1);
  }
}

syncDB();
