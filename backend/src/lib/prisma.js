const { PrismaClient } = require('@prisma/client');

// Prisma 7 sẽ tự động lấy cấu hình từ prisma.config.ts
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
