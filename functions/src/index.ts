/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions';
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();

interface PasswordData {
  password?: string;
}

/**
 * Weryfikuje hasło z Firestore i zwraca Custom Token dla użytkownika.
 */
export const verifyPasswordAndLogin = onCall(async (request) => {
  const payload = request.data as PasswordData;
  const userPassword = payload?.password;

  if (!userPassword) {
    throw new HttpsError('invalid-argument', 'Brak hasła.');
  }

  // Pobranie hashu z Firestore
  const doc = await admin.firestore().doc('secrets/app_access').get();
  const storedHash = doc.data()?.passwordHash;

  if (!storedHash) {
    throw new HttpsError('internal', 'Brak konfiguracji hasła w bazie.');
  }

  try {
    // Porównanie hasła (try-catch zabezpiecza przed błędnym formatem hashu w DB)
    const isMatch = await bcrypt.compare(userPassword, storedHash);

    if (!isMatch) {
      throw new HttpsError('unauthenticated', 'Błędne hasło!');
    }
  } catch (error: any) {
    console.error('Błąd podczas porównywania bcrypt:', error.message);
    throw new HttpsError(
      'internal',
      'Błąd weryfikacji. Upewnij się, że w bazie Firestore masz zapisany prawidłowy hash bcrypt, a nie czysty tekst!',
    );
  }

  // Wygenerowanie Custom Tokenu
  const customToken = await admin.auth().createCustomToken('app_member');

  return { token: customToken };
});
