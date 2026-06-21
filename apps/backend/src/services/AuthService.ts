import bcrypt from "bcrypt";
import {
  AuthResponseDto,
  AuthUserDto,
  LoginRequestDto,
  RegisterRequestDto,
} from "../dto/AuthDto";
import { AuthRepository } from "../repositories/AuthRepository";
import { createAccessToken } from "../utils/jwt";

type UserFromDatabase = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(data: RegisterRequestDto): Promise<AuthResponseDto | null> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);

    if (existingUser) {
      return null;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.authRepository.createUser({
      email: data.email,
      passwordHash,
      name: data.name,
    });

    return {
      user: this.mapUserToResponse(user),
      accessToken: createAccessToken({
        userId: user.id,
        email: user.email,
      }),
    };
  }

  async login(data: LoginRequestDto): Promise<AuthResponseDto | null> {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return {
      user: this.mapUserToResponse(user),
      accessToken: createAccessToken({
        userId: user.id,
        email: user.email,
      }),
    };
  }

  async getCurrentUser(userId: string): Promise<AuthUserDto | null> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      return null;
    }

    return this.mapUserToResponse(user);
  }

  private mapUserToResponse(user: UserFromDatabase): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}