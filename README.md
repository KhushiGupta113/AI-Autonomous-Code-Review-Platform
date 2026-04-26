# AI Autonomous Code Review Platform 

An advanced AI-driven code analysis tool that parses GitHub repositories and detects bugs, security risks, performance issues, and structural vulnerabilities.

## 🚀 Recent Updates: Free AI Support
This platform now supports **Groq**, allowing you to perform high-quality AI code reviews for **FREE**. We have also implemented a **"Token-Saver" mode** that intelligently selects only the most complex files for AI review while using free AST scanning for everything else.

## Project Structure
- `backend/`: Node.js Express server to handle API requests.
- `workers/`: BullMQ worker service that picks up repository URLs, clones them, and runs analysis.
- `frontend/`: React Vite application built with Tailwind CSS and Recharts.

## Setup and Run locally

### 1. Start Infrastructure (Redis & MongoDB)
```bash
docker-compose up -d
```

### 2. Setup Backend API
```bash
cd backend
npm install
npm run dev
```

### 3. Setup Worker Service (Free AI)
1. Get a **Free API Key** from [console.groq.com](https://console.groq.com/keys).
2. Set the environment variable:
```bash
cd workers
npm install
# Windows (PowerShell)
$env:GROQ_API_KEY="your_free_groq_key"
# Linux/Mac
export GROQ_API_KEY=your_free_groq_key

npm start
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173/` inside your browser!

## 🛡️ Analysis Engine
1. **AST Static Scanner**: (Free & Fast) Detects structural issues like nested loops, unused variables, and function length.
2. **AI Logic Engine**: (Powered by Groq/Llama-3) Detects complex logical bugs, security vulnerabilities (XSS, SQLi), and edge cases.
3. **Health Scoring**: Generates a 0-100 quality score based on detected issues.
