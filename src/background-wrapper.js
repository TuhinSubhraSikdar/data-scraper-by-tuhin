/*
 * Local privacy boundary for the unpacked GitHub build.
 *
 * The inherited bundle contains optional integrations that formerly contacted
 * remote analytics and configuration services. Those integrations are disabled
 * here so the extension cannot send requests to their retired placeholders.
 */
(() => {
  "use strict";

  const blockedHosts = new Set([
    "disabled-analytics.invalid",
    "disabled-config.invalid",
    "disabled-service.invalid"
  ]);
  const nativeFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (resource, options) => {
    const rawUrl = typeof resource === "string" ? resource : resource?.url;
    try {
      const url = new URL(rawUrl);
      if (blockedHosts.has(url.hostname)) {
        return Promise.resolve(new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }
    } catch (_error) {
      // Let the native implementation handle relative or non-standard inputs.
    }
    return nativeFetch(resource, options);
  };
})();

importScripts("background.js");
