export function getApiError(error,fallback="Request failed") { return error?.response?.data?.detail || error?.message || fallback; }
