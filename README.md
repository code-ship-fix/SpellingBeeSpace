# 📝 Spelling Bee Matrix - Production Ready

A secure spelling practice app with 450 words from the 2024-2025 School Spelling Bee Study List, featuring AI speech synthesis and progress tracking.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

Open http://localhost:3000 in your browser.

## 🔒 Security Features

- ✅ **API Key Security**: OpenAI key stored server-side only
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **Input Validation**: Text length and content validation
- ✅ **Error Handling**: Graceful error responses
- ✅ **CORS Protection**: Configurable cross-origin policies
- ✅ **User Tracking**: Anonymous analytics with IP geolocation

## 📱 Features

- **450 Spelling Words**: Complete 2024-2025 study list
- **AI Speech Synthesis**: Natural voice using OpenAI TTS
- **Classic Speech**: Browser-based speech synthesis
- **Progress Tracking**: Mark words as correct/incorrect
- **Data Persistence**: LocalStorage + Export/Import
- **Search & Filter**: Find words by name, type, or definition
- **Mobile Responsive**: Works on all devices
- **Accessibility**: WCAG compliant design
- **User Analytics**: Anonymous tracking with geographical insights

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: OpenAI Text-to-Speech API
- **Deployment**: Any Node.js hosting service

## 🌐 Deployment Options

### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_api_key
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI
railway login
railway init
railway add OPENAI_API_KEY=your_api_key
railway deploy
```

### Option 3: DigitalOcean App Platform
1. Connect GitHub repository
2. Set OPENAI_API_KEY environment variable
3. Deploy

### Option 4: Vercel/Netlify
1. Connect repository
2. Add OPENAI_API_KEY to environment variables
3. Deploy

## 📊 API Endpoints

### `POST /api/tts`
Generate speech audio from text
```json
{
  "text": "hello world",
  "voice": "nova",
  "speed": 0.9,
  "sessionId": "optional_session_id"
}
```

### `GET /api/health`
Health check endpoint
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "hasApiKey": true
}
```

### `POST /api/track/session`
Initialize user tracking session
```json
{
  "sessionId": "optional_existing_session"
}
```

### `POST /api/track/word`
Track user interactions
```json
{
  "sessionId": "user_session_id",
  "action": "practiced|ai_speech|classic_speech"
}
```

### `GET /api/admin/export?password=admin_password`
Export user analytics data as Excel file (admin only)

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for TTS |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `ADMIN_PASSWORD` | No | Password for analytics export (default: spellingbee2024) |

## 📈 Usage Costs

- **OpenAI TTS**: ~$0.015 per 1,000 characters
- **Average word**: ~8 characters = $0.00012 per word
- **All 450 words**: ~$0.054 total

## 🛡 Security & Privacy

1. **Never commit .env files** to version control
2. **Use HTTPS** in production
3. **Monitor API usage** and set billing alerts
4. **Implement authentication** for sensitive deployments
5. **Regular security updates** for dependencies
6. **User Analytics**: Anonymous data collection with IP geolocation
7. **Data Export**: Secure admin access to download user statistics
8. **Privacy Compliance**: Transparent data collection disclaimer

## 📊 Analytics & Data Export

### Export User Data
Access admin dashboard to download user analytics:
```
GET /api/admin/export?password=your_admin_password
```

### Data Includes:
- Anonymous session tracking
- IP-based geographic location (country, region, city)
- Usage patterns (words practiced, speech usage)
- Visit frequency and duration
- User agent information

### Privacy Notice:
The application displays a clear disclaimer about data collection and complies with privacy best practices by collecting only anonymous usage statistics.

## 📝 License

MIT License - feel free to use for educational purposes.

## 🆘 Support

For issues or questions, check the server logs and ensure:
- Environment variables are set correctly
- OpenAI API key is valid and has credits
- Network connectivity is available