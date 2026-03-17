"""
Database models for AI Resume Pro.

SQLAlchemy async models matching the canonical schema.
All tables use TEXT primary keys (UUIDs) for security and scalability.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Float, String, Text, text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Session(Base):
    """
    sessions: anonymous by default, no PII
    
    Stores session metadata including career level and industry.
    No names, emails, or other personally identifiable information.
    """
    __tablename__ = 'sessions'
    
    id = Column(String(36), primary_key=True)  # UUID string
    career_level = Column(String(20), nullable=False)  # junior|mid|senior|director
    industry = Column(String(50), nullable=False)  # ai_ml|swe|data_science|finance|etc
    privacy_mode = Column(Integer, default=0)  # 0=false, 1=true
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    
    # Relationships
    versions = relationship('ResumeVersion', back_populates='session', cascade='all, delete-orphan')
    jd_matches = relationship('JDMatch', back_populates='session', cascade='all, delete-orphan')


class ResumeVersion(Base):
    """
    resume_versions: stores diffs not full copies
    
    Each version stores encrypted content and diff from previous version.
    This allows tracking exactly which changes caused score improvements.
    """
    __tablename__ = 'resume_versions'
    
    id = Column(String(36), primary_key=True)  # UUID string
    session_id = Column(String(36), ForeignKey('sessions.id'), nullable=False)
    content_encrypted = Column(Text, nullable=False)  # AES-256 encrypted content
    diff_from_prev = Column(Text)  # JSON diff, null for v1
    health_score = Column(Integer)  # 0-100
    ats_parse_score = Column(Integer)  # 0-100
    version_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    
    # Relationships
    session = relationship('Session', back_populates='versions')
    line_tags = relationship('LineTag', back_populates='version', cascade='all, delete-orphan')
    suggestions = relationship('Suggestion', back_populates='version', cascade='all, delete-orphan')


class LineTag(Base):
    """
    line_tags: exactly which rule fired on which line
    
    Tracks color tags (green/yellow/red/grey) for each line with the rule that triggered it.
    Used for real-time feedback and debugging.
    """
    __tablename__ = 'line_tags'
    
    id = Column(String(36), primary_key=True)  # UUID string
    version_id = Column(String(36), ForeignKey('resume_versions.id'), nullable=False)
    line_number = Column(Integer, nullable=False)
    color = Column(String(20), nullable=False)  # green|yellow|red|grey
    rule_triggered = Column(String(100), nullable=False)  # e.g. "weak_verb", "missing_metric"
    pass_type = Column(String(10), nullable=False)  # local|llm
    
    # Relationships
    version = relationship('ResumeVersion', back_populates='line_tags')


class Suggestion(Base):
    """
    suggestions: every AI suggestion ever shown
    
    Stores original text, suggested text, model used, and prompt version.
    Prompt version is critical for A/B testing and improving prompts over time.
    """
    __tablename__ = 'suggestions'
    
    id = Column(String(36), primary_key=True)  # UUID string
    version_id = Column(String(36), ForeignKey('resume_versions.id'), nullable=False)
    line_number = Column(Integer, nullable=False)
    original_text = Column(Text, nullable=False)
    suggested_text = Column(Text, nullable=False)
    model_used = Column(String(20), nullable=False)  # groq|gemini|ollama
    prompt_version = Column(String(20), nullable=False)  # e.g. "v1", "v2"
    
    # Relationships
    version = relationship('ResumeVersion', back_populates='suggestions')
    feedback = relationship('Feedback', back_populates='suggestion', uselist=False, cascade='all, delete-orphan')


class Feedback(Base):
    """
    feedback: learning loop
    
    Tracks whether users accepted or rejected each suggestion.
    Query: SELECT prompt_version, AVG(accepted) FROM suggestions
           JOIN feedback ON suggestions.id = feedback.suggestion_id
           GROUP BY prompt_version
    This tells you which prompt version works best empirically.
    """
    __tablename__ = 'feedback'
    
    id = Column(String(36), primary_key=True)  # UUID string
    suggestion_id = Column(String(36), ForeignKey('suggestions.id'), nullable=False)
    accepted = Column(Integer, nullable=False)  # 1=accepted, 0=rejected
    actioned_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    
    # Relationships
    suggestion = relationship('Suggestion', back_populates='feedback')


class JDMatch(Base):
    """
    jd_matches: JD text never stored raw (privacy)
    
    Job descriptions may contain confidential information.
    We store only the hash for deduplication and the analysis results.
    """
    __tablename__ = 'jd_matches'
    
    id = Column(String(36), primary_key=True)  # UUID string
    session_id = Column(String(36), ForeignKey('sessions.id'), nullable=False)
    jd_text_hash = Column(String(64), nullable=False)  # SHA-256 of JD text
    match_score = Column(Float, nullable=False)  # 0.0 to 1.0
    missing_keywords = Column(Text)  # JSON array
    matched_keywords = Column(Text)  # JSON array
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    
    # Relationships
    session = relationship('Session', back_populates='jd_matches')
