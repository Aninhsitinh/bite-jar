const { PrismaClient } = require('@prisma/client');

// Chuẩn Prisma 7: Dùng datasourceUrl thay cho datasources
const prisma = global.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

module.exports = prisma;
