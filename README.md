# AI Resume Pro — Industry-Grade Resume Analyzer & Optimizer

## Overview

An industry-grade AI-powered resume analyzer and optimizer that provides:

- Real-time color-coded inline feedback (green/yellow/red per line)
- Two separate scores: ATS Parse Score + Resume Health Score
- Career-level-aware analysis (junior/mid/senior/director)
- Industry-specific keyword matching (15 industries)
- AI-generated bullet rewrites, summary, and cover letter
- Pixel-perfect PDF and DOCX export
- Full version history with diff tracking
- Feedback loop for continuous improvement

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.x
- Tiptap 2.x (rich text editor)
- Recharts 2.x (visualizations)
- Zustand 4.x (state management)
- TanStack Query 5.x (server state)
- shadcn/ui + Radix UI (components)

### Backend
- Python 3.11+
- FastAPI 0.115
- SpaCy 3.7 (NLP)
- sentence-transformers (semantic matching)
- Groq SDK (Llama 3.3 for bullet rewrites)
- Google Generative AI (Gemini 1.5 Flash)
- Ollama (local Llama 3.2 for privacy mode)

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\Activate on Windows
pip install -r requirements.txt
python -m spacy download en_core_web_lg
cp .env.example .env
# Edit .env with your API keys
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Project Structure

```
ai_resume_pro/
├── backend/
│   ├── api/              # HTTP and WebSocket endpoints
│   ├── parsing/          # Document parsers (PDF, DOCX, OCR)
│   ├── analysis/         # Pass 1 (local) and Pass 2 (LLM) analysis
│   ├── scoring/          # ATS Parse Score and Health Score
│   ├── export/           # PDF and DOCX export
│   ├── db/               # Database models and session store
│   ├── industry/         # Industry-specific keywords
│   ├── data/             # Static data (clichés, verbs, etc.)
│   └── prompts/          # Versioned LLM prompts
└── frontend/
    ├── app/              # Next.js App Router pages
    ├── components/       # React components
    ├── hooks/            # Custom React hooks
    ├── lib/              # Utilities and API client
    └── styles/           # Global and component styles
```

## Architecture

### Two-Pass Analysis System

**Pass 1 (Local)**: Runs in <100ms with zero API calls
- ATS simulation (6 engines)
- Cliché detection (500+ phrases)
- Verb strength analysis
- Metric detection
- STAR structure validation
- Grammar checking
- Semantic keyword matching

**Pass 2 (LLM)**: Only for text generation when explicitly requested
- Bullet point rewrites (Groq Llama 3.3)
- Summary rewrites (Gemini 1.5 Flash)
- Cover letter generation (Gemini 1.5 Flash)
- JD match analysis (Gemini 1.5 Flash)

### Scoring System

Two separate scores, never merged:

1. **ATS Parse Score (0-100)**: Technical compliance — can a machine read this file?
2. **Resume Health Score (0-100)**: Content quality — would a human be impressed?

## License

MIT
