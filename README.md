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

## Testing

Frontend includes comprehensive unit and integration tests using Vitest and React Testing Library.

```bash
cd frontend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test:coverage     # Coverage report
```

**Test Coverage:** 82 tests (81 passing + 1 skipped)

### Unit Tests (65 tests)
- **Utils (12 tests):** emoji mapping, date formatting, age calculations
- **Components (45 tests):** Button, Badge, Card, Modal, PetCard, StatCard, LoadingError
- **Context (8 tests):** ToastContext provider and operations

### Form Tests (16 tests)
- **PetForm:** Field validation, user interactions, error handling, accessibility
  - Required field validation
  - Form fill and submission flow
  - Error message display and clearing
  - Disabled state during submission

### API Integration Tests (10 tests - requires backend running)
- **CRUD operations:** GET, POST, PUT, DELETE for pets and records
- **Response validation:** Status codes and data structure verification
- **Error handling:** 404 responses for non-existent resources

```bash
# Run API tests (requires `make dev` to be running)
cd frontend
npm test -- --run src/__tests__/api.test.ts
```

Tests are organized in `__tests__/` folders alongside source code.

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
- Handle more robust edge cases like duplicate names, calendar date logic etc. 
