import { Request, Response } from "express";
import { CreateUserUseCase } from "../../../application/use-cases/CreateUserUseCase";
import { UserRole } from "../../../domain/entities/User";

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.createUserUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role || UserRole.CUSTOMER,
      });

      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}