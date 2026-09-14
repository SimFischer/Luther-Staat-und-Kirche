/* Angeheftete Leseansicht des Quellentextes mit Textmarkierungen.
   Markierungen werden als Zeichen-Offsets je Absatz gespeichert. */
(function () {
  "use strict";

  var FARBEN = [
    { id: "gelb",  name: "Gelb"  },
    { id: "gruen", name: "Grün"  },
    { id: "blau",  name: "Blau"  },
    { id: "rosa",  name: "Rosa"  }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function id() { return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---- Bereichsverwaltung ------------------------------------------ */
  function einfuegen(liste, neu) {
    var raus = [];
    liste.forEach(function (r) {
      if (r.p !== neu.p || r.e <= neu.s || r.s >= neu.e) { raus.push(r); return; }
      if (r.s < neu.s) raus.push({ id: id(), p: r.p, s: r.s, e: neu.s, f: r.f });
      if (r.e > neu.e) raus.push({ id: id(), p: r.p, s: neu.e, e: r.e, f: r.f });
    });
    raus.push(neu);
    raus.sort(function (a, b) { return a.p - b.p || a.s - b.s; });
    return raus;
  }

  function absatzHtml(text, bereiche) {
    if (!bereiche.length) return esc(text);
    var out = "", pos = 0;
    bereiche.slice().sort(function (a, b) { return a.s - b.s; }).forEach(function (r) {
      var s = Math.max(0, Math.min(text.length, r.s));
      var e = Math.max(0, Math.min(text.length, r.e));
      if (e <= pos || e <= s) return;
      if (s > pos) out += esc(text.slice(pos, s));
      out += '<mark data-f="' + r.f + '" data-id="' + r.id + '" tabindex="0">' + esc(text.slice(s, e)) + "</mark>";
      pos = e;
    });
    out += esc(text.slice(pos));
    return out;
  }

  /* ---- Offsets aus der Auswahl ------------------------------------- */
  function zeichenOffset(el, node, offset) {
    var r = document.createRange();
    r.selectNodeContents(el);
    try { r.setEnd(node, offset); } catch (e) { return el.textContent.length; }
    return r.toString().length;
  }

  function bereichIn(el, range) {
    if (!range.intersectsNode(el)) return null;
    var len = el.textContent.length, s = 0, e = len;
    if (el.contains(range.startContainer)) s = zeichenOffset(el, range.startContainer, range.startOffset);
    if (el.contains(range.endContainer)) e = zeichenOffset(el, range.endContainer, range.endOffset);
    s = Math.max(0, Math.min(len, s));
    e = Math.max(0, Math.min(len, e));
    return e > s ? { s: s, e: e } : null;
  }

  /* ---- Bauteil ------------------------------------------------------ */
  function montieren(ziel, abschnittId, state, beiAenderung) {
    var abschnitt = window.KLIEMANN_TEXT.sections[abschnittId];
    if (!abschnitt) { ziel.innerHTML = ""; return null; }
    if (!state.markierungen[abschnittId]) state.markierungen[abschnittId] = [];

    var zuKlappenGemerkt = ziel.getAttribute("data-zu") === "1";

    ziel.innerHTML =
      '<div class="leser' + (zuKlappenGemerkt ? " zu" : "") + '">' +
        '<div class="leser-kopf">' +
          '<span class="titel">' + esc(abschnitt.titel) + "</span>" +
          '<span class="zeilen">Z.&nbsp;' + abschnitt.von + "–" + abschnitt.bis + "</span>" +
          '<button type="button" class="knopf stumm klein" data-rolle="klappen">' +
            (zuKlappenGemerkt ? "Text einblenden" : "Text ausblenden") + "</button>" +
        "</div>" +
        '<div class="leser-text" data-rolle="text"></div>' +
        '<div class="leser-fuss">' +
          '<span class="hinweis" data-rolle="hinweis">Textstelle auswählen, dann Farbe antippen.</span>' +
          FARBEN.map(function (f) {
            return '<button type="button" class="farbe" data-f="' + f.id + '" title="' + f.name +
                   ' markieren" aria-label="' + f.name + ' markieren"></button>';
          }).join("") +
          '<button type="button" class="knopf stumm klein" data-rolle="weg" disabled>Markierung entfernen</button>' +
          '<button type="button" class="knopf stumm klein" data-rolle="alle">Alle löschen</button>' +
        "</div>" +
      "</div>";

    var wurzel  = ziel.firstChild;
    var textEl  = wurzel.querySelector('[data-rolle="text"]');
    var hinweis = wurzel.querySelector('[data-rolle="hinweis"]');
    var wegBtn  = wurzel.querySelector('[data-rolle="weg"]');
    var aktiveMarkierung = null;
    var offeneAuswahl = null;

    textEl.innerHTML = abschnitt.absaetze.map(function (a, i) {
      return '<p class="tx" data-p="' + i + '" data-z="' + a.von + "–" + a.bis + '"></p>';
    }).join("");

    function malen() {
      var liste = state.markierungen[abschnittId] || [];
      Array.prototype.forEach.call(textEl.querySelectorAll("p.tx"), function (p) {
        var i = +p.dataset.p;
        p.innerHTML = absatzHtml(abschnitt.absaetze[i].text, liste.filter(function (r) { return r.p === i; }));
      });
    }

    function setzeHinweis(t) { hinweis.textContent = t; }

    function auswahlPruefen() {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { offeneAuswahl = null; return; }
      var range = sel.getRangeAt(0);
      if (!textEl.contains(range.commonAncestorContainer) &&
          !(range.commonAncestorContainer === textEl)) { offeneAuswahl = null; return; }
      var treffer = [];
      Array.prototype.forEach.call(textEl.querySelectorAll("p.tx"), function (p) {
        var b = bereichIn(p, range);
        if (b) treffer.push({ p: +p.dataset.p, s: b.s, e: b.e });
      });
      offeneAuswahl = treffer.length ? treffer : null;
      if (offeneAuswahl) setzeHinweis("Auswahl übernommen – jetzt Farbe wählen.");
    }

    document.addEventListener("selectionchange", auswahlPruefen);
    textEl.addEventListener("pointerup", function () { setTimeout(auswahlPruefen, 0); });

    textEl.addEventListener("click", function (ev) {
      var m = ev.target.closest("mark");
      if (!m) { aktiveMarkierung = null; wegBtn.disabled = true; return; }
      aktiveMarkierung = m.dataset.id;
      wegBtn.disabled = false;
      setzeHinweis("Markierung ausgewählt – Farbe ändern oder entfernen.");
    });

    wurzel.addEventListener("click", function (ev) {
      var btn = ev.target.closest("button");
      if (!btn) return;

      if (btn.dataset.rolle === "klappen") {
        var zu = wurzel.classList.toggle("zu");
        ziel.setAttribute("data-zu", zu ? "1" : "0");
        btn.textContent = zu ? "Text einblenden" : "Text ausblenden";
        return;
      }
      if (btn.dataset.rolle === "alle") {
        if (!(state.markierungen[abschnittId] || []).length) { setzeHinweis("In diesem Abschnitt gibt es noch keine Markierungen."); return; }
        if (!window.confirm("Alle Markierungen in diesem Abschnitt löschen?")) return;
        state.markierungen[abschnittId] = [];
        aktiveMarkierung = null; wegBtn.disabled = true;
        malen(); beiAenderung && beiAenderung();
        setzeHinweis("Alle Markierungen dieses Abschnitts wurden gelöscht.");
        return;
      }
      if (btn.dataset.rolle === "weg") {
        if (!aktiveMarkierung) return;
        state.markierungen[abschnittId] = (state.markierungen[abschnittId] || [])
          .filter(function (r) { return r.id !== aktiveMarkierung; });
        aktiveMarkierung = null; wegBtn.disabled = true;
        malen(); beiAenderung && beiAenderung();
        setzeHinweis("Markierung entfernt.");
        return;
      }
      if (btn.classList.contains("farbe")) {
        var farbe = btn.dataset.f;
        var liste = state.markierungen[abschnittId] || [];

        if (offeneAuswahl) {
          offeneAuswahl.forEach(function (b) {
            liste = einfuegen(liste, { id: id(), p: b.p, s: b.s, e: b.e, f: farbe });
          });
          state.markierungen[abschnittId] = liste;
          offeneAuswahl = null;
          var sel = window.getSelection(); if (sel) sel.removeAllRanges();
          malen(); beiAenderung && beiAenderung();
          setzeHinweis("Markierung gesetzt. Zum Entfernen die Markierung antippen.");
        } else if (aktiveMarkierung) {
          state.markierungen[abschnittId] = liste.map(function (r) {
            return r.id === aktiveMarkierung ? { id: r.id, p: r.p, s: r.s, e: r.e, f: farbe } : r;
          });
          malen(); beiAenderung && beiAenderung();
          setzeHinweis("Farbe geändert.");
        } else {
          setzeHinweis("Zuerst eine Textstelle auswählen oder eine vorhandene Markierung antippen.");
        }
      }
    });

    malen();
    return { malen: malen };
  }

  /* Statische Darstellung für den Lehrerbereich */
  function statisch(abschnittId, markierungen) {
    var abschnitt = window.KLIEMANN_TEXT.sections[abschnittId];
    if (!abschnitt) return "";
    var liste = markierungen || [];
    return '<div class="leser"><div class="leser-kopf"><span class="titel">' + esc(abschnitt.titel) +
      '</span><span class="zeilen">Z.&nbsp;' + abschnitt.von + "–" + abschnitt.bis +
      '</span></div><div class="leser-text" style="max-height:none">' +
      abschnitt.absaetze.map(function (a, i) {
        return '<p data-z="' + a.von + "–" + a.bis + '">' +
          absatzHtml(a.text, liste.filter(function (r) { return r.p === i; })) + "</p>";
      }).join("") + "</div></div>";
  }

  window.Leser = { montieren: montieren, statisch: statisch, FARBEN: FARBEN, esc: esc, absatzHtml: absatzHtml };
})();
