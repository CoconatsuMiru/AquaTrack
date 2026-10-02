export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error
    if (typeof message === 'string') {
      return message
    }
  }

  return 'Something went wrong. Please try again.'
}

// Postgres error code 23505 = a unique rule was broken (e.g. a duplicate name or number)
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}