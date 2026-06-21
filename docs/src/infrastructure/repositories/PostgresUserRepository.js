"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepository = void 0;
const PostgresConnection_1 = require("../database/PostgresConnection");
const User_1 = require("../../domain/entities/User");
const Email_1 = require("../../domain/value-objects/Email");
const Password_1 = require("../../domain/value-objects/Password");
class PostgresUserRepository {
    async save(user) {
        await PostgresConnection_1.pool.query(`INSERT INTO users (id, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, $5)`, [
            user.id,
            user.email.getValue(),
            user.password.getValue(),
            user.role,
            user.createdAt,
        ]);
    }
    async findByEmail(email) {
        const result = await PostgresConnection_1.pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new User_1.User(row.id, new Email_1.Email(row.email), new Password_1.Password(row.password), row.role, new Date(row.created_at));
    }
}
exports.PostgresUserRepository = PostgresUserRepository;
