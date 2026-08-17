export function getPublicShareUrl(queryParams: Record<string, string>): string {
  const origin = window.location.origin;
  // Replace internal AI Studio dev domain (-dev-) with public share domain (-pre-) so mobile users don't get 403 Google Auth error
  const publicOrigin = origin.replace('-dev-', '-pre-');
  const searchParams = new URLSearchParams(queryParams);
  return `${publicOrigin}/?${searchParams.toString()}`;
}
