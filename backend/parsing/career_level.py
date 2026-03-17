"""
Career Level Detection Module

Detects career level (junior/mid/senior/director) from resume text.
Runs ONCE at upload, stored on Session object.
All subsequent analysis reads from session.career_level.

Levels:
- junior: intern, fresher, student, entry-level (0-2 years)
- mid: engineer, developer, analyst, designer (3-7 years)
- senior: senior, lead, principal, staff, architect (8-12 years)
- director: director, VP, head of, chief, partner (12+ years)

CRITICAL: This module must be tested with 30 sample resumes before proceeding.
Wrong level detection = wrong advice to 50% of users.
"""

import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class CareerLevel:
    """Result of career level detection."""
    level: str  # junior | mid | senior | director
    confidence: float  # 0.0 to 1.0
    years_detected: Optional[int] = None
    title_matched: Optional[str] = None
    years_pattern_matched: Optional[str] = None


# Title keywords by career level
JUNIOR_TITLES = [
    'intern', 'fresher', 'student', 'entry-level', 'entry level',
    'junior', 'jr', 'associate', 'trainee', 'apprentice',
    'graduate', 'new grad', 'recent graduate'
]

MID_TITLES = [
    'engineer', 'developer', 'analyst', 'designer',
    'consultant', 'specialist', 'coordinator', 'administrator',
    'programmer', 'technician', 'operator'
]

SENIOR_TITLES = [
    'senior', 'sr', 'lead', 'principal', 'staff', 'architect',
    'manager', 'supervisor', 'team lead', 'tech lead',
    'scrum master', 'product owner'
]

DIRECTOR_TITLES = [
    'director', 'vp', 'vice president', 'head of', 'chief',
    'partner', 'founder', 'ceo', 'cto', 'cfo', 'coo',
    'executive', 'general manager', 'regional manager',
    'distinguished', 'fellow'
]

# Years patterns
YEARS_PATTERNS = [
    (r'(\d+)\+?\s*(?:years?|yrs?|y\.)\s*(?:of\s*)?(?:experience|exp)', 'years_experience'),
    (r'(?:worked|working|employed)\s*(?:for|as)?\s*(?:the\s*)?(?:past|last)?\s*(\d+)\s*(?:years?|yrs?)', 'years_worked'),
    (r'(\d+)\s*(?:years?|yrs?)\s*(?:in|at)', 'years_in_field'),
    (r'(?:since|from)\s*(\d{4})', 'year_start'),  # Will calculate from current year
]


def extract_years(text: str) -> Optional[int]:
    """Extract years of experience from text."""
    import datetime
    
    for pattern, pattern_type in YEARS_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if pattern_type == 'year_start':
                # Calculate years from start year
                start_year = int(match.group(1))
                current_year = datetime.datetime.now().year
                years = current_year - start_year
                return max(0, min(years, 50))  # Cap at 50 years
            else:
                years = int(match.group(1))
                return max(0, min(years, 50))  # Cap at 50 years
    
    return None


def detect_title_level(text: str) -> tuple[Optional[str], float, Optional[str]]:
    """
    Detect career level from job titles in text.
    
    Returns:
        (level, confidence, matched_title)
    """
    text_lower = text.lower()
    
    # Check for director-level titles first (highest priority)
    for title in DIRECTOR_TITLES:
        if re.search(r'\b' + re.escape(title) + r'\b', text_lower):
            return ('director', 0.9, title)
    
    # Check for senior-level titles
    for title in SENIOR_TITLES:
        if re.search(r'\b' + re.escape(title) + r'\b', text_lower):
            # Distinguish between "senior" and just "manager"
            if title in ['senior', 'sr', 'lead', 'principal', 'staff', 'architect']:
                return ('senior', 0.85, title)
            else:
                # Manager titles could be mid or senior depending on context
                return ('senior', 0.7, title)
    
    # Check for mid-level titles
    for title in MID_TITLES:
        if re.search(r'\b' + re.escape(title) + r'\b', text_lower):
            return ('mid', 0.75, title)
    
    # Check for junior titles
    for title in JUNIOR_TITLES:
        if re.search(r'\b' + re.escape(title) + r'\b', text_lower):
            return ('junior', 0.85, title)
    
    return (None, 0.0, None)


def detect_career_level(resume_text: str) -> CareerLevel:
    """
    Main function to detect career level from resume text.
    
    Strategy:
    1. Extract years of experience
    2. Detect title-based level
    3. Combine both signals with weighted decision
    
    Args:
        resume_text: Raw resume text
        
    Returns:
        CareerLevel object with level, confidence, and metadata
    """
    # Extract years
    years = extract_years(resume_text)
    
    # Detect title level
    title_level, title_confidence, matched_title = detect_title_level(resume_text)
    
    # Decision logic
    level_candidates = []
    
    # Add years-based assessment
    if years is not None:
        if years <= 2:
            level_candidates.append(('junior', 0.7, 'years'))
        elif years <= 7:
            level_candidates.append(('mid', 0.6, 'years'))
        elif years <= 12:
            level_candidates.append(('senior', 0.6, 'years'))
        else:
            level_candidates.append(('director', 0.7, 'years'))
    
    # Add title-based assessment
    if title_level:
        level_candidates.append((title_level, title_confidence, 'title'))
    
    # If no signals detected, default to mid with low confidence
    if not level_candidates:
        return CareerLevel(
            level='mid',
            confidence=0.3,
            years_detected=None,
            title_matched=None,
            years_pattern_matched=None
        )
    
    # Weight title higher than years (titles are more explicit)
    # Sort by confidence * weight
    def score_candidate(candidate):
        level, conf, source = candidate
        weight = 1.5 if source == 'title' else 1.0
        return conf * weight
    
    level_candidates.sort(key=score_candidate, reverse=True)
    best_level, best_conf, best_source = level_candidates[0]
    
    # Check for conflicts between years and title
    if len(level_candidates) > 1:
        second_level, second_conf, second_source = level_candidates[1]
        if best_level != second_level:
            # Conflict detected - reduce confidence
            best_conf *= 0.7
    
    return CareerLevel(
        level=best_level,
        confidence=min(best_conf, 0.95),  # Cap at 0.95
        years_detected=years,
        title_matched=matched_title,
        years_pattern_matched=best_source
    )


# Test function for development
if __name__ == '__main__':
    test_cases = [
        ("Senior Software Engineer with 5 years of experience", 'senior'),
        ("Intern at Google, computer science student", 'junior'),
        ("Director of Engineering, 15 years of experience", 'director'),
        ("Software Developer, worked for the past 4 years", 'mid'),
        ("Lead Architect with 10+ years experience", 'senior'),
        ("Entry level position, recent graduate", 'junior'),
        ("VP of Product, former head of design", 'director'),
        ("Data Analyst, 2 years in finance", 'mid'),
    ]
    
    print("Testing career level detection:")
    print("=" * 60)
    
    for text, expected in test_cases:
        result = detect_career_level(text)
        status = "✓" if result.level == expected else "✗"
        print(f"{status} Input: {text[:50]}...")
        print(f"  Expected: {expected}, Got: {result.level}")
        print(f"  Confidence: {result.confidence:.2f}")
        print(f"  Years: {result.years_detected}, Title: {result.title_matched}")
        print()
