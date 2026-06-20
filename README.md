#  TaskFlow - Mini Project Management Portal

A premium full-stack Project Management Portal built for the o2h Full Stack Application Developer Fresher Hiring Assessment. It supports secure JWT authentication, status updates, statistics, search filters, sorting, responsive styling (glassmorphism design), and a dark mode toggle.

---

## Tech Stack

- **Frontend**: React (Vite, JavaScript), Axios, Custom Vanilla CSS (Premium, Glassmorphism-inspired)
- **Backend**: Node.js, Express
- **Database**: SQLite (via Sequelize ORM) for file-based database storage
- **Testing**: Jest, Supertest

---

##  Folder Structure

```
project-root/
├── backend/
│   ├── config/          # Sequelize database connection setup
│   ├── controllers/     # Authentication & Task route controllers
│   ├── models/          # Sequelize Database Models (User, Task)
│   ├── routes/          # REST API endpoints (Auth, Tasks)
│   ├── middleware/      # JWT Authentication protection logic
│   ├── tests/           # Integration tests using Jest & Supertest
│   ├── app.js           # Express app wrapper
│   ├── server.js        # Server network listener
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React UI widgets
│   │   ├── pages/       # Dashboard, AddTask, and Auth (Login/Register) pages
│   │   ├── services/    # Axios client and backend service wrappers
│   │   ├── App.jsx      # Global Router & Theme layout controller
│   │   ├── index.css    # Premium CSS design system (Light/Dark themes)
│   │   └── main.jsx     # App mounting entrypoint
│   └── package.json
└── README.md
```

---

##  Setup and Installation

### 1. Prerequisites
Ensure you have **Node.js** (v16+) and **npm** installed on your system.

### 2. Clone the Repository
```bash
git clone <repository-url>
cd Project_Mngmnt_o2h
```

### 3. Setup Backend
1. Go to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The backend uses environment variables. A pre-configured `.env` is created automatically, containing:
   ```env
   PORT=5000
   JWT_SECRET=supersecretkeyforminiportal
   NODE_ENV=development
   ```
4. Start the server (development mode with Nodemon):
   ```bash
   npm run dev
   ```
   *The backend server will run at `http://localhost:5000` and automatically create/populate the local SQLite database file `database.sqlite`.*

### 4. Setup Frontend
1. In a new terminal tab, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend dashboard will run at `http://localhost:5173`.*

---

##  Running Automated Tests

To execute the backend integration tests verifying all API endpoints, validation logic, and authentication locks:
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run tests:
   ```bash
   npm test
   ```

---

##  Assumptions Made

1. **SQLite Database**: SQLite was selected instead of MongoDB/MySQL to enable **out-of-the-box operation**. The database is a local file (`database.sqlite`) created automatically on startup, requiring no external server configuration.
2. **User Isolation**: All tasks are strictly mapped to the logged-in User ID. Users can only search, filter, view, create, edit, or delete their own tasks.
3. **Task Status Flow**: Tasks can be created in `Pending` or `In Progress` status. They can be completed directly from the dashboard view.
4. **Description Validation**: Client-side and server-side rules enforce that description values must be at least 20 characters long.
5. **Theme Persistence**: Light or Dark mode selections are stored in the user's browser `localStorage`, ensuring preferences persist across page reloads.

---

##  API Documentation

All routes except authentication require a valid JWT token sent in the `Authorization` header as: `Bearer <token>`.

###  Authentication Endpoints

#### 1. Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### Task Management Endpoints (Protected)

#### 3. Get All Tasks
- **URL**: `/api/tasks`
- **Method**: `GET`
- **Query Parameters**:
  - `search` (string, optional) - search term in title or description.
  - `status` (string, optional) - `Pending`, `In Progress`, or `Completed`.
  - `sortBy` (string, optional) - `newest`, `oldest`, `title_asc`, `title_desc`.
  - `page` (number, optional) - defaults to 1.
  - `limit` (number, optional) - page size limit (defaults to 6).
- **Response** (200 OK):
  ```json
  {
    "tasks": [
      {
        "id": 1,
        "title": "Build Login Page",
        "description": "Create a responsive login page using custom css styles.",
        "status": "Pending",
        "user_id": 1,
        "created_at": "2026-06-20T14:14:00.000Z",
        "updated_at": "2026-06-20T14:14:00.000Z"
      }
    ],
    "total": 1,
    "pages": 1,
    "currentPage": 1
  }
  ```

#### 4. Create Task
- **URL**: `/api/tasks`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Build Login Page",
    "description": "Create a responsive login page using custom css styles.",
    "status": "Pending"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 1,
    "title": "Build Login Page",
    "description": "Create a responsive login page using custom css styles.",
    "status": "Pending",
    "user_id": 1,
    "created_at": "2026-06-20T14:14:00.000Z",
    "updated_at": "2026-06-20T14:14:00.000Z"
  }
  ```

#### 5. Update Task
- **URL**: `/api/tasks/:id`
- **Method**: `PUT`
- **Request Body** (Any properties to change):
  ```json
  {
    "status": "Completed"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 1,
    "title": "Build Login Page",
    "description": "Create a responsive login page using custom css styles.",
    "status": "Completed",
    "user_id": 1,
    "created_at": "2026-06-20T14:14:00.000Z",
    "updated_at": "2026-06-20T14:14:15.000Z"
  }
  ```

#### 6. Delete Task
- **URL**: `/api/tasks/:id`
- **Method**: `DELETE`
- **Response** (200 OK):
  ```json
  {
    "message": "Task deleted successfully."
  }
  ```

#### 7. Get Task Stats
- **URL**: `/api/tasks/stats`
- **Method**: `GET`
- **Response** (200 OK):
  ```json
  {
    "total": 5,
    "pending": 2,
    "inProgress": 1,
    "completed": 2
  }
  ```
