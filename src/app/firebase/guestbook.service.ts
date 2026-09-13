import { Injectable } from '@angular/core';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from './firebase.config';

export interface GuestbookEntry {
  wishes: string;
  signature: string;
  photoUrl: string;
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
}
