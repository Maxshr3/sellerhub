import { Request, Response } from "express";
import { DashboardAnalyticsQueryDto } from "../dto/AnalyticsDto";
import { AnalyticsService } from "../services/AnalyticsService";

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getDashboardAnalytics = async (req: Request, res: Response) => {
    const query = this.parseDashboardQuery(req.query);

    const analytics = await this.analyticsService.getDashboardAnalytics(query);

    return res.status(200).json({
      data: analytics,
    });
  };

  private parseDashboardQuery(query: Request["query"]): DashboardAnalyticsQueryDto {
    return {
      marketplaceId:
        typeof query.marketplaceId === "string" && query.marketplaceId.length > 0
          ? query.marketplaceId
          : undefined,
      dateFrom:
        typeof query.dateFrom === "string" && query.dateFrom.length > 0
          ? query.dateFrom
          : undefined,
      dateTo:
        typeof query.dateTo === "string" && query.dateTo.length > 0
          ? query.dateTo
          : undefined,
    };
  }
}