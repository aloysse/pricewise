export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '發生未知錯誤'
}

export function isSupabaseError(error: unknown): error is { message: string; code: string } {
  return typeof error === 'object' && error !== null && 'message' in error && 'code' in error
}
