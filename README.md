<p align="center">
  <h1 align="center">🚀 FlowBoard</h1>
  <p align="center">
    <strong>A modern team task manager built with React, Express, and PostgreSQL</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT" />
  </p>
</p>

---

FlowBoard is a full-stack project management application that brings the power of Kanban boards, role-based access control, and real-time activity tracking to your team — all wrapped in a sleek, modern dark UI inspired by tools like Linear and Notion.

---

## ✨ Features

- 📋 **Kanban Board** — Drag-and-drop task management with 4 status columns (To Do, In Progress, In Review, Done)
- 👥 **Team Collaboration** — Invite members, assign tasks, and track activity across your projects
- 🔐 **Role-Based Access** — Admin and Member roles with granular permissions for project management
- 📊 **Dashboard Analytics** — Visual charts for task status distribution and priority breakdown
- 🎨 **Modern Dark UI** — Glassmorphism design with smooth animations, inspired by Linear and Notion
- ⏰ **Due Date Tracking** — Overdue detection and upcoming task alerts to keep your team on schedule
- 📝 **Activity Logging** — Complete audit trail of all project actions for full transparency
- 🔍 **Search & Filter** — Find tasks by status, priority, assignee, and more
- 📱 **Responsive Design** — Fully functional on desktop, tablet, and mobile devices
- 🚀 **One-Click Deploy** — Railway-ready with monorepo configuration out of the box

---

## 🛠️ Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 | Node.js |
| Vite | Express 5 |
| Tailwind CSS v4 | Prisma ORM |
| React Router v7 | PostgreSQL |
| Recharts | JWT Authentication |
| @hello-pangea/dnd | bcryptjs |
| Axios | Zod Validation |
| lucide-react | |

---

## 📁 Project Structure

```
FlowBoard/
├── package.json            # Root monorepo scripts
├── railway.toml            # Railway deployment config
├── README.md
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── src/
│       ├── index.js         # Express server entry point
│       ├── config/
│       │   └── env.js       # Environment variable loader
│       ├── middleware/
│       │   ├── auth.js      # JWT authentication middleware
│       │   ├── rbac.js      # Role-based access control
│       │   └── validate.js  # Zod request validation
│       ├── routes/
│       │   ├── auth.js      # Authentication routes
│       │   ├── projects.js  # Project CRUD routes
│       │   ├── tasks.js     # Task management routes
│       │   └── members.js   # Member management routes
│       └── schemas/
│           └── index.js     # Zod validation schemas
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── tailwind.config.js
    └── src/
        ├── App.jsx          # Root app with routing
        ├── main.jsx         # React entry point
        ├── api/
        │   └── axios.js     # Axios instance & interceptors
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Projects.jsx
        │   ├── ProjectBoard.jsx
        │   └── NotFound.jsx
        └── components/
            ├── Navbar.jsx
            ├── TaskCard.jsx
            ├── KanbanColumn.jsx
            ├── CreateTaskModal.jsx
            └── MemberList.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** 14 or higher
- **npm** v9 or higher

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/flowboard.git
cd flowboard
```

**2. Install dependencies**

```bash
npm install
```

> The `postinstall` script automatically installs dependencies for both `backend/` and `frontend/`.

**3. Set up PostgreSQL database**

Create a new PostgreSQL database for FlowBoard:

```sql
CREATE DATABASE flowboard;
```

**4. Configure environment variables**

```bash
cp backend/.env.example backend/.env
```

Fill in your database connection string and a JWT secret in `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flowboard"
JWT_SECRET="your_super_secret_key_here"
NODE_ENV="development"
PORT=3000
```

**5. Run database migrations**

```bash
cd backend && npx prisma db push
```

**6. Start development servers**

```bash
# Start both frontend and backend concurrently (from the root)
npm run dev

# Or start them separately:
npm run dev:backend    # Backend on http://localhost:3000
npm run dev:frontend   # Frontend on http://localhost:5173
```

**7. Open your browser**

