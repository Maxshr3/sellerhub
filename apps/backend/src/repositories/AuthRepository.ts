import { prisma } from "../database/prisma";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
  }) {
    return prisma.user.create({
      data,
    });
  }
}