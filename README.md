# Welthos

Welthos is an AI-assisted personal finance tracker built with Next.js 15, React 19, Prisma, and MongoDB. It helps users manage accounts, track income and expenses, set budgets, scan receipts with Gemini, and receive automated email reports and alerts.

## Highlights

- Secure JWT-based authentication with protected routes
- Multi-account money tracking with default account support
- Transaction management for income, expenses, and recurring entries
- Budget monitoring with monthly progress and automated alert emails
- AI-powered receipt scanning using Gemini
- Automated monthly reports and recurring transaction processing with Inngest
- Bot protection and rate limiting with Arcjet
- Dashboard views with charts and account-level transaction history

## Tech Stack

- Next.js 15 App Router
- React 19
- Prisma ORM
- MongoDB
- Tailwind CSS 4
- Radix UI
- Inngest
- Resend
- Google Gemini API
- Arcjet

## Project Structure

```text
app/                 App Router pages, layouts, and API routes
action/              Server actions for accounts, budgets, dashboard, and transactions
components/          Shared UI and feature components
emails/              React email templates
lib/                 Auth, Prisma, JWT, Arcjet, and Inngest utilities
prisma/              Prisma schema and migrations
public/              Static assets
scripts/             Local scripts such as standalone seed helpers
```

## Core Features

### Authentication

- Sign up, sign in, sign out, and current-user session endpoints
- Password reset flow with reset-token support
- JWT cookie authentication enforced in middleware

### Accounts and Transactions

- Create current and savings accounts
- Mark one account as the default account
- Add, edit, list, and bulk-delete transactions
- Support recurring transactions with scheduled background processing

### Insights and Automation

- Scan receipt images and extract amount, merchant, date, and category
- Generate monthly financial insights with Gemini
- Send monthly report emails
- Check budget usage and send alert emails automatically

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local `.env` file from `.env.example` and fill in your own values.

Required variables:

```env
DATABASE_URL=
JWT_SECRET=
RESEND_API_KEY=
GEMINI_API_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
ARCJET_KEY=
```

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database

This project uses Prisma with MongoDB.

Useful commands:

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

## Background Jobs

Inngest powers:

- recurring transaction processing
- monthly financial report generation
- budget alert checks

The app exposes an Inngest route at `app/api/inngest/route.js`.

## Email and AI Integrations

- `Resend` is used to deliver emails
- `Gemini` is used for receipt scanning and monthly financial insights
- `Arcjet` is used for bot protection, shielding, and token-bucket rate limiting

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes for Development

- Route protection is handled in `middleware.js`
- Receipt scanning depends on a valid Gemini API key and model access
- Some seed helpers in this repository contain hard-coded IDs and are best treated as local development utilities, not production tooling

## Recommended Improvements

- Add automated tests for auth, transactions, and receipt scanning
- Add a proper seed command wired into `package.json`
- Add deployment instructions for Vercel or Docker

## License

No license has been specified yet.
