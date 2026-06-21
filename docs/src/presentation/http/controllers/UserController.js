"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const User_1 = require("../../../domain/entities/User");
class UserController {
    constructor(createUserUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.createUser = async (req, res) => {
            try {
                const user = await this.createUserUseCase.execute({
                    email: req.body.email,
                    password: req.body.password,
                    role: req.body.role || User_1.UserRole.CUSTOMER,
                });
                res.status(201).json(user);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        };
    }
}
exports.UserController = UserController;
