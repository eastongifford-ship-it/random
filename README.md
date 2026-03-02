# Canvas GPA Tracker

A real-time GPA tracking application that connects to Canvas LMS and actively monitors your course grades. Built with Node.js backend and vanilla JavaScript frontend.

## Features

✨ **Real-Time GPA Monitoring**
- Fetch and display current GPA from Canvas
- Automatic periodic updates (configurable)
- Live grade tracking across all courses

📊 **Grade History & Analytics**
- Track GPA changes over time (up to 100 snapshots)
- Visual GPA trend chart (last 30 days)
- View historical data for better insights

🎓 **Course Management**
- View all active courses
- Individual course grades and letter grades
- Per-course GPA point calculation

🔔 **Notifications**
- Get alerts on significant GPA changes
- Real-time status updates
- Toast notifications for actions

📥 **Data Export**
- Export grades to CSV format
- Download timestamped grade reports
- Easy grade sharing and backup

## Installation

### Prerequisites
- Node.js 14+ and npm
- Canvas API access (your institution's Canvas URL and API token)

### Setup

1. **Clone or extract the repository:**
```bash
cd /workspaces/random
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure .env file:**
```
# Base URL should be the main Canvas domain – **DO NOT** include `/api/v1` at the end.
# Example: https://your-institution.instructure.com
CANVAS_BASE_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_canvas_api_token_here
PORT=3000
UPDATE_INTERVAL=300000
```

> ⚠️ A 404 error when the server tries to fetch courses usually means the base URL
> was incorrect (often because it already contained `/api/v1`). Confirm the URL and
> try again.

## Getting Your Canvas API Token

1. Log in to Canvas
2. Click your user avatar (top right)
3. Go to **Settings**
4. Click **Approved Integrations** or **Developer Keys**
5. Create a new **Access Token**
6. Copy the token (you'll only see it once!)
7. Paste it into the `.env` file or the web form

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will start on `http://localhost:3000`

## Usage

### Initial Setup
1. Open https://localhost:3000 in your browser
2. Enter your Canvas Base URL (e.g., `https://canvas.example.edu`)
3. Enter your Canvas API Token
4. Click "Connect to Canvas"

### Dashboard
Once connected, you'll see:
- **Current GPA** - Your calculated GPA
- **Weighted GPA** - GPA weighted by credits
- **Course Count** - Number of active courses
- **Grades Table** - Detailed breakdown of all courses
- **GPA History Chart** - Visual trend over time

### Controls
- **🔄 Refresh Now** - Manually fetch latest grades
- **▶️ Start Auto-Update** - Enable periodic updates (every 5 minutes)
- **📥 Export CSV** - Download grades as CSV file
- **Disconnect** - Disconnect from Canvas (data stays local)

## API Endpoints

### Setup
```
POST /api/init
Body: { "baseURL": "string", "apiToken": "string" }
```

### GPA Data
```
GET /api/gpa/current          - Get current GPA
GET /api/gpa/history          - Get historical data
GET /api/gpa/history/all      - Get all historical data
```

### Updates
```
POST /api/updates/start        - Start periodic updates
POST /api/updates/stop         - Stop periodic updates
GET /api/updates/status        - Check update status
```

### User
```
GET /api/user/profile          - Get user information
```

### Export
```
GET /api/export/csv            - Export grades as CSV
```

### System
```
GET /api/health                - Health check
```

## Project Structure

```
/
├── src/
│   ├── server.js              - Main Express server
│   ├── canvasAPI.js           - Canvas API client
│   ├── gpaCalculator.js       - GPA calculation logic
│   └── gradeHistory.js        - History management
├── public/
│   ├── index.html             - Frontend HTML
│   ├── styles.css             - Styling
│   └── app.js                 - Frontend JavaScript
├── data/                      - Local grade history storage
├── package.json               - Dependencies
├── .env.example               - Environment template
└── README.md                  - This file
```

## GPA Calculation

The application uses a 4.0 GPA scale:
- 93-100%: 4.0 (A+)
- 90-92%:  3.9 (A)
- 87-89%:  3.8 (A-)
- And so on...

**Simple GPA** = Average of all grade points
**Weighted GPA** = Sum of (grade point × credits) / total credits

## Data Storage

- **Grade History**: Stored locally in `data/gpa_history.json`
- **Session Data**: Canvas credentials stored in browser localStorage
- **No Cloud Sync**: All data remains on your device

⚠️ **Privacy Note**: Your Canvas API token is stored in `.env` (server) and localStorage (client). Be careful not to share these credentials.

## Troubleshooting

### "Failed to connect to Canvas"
- Verify your Canvas URL is correct
- Check that your API token is valid and not expired
- Ensure your institution's Canvas server is accessible

### "No courses available"
- Make sure you're enrolled in courses on Canvas
- Check that the courses have grades released
- Verify the API token has permission to view grades

### GPA not updating
- Click "Refresh Now" to manually fetch
- Check the auto-update status
- Verify Canvas server connectivity

### CSV Export fails
- Ensure you've fetched GPA at least once
- Check browser console for errors
- Try refreshing the page

## Performance Tips

1. **Adjust Update Interval**: Edit `UPDATE_INTERVAL` in `.env` (in milliseconds)
   - Default: 300000 (5 minutes)
   - Minimum: 60000 (1 minute) - to avoid Canvas rate limits

2. **Clear Old History**: History auto-limits to 100 entries
   - To manually clear: Delete `data/gpa_history.json`

3. **Browser Storage**: Clear localStorage to reset saved credentials
   - Open DevTools > Application > LocalStorage > Clear

## Limitations

- **Rate Limiting**: Canvas API has rate limits - don't set updates too frequently
- **History Size**: Limited to last 100 snapshots to keep storage minimal
- **Offline Mode**: Cannot fetch new grades without internet connection
- **Real-time**: Updates are periodic, not truly real-time (configurable interval)

## Future Enhancements

- [ ] Push notifications for grade changes
- [ ] Mobile app version
- [ ] Grade predictions and GPA projections
- [ ] Multi-institution support
- [ ] Dark mode theme
- [ ] Advanced analytics and statistics
- [ ] Peer comparison (anonymized)
- [ ] Integration with other LMS platforms

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

MIT License - feel free to use this project for personal or educational purposes.

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Open an issue on GitHub

---

**Built with ❤️ for students everywhere**

Last updated: February 2024