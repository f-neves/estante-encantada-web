import { API_URL } from '../config';
import { getToken } from '../session';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Por padrão envia o Bearer token; passe false para rotas públicas. */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${API_URL}${path}`;
  if (!query) {
    return url;
  }
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length > 0 ? `${url}?${params.join('&')}` : url;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.auth !== false) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    // Sem rede, servidor fora do ar ou bloqueio de CORS/conteúdo misto.
    throw new ApiError(0, 'Não foi possível falar com o servidor. Verifique a conexão.');
  }

  const text = await response.text();
  const data = text.length > 0 ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = (data && data.error) || 'Erro na requisição';
    throw new ApiError(response.status, message);
  }

  return data as T;
}
