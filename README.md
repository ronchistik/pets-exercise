# Novellia Pets

A pet medical records management system built with TypeScript.

## Quick Start

```bash
make install
make dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Features

- Pet Management (CRUD)
- Medical Records (Vaccines & Allergies)
  - Track vaccine due dates for upcoming renewals
  - Track allergy severity (mild/severe)
- Dashboard with statistics
  - Upcoming vaccines (due within 60 days)
  - Severe allergies alerts
  - Pets by type breakdown
- Search & Filter
- Export pet data to JSON

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite

## Project Structure

```
Novellia/
├── backend/
│   ├── server.ts          # Express server with types
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # Reusable components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── PetCard.tsx
    │   │   ├── StatCard.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Toast.tsx
    │   │   └── LoadingError.tsx
    │   ├── pages/         # Page components
    │   │   ├── Dashboard.tsx
    │   │   ├── PetList.tsx
    │   │   ├── PetDetail.tsx
    │   │   └── PetForm.tsx
    │   ├── context/       # React Context
    │   │   └── ToastContext.tsx
    │   ├── types.ts       # Shared TypeScript types
    │   ├── utils.ts       # Utility functions
    │   ├── App.tsx
    │   └── main.tsx
    ├── tsconfig.json
    └── package.json
```

## Development

- `make dev` - Run both servers in development mode with hot reload
- `make start` - Build and run production version
- `make stop` - Stop all running servers
- `make clean` - Remove all build artifacts and dependencies

## Authentication Discussion

For production, I would implement:
- JWT-based authentication with refresh tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Protected API routes with middleware
- Role-based access (user vs admin)

## Future Enhancements

Additional features I would add:
- Sort and filter options for dashboard tables (sort by pet type or due date, filter by vaccine type, etc.)
- Dashboard date range filtering (view today's visits, this week, this month, custom date range)
- Pagination or scrollable containers for large datasets on dashboard
- Audit log table to track all record updates (who changed what and when)
- Role based user permissions system  (view-only vs full edit access)
- Database migrations system for version-controlled schema changes
