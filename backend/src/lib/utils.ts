/**
 * Safely extracts a single string parameter from Express 5 req.params
 */
export function getParam(val: string | string[] | undefined): string {
  if (Array.isArray(val)) {
    return val[0] ?? "";
  }
  return val ?? "";
}
