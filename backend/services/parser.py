import os
import pypdf
from docx import Document

def extract_text_from_file(file_path: str) -> str:
    """Extracts raw text from PDF, DOCX, or TXT files using native pypdf."""
    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        text = ""
        try:
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"❌ PDF extraction error on {file_path}: {e}")

        # Clean whitespace
        text = " ".join(text.split())
        return text

    elif ext == ".docx":
        text = ""
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text:
                    text += paragraph.text + "\n"
        except Exception as e:
            print(f"❌ DOCX extraction error on {file_path}: {e}")
        return text

    elif ext in [".txt", ".md"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception as e:
            print(f"❌ TXT extraction error on {file_path}: {e}")
            return ""

    return ""