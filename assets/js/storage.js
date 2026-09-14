/* Lokale Zwischenspeicherung des Arbeitsstandes (localStorage). */
(function () {
  "use strict";
  var SCHLUESSEL = "luther-staat-kirche-q1.v1";

  function leer() {
    return {
      version: 1,
      begonnenAm: new Date().toISOString(),
      aktiveSekunden: 0,
      aktuelleSeite: 0,
      freigeschaltet: [0],
      antworten: {},     // Aufgaben-Id -> Antwortwert
      markierungen: {},  // Abschnitts-Id -> Liste von Markierungen
      tafelbild: {},     // Feld-Id -> Baustein-Id
      person: { vorname: "", nachname: "", kurs: "" },
      abgabe: null
    };
  }

  function laden() {
    try {
      var roh = localStorage.getItem(SCHLUESSEL);
      if (!roh) return leer();
      var s = JSON.parse(roh);
      if (!s || s.version !== 1) return leer();
      var v = leer();
      Object.keys(v).forEach(function (k) { if (s[k] !== undefined) v[k] = s[k]; });
      if (!Array.isArray(v.freigeschaltet) || !v.freigeschaltet.length) v.freigeschaltet = [0];
      return v;
    } catch (e) {
      return leer();
    }
  }

  var wartend = null;
  function sichern(state) {
    if (wartend) clearTimeout(wartend);
    wartend = setTimeout(function () {
      try { localStorage.setItem(SCHLUESSEL, JSON.stringify(state)); }
      catch (e) { /* z. B. privater Modus: Arbeit läuft trotzdem weiter */ }
    }, 200);
  }

  function sofortSichern(state) {
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(state)); } catch (e) {}
  }

  function loeschen() {
    try { localStorage.removeItem(SCHLUESSEL); } catch (e) {}
  }

  window.Speicher = {
    laden: laden, sichern: sichern, sofortSichern: sofortSichern,
    loeschen: loeschen, leer: leer, schluessel: SCHLUESSEL
  };
})();
