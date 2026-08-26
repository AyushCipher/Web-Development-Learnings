# Asset Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss&logoColor=white) ![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-SQL-ffb86b) ![License](https://img.shields.io/badge/License-Unlicensed-lightgrey)

A production-minded digital asset marketplace built with Next.js, TypeScript, Drizzle ORM, Better Auth, Cloudinary, and PayPal. Creators can upload assets, admins can review and approve submissions, and buyers can purchase approved assets, download them instantly, and retrieve invoices from a single account.

![Asset Platform preview](public/hero-asset-marketplace.png)

## Overview

Asset Platform is a full-stack marketplace for selling digital visual assets. The application is designed around three roles:

- Creators upload assets with titles, descriptions, categories, and prices.
- Admins review submissions, manage categories, and approve or reject assets.
- Buyers browse the public gallery, complete PayPal checkout, download purchased files, and open invoices on demand.

The app uses the Next.js App Router, server actions, and route handlers to keep the user experience fast while still enforcing authentication and role-based access control on the server.

## Key Features

- Role-based authentication with Google sign-in and admin support.
- Creator dashboard for uploading and tracking asset submissions.
- Admin approval queue for approving or rejecting marketplace content.
- Category management for organizing the asset catalog.
- Public gallery with category filters and premium previews.
- PayPal checkout flow with purchase verification and DB persistence.
- Instant asset downloads for verified buyers.
- Invoice generation and retrieval for completed purchases.
- Cloudinary-backed image uploads with signed server-side signatures.
- Theme switching, responsive layouts, and polished UI components.

## Project Architecture

The codebase follows a clear separation between UI, server logic, and persistence:

- `src/app` contains the route-based UI, layouts, and API route handlers.
- `src/components` contains reusable UI, dashboard, auth, and admin components.
- `src/actions` contains server actions for assets, payments, invoices, and admin workflows.
- `src/lib` contains shared infrastructure for authentication, database access, utilities, and invoice generation.
- `drizzle/` stores schema migration history and snapshots.

### System Design

```mermaid
flowchart TD
  A[Creator uploads asset] --> B[Cloudinary signed upload]
  B --> C[Server action saves asset as pending]
  C --> D[Admin reviews submission]
  D -->|Approve| E[Asset becomes public]
  D -->|Reject| F[Asset stays hidden]
  E --> G[Buyer browses gallery]
  G --> H[PayPal checkout]
  H --> I[Capture callback verifies payment]
  I --> J[Persist payment, purchase, invoice]
  J --> K[Buyer downloads asset]
  J --> L[Buyer opens invoice]
```

### Workflow

1. A creator signs in and uploads an image asset from the dashboard.
2. The client requests a Cloudinary signature from the server.
3. The file is uploaded to Cloudinary, then the asset metadata is saved with a `pending` status.
4. An admin approves or rejects the submission from the approval queue.
5. Approved assets appear in the public gallery with category filters and pricing.
6. A buyer starts a PayPal checkout, returns through the capture endpoint, and the payment is verified.
7. The app records the payment, purchase, and invoice in PostgreSQL.
8. The buyer can download the asset and open the generated invoice later from the purchases page.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI |
| Styling | Tailwind CSS, `tailwind-merge`, `class-variance-authority`, `next-themes` |
| Authentication | Better Auth, Google OAuth |
| Database | PostgreSQL, Drizzle ORM, Drizzle Kit |
| Media Uploads | Cloudinary |
| Payments | PayPal Checkout API |
| Validation | Zod |
| Icons and UI helpers | Lucide React, Sonner, `date-fns` |

## Folder Structure

```text
src/
  actions/              # Server actions for assets, admin, invoices, payments
  app/                  # App Router pages and API routes
    admin/              # Admin dashboard pages
    api/                # Auth, Cloudinary, download, invoice, PayPal routes
    dashboard/          # Creator dashboard pages
    gallery/            # Public marketplace pages
    login/              # Login page
  components/           # Shared UI and feature components
  lib/                  # Auth, DB, utilities, invoice generation

drizzle/                # Database migrations and snapshots
public/                 # Static assets and hero preview
```

## Installation Guide

### Prerequisites

- Node.js 18+ recommended
- PostgreSQL database
- Cloudinary account
- Google OAuth credentials
- PayPal REST API credentials

### Install dependencies

```bash
npm install
```

### Database setup

1. Create a PostgreSQL database.
2. Add your connection string to `.env.local`.
3. Run your Drizzle migrations:

```bash
npx drizzle-kit push
```

If your local workflow uses another Drizzle command, keep the same schema and migration files under `drizzle/`.

## Environment Variables

Create a `.env.local` file in the project root and populate it with the values below:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
PAYPAL_API_URL="https://api-m.sandbox.paypal.com"
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
```

### Notes

- `DATABASE_URL` is required by the database connection layer.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is used by the client-side upload flow.
- `PAYPAL_API_URL` should point to sandbox or production depending on your environment.
- Google OAuth is used for authentication, while Better Auth handles session management and role mapping.

## Running the Project

### Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET, POST | `/api/auth/[...all]` | Better Auth handler for login, session, and auth callbacks |
| POST | `/api/cloudinary/signature` | Returns a signed upload payload for Cloudinary |
| GET | `/api/paypal/capture` | Captures a PayPal order and records the purchase |
| GET | `/api/download/[id]` | Redirects verified buyers to the asset file |
| GET | `/api/invoice/[id]` | Returns the generated invoice HTML |

## Screenshots

### Marketplace home

Replace this placeholder with a screenshot of the landing page or keep the current hero image as a featured preview.

### Gallery view

Add a screenshot showing category filtering and approved assets.

### Dashboard and admin views

Add screenshots of the creator dashboard, approval queue, and settings panel.

## Future Improvements

- Add search, sorting, and pagination to the public gallery.
- Support additional payment providers and currencies.
- Introduce analytics for uploads, conversions, and revenue.
- Add asset versioning and richer file metadata.
- Expand invoice templates and export formats.
- Improve moderation with audit trails and rejection reasons.

## Challenges Solved

- Coordinating client uploads with server-side Cloudinary signatures.
- Keeping purchases tamper-resistant by validating PayPal captures before writing to the database.
- Enforcing role-based access so creators, buyers, and admins see only the workflows they should.
- Keeping the asset lifecycle coherent across pending, approved, purchased, and invoiced states.
- Building a responsive UI that still feels like a real marketplace rather than a starter template.

## Learning Outcomes

- Practical use of the Next.js App Router with server actions and route handlers.
- Role-aware authentication and session handling with Better Auth.
- Drizzle ORM schema design and relational modeling in PostgreSQL.
- Integrating Cloudinary for secure media uploads.
- Designing a payment flow that records purchases only after capture verification.
- Building a polished marketplace UI with reusable design-system components.

## Why This Project Stands Out

- It combines marketplace UX, admin moderation, and secure payment processing in one cohesive system.
- The architecture is clean enough to scale but still easy to explain in interviews and portfolio reviews.
- The project demonstrates full-stack ownership: frontend UI, backend workflows, database design, and third-party integrations.
- It shows careful handling of business logic that matters in real products, such as approval gates, verified downloads, and invoice retrieval.

## License

No license file is currently included in this repository. If you plan to open-source the project, add a license such as MIT, Apache-2.0, or GPL-3.0 before publishing.
