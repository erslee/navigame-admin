import { doc, setDoc, getDoc, getDocs, deleteDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/providers/firebase';
import { AllowedEmail, CreateAllowedEmailInput } from '@/models';

export class AllowedEmailRepository {
  private collectionName = 'allowedEmails';

  async getByEmail(email: string): Promise<AllowedEmail | null> {
    const docRef = doc(db, this.collectionName, email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AllowedEmail;
    }

    return null;
  }

  async getAll(): Promise<AllowedEmail[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AllowedEmail[];
  }

  async create(data: CreateAllowedEmailInput): Promise<AllowedEmail> {
    const docRef = doc(db, this.collectionName, data.email);
    const docData = {
      email: data.email,
      addedBy: data.addedBy,
      createdAt: Timestamp.now(),
    };

    await setDoc(docRef, docData);

    return { id: data.email, ...docData };
  }

  async delete(email: string): Promise<void> {
    const docRef = doc(db, this.collectionName, email);
    await deleteDoc(docRef);
  }

  async isAllowed(email: string): Promise<boolean> {
    const allowedEmail = await this.getByEmail(email);
    return allowedEmail !== null;
  }
}

export const allowedEmailRepository = new AllowedEmailRepository();
