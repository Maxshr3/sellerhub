import { User, UserRole } from "../../domain/entities/User";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { v4 as uuid } from "uuid";

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: any) {}

  async execute(dto: CreateUserDTO): Promise<User> {
    const email = new Email(dto.email);
    const password = new Password(dto.password);

    const user = new User(
      uuid(),
      email,
      password,
      dto.role,
      new Date()
    );

    await this.userRepository.save(user);

    return user;
  }
}