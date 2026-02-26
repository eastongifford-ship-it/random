# Quick Start Guide

Get your Canvas GPA Tracker up and running in 5 minutes!

## 1. Install Dependencies (1 min)

```bash
cd /workspaces/random
npm install
```

## 2. Get Your Canvas API Token (2 min)

1. Log into Canvas
2. Click your avatar → **Settings**
3. Go to **Approved Integrations** (or **Developer Keys**)
4. Click **+ New Access Token**
5. Set expiration (or leave blank for never)
6. Copy the token

## 3. Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env` and add:
```
CANVAS_BASE_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_token_here
PORT=3000
UPDATE_INTERVAL=300000
```

## 4. Start the Server (1 min)

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will run at: **http://localhost:3000**

## 5. Connect Your Account (In Browser)

1. Go to http://localhost:3000
2. Enter your Canvas Base URL
3. Enter your Canvas API Token
4. Click "Connect to Canvas"
5. Done! View your GPA

---

## Key Features to Try

### 📊 View Your Grades
- Instant GPA calculation
- Individual course breakdown
- Letter grade for each course

### 🔄 Auto Updates
- Click "Start Auto-Update" for updates every 5 minutes
- Watch your GPA in real-time

### 📥 Export Grades
- Download your grades as CSV
- Perfect for sharing or backup

### 📈 Track History
- See GPA trends over the last 30 days
- Visual line chart of your progress

---

## Troubleshooting

**"Cannot connect to Canvas"**
- Check your Canvas URL is correct
- Verify API token is valid
- Check internet connection

**"No courses showing"**
- Make sure you're enrolled in Canvas courses
- Verify grades have been released
- Try clicking "Refresh Now"

**Port already in use**
- Change PORT in `.env` to a different number (e.g., 3001)
- Or kill the process: `lsof -i :3000` then `kill <PID>`

---

## File Locations

- **Server code**: `src/server.js`
- **Frontend**: `public/` folder
- **Config**: `.env` file
- **Data storage**: `data/gpa_history.json`

---

## Next Steps

- Customize the update interval in `.env`
- Read the full README.md for advanced features
- Explore the API endpoints
- Consider running in production with a process manager like PM2

**Happy tracking! 🎓**
