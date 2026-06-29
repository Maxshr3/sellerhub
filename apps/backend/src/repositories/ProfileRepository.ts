import { prisma } from "../database/prisma";
import { UpdateProfileRequestDto } from "../dto/ProfileDto";

export class ProfileRepository {
  async findProfileByUserId(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileRequestDto) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.companyName !== undefined
          ? { companyName: data.companyName }
          : {}),
        ...(data.roleTitle !== undefined ? { roleTitle: data.roleTitle } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.theme !== undefined ? { theme: data.theme } : {}),
        ...(data.accentColor !== undefined
          ? { accentColor: data.accentColor }
          : {}),
        ...(data.emailReports !== undefined
          ? { emailReports: data.emailReports }
          : {}),
        ...(data.pushAlerts !== undefined ? { pushAlerts: data.pushAlerts } : {}),
      },
    });
  }
}