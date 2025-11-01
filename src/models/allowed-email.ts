import { Timestamp } from 'firebase/firestore';

export interface AllowedEmail {
  id: string;
  email: string;
  addedBy: string; // Email of admin who added this
  createdAt: Timestamp;
}

export interface CreateAllowedEmailInput {
  email: string;
  addedBy: string;
}
