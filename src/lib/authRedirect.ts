export function getAuthRedirectUrl(appUrl: string | undefined, currentOrigin: string) {
  const configuredUrl = appUrl?.trim();
  if (!configuredUrl) return currentOrigin;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return currentOrigin;
  }
}
