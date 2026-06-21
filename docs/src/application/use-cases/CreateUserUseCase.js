"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const User_1 = require("../../domain/entities/User");
const Email_1 = require("../../domain/value-objects/Email");
const Password_1 = require("../../domain/value-objects/Password");
const uuid_1 = require("uuid");
class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(dto) {
        const email = new Email_1.Email(dto.email);
        const password = new Password_1.Password(dto.password);
        const user = new User_1.User((0, uuid_1.v4)(), email, password, dto.role, new Date());
        await this.userRepository.save(user);
        return user;
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
