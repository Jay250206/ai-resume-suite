import os
import json
import re
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()

class GeminiAnalyzer:
    @staticmethod
    def _call_openrouter(prompt: str) -> dict | None:
        if not OPENROUTER_KEY:
            return None

        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENROUTER_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Resume Suite"
        }

        models_to_try = [
            "openrouter/free",
            "google/gemma-2-9b-it:free"
        ]

        for model_slug in models_to_try:
            payload = {
                "model": model_slug,
                "messages": [
                    {"role": "system", "content": "Return valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1
            }

            try:
                response = requests.post(url, headers=headers, json=payload, timeout=4)
                if response.status_code == 200:
                    res_data = response.json()
                    if "choices" in res_data and len(res_data["choices"]) > 0:
                        raw_text = res_data["choices"][0]["message"]["content"]
                        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                        if json_match:
                            return json.loads(json_match.group(0))
            except Exception:
                continue

        return None

    @staticmethod
    def analyze_resume_quality(resume_text: str, job_description: str = "") -> dict:
        text_lower = resume_text.lower()
        words = re.findall(r'\b[a-z0-9+#.-]+\b', text_lower)
        word_count = len(words)

        # ------------------- 1. FORMATTING SCORE (25 Points) -------------------
        fmt_score = 0
        if re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text): fmt_score += 6
        if re.search(r'(\+?\d[\d -]{8,12}\d)', resume_text): fmt_score += 6
        if 'linkedin.com' in text_lower: fmt_score += 4
        if 'github.com' in text_lower or 'gitlab.com' in text_lower: fmt_score += 4
        
        sections = ['experience', 'education', 'skills', 'projects', 'summary', 'certifications']
        fmt_score += min(5, sum(1 for sec in sections if sec in text_lower))
        fmt_percentage = min(100, int((fmt_score / 25) * 100))

        # ------------------- 2. IMPACT & METRICS SCORE (35 Points) -------------------
        action_verbs = [
            'developed', 'engineered', 'built', 'created', 'designed', 'optimized',
            'implemented', 'led', 'managed', 'increased', 'reduced', 'integrated',
            'delivered', 'automated', 'orchestrated', 'spearheaded', 'refactored'
        ]
        found_verbs = set(v for v in action_verbs if v in text_lower)
        verb_score = min(15, len(found_verbs) * 2)

        # Count metrics (percentages, dollar amounts, project scale, performance timings)
        metrics = re.findall(r'\b(\d+%\b|\$\d+|\d+\+|\d+\s*(users|clients|projects|ms|sec|hours|percent|gb|tb))\b', text_lower)
        metric_score = min(12, len(metrics) * 3)

        # Length score
        length_score = 0
        if 300 <= word_count <= 700:
            length_score = 8
        elif 150 <= word_count < 300 or 700 < word_count <= 1000:
            length_score = 5
        else:
            length_score = 2

        impact_total = verb_score + metric_score + length_score
        impact_percentage = min(100, int((impact_total / 35) * 100))

        # ------------------- 3. RELEVANCE & TECH DENSITY (40 Points) -------------------
        rel_score = 0
        matching_keywords = []
        missing_keywords = []

        if job_description.strip():
            jd_tokens = set(re.findall(r'\b[a-z0-9+#.-]{3,}\b', job_description.lower()))
            stop_words = {'and', 'the', 'for', 'with', 'you', 'that', 'this', 'from', 'are', 'will', 'have', 'your', 'about', 'team', 'work', 'role', 'experience'}
            jd_keywords = [w for w in jd_tokens if w not in stop_words and not w.isdigit()]

            matching_keywords = [k for k in jd_keywords if k in text_lower][:6]
            missing_keywords = [k for k in jd_keywords if k not in text_lower][:6]

            if jd_keywords:
                match_ratio = len([k for k in jd_keywords if k in text_lower]) / len(jd_keywords)
                rel_score = int(match_ratio * 40)
        else:
            tech_keywords = [
                'python', 'javascript', 'typescript', 'react', 'node', 'express',
                'sql', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'aws',
                'azure', 'git', 'github', 'rest', 'api', 'graphql', 'html', 'css',
                'java', 'c++', 'redux', 'tailwind', 'next.js', 'ci/cd'
            ]
            found_tech = [t for t in tech_keywords if t in text_lower]
            matching_keywords = found_tech[:6]
            missing_keywords = [t for t in tech_keywords if t not in text_lower][:6]
            rel_score = min(40, len(found_tech) * 4)

        relevance_percentage = min(100, int((rel_score / 40) * 100))

        # ------------------- FINAL CALCULATED ATS SCORE -------------------
        calculated_ats_score = int(fmt_score + impact_total + rel_score)
        
        # Apply score boundaries
        final_ats_score = max(25, min(96, calculated_ats_score))
        job_match = relevance_percentage if job_description.strip() else min(95, max(30, int(relevance_percentage * 0.9)))

        # Dynamic AI suggestions prompt
        prompt = f"""
        Analyze this resume text and generate 2 suggestions and 1 rewritten bullet point in valid JSON only.
        Resume: {resume_text[:1500]}
        Return JSON structure:
        {{
            "suggestions": ["Suggestion 1", "Suggestion 2"],
            "actionable_rewrites": ["Improved bullet point using action verbs and metrics."]
        }}
        """

        ai_res = GeminiAnalyzer._call_openrouter(prompt)
        suggestions = ai_res.get("suggestions") if ai_res and "suggestions" in ai_res else []
        rewrites = ai_res.get("actionable_rewrites") if ai_res and "actionable_rewrites" in ai_res else []

        if not suggestions:
            if metric_score < 6:
                suggestions.append("Add measurable outcomes and percentage improvements to project bullet points.")
            if len(found_verbs) < 5:
                suggestions.append("Begin project bullet points with strong action verbs (e.g., Engineered, Orchestrated, Optimized).")
            if word_count < 200:
                suggestions.append(f"Resume is short ({word_count} words). Expand on responsibilities and technologies used.")
            if not suggestions:
                suggestions = ["Solid overall layout. Align technical keywords specifically with target job postings."]

        if not rewrites:
            rewrites = ["Engineered responsive web applications and RESTful APIs, improving load times by 20%."]

        return {
            "ats_overall_score": final_ats_score,
            "job_match_score": job_match,
            "breakdown": {
                "formatting_score": fmt_percentage,
                "relevance_score": relevance_percentage,
                "impact_score": impact_percentage
            },
            "matching_keywords": matching_keywords,
            "missing_keywords": missing_keywords,
            "suggestions": suggestions,
            "actionable_rewrites": rewrites
        }

    @staticmethod
    def rewrite_bullet_point(bullet_point: str, target_role: str = "") -> dict:
        prompt = f"""
        Rewrite using Google's X-Y-Z formula. Role: {target_role}. Bullet: {bullet_point}
        Return JSON: {{"original": "{bullet_point}", "improved_options": ["Option 1", "Option 2", "Option 3"]}}
        """
        result = GeminiAnalyzer._call_openrouter(prompt)
        if result and "improved_options" in result:
            return result

        return {
            "original": bullet_point,
            "improved_options": [
                f"Engineered key functionality for {target_role if target_role else 'application'}, reducing processing latency by 20%.",
                f"Designed scalable modules resulting in a 15% boost in system performance.",
                f"Led technical execution for critical features, enhancing overall workflow reliability."
            ]
        }

    @staticmethod
    def generate_cover_letter(resume_text: str, job_description: str = "") -> dict:
        prompt = f"""
        Draft a 3-paragraph cover letter for this resume: {resume_text[:1200]}
        Return JSON: {{"cover_letter": "Dear Hiring Manager..."}}
        """
        result = GeminiAnalyzer._call_openrouter(prompt)
        if result and "cover_letter" in result:
            return result

        first_line = resume_text.strip().split('\n')[0] if resume_text else "Applicant"
        return {
            "cover_letter": (
                f"Dear Hiring Manager,\n\n"
                f"I am writing to express my strong interest in the software engineering position. "
                f"With hands-on experience building web applications and solving technical challenges, "
                f"I am confident in my ability to contribute effectively to your team's goals.\n\n"
                f"Sincerely,\n{first_line}"
            )
        }