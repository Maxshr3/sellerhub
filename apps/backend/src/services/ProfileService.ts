import {
  ProfileResponseDto,
  UpdateProfileRequestDto,
} from "../dto/ProfileDto";
import { ProfileRepository } from "../repositories/ProfileRepository";

type ProfileFromDatabase = NonNullable<
  Awaited<ReturnType<ProfileRepository["findProfileByUserId"]>>
>;

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string): Promise<ProfileResponseDto | null> {
    const profile = await this.profileRepository.findProfileByUserId(userId);

    if (!profile) {
      return null;
    }

    return this.mapProfileToResponse(profile);
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileRequestDto,
  ): Promise<ProfileResponseDto | null> {
    const existingProfile = await this.profileRepository.findProfileByUserId(
      userId,
    );

    if (!existingProfile) {
      return null;
    }

    const profile = await this.profileRepository.updateProfile(userId, data);

    return this.mapProfileToResponse(profile);
  }

  private mapProfileToResponse(profile: ProfileFromDatabase): ProfileResponseDto {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      companyName: profile.companyName,
      roleTitle: profile.roleTitle,
      phone: profile.phone,
      theme: profile.theme,
      accentColor: profile.accentColor,
      emailReports: profile.emailReports,
      pushAlerts: profile.pushAlerts,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}