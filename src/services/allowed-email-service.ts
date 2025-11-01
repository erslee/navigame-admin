import { allowedEmailRepository } from '@/repositories/allowed-email-repository';
import { AllowedEmail, CreateAllowedEmailInput } from '@/models';

export class AllowedEmailService {
  async getAllowedEmails(): Promise<AllowedEmail[]> {
    return allowedEmailRepository.getAll();
  }

  async addAllowedEmail(email: string, addedBy: string): Promise<AllowedEmail> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const existing = await allowedEmailRepository.getByEmail(email);
    if (existing) {
      throw new Error('Email already exists in allowed list');
    }

    return allowedEmailRepository.create({ email, addedBy });
  }

  async removeAllowedEmail(email: string): Promise<void> {
    return allowedEmailRepository.delete(email);
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    return allowedEmailRepository.isAllowed(email);
  }
}

export const allowedEmailService = new AllowedEmailService();
