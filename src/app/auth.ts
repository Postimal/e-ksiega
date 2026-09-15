import { Injectable } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth();
  private functions = getFunctions();

  /**
   * Loguje użytkownika za pomocą samego hasła przez Cloud Function.
   */
  async loginWithPassword(password: string): Promise<void> {
    try {
      // Wywołanie funkcji Cloud Function
      const verifyPasswordAndLogin = httpsCallable<{ password: string }, { token: string }>(
        this.functions,
        'verifyPasswordAndLogin',
      );

      const result = await verifyPasswordAndLogin({ password });

      // Logowanie w Firebase za pomocą otrzymanego Custom Tokenu
      const userCredential = await signInWithCustomToken(this.auth, result.data.token);
      // TODO: czy cos dalej z tym tokenem robic?
      console.log('Zalogowano pomyślnie:', userCredential.user.uid);
    } catch (error: any) {
      console.error('Błąd podczas logowania:', error.message);
      throw error;
    }
  }
}
