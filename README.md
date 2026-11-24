# CampusConnect – College Complaint Management System

CampusConnect is a modern, responsive full-stack web application built with **React** and **Supabase (PostgreSQL + Auth)** designed to streamline student complaint registration and administration resolution.

---

## 🌟 Key Features

### 1. Student Features
- **Student Registration & Login**: Seamless email/password registration with role-based profile storage.
- **Student Dashboard**: Welcome banner with live metric counters (Total, Pending, In Progress, Resolved).
- **Submit Complaints**: Modal-ready form with required fields:
  - **Title**
  - **Description**
  - **Category**: Hostel, Infrastructure, Transport, Canteen, Academics, Other
  - **Location**: Specific campus area/room
- **View Complaints History**: Filter complaints by status (All, Pending, In Progress, Resolved).
- **Status Badges**: Clean color-coded badges for *Pending*, *In Progress*, and *Resolved*.
- **Privacy & Security**: Enforced via PostgreSQL Row Level Security (RLS) so students only see their own complaints.

### 2. Administrator Features
- **Administrator Portal**: Separate role toggle for administrative access.
- **Admin Dashboard**:
  - Live metric overview: Total Complaints, Pending Complaints, In-Progress Complaints, and Resolved Complaints.
  - Search complaints by title, specific location, or student name/email.
  - Filter complaints by both **Status** and **Category**.
- **Complaint Details & Management**:
  - Full details modal showing student name, email, submission timestamp, location, and description.
  - **One-Click Status Updates**: Change status to *Pending*, *In Progress*, or *Resolved*.

### 3. Design & Architecture
- **Theme**: Clean blue-and-white college management aesthetic.
- **Responsive Design**: Mobile drawer navigation and desktop sidebar.
- **Icons**: [Lucide React](https://lucide.dev) for accessible and lightweight UI icons.

---

## 🚀 Supabase Setup Instructions

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New project**, choose an organization, provide a project name (e.g. `campusconnect`), and set a database password.

### Step 2: Run Database Schema & RLS Policies
1. In your Supabase dashboard, navigate to the **SQL Editor** tab from the left sidebar.
2. Click **New query**.
3. Copy the entire contents of [supabase-schema.sql](file:///c:/Users/karam/Desktop/Build%20to%20ship/supabase-schema.sql) and paste them into the editor.
4. Click **Run**.

This script sets up:
- `public.profiles`: Stores user name, email, and role (`student` or `admin`).
- `public.complaints`: Stores title, description, category, location, status, timestamps, and foreign key to student profile.
- Automated triggers: Creates profile records on `auth.users` registration.
- **Row Level Security (RLS) policies**:
  - Students can only view and insert their own complaints.
  - Admins can view and update all complaints.

### Step 3: Configure Environment Variables
1. In your Supabase dashboard, navigate to **Project Settings** > **API**.
2. Copy your **Project URL** and **anon public Key**.
3. Create a `.env` file in the root of this project (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Fill in your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Creating an Admin Account
To grant an account administrator privileges:
1. Register normally through the CampusConnect application or Supabase Auth.
2. Go to **Table Editor** > `profiles` in the Supabase dashboard (or run in SQL Editor):
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-admin-email@college.edu';
   ```
3. Sign out and sign back in to access the **Administrator Portal**.

---

## 💻 Running the Application Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx       # Admin overview, statistics, search & filters
│   │   ├── AuthPage.jsx             # Student & Admin authentication
│   │   ├── ComplaintCard.jsx        # Reusable complaint card with status badges
│   │   ├── ComplaintDetailModal.jsx # Detailed view & admin resolution controls
│   │   ├── Header.jsx               # Top bar with user profile
│   │   ├── Sidebar.jsx              # Responsive navigation sidebar
│   │   ├── StudentDashboard.jsx     # Student welcome, metrics, complaints history
│   │   └── SubmitComplaint.jsx      # Complaint submission form
│   ├── context/
│   │   └── AuthContext.jsx          # Supabase auth & profile state management
│   ├── App.jsx                      # Main application router/view coordinator
│   ├── index.css                    # Design tokens & blue-and-white styling
│   ├── main.jsx                     # React entry point
│   └── supabaseClient.js            # Supabase client initialization
├── .env.example                     # Sample environment file
├── supabase-schema.sql              # Complete PostgreSQL schema & RLS policies
├── package.json
└── vite.config.js
```

