import { apiDelete, apiGet, apiPost } from '@/lib/api-client';
import type {
  AIProviderSettings,
  AnalyzePostPayload,
  AnalyzePostResponse,
  SaveAIProviderPayload,
  TransformSelectionPayload,
  TransformSelectionResponse,
} from '@/types/ai';

export function apiGetAIProvider(): Promise<AIProviderSettings> {
  return apiGet<AIProviderSettings>('/api/ai/provider');
}

export function apiSaveAIProvider(
  payload: SaveAIProviderPayload,
): Promise<AIProviderSettings> {
  return apiPost<AIProviderSettings, SaveAIProviderPayload>(
    '/api/ai/provider',
    payload,
  );
}

export function apiDeleteAIProvider(): Promise<void> {
  return apiDelete<void>('/api/ai/provider');
}

export function apiAnalyzePost(
  payload: AnalyzePostPayload,
): Promise<AnalyzePostResponse> {
  return apiPost<AnalyzePostResponse, AnalyzePostPayload>(
    '/api/ai/editor/analyze',
    payload,
  );
}

export function apiTransformSelection(
  payload: TransformSelectionPayload,
): Promise<TransformSelectionResponse> {
  return apiPost<TransformSelectionResponse, TransformSelectionPayload>(
    '/api/ai/editor/transform-selection',
    payload,
  );
}
