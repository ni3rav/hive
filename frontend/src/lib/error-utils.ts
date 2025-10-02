/**
 * utility functions for handling api errors with zod validation issues
 */

interface ZodIssue {
  code: string;
  path: (string | number)[];
  message: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      issues?: ZodIssue[];
    };
  };
}

/**
 * formats zod validation issues into human-readable error messages
 */
export function formatValidationIssues(issues: ZodIssue[]): string {
  if (!issues || issues.length === 0) return '';

  return issues
    .map((issue) => {
      const field = issue.path.join('.');
      return field ? `${field}: ${issue.message}` : issue.message;
    })
    .join(', ');
}

/**
 * extracts error message from api error response, including zod issues if present
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (!error) return fallback;

  const apiError = error as ApiError;
  const responseData = apiError.response?.data;

  if (!responseData) return fallback;

  if (responseData.issues && responseData.issues.length > 0) {
    const issuesText = formatValidationIssues(responseData.issues);
    return responseData.message
      ? `${responseData.message}: ${issuesText}`
      : issuesText;
  }

  return responseData.message || fallback;
}

export function getStatusMessage(status: number | undefined): string | null {
  if (!status) return null;

  const statusMap: Record<number, string> = {
    400: 'Invalid data provided',
    401: 'Unauthorized - please log in',
    403: 'Access forbidden',
    404: 'Not found',
    409: 'Conflict - resource already exists',
    500: 'Server error - please try again later',
  };

  return statusMap[status] || null;
}
