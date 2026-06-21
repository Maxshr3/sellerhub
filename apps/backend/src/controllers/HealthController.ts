import { Request, Response } from "express";
import { HealthService } from "../services/HealthService";

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getHealth = async (_req: Request, res: Response) => {
    const result = await this.healthService.getStatus();

    return res.status(200).json(result);
  };
}