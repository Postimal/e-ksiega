import { Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from './firebase.config';

@Injectable({ providedIn: 'root' })
export class PhotoStorageService {
  private readonly storage = getStorage(firebaseApp);

  async uploadPhoto(file: File): Promise<string> {
    const compressedPhoto = await this.compressPhoto(file);
    const filePath = `guestbook-photos/${Date.now()}-${crypto.randomUUID()}.jpg`;
    const photoReference = ref(this.storage, filePath);

    await uploadBytes(photoReference, compressedPhoto, {
      contentType: 'image/jpeg',
      customMetadata: {
        originalName: file.name,
      },
    });

    return getDownloadURL(photoReference);
  }

  private async compressPhoto(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const maxDimension = 1920;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');

    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (compressedBlob) =>
          compressedBlob ? resolve(compressedBlob) : reject(new Error('Photo compression failed')),
        'image/jpeg',
        0.82,
      );
    });
  }
}
