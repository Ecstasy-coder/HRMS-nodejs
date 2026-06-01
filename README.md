# HRMS Nodejs — Integrated HR & Admin Portal

## Project Structure

```
HRMS_Nodejs/
├── hrms_backend/          ← Node.js + Express backend (port 3000)
│   ├── config/db.js       ← MongoDB connection
│   ├── controllers/       ← Business logic for all features
│   ├── middleware/        ← Upload handlers (docs, calendar, gallery)
│   ├── models/            ← Mongoose schemas
│   ├── routes/            ← API route definitions
│   ├── uploads/           ← Uploaded files (attendance, calendars, gallery, docs)
│   ├── utils/             ← Helper utilities (birthday utils)
│   ├── server.js          ← Main server entry point
│   ├── package.json
│   └── .env               ← Environment config (MongoDB URI, session secret)
│
└── hrms_frontend/         ← Static HTML/CSS/JS frontend
    ├── login.html         ← Entry point — login page
    ├── dashboard.html     ← HR/Employee dashboard
    ├── profile.html       ← User profile
    ├── attendance.html    ← Attendance view
    ├── my-attendance.html ← Personal attendance
    ├── my-job-cards.html  ← Employee job cards
    ├── my-leaves.html     ← Leave requests
    ├── my-payslips.html   ← Payslip viewer
    ├── birthdays.html     ← Birthday calendar
    ├── holiday-calendar.html
    ├── important-events.html
    ├── gallery.html       ← Company gallery
    ├── help-desk.html     ← Helpdesk tickets
    ├── reporting-manager.html ← RM dashboard
    ├── review-rm-cards.html
    ├── leave-management.html
    ├── users.html         ← User management (HR)
    ├── settings.html      ← Company settings
    ├── about-us.html / about-edit.html
    ├── api-config.js      ← API proxy config for Live Server
    ├── sidebar.html / topbar-utils.js / footer.html / common.css
    ├── assets/images/     ← Shared images & logo
    ├── css/               ← Shared stylesheets
    ├── js/                ← Shared JS modules
    └── admin/             ← ADMIN PORTAL (separate sub-section)
        ├── index.html     ← Admin dashboard entry
        ├── dashboard.html ← Admin dashboard
        ├── users.html     ← Manage all users
        ├── review-jobcards.html ← Review & approve job cards
        ├── hr-leaves.html ← Review HR staff leaves
        ├── events.html    ← Manage events
        ├── birthdays.html ← Birthday overview
        ├── gallery.html   ← Gallery management
        ├── holiday-calendar.html
        ├── analysis.html  ← Analytics & reports
        ├── about.html     ← About us management
        ├── admin-common.css
        ├── admin-utils.js
        └── topbar-utils.js / topbar.css
```

---

## Portals & Roles

| Portal | URL | Access |
|--------|-----|--------|
| Login  | `http://localhost:3000/` | All users |
| HR/Employee Dashboard | `http://localhost:3000/dashboard.html` | Employee, HR Admin, Reporting Manager |
| Admin Dashboard | `http://localhost:3000/admin/dashboard.html` | Admin only |

### User Roles
- **Admin** → Full system access, user management, reviews HR leaves & job cards
- **HR Admin** → Leave management, attendance, payslips, user management
- **Reporting Manager** → Reviews employee job cards
- **Employee** → Personal dashboard, job cards, leaves, attendance, payslips

---

## Setup & Run

### 1. Install dependencies
```bash
cd hrms_backend
npm install
```

### 2. Configure environment
Edit `hrms_backend/.env`:
```
PORT=3000
MONGO_URI=<your-mongodb-connection-string>
SESSION_SECRET=hr_portal_secret_2026
```

### 3. Start the server
```bash
cd hrms_backend
npm start
# or for development:
npx nodemon server.js
```

### 4. Open in browser
```
http://localhost:3000
```

### Create first Admin user
Visit: `http://localhost:3000/create-admin`
- Email: `admin@gmail.com`
- Password: `admin123`

---

## Backend API Summary

### Auth
- `POST /api/login` — Login
- `POST /api/logout` — Logout
- `GET /create-admin` — Create default admin

### Profile
- `GET /api/profile` — Get profile
- `PUT /api/profile` — Update profile
- `POST /api/profile/avatar` — Upload avatar
- `DELETE /api/profile/avatar` — Remove avatar
- `PUT /api/profile/password` — Change password

### HR Features
- `/api/users` — User CRUD
- `/api/jobcards` — Employee job cards
- `/api/rm-jobcards` — Reporting Manager job card reviews
- `/api/leaves` — Leave management
- `/api/attendance` — Attendance upload & records
- `/api/attendance/my-records` — Personal attendance
- `/api/payslip` — Payslip management
- `/api/birthdays` — Birthday listing
- `/api/events` — Company events
- `/api/holiday-calendar` — Holiday calendar PDFs
- `/api/holiday-dates` — Individual holiday dates
- `/api/helpdesk` — Helpdesk tickets
- `/api/gallery` — Company gallery
- `/api/about` — About us content
- `/api/company` — Company settings
- `/api/notifications` — Notifications
- `/api/dashboard` — HR/Employee dashboard data

### Admin API
- `GET /api/admin/dashboard` — Admin dashboard stats
- `GET /api/admin/users` — All users with stats
- `GET /api/admin/birthdays` — Birthday list
- `GET /api/admin/jobcards` — All job cards with filter
- `PUT /api/admin/jobcards/:id/review` — Approve/reject job card
- `GET /api/admin/hr-leaves` — HR staff leaves
- `PUT /api/admin/hr-leaves/:id/review` — Approve/reject HR leave
- `GET /api/admin/analysis` — Analytics & reports

---

## Notes
- Sessions are used for authentication (cookie-based, no JWT)
- Static frontend is served by Express from `hrms_frontend/`
- Uploads stored in `hrms_backend/uploads/` (attendance, calendars, gallery, documents)
- `api-config.js` allows frontend to work with Live Server (port 5500) by proxying to port 3000
