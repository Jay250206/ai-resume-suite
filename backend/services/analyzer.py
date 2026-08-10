import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

COMMON_SKILLS_TAXONOMY = {
    "Programming": ["python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "php", "ruby", "sql"],
    "Web Tech": ["react", "next.js", "node.js", "express", "fastapi", "django", "html", "css", "tailwind", "vue", "angular"],
    "AI/ML": ["pytorch", "tensorflow", "scikit-learn", "nltk", "opencv", "transformers", "pandas", "numpy", "gemini"],
    "Database & Cloud": ["postgresql", "mongodb", "mysql", "redis", "aws", "azure", "docker", "kubernetes", "git"]
}

class ATSAnalyzer:
    @staticmethod
    def extract_skills(text: str) -> list[str]:
        text_lower = text.lower()
        found_skills = set()
        for category, skills in COMMON_SKILLS_TAXONOMY.items():
            for skill in skills:
                if re.search(rf'\b{re.escape(skill)}\b', text_lower):
                    found_skills.add(skill.title())
        return list(found_skills)

    @staticmethod
    def compute_match_score(resume_text: str, jd_text: str) -> dict:
        if not resume_text or not jd_text:
            return {"score": 0, "matching_skills": [], "missing_skills": []}

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        match_score = round(similarity * 100, 2)

        resume_skills = set(ATSAnalyzer.extract_skills(resume_text))
        jd_skills = set(ATSAnalyzer.extract_skills(jd_text))

        matching = list(resume_skills.intersection(jd_skills))
        missing = list(jd_skills.difference(resume_skills))

        return {
            "score": match_score,
            "matching_skills": matching,
            "missing_skills": missing
        }