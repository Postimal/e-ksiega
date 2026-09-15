import { Injectable } from '@angular/core';
import { addDoc, collection, getDocs, getFirestore, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from './firebase.config';

export interface GuestbookEntry {
  wishes: string;
  signature: string;
  photoUrl?: string;
}

export interface GuestbookEntryRecord extends GuestbookEntry {
  id: string;
  createdAt?: { seconds: number } | null;
}

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
}
