"""
Verification script for AI Resume Pro backend.

Run this after setup to confirm everything is working:
    python verify.py

Checks:
1. Environment variables loaded
2. Database connection works
3. Career level detection works
4. SpaCy model available (if installed)
5. All required directories exist
"""

import sys
import os
from pathlib import Path


def check_env():
    """Check environment variables are loaded."""
    print("Checking environment variables...")
    
    try:
        from config import get_settings
        settings = get_settings()
        
        print(f"  ✓ SECRET_KEY: {'Set' if settings.secret_key else 'MISSING'}")
        print(f"  ✓ DATABASE_URL: {settings.database_url}")
        print(f"  ✓ GROQ_API_KEY: {'Set' if settings.groq_api_key else 'Not set (OK for dev)'}")
        print(f"  ✓ GEMINI_API_KEY: {'Set' if settings.gemini_api_key else 'Not set (OK for dev)'}")
        print(f"  ✓ Environment: {settings.environment}")
        
        return True
    except Exception as e:
        print(f"  ✗ Error loading settings: {e}")
        return False


def check_database():
    """Check database connection and table creation."""
    print("\nChecking database...")
    
    try:
        import asyncio
        from db import init_database
        from config import get_settings
        
        settings = get_settings()
        db = init_database(settings.database_url)
        
        async def test_db():
            await db.create_tables()
            return True
        
        result = asyncio.run(test_db())
        print("  ✓ Database connection successful")
        print("  ✓ Tables created successfully")
        
        return True
    except Exception as e:
        print(f"  ✗ Database error: {e}")
        return False


def check_career_level_detection():
    """Test career level detection module."""
    print("\nChecking career level detection...")
    
    try:
        from parsing.career_level import detect_career_level
        
        test_cases = [
            ("Senior Engineer with 5 years experience", "senior"),
            ("Intern at tech company", "junior"),
            ("Director of Engineering", "director"),
            ("Software Developer", "mid"),
        ]
        
        all_passed = True
        for text, expected in test_cases:
            result = detect_career_level(text)
            passed = result.level == expected
            status = "✓" if passed else "✗"
            print(f"  {status} '{text[:40]}...' → {result.level} (expected {expected})")
            if not passed:
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def check_spacy():
    """Check if SpaCy model is available."""
    print("\nChecking SpaCy...")
    
    try:
        import spacy
        
        # Try to load the model
        try:
            nlp = spacy.load("en_core_web_lg")
            print("  ✓ SpaCy en_core_web_lg model loaded")
            
            # Test basic functionality
            doc = nlp("Senior engineer with 5 years experience")
            print(f"  ✓ SpaCy processing works (found {len(doc)} tokens)")
            
            return True
        except OSError:
            print("  ⚠ SpaCy en_core_web_lg model not found")
            print("    Run: python -m spacy download en_core_web_lg")
            return False
    except ImportError:
        print("  ✗ SpaCy not installed")
        print("    Run: pip install spacy")
        return False


def check_directories():
    """Check all required directories exist."""
    print("\nChecking directory structure...")
    
    base = Path(__file__).parent
    
    required_dirs = [
        "api",
        "parsing",
        "analysis/pass1_local",
        "analysis/pass2_llm",
        "scoring",
        "export/templates",
        "db",
        "industry/keywords",
        "data",
        "prompts",
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        full_path = base / dir_path
        if full_path.exists():
            print(f"  ✓ {dir_path}/")
        else:
            print(f"  ✗ {dir_path}/ MISSING")
            all_exist = False
    
    return all_exist


def check_files():
    """Check critical files exist."""
    print("\nChecking critical files...")
    
    base = Path(__file__).parent
    
    required_files = [
        "main.py",
        "config.py",
        "requirements.txt",
        ".env",
        "db/models.py",
        "db/session_store.py",
        "parsing/career_level.py",
        "api/ws_analyze.py",
    ]
    
    all_exist = True
    for file_path in required_files:
        full_path = base / file_path
        if full_path.exists():
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} MISSING")
            all_exist = False
    
    return all_exist


def main():
    """Run all verification checks."""
    print("=" * 60)
    print("AI Resume Pro - Backend Verification")
    print("=" * 60)
    
    results = []
    
    results.append(("Environment", check_env()))
    results.append(("Database", check_database()))
    results.append(("Career Level Detection", check_career_level_detection()))
    results.append(("SpaCy", check_spacy()))
    results.append(("Directories", check_directories()))
    results.append(("Files", check_files()))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {name}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n✓ All checks passed! Backend is ready.")
        return 0
    else:
        print("\n✗ Some checks failed. Please fix the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
