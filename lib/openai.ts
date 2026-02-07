import OpenAI from "openai";

// Model pool - randomly select primary model from this pool for each LLM call
export const MODEL_POOL = [
  'openai/gpt-oss-120b:nitro',
  'minimax/minimax-m2.1:nitro'
];

// Legacy exports for backward compatibility (will be removed after migration)
export const PRIMARY_MODEL = MODEL_POOL[0];
export const FALLBACK_MODELS = MODEL_POOL.slice(1);

/**
 * Randomly shuffles the model pool and selects a primary model with backups
 * Returns a different primary model for each call to improve success rate
 */
export function getRandomizedModels(): { primary: string; backups: string[] } {
  const shuffled = [...MODEL_POOL].sort(() => Math.random() - 0.5);
  return {
    primary: MODEL_POOL[0] || shuffled[0],
    backups: shuffled.slice(1),
  };
}

interface LLMCallParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: Array<any>;
  temperature?: number;
  responseFormat?: { type: string };
  maxTokens?: number;
}

/**
 * Calls LLM with automatic retry using different models from the pool
 * Silent retry for non-streaming routes with exponential backoff
 * @param params - LLM call parameters
 * @param maxRetries - Maximum number of retry attempts (default: MODEL_POOL.length)
 * @returns Response content string
 * @throws Error if all retries are exhausted
 */
export async function callLLMWithRetry(
  params: LLMCallParams,
  maxRetries: number = MODEL_POOL.length
): Promise<string> {
  const openai = getOpenAIClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { primary, backups } = getRandomizedModels();

      // Exponential backoff: wait before retry (except first attempt)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 1s, 2s, 4s, max 5s
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await openai.chat.completions.create({
        model: primary,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        ...(params.responseFormat && { response_format: params.responseFormat }),
        ...(params.maxTokens && { max_tokens: params.maxTokens }),
        // @ts-expect-error - OpenRouter-specific 'models' parameter not in OpenAI types
        models: backups,
      });

      const content = response.choices[0]?.message?.content;

      // Check for empty response
      if (!content || content.trim().length === 0) {
        throw new Error(`Empty response from model: ${primary}`);
      }

      return content;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Log the attempt failure
      console.warn(`LLM call attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      // Continue to next retry
      continue;
    }
  }

  // All retries exhausted
  throw new Error(
    `Failed to get LLM response after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

// Singleton OpenAI client
let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Prompt Playground",
      },
    });
  }
  return openaiInstance;
}

