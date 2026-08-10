# AI Career Intelligence Suite

An AI-powered resume analyzer, ATS parser, and career intelligence platform built with **FastAPI** and **React (Vite)**.

---

## Features

- **ATS Score Breakdown**: Evaluates resume formatting, relevance, and metric density.
- **Bullet Point Improver**: Rewrites weak bullet points using Google's X-Y-Z formula (`Accomplished [X], as measured by [Y], by doing [Z]`).
- **Cover Letter Writer**: Generates tailored, multi-paragraph cover letters based on extracted resume content.
- **PDF Report Export**: Export feedback reports directly into clean PDF documents.
- **Scan History**: Retains local history of recent resume scans.

---

## Tech Stack

- **Frontend**: React (Vite), Modern Custom CSS with animations
- **Backend**: FastAPI (Python), PyPDF, python-docx
- **AI / LLM Integration**: OpenRouter API (Gemma / Llama / Qwen models)

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# On Windows
.\venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt