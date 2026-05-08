const { PrismaClient } = require('@prisma/client');

// Thêm cấu hình log để đối tượng không bị rỗng (non-empty)
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
