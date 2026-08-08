"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
}
const globalForPrisma = globalThis;
function createPrismaClient() {
    const adapter = new adapter_pg_1.PrismaPg({ connectionString: databaseUrl });
    return new client_1.PrismaClient({ adapter });
}
exports.prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env["NODE_ENV"] !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map