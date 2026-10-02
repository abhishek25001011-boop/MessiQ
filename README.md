# MessIQ

MessIQ is a web application for coordinating campus dining. It gives students a place to view meal menus, record meal preferences, review their history, manage their profile, and leave meal feedback. Administrators can manage menus and review student and meal activity.

## Problem

Campus dining teams need a clearer way to publish menus and understand expected participation. Students need a convenient way to see what is being served and communicate their meal choices. MessIQ brings these workflows together in one role-aware application.

## Features

- Email and password sign-in and account registration with Firebase Authentication.
- Student and administrator experiences protected by authentication and role checks.
- Date-based breakfast, lunch, snacks, and dinner menus.
- Meal preference selection and date-wise preference history.
- Student profile viewing and editing.
- Meal feedback with a rating from 1 to 5 and a comment.
- Administrator student management, meal management, and participation/feedback analytics.
- Responsive layout with light and dark themes.

## Tech stack

- React 18, TypeScript, and Vite
- React Router
- Firebase Authentication and Cloud Firestore
- Tailwind CSS, shadcn/ui, Radix UI, and Lucide icons
- Recharts for dashboard visualizations

## Firebase and Firestore architecture

The application uses the Firebase Web SDK initialized once in `src/firebase.ts`. Authentication is provided by Firebase Authentication; Firestore reads and writes use the shared `db` instance exported from that module.

The current Firestore data model uses:

| Collection | Purpose |
| --- | --- |
| `users/{uid}` | Student or administrator profile keyed by Firebase Authentication UID. The `role` field controls access. |
| `meals/{mealId}` | Menu entries with `date`, `type`, `name`, `description`, and `createdAt`. |
| `mealSelections/{preferenceId}` | A student's meal choices, keyed to avoid duplicate user/date/meal-type entries. |
| `feedback/{feedbackId}` | Meal ratings and comments associated with a student UID and meal ID. |

Firestore access is governed by [`firestore.rules`](firestore.rules). The rules restrict student records to their owner and allow administrator operations according to the user's Firestore role. Configure and review the rules for your own Firebase project before making it publicly accessible. A Firebase web API key is included in the browser app configuration; it identifies the Firebase project and is not a server credential. Never put service account keys, private keys, or other server credentials in this frontend repository. Use Firebase Authentication, Firestore Security Rules, and appropriate Firebase API restrictions to protect project data.

## Requirements

- Node.js 20 or later and npm
- A Firebase project with Email/Password Authentication and Cloud Firestore enabled
- An administrator account whose `users/{uid}.role` is set to `admin` using a trusted administrative process

## Local setup

1. Clone the repository and open its directory.
2. Install dependencies:

   ```sh
   npm ci
   ```

3. Configure the Firebase project used by the application in `src/firebase.ts` (Firebase web app configuration only).
4. Start the development server:

   ```sh
   npm run dev
   ```

5. Open the local URL printed by Vite.

Useful checks:

```sh
npm run build
npm run lint
npm test
```

## Environment configuration

The current Firebase Web SDK configuration is initialized in `src/firebase.ts`; this project does not currently read Firebase settings from environment variables. If you adapt it to use Vite environment variables, use a local `.env.local` file and the `VITE_` prefix (for example, `VITE_FIREBASE_PROJECT_ID`). Vite variables are embedded in the client bundle, so they are public configuration and must never contain private credentials. `.env` files are ignored by Git; `.env.example` may be committed for documenting variable names without values.

## Deployment

The project is configured for Firebase Hosting. After setting up a Firebase project and selecting it for the Firebase CLI, deploy the production build:

```sh
npm ci
npm run build
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only hosting,firestore:rules
```

The Hosting configuration serves Vite's `dist` directory and rewrites application routes to `index.html`. Confirm the selected Firebase project, Authentication providers, Firestore rules, and administrator role before deployment. This repository preparation does not deploy the application.

For a different static hosting provider, build with `npm run build`, publish `dist`, and configure the host to serve `index.html` for client-side routes.

## Screenshots

_Screenshots will be added here._

<!-- Add screenshots to a repository folder (for example, docs/screenshots/) and link them here. -->
