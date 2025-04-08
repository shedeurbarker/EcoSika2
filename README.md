# EcoSika

A Next.js application with TypeScript, Tailwind CSS, and Firebase integration.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Firebase:

-   Update the Firebase configuration in `src/firebase/config.ts` with your Firebase project credentials
-   You can find these credentials in your Firebase Console under Project Settings

3. Start the development server:

```bash
npm run dev
```

## Project Structure

```
src/
  ├── pages/          # Next.js pages
  ├── components/     # React components
  ├── styles/         # Global styles and Tailwind CSS
  ├── firebase/       # Firebase configuration
  └── types/          # TypeScript type definitions
```

## Available Scripts

-   `npm run dev`: Runs the app in development mode
-   `npm run build`: Builds the app for production
-   `npm start`: Runs the built app in production mode
-   `npm run lint`: Runs the linter

## Tech Stack

-   Next.js 14
-   TypeScript
-   Tailwind CSS
-   Firebase
