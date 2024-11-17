# Flappy Seal

A fun and engaging web-based game featuring a seal as the main character.

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file in the root directory
4. Copy the contents of `.env.example` to `.env`
5. Fill in your Firebase configuration values in the `.env` file
6. Run `npm run dev` to start the development server

## Environment Variables

The following environment variables are required:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Make sure to never commit your `.env` file to version control.