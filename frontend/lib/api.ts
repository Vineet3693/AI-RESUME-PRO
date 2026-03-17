import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  session_id: string;
  career_level: 'junior' | 'mid' | 'senior' | 'director';
  industry: string;
  sections: Record<string, string>;
}

export interface LineTag {
  line_number: number;
  color: 'green' | 'yellow' | 'red' | 'grey';
  rule_triggered: string;
  suggestion?: string;
  pass_type: 'local' | 'llm';
}

export interface AnalyzeResponse {
  line_tags: LineTag[];
  ats_parse_score: number;
  health_score: number;
}

export interface JDMatchResponse {
  match_score: number;
  missing_keywords: string[];
  matched_keywords: string[];
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

export async function analyzeResume(
  sessionId: string,
  changedLines: { index: number; text: string }[]
): Promise<AnalyzeResponse> {
  const response = await api.post('/analyze', {
    session_id: sessionId,
    changed_lines: changedLines,
  });
  
  return response.data;
}

export async function matchJD(
  sessionId: string,
  jdText?: string,
  jdUrl?: string
): Promise<JDMatchResponse> {
  const response = await api.post('/jd/match', {
    session_id: sessionId,
    jd_text: jdText,
    jd_url: jdUrl,
  });
  
  return response.data;
}

export async function submitFeedback(
  suggestionId: string,
  accepted: boolean
): Promise<void> {
  await api.post('/feedback', {
    suggestion_id: suggestionId,
    accepted: accepted ? 1 : 0,
  });
}

export async function exportPDF(sessionId: string): Promise<Blob> {
  const response = await api.get(`/export/pdf?session_id=${sessionId}`, {
    responseType: 'blob',
  });
  
  return response.data;
}

export async function exportDOCX(sessionId: string): Promise<Blob> {
  const response = await api.get(`/export/docx?session_id=${sessionId}`, {
    responseType: 'blob',
  });
  
  return response.data;
}

export async function getHistory(sessionId: string): Promise<any[]> {
  const response = await api.get(`/history/${sessionId}`);
  return response.data;
}
