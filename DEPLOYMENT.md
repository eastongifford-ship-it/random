# Deployment Guide

Learn how to deploy Canvas GPA Tracker to production.

## Local Development

### Prerequisites
- Node.js 14+
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd canvas-gpa-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your Canvas credentials
```

4. **Run development server**
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## Deployment Options

### Option 1: Heroku (Easiest)

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create an app**
```bash
heroku create your-app-name
```

3. **Set environment variables**
```bash
heroku config:set CANVAS_BASE_URL=https://your-institution.instructure.com
heroku config:set CANVAS_API_TOKEN=your_token_here
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git push heroku main
```

5. **Monitor**
```bash
heroku logs --tail
heroku ps
```

### Option 2: DigitalOcean (VPS)

1. **Create a Droplet**
   - Choose Ubuntu 20.04+
   - 1GB RAM minimum
   - Add SSH key

2. **SSH into droplet**
```bash
ssh root@your_droplet_ip
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clone repository**
```bash
git clone <repo-url>
cd canvas-gpa-tracker
```

5. **Install and setup**
```bash
npm install
cp .env.example .env
# Edit .env
```

6. **Use PM2 for process management**
```bash
sudo npm install -g pm2
pm2 start src/server.js --name "canvas-gpa"
pm2 startup
pm2 save
```

7. **Setup Nginx reverse proxy**

Create `/etc/nginx/sites-available/canvas-gpa`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/canvas-gpa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: AWS (Scalable)

1. **Create EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - t2.micro (free tier eligible)

2. **SSH and setup (same as DigitalOcean steps above)**

3. **Use AWS RDS for database** (if you add one later)

4. **Use AWS S3 for backups** of history data

### Option 4: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create .dockerignore**
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

3. **Build image**
```bash
docker build -t canvas-gpa-tracker:1.0 .
```

4. **Run container**
```bash
docker run -p 3000:3000 \
  -e CANVAS_BASE_URL=https://canvas.example.edu \
  -e CANVAS_API_TOKEN=token123 \
  -e NODE_ENV=production \
  canvas-gpa-tracker:1.0
```

5. **Push to Docker Hub**
```bash
docker tag canvas-gpa-tracker:1.0 username/canvas-gpa-tracker:1.0
docker push username/canvas-gpa-tracker:1.0
```

---

## Environment Configuration

### Production .env Variables

```
# Canvas Connection
CANVAS_BASE_URL=https://your-institution.instructure.com
CANVAS_API_TOKEN=your_secure_token_here

# Server
PORT=3000
NODE_ENV=production

# Updates (in milliseconds)
UPDATE_INTERVAL=300000

# Security (future)
SESSION_SECRET=your_random_secret_key
```

### Best Practices

1. **Never commit `.env`** - add to `.gitignore`
2. **Use strong API tokens** - rotate regularly
3. **Enable HTTPS** - use Let's Encrypt
4. **Set appropriate update intervals** - respect Canvas rate limits
5. **Monitor server logs** - setup log aggregation
6. **Backup data regularly** - especially `data/gpa_history.json`

---

## Performance Optimization

### For Production

1. **Enable compression**
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Add caching headers**
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

3. **Use load balancing** (with multiple instances)
   - Nginx load balancer
   - AWS load balancer
   - Heroku automatic scaling

4. **Database optimization** (if scaling)
   - Consider moving to PostgreSQL
   - Cache frequently accessed data
   - Archive old history entries

### Database Migration (Optional)

If you need persistence beyond local storage:

1. **Install PostgreSQL driver**
```bash
npm install pg sequelize
```

2. **Update code to use database**
   - Replace `gradeHistory.js` file I/O with DB queries
   - Add connection pooling

---

## Monitoring & Maintenance

### Setup Monitoring

1. **Application Performance**
   - Use New Relic, DataDog, or similar
   - Monitor response times
   - Track error rates

2. **Server Health**
   - CPU and memory usage
   - Disk space
   - Network traffic

3. **Canvas API Status**
   - Monitor API response times
   - Track rate limit hits
   - Log failed requests

### Logging

```javascript
// Add to server.js
const fs = require('fs');
const logStream = fs.createWriteStream('app.log', {flags: 'a'});

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logStream.write(`${timestamp} - ${req.method} ${req.path}\n`);
  next();
});
```

### Regular Maintenance

- **Weekly**: Check logs for errors
- **Monthly**: Review and archive old history
- **Quarterly**: Update dependencies
- **Yearly**: Rotate API tokens, review security

---

## Troubleshooting

### High Memory Usage
- Reduce `UPDATE_INTERVAL`
- Archive/delete old history entries
- Use Docker with memory limits

### Slow Response Times
- Check Canvas API rate limits
- Verify network connection
- Add caching layer

### Failed Deployments
- Check environment variables
- Review logs: `heroku logs --tail`
- Verify node version compatibility

---

## Rollback Procedure

### Heroku
```bash
heroku releases                    # See release history
heroku rollback v123               # Rollback to specific version
```

### Manual VPS
```bash
git log --oneline
git checkout previous_commit_hash
pm2 restart canvas-gpa
```

---

## Security Checklist

- [ ] Environment variables in `.env` (not committed)
- [ ] API token rotated recently
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive data
- [ ] Regular security updates applied
- [ ] Firewall configured (VPS)
- [ ] SSH hardened (disabled root, key-based auth)
- [ ] Log aggregation for audit trail

---

## Cost Estimation

### Monthly Costs by Platform

| Platform | Free Tier | Paid (Estimate) |
|----------|-----------|-----------------|
| Heroku | $0 (paused after 30min) | $7-50 |
| DigitalOcean | $0 | $5-20 |
| AWS | ~$5 (t2.micro) | $5-50 |
| Google Cloud | ~$5 (free tier) | $5-50 |

---

## Getting Help

1. Check [Canvas API Documentation](https://canvas.instructure.com/doc/api/)
2. Review server logs
3. Test with `curl` commands
4. Check browser console for frontend errors

---

**Last Updated**: February 2024
