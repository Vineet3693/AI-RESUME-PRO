"""
Session Store - CRUD operations for sessions and resume versions.

Handles all database operations for:
- Creating new sessions
- Storing resume versions with encrypted content
- Retrieving version history
- Managing diffs between versions
"""

import json
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Session, ResumeVersion


class SessionStore:
    """
    CRUD operations for sessions and resume versions.
    
    All methods are async and use SQLAlchemy async session.
    Content is stored encrypted (AES-256) - encryption handled at service layer.
    """
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
    
    # ========== Session Operations ==========
    
    async def create_session(
        self,
        career_level: str,
        industry: str,
        privacy_mode: bool = False
    ) -> Session:
        """
        Create a new session.
        
        Args:
            career_level: junior|mid|senior|director
            industry: ai_ml|swe|data_science|finance|etc
            privacy_mode: Whether to use local LLM only
            
        Returns:
            Created Session object
        """
        session_id = str(uuid.uuid4())
        session = Session(
            id=session_id,
            career_level=career_level,
            industry=industry,
            privacy_mode=1 if privacy_mode else 0
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """
        Get a session by ID.
        
        Args:
            session_id: UUID string
            
        Returns:
            Session object or None if not found
        """
        result = await self.db.execute(
            select(Session).where(Session.id == session_id)
        )
        return result.scalar_one_or_none()
    
    async def update_privacy_mode(
        self,
        session_id: str,
        privacy_mode: bool
    ) -> Optional[Session]:
        """
        Update privacy mode for a session.
        
        Args:
            session_id: UUID string
            privacy_mode: New privacy mode value
            
        Returns:
            Updated Session object or None if not found
        """
        session = await self.get_session(session_id)
        if session:
            session.privacy_mode = 1 if privacy_mode else 0
            await self.db.commit()
            await self.db.refresh(session)
        return session
    
    # ========== Resume Version Operations ==========
    
    async def create_version(
        self,
        session_id: str,
        content_encrypted: str,
        diff_from_prev: Optional[dict] = None,
        health_score: Optional[int] = None,
        ats_parse_score: Optional[int] = None
    ) -> ResumeVersion:
        """
        Create a new resume version.
        
        Args:
            session_id: Parent session ID
            content_encrypted: AES-256 encrypted resume content
            diff_from_prev: JSON diff from previous version (None for v1)
            health_score: Resume Health Score (0-100)
            ats_parse_score: ATS Parse Score (0-100)
            
        Returns:
            Created ResumeVersion object
        """
        # Get the latest version number
        result = await self.db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.session_id == session_id)
            .order_by(desc(ResumeVersion.version_number))
            .limit(1)
        )
        latest = result.scalar_one_or_none()
        version_number = (latest.version_number + 1) if latest else 1
        
        # Convert diff to JSON string if provided
        diff_json = json.dumps(diff_from_prev) if diff_from_prev else None
        
        version = ResumeVersion(
            id=str(uuid.uuid4()),
            session_id=session_id,
            content_encrypted=content_encrypted,
            diff_from_prev=diff_json,
            health_score=health_score,
            ats_parse_score=ats_parse_score,
            version_number=version_number
        )
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        return version
    
    async def get_latest_version(self, session_id: str) -> Optional[ResumeVersion]:
        """
        Get the latest resume version for a session.
        
        Args:
            session_id: Parent session ID
            
        Returns:
            Latest ResumeVersion or None if no versions exist
        """
        result = await self.db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.session_id == session_id)
            .order_by(desc(ResumeVersion.version_number))
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def get_version(self, version_id: str) -> Optional[ResumeVersion]:
        """
        Get a specific version by ID.
        
        Args:
            version_id: UUID string
            
        Returns:
            ResumeVersion or None if not found
        """
        result = await self.db.execute(
            select(ResumeVersion).where(ResumeVersion.id == version_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all_versions(self, session_id: str) -> list[ResumeVersion]:
        """
        Get all versions for a session in order.
        
        Args:
            session_id: Parent session ID
            
        Returns:
            List of ResumeVersion objects ordered by version_number
        """
        result = await self.db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.session_id == session_id)
            .order_by(ResumeVersion.version_number)
        )
        return result.scalars().all()
    
    async def update_version_scores(
        self,
        version_id: str,
        health_score: int,
        ats_parse_score: int
    ) -> Optional[ResumeVersion]:
        """
        Update scores for a version.
        
        Args:
            version_id: Version UUID
            health_score: Resume Health Score (0-100)
            ats_parse_score: ATS Parse Score (0-100)
            
        Returns:
            Updated ResumeVersion or None if not found
        """
        version = await self.get_version(version_id)
        if version:
            version.health_score = health_score
            version.ats_parse_score = ats_parse_score
            await self.db.commit()
            await self.db.refresh(version)
        return version
