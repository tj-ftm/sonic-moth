# Moth VS Lamp - Google IDX & Firebase Edition

A survival game built with React, TypeScript, and Firebase, optimized for Google IDX development environment.

## 🚀 Getting Started with Google IDX

This project is configured to work seamlessly with Google IDX. Simply open the project in IDX and it will automatically:

- Install all dependencies
- Set up the development environment
- Configure Firebase emulators
- Start the development server

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (optional)
4. Copy your Firebase config and create a `.env` file:

```bash
cp .env.example .env
```

Fill in your Firebase configuration values in the `.env` file.

### 2. Firebase Emulators (Development)

For local development, the project uses Firebase emulators:

```bash
# Start emulators
npm run firebase:emulators

# In another terminal, start the dev server
npm run dev
```

### 3. Production Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
npm run firebase:deploy:hosting

# Deploy functions
npm run firebase:deploy:functions

# Deploy Firestore rules
npm run firebase:deploy:firestore
```

## 🎮 Game Features

- **Survival Gameplay**: Navigate as a moth avoiding obstacles
- **Real-time Leaderboard**: Powered by Firestore
- **Wallet Integration**: Connect Sonic Network wallets
- **Mobile Optimized**: Touch controls for mobile devices
- **Progressive Web App**: Installable on mobile devices

## 🏗️ Project Structure

```
├── .idx/                   # Google IDX configuration
├── functions/              # Firebase Cloud Functions
├── src/
│   ├── components/         # React components
│   ├── lib/
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── firestore.ts    # Firestore operations
│   └── pages/              # Application pages
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## 🔥 Firebase Services Used

- **Firestore**: Real-time database for leaderboards and user profiles
- **Cloud Functions**: Server-side logic for score validation
- **Hosting**: Static site hosting
- **Authentication**: User authentication (optional)

## 🌐 Environment Variables

Required environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 📱 Mobile Support

The game includes full mobile support with:
- Touch controls for movement and shooting
- Responsive design
- Mobile-optimized UI components
- Progressive Web App capabilities

## 🔐 Security

- Firestore security rules prevent unauthorized access
- Client-side validation with server-side verification
- Wallet address validation for score submissions

## 🚀 Deployment

The project is configured for easy deployment to Firebase Hosting:

1. Build the project: `npm run build`
2. Deploy: `npm run firebase:deploy`

## 🛠️ Development

- **Hot Reload**: Automatic reloading during development
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Firebase Emulators**: Local development environment

## 📄 License

This project is open source and available under the MIT License.