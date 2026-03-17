
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ebook-iwzg.vercel.app'

export type ApiErrorShape = { message?: string }

export async function apiFetch<T>(
  path: string,
  opts?: {
    method?: HttpMethod
    body?: unknown
    token?: string
    isFormData?: boolean
  }
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts?.method || 'GET',
    headers: {
      ...(opts?.isFormData
        ? {}
        : {
            'Content-Type': 'application/json',
          }),
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts?.body
      ? opts.isFormData
        ? (opts.body as BodyInit)
        : JSON.stringify(opts.body)
      : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    let data: ApiErrorShape | undefined
    try {
      data = await res.json()
    } catch {
      data = undefined
    }
    throw new Error(data?.message || `Request failed: ${res.status}`)
  }

  return (await res.json()) as T
}
