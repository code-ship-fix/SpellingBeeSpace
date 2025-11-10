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

## 📱 Features

- **450 Spelling Words**: Complete 2024-2025 study list
- **AI Speech Synthesis**: Natural voice using OpenAI TTS
- **Classic Speech**: Browser-based speech synthesis
- **Progress Tracking**: Mark words as correct/incorrect
- **Data Persistence**: LocalStorage + Export/Import
- **Search & Filter**: Find words by name, type, or definition
- **Mobile Responsive**: Works on all devices
- **Accessibility**: WCAG compliant design

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
  "speed": 0.9
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

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for TTS |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## 📈 Usage Costs

- **OpenAI TTS**: ~$0.015 per 1,000 characters
- **Average word**: ~8 characters = $0.00012 per word
- **All 450 words**: ~$0.054 total

## 🛡 Security Best Practices

1. **Never commit .env files** to version control
2. **Use HTTPS** in production
3. **Monitor API usage** and set billing alerts
4. **Implement authentication** for sensitive deployments
5. **Regular security updates** for dependencies

## 📝 License

MIT License - feel free to use for educational purposes.

## 🆘 Support

For issues or questions, check the server logs and ensure:
- Environment variables are set correctly
- OpenAI API key is valid and has credits
- Network connectivity is available