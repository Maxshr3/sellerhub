import { Request, Response } from "express";
import { HealthService } from "../services/HealthService";

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getHealth = (_req: Request, res: Response) => {
    const result = this.healthService.getStatus();

    return res.status(200).json(result);
  };
}