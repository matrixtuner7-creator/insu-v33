export function getPublicShareUrl(queryParams: Record<string, string>): string {
  const baseDomain = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://incident.palcom.online';
  const searchParams = new URLSearchParams(queryParams);
  return `${baseDomain}/?${searchParams.toString()}`;
}
