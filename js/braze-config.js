/**
 * BRAZE WEB SDK CONFIG
 *
 * Set your API key here to enable Braze. Leave empty to run in "console-only"
 * mode (events still log to console, but are not sent to Braze).
 *
 * Get your key: Braze Dashboard → Settings → API Keys → Web SDK Key
 * Endpoint: Use the SDK endpoint for your region (e.g. sdk.iad-01.braze.com)
 */
window.BRAZE_CONFIG = {
  apiKey: '', // e.g. 'your-braze-api-key-here'
  baseUrl: 'sdk.iad-01.braze.com',
  enableLogging: true // set false in production
};
