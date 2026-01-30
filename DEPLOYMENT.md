# Deployment Guide

## Quick Deploy to Popular Platforms

### 1. Vercel (Recommended)

**Why Vercel?**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Free tier available

**Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /home/user/webapp
vercel

# Add environment variables in Vercel dashboard:
# - VITE_OPENAI_API_KEY
# - VITE_FIREBASE_API_KEY
# - (other Firebase vars)

# Deploy to production
vercel --prod
```

**Configure Environment Variables:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add all variables from `.env.example`
4. Redeploy for changes to take effect

---

### 2. Netlify

**Steps:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
cd /home/user/webapp
netlify init

# Build command: npm run build
# Publish directory: dist

# Deploy
netlify deploy --prod
```

**Environment Variables:**
1. Site settings → Build & deploy → Environment
2. Add all variables from `.env.example`

---

### 3. Firebase Hosting

**Steps:**
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize
cd /home/user/webapp
firebase init hosting

# Select options:
# - Public directory: dist
# - Single-page app: Yes
# - GitHub actions: Optional

# Build the app
npm run build

# Deploy
firebase deploy --only hosting
```

**Note:** Environment variables are baked into build. Set them before building:
```bash
export VITE_OPENAI_API_KEY=your_key
export VITE_FIREBASE_API_KEY=your_key
npm run build
firebase deploy
```

---

### 4. GitHub Pages

**Steps:**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d dist"

# Update vite.config.ts:
# base: '/your-repo-name/'

# Deploy
npm run deploy
```

**⚠️ Limitation:** GitHub Pages doesn't support environment variables at runtime. You'll need to:
1. Build locally with environment variables set
2. Commit the built files (not recommended)
3. Or use GitHub Actions with secrets

---

## Backend API Proxy (Recommended for Production)

For security, create a backend proxy for OpenAI calls:

### Option A: Vercel Serverless Functions

Create `/api/grammar.ts`:
```typescript
import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export default async function handler(req, res) {
  const { text } = req.body;
  
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Fix grammar and spelling...'
        },
        { role: 'user', content: text }
      ]
    });
    
    res.json({ result: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process' });
  }
}
```

Update frontend:
```typescript
// services/openai.ts
export async function correctGrammar(text: string): Promise<string> {
  const response = await fetch('/api/grammar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  const data = await response.json();
  return data.result;
}
```

### Option B: Express.js Backend

Create `server.js`:
```javascript
const express = require('express');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static('dist'));

app.post('/api/grammar', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Fix grammar...' },
        { role: 'user', content: req.body.text }
      ]
    });
    
    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running'));
```

Deploy to:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

---

## Environment Variables Checklist

Before deploying, ensure you have:

```bash
# OpenAI (Required for AI features)
VITE_OPENAI_API_KEY=sk-...

# Firebase (Required for auth)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

---

## Post-Deployment Checklist

- [ ] Test voice input functionality
- [ ] Verify grammar correction works
- [ ] Check flow improvement processes paragraphs
- [ ] Test Google authentication
- [ ] Test Apple authentication
- [ ] Verify session saving
- [ ] Test session history loading
- [ ] Check mobile responsiveness
- [ ] Test in different browsers
- [ ] Verify HTTPS is working
- [ ] Check error handling
- [ ] Monitor API usage/costs

---

## Monitoring & Analytics

### Add Google Analytics
```typescript
// main.tsx
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

### Add Sentry for Error Tracking
```bash
npm install @sentry/react

# main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE
});
```

### Monitor OpenAI Usage
- Check OpenAI dashboard regularly
- Set up billing alerts
- Implement rate limiting
- Cache common corrections

---

## Performance Optimization

### Code Splitting
```typescript
// App.tsx
const SessionHistory = lazy(() => import('./components/SessionHistory'));
```

### Bundle Analysis
```bash
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer()
  ]
});

npm run build
```

### CDN for Static Assets
- Use Cloudflare CDN
- Enable compression
- Optimize images
- Lazy load components

---

## Security Hardening

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    connect-src 'self' https://api.openai.com https://firebaseapp.com;">
```

### Rate Limiting (Backend)
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://yourdomain.com',
  methods: ['GET', 'POST']
}));
```

---

## Cost Estimation

### OpenAI API Costs
```
GPT-3.5-turbo pricing (as of 2024):
- Input: $0.0015 / 1K tokens
- Output: $0.002 / 1K tokens

Example: 500 users, 50 requests/day each
- ~25,000 requests/day
- ~500K tokens/day
- Cost: ~$0.75 - $1.00 per day
- Monthly: ~$22.50 - $30
```

### Firebase Costs
```
Free tier includes:
- 50,000 reads/day
- 20,000 writes/day
- 1GB storage
- 10GB/month bandwidth

Typical usage: Free tier sufficient for MVP
```

### Hosting Costs
```
Vercel: Free tier - 100GB bandwidth
Netlify: Free tier - 100GB bandwidth
Firebase: Free tier - 10GB/month

Estimated: $0-$10/month for small apps
```

---

## Scaling Considerations

### Database Migration
When scaling, consider:
- PostgreSQL (Supabase, Neon)
- MongoDB (Atlas)
- Redis for caching

### Queue System
For high-traffic AI processing:
- Bull (Redis-based)
- RabbitMQ
- AWS SQS

### Load Balancing
- Vercel/Netlify auto-scale
- AWS ALB
- Cloudflare Load Balancing

---

## Support & Maintenance

### Backup Strategy
- Export sessions weekly
- Database snapshots
- Git commits for code
- Environment variable backups

### Update Schedule
- Dependencies: Monthly
- Security patches: Immediately
- Feature releases: Bi-weekly
- Major versions: Quarterly

### Monitoring
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Cost monitoring (OpenAI dashboard)

---

**Ready to deploy?** Choose your platform and follow the steps above!
