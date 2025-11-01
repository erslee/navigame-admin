# Navigame Admin Dashboard

Admin dashboard for managing Navigame data with Firebase authentication and Firestore database.

## Features

- **Google OAuth Authentication** with email whitelist
- **AI-Powered POI Generation** using OpenRouter ([detailed guide](AI_GENERATION.md)):
  - Select from multiple AI models (Claude, GPT-4, Gemini, Llama)
  - Generate POIs based on custom prompts
  - Specify country, city, and category
  - Define custom dynamic fields
  - Preview and selectively import generated POIs
- **CRUD Operations** for:
  - Countries (name, ISO code)
  - Cities (name, country reference)
  - Categories (name, description)
  - Points of Interest (name, category, city, address, dynamic fields)
- **Advanced Table Features**:
  - Pagination
  - Search/filtering
  - Bulk delete operations
- **Dynamic Fields** for POIs with add/remove UI
- **Email Whitelist Management** to control access
- **Responsive Design** with dark mode support

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript** with strict mode
- **Firebase** (Authentication & Firestore)
- **OpenRouter** (AI model integration)
- **Tailwind CSS v4**
- **React Hook Form**
- **Zod** for validation
- **TanStack Table** for advanced data tables

## Project Structure

```
navigame-admin/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/                # Login page
│   └── (dashboard)/              # Protected dashboard routes
│       ├── countries/            # Countries CRUD
│       ├── cities/               # Cities CRUD
│       ├── categories/           # Categories CRUD
│       ├── pois/                 # POIs CRUD
│       └── admin/
│           └── allowed-emails/   # Email whitelist management
│
├── src/
│   ├── models/                   # TypeScript interfaces
│   ├── providers/                # Firebase & Auth providers
│   ├── repositories/             # Firestore data access layer
│   ├── services/                 # Business logic layer
│   └── components/               # React components
│       ├── auth/                 # Authentication components
│       ├── common/               # Reusable UI components
│       ├── countries/            # Country CRUD components
│       ├── cities/               # City CRUD components
│       ├── categories/           # Category CRUD components
│       ├── pois/                 # POI CRUD components
│       ├── layout/               # Dashboard layout
│       └── admin/                # Admin components
│
└── .env.local                    # Environment variables (create this)
```

## Setup Instructions

📖 **For detailed step-by-step setup instructions, see [SETUP.md](SETUP.md)**

### Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Google" provider
4. Create a **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Start in test mode or configure security rules
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Copy the config values

### 3. Configure OpenRouter (for AI features)

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to **Keys** in your account settings
4. Click **Create Key**
5. Copy the API key (starts with `sk-or-v1-`)

