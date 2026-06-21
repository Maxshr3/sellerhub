import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { CreateUserUseCase } from "../../../application/use-cases/CreateUserUseCase";
import { PostgresUserRepository } from "../../../infrastructure/repositories/PostgresUserRepository";

const router = Router();

// временно DI вручную
const repo = new PostgresUserRepository();
const useCase = new CreateUserUseCase(repo);
const controller = new UserController(useCase);

router.post("/users", controller.createUser);

export default router;