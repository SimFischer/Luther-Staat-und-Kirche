/* Druck- und PDF-Ansicht für die Schüleransicht:
   baut aus dem aktuellen Stand eine vollständige, lesbare Zusammenfassung
   (alle Lernschritte mit den eigenen Antworten, Tafelbild, Textmarkierungen)
   und öffnet den Druckdialog. Dort lässt sich "Als PDF sichern" wählen.
   Es werden bewusst keine Lösungen oder Bewertungen ausgegeben. */
(function () {
  "use strict";

  var esc = window.Leser.esc;

  function datumJetzt() {
    return new Date().toLocaleString("de-DE");
  }

  function kasten(text) {
    return '<div class="antwort">' + (text ? esc(text) : "— keine Angabe —") + "</div>";
  }

  /* Antwort einer Aufgabe lesbar darstellen – ohne Richtig/Falsch */
  function antwortHtml(a, werte) {
    var v = werte[a.id];

    if (a.typ === "mc") {
      if (v === undefined || v === null) return kasten("");
      return kasten(a.optionen[v]);
    }
    if (a.typ === "multi") {
      if (!Array.isArray(v) || !v.length) return kasten("");
      return kasten(v.map(function (i) { return "• " + a.optionen[i]; }).join("\n"));
    }
    if (a.typ === "text") return kasten(v || "");
    if (a.typ === "position") {
      v = v || {};
      return kasten((v.wahl !== undefined && v.wahl !== null ? "Position: " + a.optionen[v.wahl] + "\n\n" : "") +
        (v.text || ""));
    }
    if (a.typ === "auswahl") return kasten((v || {}).thema || "");
    if (a.typ === "zuordnung") {
      v = v || {};
      return '<div class="antwort">' + a.koerbe.map(function (k) {
        var drin = a.items.filter(function (it) { return v[it.id] === k.id; });
        return "<strong>" + esc(k.label) + "</strong>\n" +
          (drin.length ? drin.map(function (it) { return "  • " + it.text; }).join("\n") : "  —");
      }).join("\n\n") + "</div>";
    }
    if (a.typ === "aussagen") {
      v = v || {};
      return a.items.map(function (it) {
        var e = v[it.id] || {};
        var gew = (e.kat !== undefined && e.kat !== null) ? a.kategorien[e.kat] : null;
        return '<div class="antwort"><strong>' + esc(it.text) + "</strong>\n" +
          (gew ? esc(gew) : "— keine Einordnung —") +
          (it.begruendung ? "\n\nBegründung: " + esc(e.text || "— fehlt —") : "") + "</div>";
      }).join("");
    }
    return kasten("");
  }

  function kopfTabelle(state, info) {
    var p = state.person || {};
    var name = ((p.vorname || "") + " " + (p.nachname || "")).trim();
    var ab = state.abgabe;
    var zeilen =
      "<tr><th>Name</th><td>" + esc(name || "— nicht eingetragen —") + "</td></tr>" +
      "<tr><th>Kurs / Klasse</th><td>" + esc(p.kurs || "— nicht eingetragen —") + "</td></tr>" +
      "<tr><th>Ausgedruckt am</th><td>" + esc(datumJetzt()) + "</td></tr>";
    if (ab && ab.abgegebenAm) {
      zeilen += "<tr><th>Verbindlich abgegeben am</th><td>" +
        esc(new Date(ab.abgegebenAm).toLocaleString("de-DE")) + "</td></tr>";
    }
    if (info && info.gesamt) {
      zeilen += "<tr><th>Bearbeitungsstand</th><td>" + info.abgeschlossen + " von " + info.gesamt +
        " Lernschritten abgeschlossen</td></tr>";
    }
    return '<table class="tabelle"><tbody>' + zeilen + "</tbody></table>";
  }

  function inhaltHtml(state, info) {
    var werte = state.antworten || {};
    var h = '<section class="karte detail">' +
      "<h1>Luthers Verständnis von Staat und Kirche</h1>" +
      '<p class="lead">Zwei-Reiche-Lehre / Lehre von den zwei Regimenten – eigene Bearbeitung</p>' +
      kopfTabelle(state, info);

    window.SEITEN.forEach(function (s) {
      if (!s.aufgaben || !s.aufgaben.length) return;
      h += "<h3>" + esc(s.kapitel + ": " + s.titel) + "</h3>";
      s.aufgaben.forEach(function (auf) {
        h += '<p style="margin:.6rem 0 .1rem"><strong>' + esc(auf.frage) + "</strong></p>" +
          antwortHtml(auf, werte);
      });
    });

    h += "<h3>Tafelbild</h3><div id='druckTafel'></div>";

    h += "<h3>Textmarkierungen</h3>";
    var mk = state.markierungen || {};
    var hat = Object.keys(mk).some(function (k) { return (mk[k] || []).length; });
    if (!hat) {
      h += '<p class="zusatz">Keine Markierungen vorhanden.</p>';
    } else {
      Object.keys(window.KLIEMANN_TEXT.sections).forEach(function (id) {
        if (!(mk[id] || []).length) return;
        h += window.Leser.statisch(id, mk[id]);
      });
    }

    return h + "</section>";
  }

  function schliessen() {
    var el = document.getElementById("druckansicht");
    if (el) el.remove();
    document.body.classList.remove("druckt");
    document.removeEventListener("keydown", beiTaste);
  }

  function beiTaste(ev) {
    if (ev.key === "Escape") schliessen();
  }

  function oeffnen(state, info) {
    schliessen();

    var huelle = document.createElement("div");
    huelle.id = "druckansicht";
    huelle.className = "druck-huelle";
    huelle.innerHTML =
      '<div class="druck-werkzeuge">' +
        '<button type="button" class="knopf" data-druck="los">Als PDF sichern / drucken</button>' +
        '<button type="button" class="knopf stumm" data-druck="zu">Zurück zur Bearbeitung</button>' +
        '<p class="zusatz" style="margin:.5rem 0 0">Im Druckdialog bei „Ziel“ bzw. „Drucker“ ' +
        "„Als PDF speichern“ auswählen. Diese Übersicht enthält deine eigenen Antworten, " +
        "keine Musterlösungen.</p>" +
      "</div>" +
      '<main class="huelle">' + inhaltHtml(state, info) + "</main>";

    document.body.appendChild(huelle);
    document.body.classList.add("druckt");

    var tafelZiel = huelle.querySelector("#druckTafel");
    if (tafelZiel && window.Tafel) {
      window.Tafel.montieren(tafelZiel, { tafelbild: state.tafelbild || {} }, null, true);
    }

    huelle.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-druck]");
      if (!b) return;
      if (b.dataset.druck === "zu") { schliessen(); return; }
      // Kurz warten, damit das Tafelbild seine Linien fertig gezeichnet hat
      setTimeout(function () { window.print(); }, 150);
    });

    document.addEventListener("keydown", beiTaste);
    huelle.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  window.Druck = { oeffnen: oeffnen, schliessen: schliessen };
})();