Navigate to **[http://localhost:5173](http://localhost:5173)** and start managing your projects!

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/flowboard` |
| `JWT_SECRET` | Secret key for JWT token signing | `your_super_secret_key` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Backend server port | `3000` |

---

## 📡 API Documentation

All API endpoints are prefixed with `/api`. Protected routes require a valid JWT token in the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ No | Register a new user account |
| `POST` | `/api/auth/login` | ❌ No | Log in and receive a JWT token |
| `GET` | `/api/auth/me` | ✅ Yes | Get the authenticated user's profile |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/projects` | ✅ Yes | Create a new project |
| `GET` | `/api/projects` | ✅ Yes | List all projects for the current user |
| `GET` | `/api/projects/:id` | ✅ Yes | Get project details with tasks and members |
| `PUT` | `/api/projects/:id` | ✅ Admin | Update project name or description |
| `DELETE` | `/api/projects/:id` | ✅ Admin | Delete a project and all its data |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/projects/:id/tasks` | ✅ Yes | Create a new task in a project |
| `GET` | `/api/projects/:id/tasks` | ✅ Yes | List all tasks in a project |
| `PUT` | `/api/tasks/:id` | ✅ Yes | Update task details (title, status, priority) |
| `PATCH` | `/api/tasks/:id/status` | ✅ Yes | Update only the task's status (for drag-and-drop) |
| `DELETE` | `/api/tasks/:id` | ✅ Yes | Delete a task |

### Members

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/projects/:id/members` | ✅ Admin | Add a member to a project by email |
| `GET` | `/api/projects/:id/members` | ✅ Yes | List all members of a project |
| `PUT` | `/api/projects/:id/members/:userId` | ✅ Admin | Update a member's role (Admin/Member) |
| `DELETE` | `/api/projects/:id/members/:userId` | ✅ Admin | Remove a member from a project |

### Activity

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects/:id/activity` | ✅ Yes | Get the activity log for a project |

---

## 🎨 Design System

FlowBoard uses a carefully crafted design system built for clarity and focus:

| Element | Value |
|---------|-------|
| **Primary Background** | Navy `#0F172A` |
| **Accent Color** | Indigo `#6366F1` |
| **Highlight Color** | Cyan `#22D3EE` |
| **Typography** | Inter (Google Fonts) |
| **Border Radius** | `0.75rem` (12px) |
| **Approach** | Dark-first design |

### Design Principles

- **Glassmorphism Cards** — Frosted-glass effect with `backdrop-blur` and semi-transparent backgrounds
- **Animated Transitions** — Smooth hover states, page transitions, and micro-interactions
- **Dark-First Approach** — Designed for dark mode from the ground up, reducing eye strain during long work sessions
- **Consistent Spacing** — 4px grid system with Tailwind's spacing utilities

---

## 🚂 Deployment (Railway)

FlowBoard is pre-configured for one-click deployment on [Railway](https://railway.app):

**1. Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**2. Connect your repo to Railway**

- Go to [railway.app](https://railway.app) and create a new project
- Select **"Deploy from GitHub repo"** and connect your repository

**3. Add a PostgreSQL database**

- In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
- Railway will automatically set the `DATABASE_URL` environment variable

**4. Set environment variables**

Add the following variables in your Railway service settings:

```
JWT_SECRET=your_production_secret_key
NODE_ENV=production
PORT=3000
```

**5. Deploy**

Railway auto-detects the `railway.toml` configuration and handles the rest. Your app will be built with Nixpacks and started with `npm run start`, which runs Prisma migrations and starts the Express server.

> 💡 **Tip:** Railway provides a free subdomain for your app. You can also add a custom domain in the service settings.

---

## 📸 Screenshots

> 🖼️ **Screenshots coming soon!**

| View | Description |
|------|-------------|
| **Dashboard** | Analytics overview with task status charts and priority breakdown |
| **Kanban Board** | Drag-and-drop board with To Do, In Progress, In Review, and Done columns |
| **Projects** | Project list with member counts, task summaries, and quick actions |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 FlowBoard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built with ❤️ by the FlowBoard team
</p>
