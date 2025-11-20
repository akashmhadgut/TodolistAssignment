# Minitasks Backend

Simple Express backend for authentication and tasks CRUD.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```powershell
cd backend
npm install
```

3. Run in dev mode:

```powershell
npm run dev
```

APIs

- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/auth/profile` (auth)
- `PUT /api/auth/profile` (auth)
- `GET /api/tasks` (auth) ?q=search
- `POST /api/tasks` (auth) { title, description }
- `PUT /api/tasks/:id` (auth)
- `DELETE /api/tasks/:id` (auth)

This backend uses JWT for authentication and MongoDB for persistence.
