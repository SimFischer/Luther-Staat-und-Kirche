/* Steuerung der Lernanwendung: Seitenfolge, Aufgaben, Prüfung, Abgabe. */
(function () {
  "use strict";

  var SEITEN = window.SEITEN;
  var state = window.Speicher.laden();
  var esc = window.Leser.esc;

  var elKopf, elSchritte, elBalken, elLeser, elInhalt, elMeldung;
  var aktiveSeite = 0;
  var aktuellerAbschnitt = null;
  var leserInstanz = null;

  /* Vorschaumodus für Lehrkräfte: index.html?vorschau=1
     Hebt die Freischaltsperre auf, damit sich alle Lernschritte ansehen lassen.
     Freigegeben wird er erst, wenn dieselbe Anmeldung wie im Lehrerbereich
     vorliegt (Supabase-Sitzung) UND das Konto in der Tabelle lehrkraefte
     freigeschaltet ist. Der Modus gilt nur für diesen Browser-Tab und verändert
     den gespeicherten Arbeitsstand nicht. */
  var VORSCHAU_SCHLUESSEL = "luther-vorschau";
  var vorschau = false;
  var vorschauAngefragt = (function () {
    var imLink = /[?&]vorschau(=|&|$)/.test(window.location.search);
    try {
      if (imLink) { sessionStorage.setItem(VORSCHAU_SCHLUESSEL, "1"); return true; }
      return sessionStorage.getItem(VORSCHAU_SCHLUESSEL) === "1";
    } catch (e) { return imLink; }
  })();

  function vorschauMerkerLoeschen() {
    try { sessionStorage.removeItem(VORSCHAU_SCHLUESSEL); } catch (e) {}
  }

  function vorschauBeenden() {
    vorschauMerkerLoeschen();
    window.location.href = window.location.pathname;
  }

  /* Prüft dieselbe Berechtigung wie der Lehrerbereich: angemeldet und in der
     Tabelle lehrkraefte eingetragen. Ohne Anmeldung greift die Row Level
     Security, die Abfrage liefert dann nichts. */
  function pruefeLehrkraft() {
    if (!window.SB.istKonfiguriert() || window.SB.istServiceKey()) {
      return Promise.resolve({ erlaubt: false,
        grund: "Die Online-Anbindung ist auf dieser Seite nicht eingerichtet." });
    }
    return window.SB.hole().then(function (sb) {
      return sb.auth.getSession().then(function (res) {
        var sitzung = res && res.data ? res.data.session : null;
        if (!sitzung || !sitzung.user) {
          return { erlaubt: false, anmeldung: true,
            grund: "Dafür musst du im Lehrerbereich angemeldet sein." };
        }
        return sb.from("lehrkraefte").select("user_id").eq("user_id", sitzung.user.id).maybeSingle()
          .then(function (r) {
            if (r.error || !r.data) {
              return { erlaubt: false, anmeldung: true,
                grund: "Dieses Konto ist nicht als Lehrkraft freigeschaltet." };
            }
            return { erlaubt: true };
          });
      });
    }).catch(function () {
      return { erlaubt: false,
        grund: "Die Berechtigung konnte gerade nicht geprüft werden." };
    });
  }

  /* ---------------- Hilfsfunktionen ---------------- */
  function speichern() { window.Speicher.sichern(state); }
  function ant(id) { return state.antworten[id]; }
  function setAnt(id, wert) { state.antworten[id] = wert; speichern(); }
  function frei(i) { return vorschau || state.freigeschaltet.indexOf(i) >= 0; }
  function laenge(s) { return (s || "").trim().replace(/\s+/g, " ").length; }

  function seiteMitAbschnitt(abschnittId) {
    for (var i = 0; i < SEITEN.length; i++) if (SEITEN[i].abschnitt === abschnittId) return i;
    return -1;
  }

  /* ---------------- Prüfung ---------------- */
  function pruefeAufgabe(a) {
    var f = [], v = ant(a.id), i;

    if (a.typ === "mc") {
      if (v === undefined || v === null) f.push("„" + kurzFrage(a) + "“ ist noch nicht beantwortet.");
      else if (v !== a.loesung) f.push(a.hinweis);
    }

    else if (a.typ === "multi") {
      if (!Array.isArray(v) || !v.length) f.push("„" + kurzFrage(a) + "“ ist noch nicht beantwortet.");
      else {
        var soll = a.loesung.slice().sort().join(","), ist = v.slice().sort().join(",");
        if (soll !== ist) f.push(a.hinweis);
      }
    }

    else if (a.typ === "text") {
      if (laenge(v) < (a.minLen || 1)) f.push(a.hinweisLeer);
      else if (a.schluessel) {
        var t = (v || "").toLowerCase();
        for (i = 0; i < a.schluessel.length; i++) {
          var treffer = a.schluessel[i].some(function (w) { return t.indexOf(w) >= 0; });
          if (!treffer) { f.push(a.hinweisSchluessel); break; }
        }
      }
    }

    else if (a.typ === "position") {
      v = v || {};
      if (v.wahl === undefined || v.wahl === null) f.push(a.hinweisWahl);
      if (laenge(v.text) < (a.minLen || 1)) f.push(a.hinweisText);
    }

    else if (a.typ === "auswahl") {
      v = v || {};
      if (!v.thema || !String(v.thema).trim()) f.push(a.hinweis);
    }

    else if (a.typ === "zuordnung") {
      v = v || {};
      var offen = a.items.filter(function (it) { return !v[it.id]; });
      if (offen.length) f.push(a.hinweisLeer);
      else if (a.items.some(function (it) { return v[it.id] !== it.korb; })) f.push(a.hinweisFalsch);
    }

    else if (a.typ === "aussagen") {
      v = v || {};
      var ohne = a.items.filter(function (it) { return !v[it.id] || v[it.id].kat === undefined || v[it.id].kat === null; });
      if (ohne.length) f.push(a.hinweisLeer);
      var ohneB = a.items.filter(function (it) {
        return it.begruendung && laenge((v[it.id] || {}).text) < 60;
      });
      if (ohneB.length) f.push(a.hinweisBegruendung);
    }

    return f.filter(Boolean);
  }

  function kurzFrage(a) {
    var t = a.frage.replace(/\s+/g, " ");
    return t.length > 68 ? t.slice(0, 65) + "…" : t;
  }

  function pruefeSeite(i) {
    var s = SEITEN[i], f = [];
    if (s.tafel) return window.Tafel.pruefen(state);
    s.aufgaben.forEach(function (a) { f = f.concat(pruefeAufgabe(a)); });
    return f;
  }

  function seiteFertig(i) { return pruefeSeite(i).length === 0; }

  function offeneBereiche() {
    var offen = [];
    for (var i = 1; i < SEITEN.length; i++) {
      if (SEITEN[i].abgabe) continue;
      if (pruefeSeite(i).length) offen.push(SEITEN[i].kapitel + ": " + SEITEN[i].titel);
    }
    return offen;
  }

  /* ---------------- Kopfzeile ---------------- */
  function zeichneKopf() {
    elSchritte.innerHTML = SEITEN.map(function (s, i) {
      var klassen = ["schritt"];
      if (i === aktiveSeite) klassen.push("aktiv");
      else if (frei(i) && i < SEITEN.length && seiteFertig(i)) klassen.push("fertig");
      return '<li><button type="button" class="' + klassen.join(" ") + '" data-gehe="' + i + '"' +
        (frei(i) ? "" : " disabled") +
        ' title="' + esc(s.titel) + '" aria-label="' + esc(s.kapitel + " – " + s.titel) + '">' +
        esc(s.kurz) + "</button></li>";
    }).join("");
    var fertig = 0;
    for (var i = 1; i < SEITEN.length - 1; i++) if (frei(i) && seiteFertig(i)) fertig++;
    elBalken.style.width = Math.round(fertig / (SEITEN.length - 2) * 100) + "%";
  }

  /* ---------------- Leseansicht ---------------- */
  function zeichneLeser(seite) {
    var moeglich = Object.keys(window.KLIEMANN_TEXT.sections).filter(function (id) {
      var idx = seiteMitAbschnitt(id);
      return idx >= 0 && frei(idx);
    });
    aktuellerAbschnitt = seite.abschnitt || (moeglich.length ? (aktuellerAbschnitt && moeglich.indexOf(aktuellerAbschnitt) >= 0 ? aktuellerAbschnitt : moeglich[moeglich.length - 1]) : null);

    elLeser.innerHTML = "";
    if (!aktuellerAbschnitt) return;

    var halter = document.createElement("div");
    elLeser.appendChild(halter);
    leserInstanz = window.Leser.montieren(halter, aktuellerAbschnitt, state, speichern);

    if (moeglich.length > 1) {
      var wahl = document.createElement("div");
      wahl.className = "knopfzeile";
      wahl.style.margin = "-.4rem 0 1rem";
      wahl.innerHTML = '<span class="zusatz" style="margin:0">Abschnitt öffnen:</span>' +
        moeglich.map(function (id) {
          var s = window.KLIEMANN_TEXT.sections[id];
          return '<button type="button" class="knopf stumm klein" data-abschnitt="' + id + '"' +
            (id === aktuellerAbschnitt ? ' style="background:var(--blau-zart)"' : "") +
            '>Z. ' + s.von + "–" + s.bis + "</button>";
        }).join("");
      elLeser.appendChild(wahl);
      wahl.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-abschnitt]");
        if (!b) return;
        aktuellerAbschnitt = b.dataset.abschnitt;
        zeichneLeser({ abschnitt: aktuellerAbschnitt });
      });
    }
  }

  /* Aufklappbare Schreibhilfen zu einer Schreibaufgabe (Aufbau, Denkanstoesse) */
  function strukturHtml(a) {
    var h = "";
    if (a.struktur && a.struktur.length) {
      h += '<details class="schreibhilfe"' + (a.strukturOffen ? " open" : "") + ">" +
        "<summary>" + esc(a.strukturTitel || "Strukturhilfe: So kannst du deinen Text aufbauen") + "</summary>" +
        '<div class="schreibhilfe-inhalt">' +
        a.struktur.map(function (teil) {
          return "<h4>" + esc(teil.titel) + "</h4>" +
            (teil.zusatz ? '<p class="zusatz">' + esc(teil.zusatz) + "</p>" : "") +
            "<ul>" + (teil.punkte || []).map(function (pt) {
              return "<li>" + esc(pt) + "</li>";
            }).join("") + "</ul>";
        }).join("") + "</div></details>";
    }
    if (a.anstoesse && a.anstoesse.length) {
      h += '<details class="schreibhilfe"><summary>Denkanstöße, falls du nicht weiterkommst</summary>' +
        '<div class="schreibhilfe-inhalt"><ul>' +
        a.anstoesse.map(function (pt) { return "<li>" + esc(pt) + "</li>"; }).join("") +
        "</ul></div></details>";
    }
    return h;
  }

  /* ---------------- Aufgaben zeichnen ---------------- */
  function htmlAufgabe(a) {
    var v = ant(a.id), h = "";
    h += '<section class="karte auftrag" data-aufgabe="' + a.id + '">';
    h += '<span class="auftrag-marke">Arbeitsauftrag</span>';
    h += '<p class="frage">' + esc(a.frage) + "</p>";
    if (a.zusatz) h += '<p class="zusatz">' + esc(a.zusatz) + "</p>";

    if (a.typ === "mc" || a.typ === "multi") {
      var mehrfach = a.typ === "multi";
      h += '<div class="optionen">' + a.optionen.map(function (o, i) {
        var an = mehrfach ? (Array.isArray(v) && v.indexOf(i) >= 0) : (v === i);
        return '<label class="opt"><input type="' + (mehrfach ? "checkbox" : "radio") +
          '" name="f_' + a.id + '" value="' + i + '"' + (an ? " checked" : "") +
          ' data-typ="' + a.typ + '" data-ziel="' + a.id + '"><span>' + esc(o) + "</span></label>";
      }).join("") + "</div>";
    }

    else if (a.typ === "text") {
      h += strukturHtml(a);
      h += '<textarea data-typ="text" data-ziel="' + a.id + '" rows="' + (a.zeilen || 5) +
        '" placeholder="' +
        esc(a.platzhalter || "") + '">' + esc(v || "") + "</textarea>" +
        '<div class="zaehler" data-zaehler="' + a.id + '">' + laenge(v) +
        " Zeichen (mindestens " + a.minLen + ")</div>";
    }

    else if (a.typ === "position") {
      v = v || {};
      h += '<div class="optionen">' + a.optionen.map(function (o, i) {
        return '<label class="opt"><input type="radio" name="f_' + a.id + '" value="' + i + '"' +
          (v.wahl === i ? " checked" : "") + ' data-typ="position-wahl" data-ziel="' + a.id +
          '"><span>' + esc(o) + "</span></label>";
      }).join("") + "</div>";
      h += '<label class="feld" style="margin-top:.7rem"><span>Begründung</span>' +
        '<textarea data-typ="position-text" data-ziel="' + a.id + '" rows="5">' + esc(v.text || "") +
        "</textarea></label>" +
        '<div class="zaehler" data-zaehler="' + a.id + '">' + laenge(v.text) +
        " Zeichen (mindestens " + a.minLen + ")</div>";
    }

    else if (a.typ === "auswahl") {
      v = v || {};
      var istEigen = v.thema && a.optionen.indexOf(v.thema) < 0;
      h += '<select data-typ="auswahl" data-ziel="' + a.id + '">' +
        '<option value="">— bitte wählen —</option>' +
        a.optionen.map(function (o) {
          return '<option value="' + esc(o) + '"' + (v.thema === o ? " selected" : "") + ">" + esc(o) + "</option>";
        }).join("") +
        '<option value="__eigen"' + (istEigen ? " selected" : "") + ">" + esc(a.eigenes) + "</option></select>" +
        '<div data-eigen="' + a.id + '" style="margin-top:.6rem' + (istEigen ? "" : ";display:none") + '">' +
        '<input type="text" data-typ="auswahl-eigen" data-ziel="' + a.id + '" placeholder="Eigenes Thema" value="' +
        esc(istEigen ? v.thema : "") + '"></div>';
    }

    else if (a.typ === "zuordnung") {
      v = v || {};
      var imVorrat = a.items.filter(function (it) { return !v[it.id]; });
      h += '<div class="vorrat" data-vorrat="' + a.id + '">' +
        (imVorrat.length ? imVorrat.map(function (it) {
          return '<button type="button" class="chip" data-chip="' + it.id + '" data-ziel="' + a.id + '">' +
            esc(it.text) + "</button>";
        }).join("") : '<span class="zusatz" style="margin:0">Alle Begriffe sind zugeordnet.</span>') + "</div>";
      h += '<div class="zuordnung zwei" style="margin-top:.8rem">' + a.koerbe.map(function (k) {
        var drin = a.items.filter(function (it) { return v[it.id] === k.id; });
        return '<div class="korb" data-korb="' + k.id + '" data-ziel="' + a.id + '"><h4>' + esc(k.label) + "</h4>" +
          '<div class="ablage">' + (drin.length ? drin.map(function (it) {
            return '<button type="button" class="chip" data-raus="' + it.id + '" data-ziel="' + a.id +
              '" title="Zurück in den Vorrat">' + esc(it.text) + "</button>";
          }).join("") : '<span class="zusatz" style="margin:0">noch leer</span>') + "</div></div>";
      }).join("") + "</div>";
    }

    else if (a.typ === "aussagen") {
      v = v || {};
      h += a.items.map(function (it) {
        var e = v[it.id] || {};
        var gewaehlt = e.kat !== undefined && e.kat !== null;
        var s = '<div class="aussage"><p>' + esc(it.text) + "</p><div class=\"kat\">" +
          a.kategorien.map(function (k, ki) {
            return '<button type="button" data-kat="' + ki + '" data-item="' + it.id + '" data-ziel="' + a.id +
              '" aria-pressed="' + (e.kat === ki) + '">' + esc(k) + "</button>";
          }).join("") + "</div>";
        if (it.begruendung) {
          s += '<label class="feld" style="margin-top:.55rem"><span>Begründe deine Entscheidung</span>' +
            '<textarea rows="3" data-typ="aussage-text" data-item="' + it.id + '" data-ziel="' + a.id + '">' +
            esc(e.text || "") + "</textarea></label>";
        }
        if (gewaehlt) {
          s += '<div class="rueck ' + (e.kat === it.loesung ? "ok" : "nein") + '"><strong>' +
            (e.kat === it.loesung ? "Deine Einordnung trägt." : "Sieh noch einmal genauer hin.") +
            "</strong> " + esc(it.rueck) + "</div>";
        }
        return s + "</div>";
      }).join("");
    }

    h += "</section>";
    return h;
  }

  /* ---------------- Seitenaufbau ---------------- */
  function zeichneSeite(i) {
    aktiveSeite = i;
    state.aktuelleSeite = i;
    speichern();
    window.scrollTo(0, 0);

    var s = SEITEN[i], h = "";
    h += '<div class="seiten-kopf"><p class="kapitel">' + esc(s.kapitel) + "</p>" +
         "<h1>" + esc(s.titel) + "</h1>" +
         (s.lead ? '<p class="lead">' + esc(s.lead) + "</p>" : "") + "</div>";

    if (s.start) h += startInhalt();
    if (s.hilfe) h += '<div class="meldung info"><h3>Hilfe</h3>' + esc(s.hilfe) + "</div>";
    if (s.tafel) h += '<div id="tafelZiel"></div>';
    if (s.abgabe) h += abgabeInhalt();

    h += s.aufgaben.map(htmlAufgabe).join("");
    h += '<div id="meldung"></div>';

    h += '<div class="knopfzeile">';
    if (i > 0) h += '<button type="button" class="knopf stumm" data-gehe="' + (i - 1) + '">Zurück</button>';
    if (!s.abgabe) {
      h += '<button type="button" class="knopf" data-weiter="1">' +
           (i === 0 ? "Beginnen" : "Seite abschließen und weiter") + "</button>";
    }
    h += '<button type="button" class="knopf warn abstand" data-reset="1">Arbeit zurücksetzen</button>';
    h += "</div>";

    h += sicherungHtml(!!s.abgabe);

    h += '<div class="fuss"><p>' + esc(window.KLIEMANN_TEXT.autor) + ", „" +
         esc(window.KLIEMANN_TEXT.titel) + "“</p>" +
         '<p><a href="lehrer.html" class="fuss-link">Lehreransicht</a></p></div>';

    elInhalt.innerHTML = h;
    elMeldung = document.getElementById("meldung");

    zeichneLeser(s);
    if (s.tafel) {
      window.Tafel.montieren(document.getElementById("tafelZiel"), state, speichern);
    }
    if (s.abgabe) abgabeVerdrahten();
    zeichneKopf();
  }

  /* Datensparsamkeit: An die Datenbank geht nur ein Kürzel aus je zwei
     Buchstaben von Vor- und Nachname. Der vollständige Name bleibt
     ausschließlich in der lokalen Speicherung auf dem Gerät. */
  var NUR_BUCHSTABEN = (function () {
    // \p{L} erfasst auch Buchstaben wie Ş oder Ł. Ältere Browser fallen auf
    // den Latin-1-Bereich zurück.
    try { return new RegExp("[^\\p{L}]", "gu"); }
    catch (e) { return /[^A-Za-zÀ-ÿ]/g; }
  })();

  function kuerzelTeil(t) {
    var rein = String(t || "").trim().replace(NUR_BUCHSTABEN, "");
    if (!rein) return "";
    var a = rein.charAt(0).toUpperCase();
    var b = rein.length > 1 ? rein.charAt(1).toLowerCase() : "";
    return a + b;
  }

  function kuerzelGanz(vorname, nachname) {
    var k = kuerzelTeil(vorname) + kuerzelTeil(nachname);
    return k || "\u2014";
  }

  function kuerzelVorschauAn() {
    var z = document.querySelector("[data-kuerzel]");
    if (!z) return;
    var p = state.person || {};
    z.textContent = kuerzelGanz(p.vorname, p.nachname) +
      ((p.kurs || "").trim() ? " \u00b7 " + (p.kurs || "").trim() : "");
  }

  function personFelder() {
    var p = state.person || {};
    return '<div class="feldgruppe drei">' +
      '<label class="feld"><span>Vorname</span><input type="text" data-person="vorname" autocomplete="given-name" value="' + esc(p.vorname || "") + '"></label>' +
      '<label class="feld"><span>Nachname</span><input type="text" data-person="nachname" autocomplete="family-name" value="' + esc(p.nachname || "") + '"></label>' +
      '<label class="feld"><span>Kurs / Klasse</span><input type="text" data-person="kurs" placeholder="z. B. Q1 ev. Religion" value="' + esc(p.kurs || "") + '"></label>' +
      "</div>" +
      '<p class="zusatz kuerzel-hinweis">Übertragen wird nur dein Kürzel: ' +
      '<strong data-kuerzel>' + esc(kuerzelGanz(p.vorname, p.nachname)) +
      ((p.kurs || "").trim() ? " \u00b7 " + esc((p.kurs || "").trim()) : "") + "</strong>. " +
      "Dein vollständiger Name bleibt auf diesem Gerät und erscheint nur in deinem eigenen PDF.</p>";
  }

  function sicherungHtml(aufAbgabeseite) {
    var h = '<section class="karte sicherung"><h2>Arbeit sichern und fortsetzen</h2>' +
      '<p class="zusatz">Wenn du in der Stunde nicht fertig wirst: Zwischenstand herunterladen und beim nächsten Mal wieder hochladen. Auf diesem Gerät bleibt dein Stand ohnehin gespeichert. ' +
      "Für die Klausurvorbereitung: „Ergebnisse als PDF sichern“ erstellt jederzeit eine vollständige Übersicht mit allen Lernschritten und deinen Antworten \u2013 auch nach der Abgabe.</p>";
    if (!aufAbgabeseite) h += personFelder();
    h += '<div class="knopfzeile">' +
      '<button type="button" class="knopf stumm" data-drucken="1">Ergebnisse als PDF sichern</button>' +
      '<button type="button" class="knopf stumm" data-sichern="datei">Zwischenstand herunterladen</button>' +
      '<label class="knopf stumm dateiwahl">Zwischenstand hochladen' +
      '<input type="file" accept=".json,application/json" data-laden="1" hidden></label>';
    if (window.SB.istKonfiguriert() && !state.abgabe) {
      h += '<button type="button" class="knopf stumm" data-sichern="online">Zwischenstand an die Lehrkraft senden</button>';
    }
    h += '</div><div id="sicherungMeldung"></div></section>';
    return h;
  }

  function sicherungMeldung(art, text) {
    var z = document.getElementById("sicherungMeldung");
    if (z) z.innerHTML = '<div class="meldung ' + art + '"><p>' + esc(text) + "</p></div>";
  }

  function dateiName() {
    var p = state.person || {};
    var teil = ((p.nachname || "") + "_" + (p.vorname || "")).replace(/[^A-Za-zÄÖÜäöüß0-9_-]/g, "");
    var d = new Date(), z = function (n) { return (n < 10 ? "0" : "") + n; };
    return "Luther_Zwischenstand" + (teil.length > 1 ? "_" + teil : "") + "_" +
      d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()) + ".json";
  }

  function alsDatei() {
    var paket = { typ: "luther-zwischenstand", version: 1, gespeichertAm: new Date().toISOString(), stand: state };
    var blob = new Blob([JSON.stringify(paket, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = dateiName();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    sicherungMeldung("gut", "Der Zwischenstand wurde als Datei " + dateiName() + " gespeichert. Bewahre sie auf und lade sie beim nächsten Mal hier wieder hoch.");
  }

  function ausDatei(datei) {
    var leser = new FileReader();
    leser.onload = function () {
      var paket;
      try { paket = JSON.parse(leser.result); } catch (e) { paket = null; }
      if (!paket || paket.typ !== "luther-zwischenstand" || !paket.stand) {
        sicherungMeldung("fehler", "Diese Datei ist kein Zwischenstand dieser Lernanwendung.");
        return;
      }
      if (!window.confirm("Zwischenstand vom " +
          new Date(paket.gespeichertAm).toLocaleString("de-DE") +
          " laden?\n\nDer Stand auf diesem Gerät wird dabei ersetzt.")) return;
      var neu = window.Speicher.leer();
      Object.keys(neu).forEach(function (k) { if (paket.stand[k] !== undefined) neu[k] = paket.stand[k]; });
      if (!Array.isArray(neu.freigeschaltet) || !neu.freigeschaltet.length) neu.freigeschaltet = [0];
      state = neu;
      window.Speicher.sofortSichern(state);
      var ziel = Math.min(state.aktuelleSeite || 0, SEITEN.length - 1);
      if (!frei(ziel)) ziel = 0;
      zeichneSeite(ziel);
      sicherungMeldung("gut", "Der Zwischenstand wurde geladen. Du kannst dort weiterarbeiten, wo du aufgehört hast.");
    };
    leser.onerror = function () { sicherungMeldung("fehler", "Die Datei konnte nicht gelesen werden."); };
    leser.readAsText(datei);
  }

  var onlineLaeuft = false;

  function anLehrkraft() {
    var p = state.person || {};
    var fehlt = [];
    if (!(p.vorname || "").trim()) fehlt.push("Vorname");
    if (!(p.nachname || "").trim()) fehlt.push("Nachname");
    if (!(p.kurs || "").trim()) fehlt.push("Kurs / Klasse");
    if (fehlt.length) {
      sicherungMeldung("fehler", "Dafür fehlt noch: " + fehlt.join(", ") + ".");
      return;
    }
    if (onlineLaeuft) return;
    if (!window.confirm("Zwischenstand an die Lehrkraft senden?\n\nDas ist noch keine verbindliche Abgabe; du kannst danach weiterarbeiten.")) return;
    onlineLaeuft = true;
    sicherungMeldung("info", "Zwischenstand wird gesendet …");
    var daten = sammleAbgabe(p.vorname.trim(), p.nachname.trim(), p.kurs.trim(), "zwischenstand");
    window.SB.hole().then(function (sb) {
      return sb.from(window.SB.TABELLE).insert(daten);
    }).then(function (res) {
      if (res && res.error) throw res.error;
      onlineLaeuft = false;
      state.letzterZwischenstand = daten.abgegeben_am;
      speichern();
      sicherungMeldung("gut", "Der Zwischenstand liegt jetzt bei deiner Lehrkraft. Du kannst weiterarbeiten.");
    }).catch(function (err) {
      onlineLaeuft = false;
      sicherungMeldung("fehler", "Das Senden hat nicht geklappt: " +
        String(err && err.message ? err.message : err) + " Nutze solange den Download.");
    });
  }

  /* Vollstaendige Ergebnisuebersicht zum Drucken bzw. als PDF sichern */
  function druckansicht() {
    if (!window.Druck) { window.print(); return; }
    var abgeschlossen = 0;
    for (var i = 1; i < SEITEN.length - 1; i++) if (seiteFertig(i)) abgeschlossen++;
    window.Druck.oeffnen(state, { abgeschlossen: abgeschlossen, gesamt: SEITEN.length - 2 });
  }

  function startInhalt() {
    var t = window.KLIEMANN_TEXT;
    return '<section class="karte"><h2>So arbeitest du</h2><ul>' +
      "<li>Lies zuerst den Originalabschnitt, dann bearbeite die Aufgaben darunter.</li>" +
      "<li>Der Text bleibt oben sichtbar und lässt sich ein- und ausklappen.</li>" +
      "<li>Du kannst im Text markieren: Stelle auswählen, dann eine der vier Farben antippen.</li>" +
      "<li>Dein Stand wird automatisch auf diesem Gerät gespeichert.</li>" +
      "</ul><h2>Die Aufgaben des Materials</h2><ol>" +
      t.aufgabenImOriginal.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") +
      "</ol></section>";
  }

  /* ---------------- Ereignisse ---------------- */
  function verdrahten() {
    document.addEventListener("click", function (ev) {
      var g = ev.target.closest("[data-gehe]");
      if (g) {
        var ziel = +g.dataset.gehe;
        if (!frei(ziel)) { melde(["Diese Seite ist noch nicht freigeschaltet. Schließe zuerst die vorherige Seite ab."], "fehler"); return; }
        zeichneSeite(ziel); return;
      }
      if (ev.target.closest("[data-weiter]")) { weiter(); return; }
      if (ev.target.closest('[data-vorschau="aus"]')) {
        if (vorschau) { vorschauBeenden(); }
        else {
          var l = document.querySelector(".vorschau-leiste");
          if (l) l.remove();
        }
        return;
      }
      if (ev.target.closest("[data-drucken]")) { druckansicht(); return; }
      var sich = ev.target.closest("[data-sichern]");
      if (sich) {
        if (sich.dataset.sichern === "datei") alsDatei(); else anLehrkraft();
        return;
      }
      if (ev.target.closest("[data-reset]")) { zuruecksetzen(); return; }

      var chip = ev.target.closest("[data-chip]");
      if (chip) {
        document.querySelectorAll('[data-vorrat="' + chip.dataset.ziel + '"] .chip')
          .forEach(function (c) { if (c !== chip) c.classList.remove("gewaehlt"); });
        chip.classList.toggle("gewaehlt");
        return;
      }
      var korb = ev.target.closest("[data-korb]");
      if (korb) {
        // Ein ausgewählter Begriff wird immer eingeordnet – auch wenn der
        // Fingertipp auf einem bereits abgelegten Begriff landet.
        var gew = document.querySelector('[data-vorrat="' + korb.dataset.ziel + '"] .chip.gewaehlt');
        if (gew) {
          var w = ant(korb.dataset.ziel) || {};
          w[gew.dataset.chip] = korb.dataset.korb;
          setAnt(korb.dataset.ziel, w);
          zeichneAufgabeNeu(korb.dataset.ziel);
          return;
        }
      }
      var raus = ev.target.closest("[data-raus]");
      if (raus) {
        var av = ant(raus.dataset.ziel) || {};
        delete av[raus.dataset.raus];
        setAnt(raus.dataset.ziel, av);
        zeichneAufgabeNeu(raus.dataset.ziel);
        return;
      }
      var kat = ev.target.closest("[data-kat]");
      if (kat) {
        var e = ant(kat.dataset.ziel) || {};
        var vor = e[kat.dataset.item] || {};
        vor.kat = +kat.dataset.kat;
        e[kat.dataset.item] = vor;
        setAnt(kat.dataset.ziel, e);
        zeichneAufgabeNeu(kat.dataset.ziel);
      }
    });

    document.addEventListener("change", function (ev) {
      var el = ev.target;
      if (el.dataset && el.dataset.laden && el.files && el.files[0]) {
        ausDatei(el.files[0]);
        el.value = "";
        return;
      }
      var ziel = el.dataset ? el.dataset.ziel : null;
      if (!ziel) return;
      var typ = el.dataset.typ;
      if (typ === "mc") setAnt(ziel, +el.value);
      else if (typ === "multi") {
        var liste = Array.isArray(ant(ziel)) ? ant(ziel).slice() : [];
        var idx = liste.indexOf(+el.value);
        if (el.checked && idx < 0) liste.push(+el.value);
        if (!el.checked && idx >= 0) liste.splice(idx, 1);
        setAnt(ziel, liste);
      }
      else if (typ === "position-wahl") { var p = ant(ziel) || {}; p.wahl = +el.value; setAnt(ziel, p); }
      else if (typ === "auswahl") {
        var a = ant(ziel) || {};
        var eigen = document.querySelector('[data-eigen="' + ziel + '"]');
        if (el.value === "__eigen") { eigen.style.display = ""; a.thema = (eigen.querySelector("input").value || "").trim(); }
        else { eigen.style.display = "none"; a.thema = el.value; }
        setAnt(ziel, a);
      }
    });

    document.addEventListener("input", function (ev) {
      var el = ev.target;
      if (el.dataset && el.dataset.person) {
        if (!state.person) state.person = { vorname: "", nachname: "", kurs: "" };
        state.person[el.dataset.person] = el.value;
        kuerzelVorschauAn();
        speichern();
        return;
      }
      var ziel = el.dataset ? el.dataset.ziel : null;
      if (!ziel) return;
      var typ = el.dataset.typ;
      if (typ === "text") { setAnt(ziel, el.value); zaehlerAn(ziel, el.value); }
      else if (typ === "position-text") { var p = ant(ziel) || {}; p.text = el.value; setAnt(ziel, p); zaehlerAn(ziel, el.value); }
      else if (typ === "auswahl-eigen") { var a = ant(ziel) || {}; a.thema = el.value.trim(); setAnt(ziel, a); }
      else if (typ === "aussage-text") {
        var e = ant(ziel) || {}, vor = e[el.dataset.item] || {};
        vor.text = el.value; e[el.dataset.item] = vor; setAnt(ziel, e);
      }
    });
  }

  function zaehlerAn(id, wert) {
    var z = document.querySelector('[data-zaehler="' + id + '"]');
    if (!z) return;
    var min = z.textContent.match(/mindestens (\d+)/);
    z.textContent = laenge(wert) + " Zeichen (mindestens " + (min ? min[1] : "") + ")";
  }

  function zeichneAufgabeNeu(id) {
    var s = SEITEN[aktiveSeite];
    var a = null;
    s.aufgaben.forEach(function (x) { if (x.id === id) a = x; });
    if (!a) return;
    var alt = document.querySelector('[data-aufgabe="' + id + '"]');
    if (!alt) return;
    var huelle = document.createElement("div");
    huelle.innerHTML = htmlAufgabe(a);
    alt.replaceWith(huelle.firstChild);
  }

  function melde(liste, art) {
    if (!elMeldung) return;
    if (!liste || !liste.length) { elMeldung.innerHTML = ""; return; }
    var titel = art === "fehler" ? "Diese Seite ist noch nicht abgeschlossen"
              : art === "gut" ? "Geschafft" : "Hinweis";
    elMeldung.innerHTML = '<div class="meldung ' + art + '"><h3>' + titel + "</h3>" +
      (liste.length === 1 ? "<p>" + esc(liste[0]) + "</p>"
        : "<ul>" + liste.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>") + "</div>";
    elMeldung.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function weiter() {
    var f = pruefeSeite(aktiveSeite);
    if (f.length) { melde(f, "fehler"); zeichneKopf(); return; }
    var naechste = aktiveSeite + 1;
    if (naechste >= SEITEN.length) return;
    if (!frei(naechste)) state.freigeschaltet.push(naechste);
    window.Speicher.sofortSichern(state);
    zeichneSeite(naechste);
  }

  function zuruecksetzen() {
    if (!window.confirm("Wirklich die gesamte Arbeit zurücksetzen?\n\nAlle Antworten, Markierungen und das Tafelbild auf diesem Gerät werden gelöscht. Das lässt sich nicht rückgängig machen.")) return;
    if (!window.confirm("Letzte Sicherheitsabfrage: alles endgültig löschen?")) return;
    window.Speicher.loeschen();
    state = window.Speicher.leer();
    zeichneSeite(0);
  }

  /* ---------------- Abgabe ---------------- */
  function abgabeInhalt() {
    var a = state.abgabe;
    if (a) {
      return '<div class="meldung gut"><h3>Deine Arbeit wurde erfolgreich abgegeben.</h3>' +
        "<p>" + esc(a.vorname + " " + a.nachname) + " – " + esc(a.kurs) + ", abgegeben am " +
        new Date(a.abgegebenAm).toLocaleString("de-DE") + (a.online ? "" : " (lokal gesichert)") + ".</p></div>" +
        '<section class="karte"><p>Du kannst diese Seite jetzt schließen. Eine erneute Abgabe ist nicht nötig.</p>' +
        '<div class="knopfzeile"><button type="button" class="knopf stumm" data-drucken="1">Ergebnisse als PDF sichern</button></div></section>';
    }
    var offen = offeneBereiche();
    var h = '<section class="karte"><h2>Vor der Abgabe</h2>';
    if (offen.length) {
      h += '<div class="meldung fehler" style="margin-top:0"><h3>Es fehlen noch Pflichtbereiche</h3><ul>' +
        offen.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") +
        "</ul><p>Öffne die genannten Seiten über die Zahlen oben und schließe sie ab.</p></div>";
    } else {
      h += '<div class="meldung gut" style="margin-top:0"><p>Alle Pflichtbereiche sind bearbeitet.</p></div>';
    }
    h += personFelder();
    h += '<div id="abgabeMeldung"></div>';
    h += '<div class="knopfzeile"><button type="button" class="knopf" id="btnAbgabe">Arbeit verbindlich abgeben</button>' +
      '<button type="button" class="knopf stumm" data-drucken="1">Ergebnisse als PDF sichern</button></div>';
    if (!window.SB.istKonfiguriert()) {
      h += '<div class="meldung info"><h3>Die Online-Abgabe ist noch nicht eingerichtet.</h3>' +
        "<p>Deine Arbeit wird dann nur auf diesem Gerät gesichert. Gib deiner Lehrkraft Bescheid oder drucke die Übersicht aus.</p></div>";
    }
    return h + "</section>";
  }

  function sammleAbgabe(vorname, nachname, kurs, art) {
    var recherche = {};
    ["t0", "t1", "t2", "t3", "t4", "t5"].forEach(function (k) { if (ant(k) !== undefined) recherche[k] = ant(k); });
    var abgeschlossen = 0;
    for (var i = 1; i < SEITEN.length - 1; i++) if (seiteFertig(i)) abgeschlossen++;
    return {
      // Bewusst nur die Kürzel-Bestandteile, nicht der Klarname
      vorname: kuerzelTeil(vorname), nachname: kuerzelTeil(nachname), kurs: kurs,
      art: art || "abgabe",
      abgegeben_am: new Date().toISOString(),
      dauer_sekunden: Math.round(state.aktiveSekunden || 0),
      fortschritt: {
        freigeschaltet: state.freigeschaltet,
        abgeschlossene_seiten: abgeschlossen,
        seiten_gesamt: SEITEN.length - 2,
        begonnen_am: state.begonnenAm
      },
      antworten: state.antworten,
      markierungen: state.markierungen,
      tafelbild: state.tafelbild,
      recherche: recherche,
      urteil: ant("t6") || "",
      vollstaendig: offeneBereiche().length === 0,
      client_id: geraeteId()
    };
  }

  function geraeteId() {
    try {
      var k = "luther-geraet";
      var v = localStorage.getItem(k);
      if (!v) { v = "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return "unbekannt"; }
  }

  var abgabeLaeuft = false;

  function abgabeVerdrahten() {
    var btn = document.getElementById("btnAbgabe");
    var meld = document.getElementById("abgabeMeldung");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (abgabeLaeuft || state.abgabe) return;
      var p = state.person || {};
      var vorname = (p.vorname || "").trim();
      var nachname = (p.nachname || "").trim();
      var kurs = (p.kurs || "").trim();

      var fehlt = [];
      if (!vorname) fehlt.push("Dein Vorname fehlt.");
      if (!nachname) fehlt.push("Dein Nachname fehlt.");
      if (!kurs) fehlt.push("Die Angabe zu Kurs bzw. Klasse fehlt.");
      var offen = offeneBereiche();
      offen.forEach(function (o) { fehlt.push("Noch nicht abgeschlossen – " + o); });

      if (fehlt.length) {
        meld.innerHTML = '<div class="meldung fehler"><h3>Die Abgabe ist noch nicht möglich</h3><ul>' +
          fehlt.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul></div>";
        return;
      }
      if (!window.confirm("Arbeit jetzt verbindlich abgeben?\n\nDanach sind keine Änderungen mehr vorgesehen.")) return;

      abgabeLaeuft = true;
      btn.disabled = true;
      btn.textContent = "Wird abgegeben …";
      var daten = sammleAbgabe(vorname, nachname, kurs, "abgabe");

      function fertig(online, info) {
        state.abgabe = { vorname: vorname, nachname: nachname, kurs: kurs, abgegebenAm: daten.abgegeben_am, online: online };
        window.Speicher.sofortSichern(state);
        abgabeLaeuft = false;
        zeichneSeite(aktiveSeite);
        if (info) {
          var m = document.getElementById("meldung");
          if (m) m.innerHTML = '<div class="meldung info"><p>' + esc(info) + "</p></div>";
        }
      }

      if (!window.SB.istKonfiguriert()) {
        fertig(false, "Die Online-Abgabe ist noch nicht eingerichtet. Deine Arbeit wurde auf diesem Gerät gesichert.");
        return;
      }

      window.SB.hole().then(function (sb) {
        return sb.from(window.SB.TABELLE).insert(daten);
      }).then(function (res) {
        if (res && res.error) throw res.error;
        fertig(true, null);
      }).catch(function (err) {
        abgabeLaeuft = false;
        btn.disabled = false;
        btn.textContent = "Arbeit verbindlich abgeben";
        meld.innerHTML = '<div class="meldung fehler"><h3>Die Abgabe konnte nicht übertragen werden</h3>' +
          "<p>" + esc(String(err && err.message ? err.message : err)) + "</p>" +
          "<p>Deine Arbeit ist auf diesem Gerät weiterhin gespeichert. Versuche es erneut oder sprich deine Lehrkraft an.</p></div>";
      });
    });
  }

  /* ---------------- Zeiterfassung ---------------- */
  setInterval(function () {
    if (document.visibilityState === "visible" && !state.abgabe) {
      state.aktiveSekunden = (state.aktiveSekunden || 0) + 5;
      speichern();
    }
  }, 5000);

  function vorschauLeiste(inhalt, klasse) {
    var alt = document.querySelector(".vorschau-leiste");
    if (alt) alt.remove();
    var leiste = document.createElement("div");
    leiste.className = "vorschau-leiste" + (klasse ? " " + klasse : "");
    leiste.innerHTML = inhalt;
    document.body.insertBefore(leiste, document.body.firstChild);
  }

  function zeigeVorschauLeiste() {
    vorschauLeiste(
      "<strong>Vorschaumodus</strong>" +
      "<span>Alle Lernschritte sind freigeschaltet. Eingaben werden wie sonst auch " +
      "auf diesem Gerät gespeichert \u2013 eine Abgabe landet weiterhin in der Datenbank.</span>" +
      '<button type="button" class="knopf stumm klein" data-vorschau="aus">Vorschau beenden</button>');
  }

  function zeigeVorschauAbgelehnt(ergebnis) {
    vorschauMerkerLoeschen();
    vorschauLeiste(
      "<strong>Vorschaumodus nicht verfügbar</strong>" +
      "<span>" + esc(ergebnis.grund || "") + " Die Lernschritte bleiben deshalb der Reihe nach " +
      "freigeschaltet.</span>" +
      (ergebnis.anmeldung
        ? '<a class="knopf stumm klein" href="lehrer.html">Zum Lehrerbereich</a>'
        : '<button type="button" class="knopf stumm klein" data-vorschau="aus">Hinweis ausblenden</button>'),
      "abgelehnt");
  }

  /* ---------------- Start ---------------- */
  function los() {
    elSchritte = document.getElementById("schritte");
    elBalken   = document.getElementById("balken");
    elLeser    = document.getElementById("leser");
    elInhalt   = document.getElementById("inhalt");

    if (window.SB.istServiceKey()) {
      document.getElementById("inhalt").innerHTML =
        '<div class="meldung fehler"><h3>Konfigurationsfehler</h3><p>In <code>assets/js/supabase_config.js</code> ist offenbar ein geheimer Schlüssel (service_role) eingetragen. ' +
        "Dieser darf nicht im Browser verwendet werden. Bitte durch den anon-/publishable-Key ersetzen.</p></div>";
      return;
    }
    verdrahten();
    window.addEventListener("beforeunload", function () { window.Speicher.sofortSichern(state); });

    if (!vorschauAngefragt) { ersteSeite(); return; }

    elInhalt.innerHTML = '<div class="karte">Berechtigung wird geprüft \u2026</div>';
    pruefeLehrkraft().then(function (ergebnis) {
      vorschau = !!ergebnis.erlaubt;
      if (vorschau) zeigeVorschauLeiste();
      else zeigeVorschauAbgelehnt(ergebnis);
      ersteSeite();
    });
  }

  function ersteSeite() {
    var start = Math.min(state.aktuelleSeite || 0, SEITEN.length - 1);
    if (!frei(start)) start = 0;
    zeichneSeite(start);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los);
  else los();
})();
