"""
Feedback Logger - Logs suggestion accept/reject actions.

Implements the learning loop for improving AI suggestions.
Every suggestion acceptance or rejection is logged with timestamp.

Query to analyze prompt effectiveness:
    SELECT prompt_version, AVG(accepted) 
    FROM suggestions 
    JOIN feedback ON suggestions.id = feedback.suggestion_id 
    GROUP BY prompt_version
    
This tells you empirically which prompt version works best.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Feedback, Suggestion


class FeedbackLogger:
    """
    Logs user feedback on AI suggestions.
    
    All methods are async and use SQLAlchemy async session.
    """
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
    
    async def log_feedback(
        self,
        suggestion_id: str,
        accepted: bool
    ) -> Feedback:
        """
        Log feedback for a suggestion.
        
        Args:
            suggestion_id: UUID of the suggestion
            accepted: True if user accepted, False if rejected
            
        Returns:
            Created Feedback object
        """
        feedback_id = str(uuid.uuid4())
        feedback = Feedback(
            id=feedback_id,
            suggestion_id=suggestion_id,
            accepted=1 if accepted else 0
        )
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        return feedback
    
    async def get_suggestion_feedback(
        self,
        suggestion_id: str
    ) -> Optional[Feedback]:
        """
        Get feedback for a specific suggestion.
        
        Args:
            suggestion_id: UUID of the suggestion
            
        Returns:
            Feedback object or None if not found
        """
        result = await self.db.execute(
            select(Feedback).where(Feedback.suggestion_id == suggestion_id)
        )
        return result.scalar_one_or_none()
    
    async def get_acceptance_rate_by_prompt_version(
        self
    ) -> list[tuple[str, float]]:
        """
        Get acceptance rates grouped by prompt version.
        
        This is the key query for improving prompts over time.
        Returns list of (prompt_version, acceptance_rate) tuples.
        
        Returns:
            List of (prompt_version, rate) where rate is 0.0 to 1.0
        """
        # Note: This requires raw SQL since we need aggregation
        from sqlalchemy import text
        
        query = text("""
            SELECT s.prompt_version, 
                   AVG(f.accepted) as acceptance_rate
            FROM suggestions s
            JOIN feedback f ON s.id = f.suggestion_id
            GROUP BY s.prompt_version
            ORDER BY s.prompt_version
        """)
        
        result = await self.db.execute(query)
        return [(row.prompt_version, row.acceptance_rate) 
                for row in result.fetchall()]
    
    async def get_total_feedback_count(self) -> int:
        """
        Get total number of feedback records.
        
        Returns:
            Total count of feedback entries
        """
        from sqlalchemy import func
        
        result = await self.db.execute(select(func.count(Feedback.id)))
        return result.scalar()
    
    async def get_feedback_stats(self) -> dict:
        """
        Get overall feedback statistics.
        
        Returns:
            Dict with total, accepted, rejected, and acceptance_rate
        """
        from sqlalchemy import func
        
        result = await self.db.execute(
            select(
                func.count(Feedback.id).label('total'),
                func.sum(Feedback.accepted).label('accepted'),
            )
        )
        row = result.one()
        
        total = row.total or 0
        accepted = row.accepted or 0
        rejected = total - accepted
        acceptance_rate = (accepted / total) if total > 0 else 0.0
        
        return {
            'total': total,
            'accepted': accepted,
            'rejected': rejected,
            'acceptance_rate': acceptance_rate
        }
