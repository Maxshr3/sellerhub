export class HealthService {
  getStatus() {
    return {
      status: "ok",
      service: "sellerhub-backend",
      timestamp: new Date().toISOString(),
    };
  }
}