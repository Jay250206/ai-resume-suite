import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.parser import extract_text_from_file
from services.gemini import GeminiAnalyzer

app = FastAPI(title="AI Resume Suite Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RewriteRequest(BaseModel):
    bullet_point: str
    target_role: str = ""

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str = ""

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form("")
):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        extracted_text = extract_text_from_file(temp_path)
        word_count = len(extracted_text.split())

        # Debug Terminal Output
        print("=" * 60)
        print(f"📄 UPLOADED FILE: {file.filename}")
        print(f"📊 EXTRACTED WORD COUNT: {word_count}")
        print("📝 FIRST 200 CHARACTERS:")
        print(extracted_text[:200].strip())
        print("=" * 60)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract readable text from the uploaded PDF/document."
            )
        
        analysis = GeminiAnalyzer.analyze_resume_quality(extracted_text, job_description)
        analysis["raw_text"] = extracted_text
        analysis["filename"] = file.filename
        
        return analysis
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/rewrite-bullet")
async def rewrite_bullet(req: RewriteRequest):
    if not req.bullet_point.strip():
        raise HTTPException(status_code=400, detail="Bullet point text is required.")
    return GeminiAnalyzer.rewrite_bullet_point(req.bullet_point, req.target_role)

@app.post("/generate-cover-letter")
async def generate_cover_letter(req: CoverLetterRequest):
    if not req.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is required.")
    return GeminiAnalyzer.generate_cover_letter(req.resume_text, req.job_description)