### 4. Set Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# OpenRouter Configuration (for AI POI generation)
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
```

### 4. Set Up Firebase Service Account (for Console Commands)

To use console commands for managing allowed emails, you need a Firebase service account:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `firebase-service-account.json` in the project root

⚠️ **Important**: Never commit this file to version control (it's already in .gitignore)

### 5. Add Your First Allowed Email

You need to add your email to the allowed list before you can sign in.

**Option A: Using Console Command (Recommended)**

```bash
npm run add-email your-email@example.com
```

**Option B: Using Firebase Console**

1. Go to Firestore Database
2. Create a collection named `allowedEmails`
3. Add a document with ID = your email address
4. Add these fields:
   ```
   email: "your-email@example.com"
   addedBy: "system"
   createdAt: [current timestamp]
   ```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Production Build

```bash
npm run build
npm start
```

## Console Commands

📋 **For complete CLI commands reference, see [CLI_COMMANDS.md](CLI_COMMANDS.md)**

Manage allowed emails using command line scripts:

### Add an Email

```bash
npm run add-email your-email@example.com
```

### List All Allowed Emails

```bash
npm run list-emails
```

### Remove an Email

```bash
npm run remove-email your-email@example.com
```

**Note**: These commands require the Firebase service account JSON file (see Setup Instructions step 4).

## Usage

### First-Time Setup

1. Visit http://localhost:3000
2. You'll be redirected to the login page
3. Click "Continue with Google"
4. Sign in with an email that's in the allowed list
5. You'll be redirected to the Countries page

### Managing Data

#### Countries
- Navigate to "Countries" in the sidebar
- Click "Add Country" to create a new country
- Enter name and 2-letter ISO code (e.g., "US", "FR")
- Use search, edit, delete, or bulk delete operations

#### Cities
- Navigate to "Cities"
- Click "Add City"
- Enter city name and select a country from the dropdown
- The city will store both the country ID and name

#### Categories
- Navigate to "Categories"
- Click "Add Category"
- Enter name and optional description

#### POIs (Points of Interest)
- Navigate to "POIs"
- Click "Add POI"
- Fill in:
  - Name
  - Category (dropdown)
  - City (dropdown)
  - Address (required)
  - Dynamic fields (optional key-value pairs)
- Add custom fields by entering field name and value, then click "Add"
- Remove fields by clicking "Remove" next to the field

#### AI POI Generation
- Navigate to "AI Generate" in the sidebar
- Select an AI model from the dropdown (e.g., Claude, GPT-4, Gemini, Llama)
- Enter a detailed prompt describing the POIs you want to generate
  - Example: "Popular tourist attractions with historical significance"
  - Example: "Family-friendly restaurants with outdoor seating"
- Select Country, City, and Category
- Specify number of POIs to generate (1-50)
- (Optional) Add comma-separated dynamic fields
  - Example: "phone, website, opening_hours, price_range"
- Click "Generate POIs"
- Review the generated POIs in the preview
- Remove any unwanted POIs by clicking "Remove"
- Click "Import All" to add them to your database

### Managing Access

1. Navigate to "Allowed Emails"
2. Enter an email address and click "Add"
3. Only emails in this list can sign in
4. Remove emails by clicking "Remove"

## Data Models

### Country
```typescript
{
  id: string
  name: string
  code: string (2-letter ISO code)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### City
```typescript
{
  id: string
  name: string
  countryId: string
  countryName: string (denormalized)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Category
```typescript
{
  id: string
  name: string
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### POI
```typescript
{
  id: string
  name: string
  categoryId: string
  categoryName: string (denormalized)
  cityId: string
  cityName: string (denormalized)
  address: string
  dynamicFields: Record<string, string>
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Architecture

This project follows a layered architecture pattern:

- **Models**: Type definitions and interfaces
- **Providers**: Firebase initialization and authentication context
- **Repositories**: Direct Firestore operations (CRUD, pagination, search)
- **Services**: Business logic and validation
- **Components**: React UI components

## Security

- Email whitelist stored in Firestore
- Protected routes with authentication guards
- Only authenticated and whitelisted users can access the dashboard
- Google OAuth for secure authentication

## Firestore Collections

The application uses these Firestore collections:

- `countries` - Country records
- `cities` - City records
- `categories` - Category records
- `pois` - Point of Interest records
- `allowedEmails` - Email whitelist (document ID = email address)

## Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is allowed
    function isAllowed() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/allowedEmails/$(request.auth.token.email));
    }

    // All collections require authentication and whitelist
    match /{collection}/{document=**} {
      allow read, write: if isAllowed();
    }
  }
}
```

## Development Scripts

```bash
# Development & Build
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint

# Email Management (requires firebase-service-account.json)
npm run add-email     # Add an email to allowed list
npm run list-emails   # List all allowed emails
npm run remove-email  # Remove an email from allowed list
```

## Troubleshooting

### "Your email is not authorized"
- Make sure your email is added to the `allowedEmails` collection in Firestore
- Document ID must be your exact email address

### Import errors
- Make sure the `@/*` path alias is configured in `tsconfig.json` to point to `./src/*`

### Firebase errors
- Verify all environment variables in `.env.local` are correct
- Make sure Google Auth is enabled in Firebase Console
- Check that Firestore database is created

### AI Generation not working
- Make sure `NEXT_PUBLIC_OPENROUTER_API_KEY` is set in `.env.local`
- Verify your OpenRouter API key is valid
- Check that you have credits in your OpenRouter account
- Try a different AI model if one fails
- Make sure your prompt is clear and specific

## License

MIT
