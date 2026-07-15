export interface AIProviderSettings {
  provider: 'gemini';
  hasKey: boolean;
  model: string;
}

export interface SaveAIProviderPayload {
  apiKey: string;
  model?: string;
}

export interface AnalyzePostPayload {
  content: string;
  userPrompt?: string;
}

export interface AnalyzePostResponse {
  analysis: string;
}

export type TransformSelectionAction =
  | 'change_tone'
  | 'fix_grammar'
  | 'elaborate'
  | 'concise';

export interface TransformSelectionPayload {
  selection: string;
  action: TransformSelectionAction;
  tone?: string;
}

export interface TransformSelectionResponse {
  transformed: string;
}
