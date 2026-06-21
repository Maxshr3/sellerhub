"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const CreateUserUseCase_1 = require("../../../application/use-cases/CreateUserUseCase");
const PostgresUserRepository_1 = require("../../../infrastructure/repositories/PostgresUserRepository");
const router = (0, express_1.Router)();
// временно DI вручную
const repo = new PostgresUserRepository_1.PostgresUserRepository();
const useCase = new CreateUserUseCase_1.CreateUserUseCase(repo);
const controller = new UserController_1.UserController(useCase);
router.post("/users", controller.createUser);
exports.default = router;
