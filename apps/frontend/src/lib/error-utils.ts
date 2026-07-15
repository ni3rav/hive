/**
 * utility functions for handling api errors with zod validation issues
 */

interface ZodIssue {
  code: string;
  path: (string | number)[];
  message: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: {
    issues?: ZodIssue[];
  };
}

interface ApiError {
  response?: {
    status?: number;
    data?:
      | ApiErrorResponse
      | {
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

  // handle new response shape with success/code/details
  if ('success' in responseData && responseData.success === false) {
    const standardResponse = responseData as ApiErrorResponse;
    if (
      standardResponse.details?.issues &&
      standardResponse.details.issues.length > 0
    ) {
      const issuesText = formatValidationIssues(
        standardResponse.details.issues,
      );
      return `${standardResponse.message}: ${issuesText}`;
    }
    return standardResponse.message;
  }

  // Handle legacy response shape (backward compatibility)
  if (
    'issues' in responseData &&
    responseData.issues &&
    responseData.issues.length > 0
  ) {
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

export function getAuthErrorMessage(
  error: unknown,
  context: 'login' | 'register' | 'verify',
  fallback = 'Authentication failed',
): string {
  const apiError = error as ApiError;
  const status = apiError.response?.status;

  const customMessages: Record<string, Record<number, string>> = {
    login: {
      404: 'Invalid email or password',
      401: 'Invalid email or password',
    },
    register: {
      409: 'This email is already registered. Please log in.',
    },
    verify: {
      400: 'Invalid or expired verification link',
      404: 'Verification link not found',
    },
  };

  if (status && customMessages[context]?.[status]) {
    return customMessages[context][status];
  }

  return getErrorMessage(error, fallback);
}
