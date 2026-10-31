const API_BASE_URL = '/api'

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem('fleettrack_token')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  const responseText = await response.text()

  let result = {}

  if (responseText) {
    try {
      result = JSON.parse(responseText)
    } catch {
      throw new Error('Server returned an invalid response.')
    }
  }

  if (!response.ok) {
    throw new Error(result.error || result.message || 'Request failed.')
  }

  return result
}