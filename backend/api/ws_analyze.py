"""
WebSocket handler for real-time resume analysis.

Receives: {session_id, changed_lines: [{index, text}]}
Returns: {line_tags: [{index, color, rule, suggestion}]}

Debounce is handled CLIENT-SIDE (1.5s).
This handler just processes what it receives.

Pass 1 local analysis runs on every change.
Pass 2 LLM suggestions are only generated when explicitly requested.
"""

import json
from typing import Dict, List, Any

from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and store a new connection."""
        await websocket.accept()
        self.active_connections[session_id] = websocket
    
    def disconnect(self, session_id: str):
        """Remove a connection."""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_to_session(self, session_id: str, data: dict):
        """Send data to a specific session."""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(data)


manager = ConnectionManager()


async def run_pass1_analysis(
    lines: List[str],
    career_level: str,
    industry: str,
    jd_embedding: Any = None
) -> List[Dict]:
    """
    Run Pass 1 local analysis on resume lines.
    
    This is the orchestrator that calls all Pass 1 checks:
    - ATS simulation
    - Cliché detection
    - Verb strength analysis
    - Metric detection
    - STAR structure validation
    - Grammar checking
    - Semantic keyword matching
    
    Args:
        lines: List of resume text lines
        career_level: junior|mid|senior|director
        industry: Industry name
        jd_embedding: Optional JD embedding for semantic match
        
    Returns:
        List of line tags with color, rule, and optional suggestion
    """
    # TODO: Import and call pass1_local/orchestrator.py
    # For now, return placeholder response
    
    line_tags = []
    for i, line in enumerate(lines):
        # Placeholder - will be replaced by actual analysis
        if len(line.strip()) == 0:
            continue
            
        # Simple heuristic for demo
        if any(weak in line.lower() for weak in ['helped', 'worked', 'did', 'made']):
            line_tags.append({
                'index': i,
                'color': 'red',
                'rule': 'weak_verb',
                'message': 'Weak or passive verb detected'
            })
        elif any(cliche in line.lower() for cliche in ['team player', 'hard worker', 'detail oriented']):
            line_tags.append({
                'index': i,
                'color': 'red',
                'rule': 'cliche_detected',
                'message': 'Cliché phrase detected'
            })
        else:
            line_tags.append({
                'index': i,
                'color': 'green',
                'rule': 'ok',
                'message': None
            })
    
    return line_tags


async def websocket_analyze(websocket: WebSocket):
    """
    Main WebSocket handler for real-time analysis.
    
    Protocol:
    1. Client connects with session_id
    2. Client sends: {type: 'analyze', session_id, changed_lines: [{index, text}]}
    3. Server runs Pass 1 analysis
    4. Server responds: {line_tags: [{index, color, rule, message}]}
    5. Repeat on every debounce (client-side 1.5s)
    """
    # Wait for initial connection message
    try:
        data = await websocket.receive_json()
    except WebSocketDisconnect:
        return
    
    session_id = data.get('session_id')
    if not session_id:
        await websocket.close(code=4000, reason="Missing session_id")
        return
    
    # Connect and store the session
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            try:
                # Wait for analysis request
                data = await websocket.receive_json()
                
                if data.get('type') != 'analyze':
                    continue
                
                changed_lines = data.get('changed_lines', [])
                if not changed_lines:
                    continue
                
                # TODO: Get session from DB to retrieve career_level and industry
                # For now, use defaults
                career_level = 'mid'
                industry = 'general'
                
                # Extract all lines (client should send full content or we fetch from DB)
                # For now, just analyze the changed lines
                lines_to_analyze = [line['text'] for line in changed_lines]
                
                # Run Pass 1 analysis
                line_tags = await run_pass1_analysis(
                    lines=lines_to_analyze,
                    career_level=career_level,
                    industry=industry
                )
                
                # Map back to original indexes
                response_tags = []
                for i, tag in enumerate(line_tags):
                    tag['index'] = changed_lines[i]['index']
                    response_tags.append(tag)
                
                # Send response
                await websocket.send_json({
                    'type': 'analysis_result',
                    'line_tags': response_tags
                })
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                # Log error but keep connection open
                print(f"WebSocket error: {e}")
                await websocket.send_json({
                    'type': 'error',
                    'message': str(e)
                })
    
    finally:
        manager.disconnect(session_id)
