import { pool } from "../database/PostgresConnection";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../application/interfaces/UserRepository";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";

export class PostgresUserRepository implements UserRepository {

  async save(user: User): Promise<void> {
    await pool.query(
      `INSERT INTO users (id, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        user.email.getValue(),
        user.password.getValue(),
        user.role,
        user.createdAt,
      ]
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return new User(
      row.id,
      new Email(row.email),
      new Password(row.password),
      row.role,
      new Date(row.created_at)
    );
  }
}