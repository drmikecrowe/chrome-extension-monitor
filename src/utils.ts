export function isDevMode(): boolean {
  let devMode = !chrome.runtime || !("update_url" in chrome.runtime.getManifest());
  if (devMode) {
    localStorage.debug = "mbfc:*";
  }
  return devMode;
}
