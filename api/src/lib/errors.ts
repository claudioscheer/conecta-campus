export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR";

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}

export function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
): Response {
  const body: ErrorEnvelope = {
    error: {
      code,
      message,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    },
  };
  return Response.json(body, { status });
}
