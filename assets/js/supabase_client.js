/* Supabase-Anbindung ohne Build-Schritt. Das SDK wird bei Bedarf nachgeladen. */
(function () {
  "use strict";
  var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
  var client = null;
  var ladeVorgang = null;

  function cfg() { return window.SUPABASE_CONFIG || {}; }

  function istKonfiguriert() {
    var c = cfg();
    return !!(c.url && c.anonKey &&
              /^https?:\/\//.test(c.url) &&
              c.anonKey.length > 20);
  }

  function warnungServiceKey() {
    // Ein versehentlich eingetragener service_role-Key wird blockiert.
    var k = (cfg().anonKey || "");
    try {
      var teile = k.split(".");
      if (teile.length === 3) {
        var nutz = JSON.parse(atob(teile[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (nutz && nutz.role === "service_role") return true;
      }
    } catch (e) { /* kein JWT – z. B. neuer publishable key */ }
    return /^sb_secret_/.test(k);
  }

  function hole() {
    if (!istKonfiguriert()) return Promise.reject(new Error("nicht-konfiguriert"));
    if (warnungServiceKey()) return Promise.reject(new Error("service-role-key"));
    if (client) return Promise.resolve(client);
    if (!ladeVorgang) {
      ladeVorgang = import(/* @vite-ignore */ SDK_URL).then(function (mod) {
        client = mod.createClient(cfg().url, cfg().anonKey, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
        return client;
      });
    }
    return ladeVorgang;
  }

  window.SB = {
    istKonfiguriert: istKonfiguriert,
    istServiceKey: warnungServiceKey,
    hole: hole,
    TABELLE: "abgaben"
  };
})();
