import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/providers/firebase';

export interface PaginationParams {
  pageSize: number;
  lastDoc?: DocumentSnapshot<DocumentData>;
}

export interface SearchParams {
  field: string;
  value: string;
}

export interface FilterParams {
  field: string;
  value: string;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc?: DocumentSnapshot<DocumentData>;
  hasMore: boolean;
}

export class BaseRepository<T extends { id: string }> {
  constructor(protected collectionName: string) {}

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }

    return null;
  }

  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  async getPaginated(
    pagination: PaginationParams,
    searchParams?: SearchParams,
    filterParams?: FilterParams[]
  ): Promise<PaginatedResult<T>> {
    const constraints: QueryConstraint[] = [];

    // Add filter constraints if provided
    if (filterParams && filterParams.length > 0) {
      filterParams.forEach((filter) => {
        constraints.push(where(filter.field, '==', filter.value));
      });
    }

    // Add search constraint if provided
    if (searchParams) {
      constraints.push(where(searchParams.field, '>=', searchParams.value));
      constraints.push(where(searchParams.field, '<=', searchParams.value + '\uf8ff'));
    }

    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));

    // Add pagination
    constraints.push(limit(pagination.pageSize + 1)); // Fetch one extra to check if there's more

    if (pagination.lastDoc) {
      constraints.push(startAfter(pagination.lastDoc));
    }

    const q = query(collection(db, this.collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    const items = querySnapshot.docs.slice(0, pagination.pageSize).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    const hasMore = querySnapshot.docs.length > pagination.pageSize;
    const lastDoc = hasMore ? querySnapshot.docs[pagination.pageSize - 1] : undefined;

    return { items, lastDoc, hasMore };
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = Timestamp.now();
    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, this.collectionName), docData);
    const newDoc = await getDoc(docRef);

    return { id: newDoc.id, ...newDoc.data() } as T;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const deletePromises = ids.map((id) => this.delete(id));
    await Promise.all(deletePromises);
  }

  async bulkUpdate(ids: string[], data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    const updatePromises = ids.map((id) => this.update(id, data));
    await Promise.all(updatePromises);
  }
}
