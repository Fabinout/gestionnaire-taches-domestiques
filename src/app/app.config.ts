import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {environment} from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // 1. Initialisation de l'application Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // 2. Fournisseur pour Authentication
    provideAuth(() => getAuth()),
    // 3. Fournisseur pour Cloud Firestore
    provideFirestore(() => getFirestore())
  ]
};
