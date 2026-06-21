import { Request, Response } from "express";
import { AnalyticsService } from "../services/AnalyticsService";

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getDashboardAnalytics = async (_req: Request, res: Response) => {
    const dashboardAnalytics =
      await this.analyticsService.getDashboardAnalytics();

    return res.status(200).json({
      data: dashboardAnalytics,
    });
  };
}