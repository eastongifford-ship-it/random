# 🚀 Getting Started - Canvas GPA Tracker

## Welcome! 👋

Your complete Canvas GPA tracking system is ready to use. Follow these simple steps to get started.

---

## Step 1️⃣ : Install Dependencies (< 1 minute)

```bash
cd /workspaces/random
npm install
```

This installs all required packages:
- **Express** - Web server
- **Axios** - Canvas API client
- **dotenv** - Environment configuration
- **CORS** - Cross-origin support

---

## Step 2️⃣ : Get Your Canvas API Token (2 minutes)

### How to get your token:

1. **Log into Canvas** - Your institution's Canvas portal
2. **Click your avatar** - Top right corner of the screen
3. **Click Settings** - In the dropdown menu
4. **Find Approved Integrations** - (or Developer Keys, depending on your institution)
5. **Click "+ New Access Token"** or **"+ New Developer Key"**
6. Fill in the details:
   - **Purpose**: `Canvas GPA Tracker`
   - **Expiration**: Leave blank or choose yearly
7. **Copy the token** - You'll only see it once!
8. **Save it somewhere safe** - You'll need it in Step 3

### Your Canvas Base URL:
- Typically: `https://your-institution.instructure.com`
- Or: `https://institution.canvas.com`
- Examples:
  - `https://canvas.example.edu`
  - `https://myuniversity.instructure.com`

---

## Step 3️⃣ : Configure Environment (< 1 minute)

### Create configuration file:
```bash
cp .env.example .env
```

### Edit `.env` with your information:
```bash
nano .env
# or use VS Code: code .env
```

### Paste this config:
```
# Canvas Configuration
CANVAS_BASE_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_token_here_really_long_string

# Application Configuration  
PORT=3000
UPDATE_INTERVAL=300000
NODE_ENV=development
```

**Replace these:**
- `https://your-institution.instructure.com` → Your Canvas URL
- `your_token_here_really_long_string` → Your API token from Step 2

### Save the file:
- If using `nano`: Press `Ctrl+X`, then `Y`, then `Enter`
- If using VS Code: `Ctrl+S`

---

## Step 4️⃣ : Start the Server (< 1 minute)

### Development mode (recommended for first time):
```bash
npm run dev
```

You'll see:
```
Canvas GPA Tracker server running on port 3000
Visit http://localhost:3000 to use the application
```

### OR Production mode:
```bash
npm start
```

---

## Step 5️⃣ : Open in Browser (30 seconds)

1. **Open your browser**
2. **Go to**: `http://localhost:3000`
3. **You should see**: The Canvas GPA Tracker setup page

---

## Step 6️⃣ : Connect Your Account (30 seconds)

### In the browser:

1. **Enter Canvas Base URL**
   - Copy from your `.env` file
   - Example: `https://canvas.example.edu`

2. **Enter Canvas API Token**
   - Copy from your `.env` file
   - Or from your saved token

3. **Click "Connect to Canvas"**

4. **Wait for confirmation** - "Connected to Canvas successfully!"

---

## Step 7️⃣ : View Your GPA! 🎉

You should now see:

✅ **Your Current GPA** - Calculated from all courses
✅ **Weighted GPA** - Adjusted by credits  
✅ **Course Count** - How many courses you're in
✅ **Grades Table** - All your courses with grades
✅ **GPA History** - Chart showing trends

---

## 🎮 Try These Actions

### 1. Refresh Your Grades
- Click **"🔄 Refresh Now"** button
- Wait for latest data from Canvas

### 2. Enable Auto-Updates
- Click **"▶️ Start Auto-Update"** button
- Your GPA will update every 5 minutes automatically
- Button changes to **"⏸️ Stop Auto-Update"**

### 3. Export Your Grades
- Click **"📥 Export CSV"** button
- File downloads as `grades-2024-02-26.csv`
- Open in Excel or Google Sheets

### 4. View GPA Trends
- Scroll down to **"GPA History (Last 30 Days)"**
- See a line chart of your GPA over time
- More history = more interesting trends!

---

## 📚 Documentation

If you need more info, check these files:

| File | Purpose |
|------|---------|
| **README.md** | Complete user guide |
| **API.md** | Technical API documentation |
| **DEPLOYMENT.md** | How to deploy online |
| **FEATURES.md** | Complete feature list |
| **PROJECT_SUMMARY.md** | Project overview |

---

## 🆘 Need Help?

### "Connection Failed"
- ✅ Check your Canvas URL is correct
- ✅ Verify API token is copied correctly
- ✅ Make sure token wasn't expired
- ✅ Check internet connection

### "No courses showing"
- ✅ Make sure you're enrolled in Canvas courses
- ✅ Check that grades have been posted
- ✅ Click "Refresh Now" to try again
- ✅ Try logout/login on Canvas

### "Port 3000 in use"
- ✅ Change PORT in `.env` to `3001` or `3002`
- ✅ Restart the server

### "Getting blank page"
- ✅ Try refreshing the browser (`Ctrl+F5` or `Cmd+Shift+R`)
- ✅ Check browser console for errors (`F12` → Console)
- ✅ Make sure server is still running

---

## 🔄 Daily Workflow

Once set up, here's what you do each day:

1. **Open browser** → `http://localhost:3000`
2. **Auto-update is running** → Your GPA refreshes every 5 minutes
3. **Check your GPA** → See current status
4. **If grades changed** → Get a notification
5. **Optional**: Click "Refresh Now" to manually update

---

## 📱 Access from Phone/Tablet

If you want to access from other devices:

1. **Find your computer's IP address**:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "
   
   # On Windows:
   ipconfig
   ```

2. **On phone/tablet**, go to:
   ```
   http://YOUR_COMPUTER_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

3. **Both devices need to be on the same network**

---

## 🛑 Stopping the Server

When you want to stop:

### Press `Ctrl+C` in the terminal

You'll see:
```
SIGINT signal received: closing HTTP server
HTTP server closed
```

---

## 🔄 Starting Again Later

To run it again later:

```bash
cd /workspaces/random
npm start
```

Then go to `http://localhost:3000` in your browser.

---

## 💡 Pro Tips

1. **Auto-update saves time** - Enable it to always have fresh data
2. **Export regularly** - Keep backup CSV copies of your grades
3. **Set update interval** - Edit `UPDATE_INTERVAL` in `.env` if needed:
   - `300000` = 5 minutes (default)
   - `600000` = 10 minutes
   - `1800000` = 30 minutes

4. **Check GPA history** - Look for trends over time

5. **Share your CSV** - Export and send to academic advisors

---

## 🎯 You're All Set!

Everything is ready to go. Your Canvas GPA Tracker will:

✨ Show your current GPA instantly
✨ Track changes in real-time
✨ Keep history for analysis
✨ Export grades on demand
✨ Stay private on your device

---

## 📞 Questions?

1. **Check README.md** - Full documentation
2. **Check API.md** - Technical details
3. **Look at FEATURES.md** - What you can do
4. **Check browser console** - Error messages (`F12`)

---

## 🎓 Happy Tracking!

You're now a Canvas GPA Tracker user. Monitor your academic progress in real-time! 📊

---

**Version**: 1.0  
**Status**: Ready to Use ✅  
**Last Updated**: February 2024
