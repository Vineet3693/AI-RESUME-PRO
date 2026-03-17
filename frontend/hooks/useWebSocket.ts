import { useEffect, useRef, useCallback, useState } from 'react';
import { useResumeStore } from './useResumeStore';
import { LineTag } from '@/lib/api';

interface UseWebSocketProps {
  sessionId: string | null;
  onColorUpdate: (tags: Map<number, LineTag>) => void;
}

const DEBOUNCE_MS = 1500;

export function useWebSocket({ sessionId, onColorUpdate }: UseWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const changedLinesRef = useRef<Map<number, string>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const privacyMode = useResumeStore((state) => state.privacyMode);

  const connect = useCallback(() => {
    if (!sessionId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/analyze';
    const ws = new WebSocket(`${wsUrl}?session_id=${sessionId}&privacy_mode=${privacyMode}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Reconnect with exponential backoff
      setTimeout(connect, 2000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'analysis_result') {
          const colorMap = new Map<number, LineTag>();
          
          data.line_tags.forEach((tag: LineTag) => {
            colorMap.set(tag.line_number, tag);
          });
          
          onColorUpdate(colorMap);
          
          // Update scores in store
          if (data.ats_parse_score !== undefined && data.health_score !== undefined) {
            useResumeStore.getState().setScores(data.ats_parse_score, data.health_score);
          }
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    wsRef.current = ws;
  }, [sessionId, privacyMode, onColorUpdate]);

  const sendChangedLines = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (changedLinesRef.current.size === 0) return;

    const changedLines = Array.from(changedLinesRef.current.entries()).map(([index, text]) => ({
      index,
      text,
    }));

    wsRef.current.send(JSON.stringify({
      type: 'analyze',
      session_id: sessionId,
      changed_lines: changedLines,
    }));

    changedLinesRef.current.clear();
  }, [sessionId]);

  const queueLineChange = useCallback((lineIndex: number, text: string) => {
    changedLinesRef.current.set(lineIndex, text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      sendChangedLines();
    }, DEBOUNCE_MS);
  }, [sendChangedLines]);

  useEffect(() => {
    connect();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    queueLineChange,
  };
}
