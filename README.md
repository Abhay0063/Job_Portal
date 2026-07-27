# Job Portal & Recruitment Management — Session 1

## What's in here
- `/backend` — Express + Sequelize API, already tested against a live MySQL instance (6 tables, 6 FKs confirmed working)
- `/frontend` — empty, scaffold in a later session with `npm create vite@latest . -- --template react` or CRA

---

## Step 1 — Install MySQL locally

**Windows**
1. Download MySQL Installer (Community): https://dev.mysql.com/downloads/installer/
2. Run it → choose "Server only" (or "Developer Default" if you also want Workbench) → let it install MySQL Server + set a root password when prompted.
3. Confirm it's running: open a new terminal (cmd/PowerShell) and run:
   ```
   mysql -u root -p
   ```
   Enter the root password you set. If you land on a `mysql>` prompt, it's running. Type `exit` to leave.
4. If `mysql` isn't recognized, add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to your PATH.

**Mac**
```
brew install mysql
brew services start mysql
mysql -u root
```
If you land on `mysql>`, it's running.

**Linux (Ubuntu/Debian)**
```
sudo apt update
sudo apt install mysql-server
sudo service mysql start   # or: sudo systemctl start mysql
sudo mysql
```

## Step 2 — Create the database and app user
Once you're at the `mysql>` prompt (any OS), run:
```sql
CREATE DATABASE job_portal_db;
CREATE USER 'job_portal_user'@'localhost' IDENTIFIED BY 'DevPass123!';
GRANT ALL PRIVILEGES ON job_portal_db.* TO 'job_portal_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```
Change the password before you ever deploy this anywhere. `DevPass123!` is a local-dev placeholder, not a real secret.

## Step 3 — Install backend deps and configure env
```
cd backend
npm install
cp .env.example .env
```
`.env` already matches the DB/user you just created, so you shouldn't need to edit it unless you used different credentials.

## Step 4 — Sync the database (create tables)
```
npm run sync
```
**Expected output:**
```
✅ Connection to MySQL established.
✅ All tables synced: users, recruiters, candidates, jobs, applications, interviews.
```
Verify it yourself:
```
mysql -u job_portal_user -p job_portal_db -e "SHOW TABLES;"
```
You should see: `applications, candidates, interviews, jobs, recruiters, users`.

## Step 5 — Start the server
```
npm run dev
```
**Expected output:**
```
✅ Database connected.
🚀 Server running on http://localhost:5000
```
Visit `http://localhost:5000/api/health` — you should get `{"status":"ok","message":"Job Portal API is running"}`.

---

## Data model (session 1)
```
User (1) ---- (1) Recruiter ---- (many) Job ---- (many) Application ---- (1) Interview
User (1) ---- (1) Candidate ------------------------------/
```
- `User`: role enum (admin/recruiter/candidate) — this is your auth anchor for session 2
- `Recruiter`/`Candidate`: split profile tables, both FK to `User.id` — keeps `users` table lean and avoids nullable columns for fields that only apply to one role
- `Job` belongs to `Recruiter`; `Application` links `Candidate` to `Job`; `Interview` belongs to `Application`

## What's next (session 2)
- `bcrypt` for password hashing, `jsonwebtoken` for auth — neither is installed yet, intentionally
- `middleware/auth.js` for route protection + role checks
- `routes/authRoutes.js` + `controllers/authController.js` (register/login)
