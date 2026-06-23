import type { DeepSeekMessage, DeepSeekResponse } from '@/types'
import { STORAGE_KEYS } from '@/types'

const BASE_URL = 'https://api.deepseek.com/v1'
const MODEL = 'deepseek-chat'

function getApiKey(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.apiKey)
    if (!raw) return ''
    return JSON.parse(raw) as string
  } catch {
    return ''
  }
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0
}

export async function chat(
  messages: DeepSeekMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('请先设置 DeepSeek API Key')
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
      stream: false,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error')
    if (res.status === 401) {
      throw new Error('API Key 无效，请在设置中更新')
    }
    if (res.status === 429) {
      throw new Error('API 请求太频繁，请稍后再试')
    }
    throw new Error(`API 请求失败 (${res.status}): ${errText}`)
  }

  const data: DeepSeekResponse = await res.json()
  const content = data.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 返回为空，请重试')
  }

  // Clean markdown code block wrappers if present
  return content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

/**
 * Safely parse AI JSON response with fallback.
 */
export function parseAIResponse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    // Try to extract JSON from the string
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        return fallback
      }
    }
    return fallback
  }
}
