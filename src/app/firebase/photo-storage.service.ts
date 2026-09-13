import { Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from './firebase.config';

@Injectable({ providedIn: 'root' })
export class PhotoStorageService {
  private readonly storage = getStorage(firebaseApp);

  async uploadPhoto(file: File): Promise<string> {
    const photo = file.size > 8 * 1024 * 1024 ? await this.compressPhoto(file) : file;
    const extension =
      photo.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `guestbook-photos/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const photoReference = ref(this.storage, filePath);

    await uploadBytes(photoReference, photo, {
      contentType: photo.type || file.type,
      customMetadata: {
        originalName: file.name,
      },
    });

    return getDownloadURL(photoReference);
  }

  private async compressPhoto(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const maxDimension = 2560;
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
        0.9,
      );
    });
  }
}
