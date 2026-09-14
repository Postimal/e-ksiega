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

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

admin.initializeApp();

interface PasswordData {
  password: string;
}

/**
 * Weryfikuje hasło z Firestore i zwraca Custom Token dla użytkownika.
 * @param {any} data Dane przesłane z aplikacji klienckiej.
 * @return {Promise<{token: string}>} Obiekt zawierający wygenerowany token.
 */
export const verifyPasswordAndLogin = functions.https.onCall(async (data) => {
  const userPassword = (data as unknown as PasswordData).password;
  console.log('Otrzymany obiekt:', data);

  if (!userPassword) {
    // eslint-disable-next-line max-len
    throw new functions.https.HttpsError('invalid-argument', 'Brak hasła.', { data });
  }

  // Pobranie hashu z Firestore
  const doc = await admin.firestore().doc('secrets/app_access').get();
  const storedHash = doc.data()?.passwordHash;

  if (!storedHash) {
    // eslint-disable-next-line max-len
    throw new functions.https.HttpsError('internal', 'Brak konfiguracji hasła w bazie.');
  }

  // Porównanie hasła
  const isMatch = await bcrypt.compare(userPassword, storedHash);

  if (!isMatch) {
    throw new functions.https.HttpsError('unauthenticated', 'Błędne hasło!');
  }

  // Wygenerowanie Custom Tokenu
  const customToken = await admin.auth().createCustomToken('app_member');

  return { token: customToken };
});
