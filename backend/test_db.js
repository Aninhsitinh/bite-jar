const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối Database thành công!');
    
    // Check tables
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('Các bảng hiện có trong DB:', results.map(r => r.table_name).join(', '));
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Kết nối Database thất bại:', error.message);
    process.exit(1);
  }
}

testConnection();
