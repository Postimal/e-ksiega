import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { firebaseApp } from './firebase.config';

export interface GuestbookEntry {
  group_id?: string;
  wishes: string;
  signature: string;
  photoUrl?: string;
}

export interface GuestbookEntryRecord extends GuestbookEntry {
  id: string;
  createdAt?: { seconds: number } | null;
}

const GUESTBOOK_COLLECTION = 'wishes';

@Injectable({ providedIn: 'root' })
export class GuestbookService {
  private readonly database = getFirestore(firebaseApp);

  async saveEntry(entry: GuestbookEntry): Promise<string> {
    const documentReference = await addDoc(collection(this.database, 'guestbookEntries'), {
      ...entry,
      createdAt: serverTimestamp(),
    });

    return documentReference.id;
  }

  async saveEntryV1(entry: GuestbookEntry): Promise<string> {
    const documentReference = await addDoc(collection(this.database, GUESTBOOK_COLLECTION), {
      ...entry,
      createdAt: serverTimestamp(),
    });

    return documentReference.id;
  }

  async getEntries(): Promise<GuestbookEntryRecord[]> {
    const snapshot = await getDocs(collection(this.database, 'guestbookEntries'));

    return snapshot.docs
      .map(
        (document) =>
          ({
            id: document.id,
            ...document.data(),
          }) as GuestbookEntryRecord,
      )
      .sort((first, second) => (second.createdAt?.seconds ?? 0) - (first.createdAt?.seconds ?? 0));
  }

  async getEntriesV1(groupId: string): Promise<GuestbookEntryRecord[]> {
    // 1. Tworzymy zapytanie (query), przekazując kolekcję i warunek (where)
    const q = query(
      collection(this.database, GUESTBOOK_COLLECTION),
      where('group_id', '==', groupId), // passedId to zmienna z Twoim id grupy w Angularze
    );

    // 2. Pobieramy dokumenty na podstawie stworzonego zapytania 'q', a nie całej kolekcji
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(
        (document) =>
          ({
            id: document.id,
            ...document.data(),
          }) as GuestbookEntryRecord,
      )
      .sort((first, second) => (second.createdAt?.seconds ?? 0) - (first.createdAt?.seconds ?? 0));
  }
}
