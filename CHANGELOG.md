# Changelog

All notable changes to the Navigame Admin project will be documented in this file.

## [Unreleased]

### Added
- **AI POI Generation Feature**
  - Integration with OpenRouter API for AI-powered POI generation
  - Support for multiple AI models (Claude, GPT-4, Gemini, Llama, etc.)
  - Custom prompt input for describing desired POIs
  - Configurable dynamic fields for generated POIs
  - Preview and selective import of generated POIs
  - Model selection with pricing information
  - Comprehensive AI generation guide ([AI_GENERATION.md](AI_GENERATION.md))

- **Console Commands for Email Management**
  - `npm run add-email` - Add emails to allowed list
  - `npm run list-emails` - View all allowed emails
  - `npm run remove-email` - Remove emails from allowed list
  - Firebase Admin SDK integration for server-side operations

- **Documentation**
  - Detailed setup guide ([SETUP.md](SETUP.md))
  - CLI commands reference ([CLI_COMMANDS.md](CLI_COMMANDS.md))
  - AI generation guide ([AI_GENERATION.md](AI_GENERATION.md))
  - Environment variable examples (`.env.example`)

### Changed
- Updated navigation to include AI Generate page
- Enhanced README with AI features and setup instructions
- Added OpenRouter API key to environment configuration

## [1.0.0] - 2025-11-01

### Added
- Initial release with core features:
  - Firebase Authentication with Google OAuth
  - Email whitelist system for access control
  - CRUD operations for Countries, Cities, Categories, and POIs
  - Dynamic fields support for POIs
  - Pagination, search, and bulk delete operations
  - Protected routes with authentication guards
  - Responsive dashboard with dark mode
  - Layered architecture (Models, Repositories, Services, Components)

### Features
- **Authentication**
  - Google OAuth integration
  - Email-based access control
  - Protected routes

- **Data Management**
  - Countries (name, ISO code)
  - Cities (name, country reference with denormalized names)
  - Categories (name, description)
  - POIs (name, category, city, address, dynamic fields)

- **UI/UX**
  - Modern responsive design with Tailwind CSS
  - Dark mode support
  - Loading states and error handling
  - Modal dialogs for forms
  - Confirmation prompts for deletions

- **Database**
  - Firestore integration
  - Real-time updates
  - Timestamp tracking (createdAt, updatedAt)
  - Efficient querying with pagination

### Tech Stack
- Next.js 16 (App Router)
- TypeScript with strict mode
- Firebase (Authentication & Firestore)
- Tailwind CSS v4
- React Hook Form
- Zod validation
- TanStack Table

---

## Version History

- **v1.0.0** - Initial release with core CRUD functionality
- **Unreleased** - AI generation feature, CLI tools, enhanced documentation
