/* Lernschritt 8: Erörterung in drei Teilen schreiben.
   -----------------------------------------------------------------
   Dieses Skript erweitert die vorhandene Anwendung, ohne app.js zu
   verändern:

   1. Die Punkte der Checklisten in den Schreibhilfen werden zu echten
      Kästchen zum Abhaken. Der Haken merkt sich auf diesem Gerät,
      welche Punkte schon erledigt sind.
   2. Über dem Feld der Reinschrift erscheint ein Knopf, der Einleitung,
      Hauptteil und Schluss zu einem Rohtext zusammenfügt.

   Wenn dieses Skript nicht geladen wird, funktioniert die Anwendung
   unverändert weiter: Die Checklisten bleiben dann normale Aufzählungen
   und die Teile werden von Hand zusammenkopiert.
   Das Skript muss NACH app.js eingebunden werden. */
(function () {
  "use strict";

  var TEILE = ["z1e", "z1h", "z1s"];
  var ZIEL = "z1";
  var HAKEN_SCHLUESSEL = "luther-checkliste";

  /* ---------------- Haken speichern ---------------- */
  function hakenLesen() {
    try {
      var roh = window.localStorage.getItem(HAKEN_SCHLUESSEL);
      var o = roh ? JSON.parse(roh) : {};
      return o && typeof o === "object" ? o : {};
    } catch (e) { return {}; }
  }

  function hakenSchreiben(o) {
    try { window.localStorage.setItem(HAKEN_SCHLUESSEL, JSON.stringify(o)); } catch (e) {}
  }

  /* ---------------- Checklisten ---------------- */
  function checklisteBauen(abschnitt, aufgabeId) {
    /* Nur die erste Schreibhilfe ist die Checkliste. Die zweite enthaelt
       die Denkanstoesse - die sind zum Lesen da, nicht zum Abhaken. */
    var hilfe = abschnitt.querySelector("details.schreibhilfe");
    if (!hilfe) return;
    var listen = hilfe.querySelectorAll(".schreibhilfe-inhalt ul");
    if (!listen.length) return;
    var haken = hakenLesen();

    Array.prototype.forEach.call(listen, function (liste, li) {
      if (liste.dataset.checkliste) return;
      liste.dataset.checkliste = "1";
      liste.classList.add("checkliste");

      Array.prototype.forEach.call(liste.children, function (punkt, pi) {
        if (punkt.tagName !== "LI") return;
        var schluessel = aufgabeId + ":" + li + ":" + pi;
        var text = punkt.textContent;

        var label = document.createElement("label");
        label.className = "checkpunkt";
        var box = document.createElement("input");
        box.type = "checkbox";
        box.checked = !!haken[schluessel];
        var span = document.createElement("span");
        span.textContent = text;

        box.addEventListener("change", function () {
          var akt = hakenLesen();
          if (box.checked) akt[schluessel] = true; else delete akt[schluessel];
          hakenSchreiben(akt);
          label.classList.toggle("erledigt", box.checked);
        });

        label.appendChild(box);
        label.appendChild(span);
        label.classList.toggle("erledigt", box.checked);

        punkt.textContent = "";
        punkt.appendChild(label);
      });
    });
  }

  /* ---------------- Zusammenfügen ---------------- */
  function feld(id) {
    return document.querySelector('textarea[data-typ="text"][data-ziel="' + id + '"]');
  }

  function inhalt(id) {
    var f = feld(id);
    return f ? f.value.trim() : "";
  }

  function fehlendeTeile() {
    return TEILE.filter(function (id) { return inhalt(id).length < 20; });
  }

  function namen(id) {
    return id === "z1e" ? "Einleitung" : id === "z1h" ? "Hauptteil" : "Schluss";
  }

  /* Absätze der drei Teile hintereinanderhängen, ohne etwas zu verändern.
     Es wird bewusst NICHT umformuliert: Das Verbinden ist die Aufgabe
     der Schülerinnen und Schüler. */
  function zusammenfuegen() {
    return TEILE.map(function (id) {
      return inhalt(id).replace(/\n{3,}/g, "\n\n");
    }).filter(Boolean).join("\n\n");
  }

  function meldung(zone, art, text) {
    zone.innerHTML = '<div class="meldung ' + art + '" style="margin:.6rem 0 0"><p></p></div>';
    zone.querySelector("p").textContent = text;
  }

  function knopfBauen(abschnitt) {
    if (abschnitt.querySelector("[data-zusammen]")) return;
    var ziel = feld(ZIEL);
    if (!ziel) return;

    var kasten = document.createElement("div");
    kasten.className = "zusammenfuegen";
    kasten.innerHTML =
      '<div class="knopfzeile" style="margin:0 0 .6rem">' +
        '<button type="button" class="knopf" data-zusammen="1">Die drei Teile zu einem Text zusammenfügen</button>' +
      "</div>" +
      '<div data-zusammen-meldung></div>';
    ziel.parentNode.insertBefore(kasten, ziel);

    var zone = kasten.querySelector("[data-zusammen-meldung]");
    var knopf = kasten.querySelector("[data-zusammen]");

    var letzterStand = null;
    function standAn() {
      var fehlt = fehlendeTeile();
      var stand = fehlt.join(",");
      if (stand === letzterStand) return;
      letzterStand = stand;
      if (fehlt.length) {
        knopf.disabled = true;
        meldung(zone, "info", "Schreibe zuerst alle drei Teile. Es fehlt noch: " +
          fehlt.map(namen).join(", ") + ".");
      } else {
        knopf.disabled = false;
        zone.innerHTML = "";
      }
    }

    knopf.addEventListener("click", function () {
      if (fehlendeTeile().length) { standAn(); return; }
      var neu = zusammenfuegen();
      var alt = ziel.value.trim();
      if (alt && alt !== neu) {
        if (!window.confirm("In diesem Feld steht schon ein Text. Soll er durch die neu " +
            "zusammengefügten Teile ersetzt werden?\n\nDeine Überarbeitungen in diesem Feld " +
            "gehen dabei verloren. Die drei Teile oben bleiben unverändert.")) return;
      }
      ziel.value = neu;
      /* Das normale Eingabe-Ereignis auslösen, damit die Anwendung den
         Text wie jede andere Eingabe speichert und den Zähler nachführt. */
      ziel.dispatchEvent(new Event("input", { bubbles: true }));
      ziel.focus();
      ziel.setSelectionRange(0, 0);
      ziel.scrollIntoView({ block: "center", behavior: "smooth" });
      letzterStand = "__fertig";
      meldung(zone, "gut", "Die drei Teile stehen jetzt untereinander im Feld. Das ist dein " +
        "Rohtext, noch keine fertige Erörterung: Setze Überleitungen zwischen die Abschnitte, " +
        "streiche Wiederholungen und beziehe den Schluss auf deine Leitfrage zurück.");
    });

    /* Der Knopf wird erst aktiv, wenn alle drei Teile gefüllt sind. */
    standAn();
    TEILE.forEach(function (id) {
      var f = feld(id);
      if (f) f.addEventListener("input", standAn);
    });
  }

  /* ---------------- Einklinken ---------------- */
  function aufbereiten() {
    TEILE.concat([ZIEL]).forEach(function (id) {
      var abschnitt = document.querySelector('[data-aufgabe="' + id + '"]');
      if (abschnitt) checklisteBauen(abschnitt, id);
    });
    var zielAbschnitt = document.querySelector('[data-aufgabe="' + ZIEL + '"]');
    if (zielAbschnitt) knopfBauen(zielAbschnitt);
  }

  function beobachten() {
    var inhaltEl = document.getElementById("inhalt");
    if (!inhaltEl) return;
    aufbereiten();
    var wartet = false;
    new MutationObserver(function () {
      if (wartet) return;
      wartet = true;
      window.setTimeout(function () { wartet = false; aufbereiten(); }, 0);
    }).observe(inhaltEl, { childList: true, subtree: true });
  }

  /* Eigene Gestaltung, damit keine Anpassung in style.css nötig ist. */
  function gestaltung() {
    if (document.getElementById("eroerterungStil")) return;
    var s = document.createElement("style");
    s.id = "eroerterungStil";
    s.textContent =
      "ul.checkliste{list-style:none;padding-left:0;margin:.3rem 0}" +
      "ul.checkliste li{margin:.35rem 0}" +
      ".checkpunkt{display:flex;gap:.55rem;align-items:flex-start;cursor:pointer;line-height:1.45}" +
      ".checkpunkt input{margin-top:.25rem;flex:0 0 auto;width:1.05rem;height:1.05rem;cursor:pointer}" +
      ".checkpunkt.erledigt span{opacity:.55;text-decoration:line-through}" +
      ".zusammenfuegen{margin:.4rem 0 .2rem}" +
      ".zusammenfuegen .knopf[disabled]{opacity:.5;cursor:not-allowed}";
    document.head.appendChild(s);
  }

  function los() { gestaltung(); beobachten(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los);
  else los();
})();
