import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Sử dụng DATABASE_URL (pooling) để ứng dụng chạy nhanh nhất trên Production
    url: process.env["DATABASE_URL"],
  },
});
