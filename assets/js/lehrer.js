/* Lehrerbereich: Anmeldung über Supabase Auth, zusätzliche Freigabeprüfung
   über die Tabelle public.lehrkraefte, Übersicht und Detailansicht. */
(function () {
  "use strict";

  var esc = window.Leser.esc;
  var bereich = document.getElementById("bereich");
  var kontoZeile = document.getElementById("kontoZeile");
  var btnAbmelden = document.getElementById("btnAbmelden");
  var sb = null, abgaben = [], ausgewaehlt = null;
  var filter = { suche: "", kurs: "", sortierung: "neu", art: "abgabe" };

  function meldung(art, titel, text) {
    return '<div class="meldung ' + art + '">' + (titel ? "<h3>" + esc(titel) + "</h3>" : "") +
      "<p>" + esc(text) + "</p></div>";
  }

  /* ---------------- Herunterladen ---------------- */
  function speichereDatei(name, inhalt, typ) {
    var blob = new Blob([inhalt], { type: typ + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function heute() {
    var d = new Date(), z = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }

  function sauber(t) {
    return String(t || "").replace(/[^A-Za-zÄÖÜäöüß0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  }

  /* Ab Version 10 übertragen die Schülergeräte nur noch ein Kürzel aus je zwei
     Buchstaben von Vor- und Nachname. Ältere Abgaben enthalten noch Klarnamen,
     deshalb wird beides unterstützt. */
  function istKuerzel(a) {
    return (a.vorname || "").length <= 2 && (a.nachname || "").length <= 2;
  }

  function anzeigeName(a) {
    if (istKuerzel(a)) return (a.vorname || "") + (a.nachname || "");
    return (a.nachname || "") + ", " + (a.vorname || "");
  }

  /* Bewertet eine einzelne Aufgabe: true, false oder null (nicht prüfbar) */
  function bewerte(a, wert) {
    if (a.typ === "mc") return wert === undefined || wert === null ? false : wert === a.loesung;
    if (a.typ === "multi") {
      if (!Array.isArray(wert)) return false;
      return a.loesung.slice().sort().join(",") === wert.slice().sort().join(",");
    }
    if (a.typ === "zuordnung") {
      var w = wert || {};
      return a.items.every(function (it) { return w[it.id] === it.korb; });
    }
    return null;
  }

  /* Spalten für die CSV-Übersicht, abgeleitet aus den Lernseiten */
  function spalten() {
    var sp = [
      { kopf: "Kürzel",      hole: function (a) { return (a.vorname || "") + (a.nachname || ""); } },
      { kopf: "Nachname",    hole: function (a) { return a.nachname; } },
      { kopf: "Vorname",     hole: function (a) { return a.vorname; } },
      { kopf: "Kurs",        hole: function (a) { return a.kurs; } },
      { kopf: "Art",         hole: function (a) { return (a.art || "abgabe") === "zwischenstand" ? "Zwischenstand" : "Abgabe"; } },
      { kopf: "Gesendet am", hole: function (a) { return new Date(a.abgegeben_am).toLocaleString("de-DE"); } },
      { kopf: "Vollständig", hole: function (a) { return a.vollstaendig ? "ja" : "nein"; } },
      { kopf: "Lernschritte", hole: function (a) {
          var f = a.fortschritt || {};
          return f.abgeschlossene_seiten !== undefined ? f.abgeschlossene_seiten + " von " + f.seiten_gesamt : ""; } },
      { kopf: "Dauer (min)", hole: function (a) { return a.dauer_sekunden ? Math.round(a.dauer_sekunden / 60) : ""; } }
    ];

    window.SEITEN.forEach(function (seite) {
      var pruefbar = seite.aufgaben.filter(function (a) { return bewerte(a, undefined) !== null; });
      if (pruefbar.length) {
        sp.push({ kopf: seite.kapitel.replace("Lernschritt ", "LS ") + " richtig", hole: function (a) {
          var w = a.antworten || {};
          var n = pruefbar.filter(function (auf) { return bewerte(auf, w[auf.id]) === true; }).length;
          return n + "/" + pruefbar.length;
        } });
      }
      seite.aufgaben.forEach(function (auf) {
        if (auf.typ === "text") {
          sp.push({ kopf: auf.id + " " + kurz(auf.frage), hole: function (a) { return (a.antworten || {})[auf.id] || ""; } });
        } else if (auf.typ === "position") {
          sp.push({ kopf: auf.id + " Position", hole: function (a) {
            var v = (a.antworten || {})[auf.id] || {};
            return v.wahl !== undefined && v.wahl !== null ? auf.optionen[v.wahl] : ""; } });
          sp.push({ kopf: auf.id + " Begründung", hole: function (a) {
            return ((a.antworten || {})[auf.id] || {}).text || ""; } });
        } else if (auf.typ === "auswahl") {
          sp.push({ kopf: auf.id + " Thema", hole: function (a) {
            return ((a.antworten || {})[auf.id] || {}).thema || ""; } });
        } else if (auf.typ === "aussagen") {
          auf.items.filter(function (it) { return it.begruendung; }).forEach(function (it) {
            sp.push({ kopf: it.id + " Begründung", hole: function (a) {
              return (((a.antworten || {})[auf.id] || {})[it.id] || {}).text || ""; } });
          });
        }
      });
    });
    return sp;
  }

  function kurz(t) {
    t = String(t).replace(/\s+/g, " ");
    return t.length > 40 ? t.slice(0, 37) + "…" : t;
  }

  function csvFeld(w) {
    return '"' + String(w === undefined || w === null ? "" : w).replace(/\r?\n/g, " / ").replace(/"/g, '""') + '"';
  }

  function alsCsv(liste) {
    var sp = spalten();
    var zeilen = [sp.map(function (c) { return csvFeld(c.kopf); }).join(";")];
    liste.forEach(function (a) {
      zeilen.push(sp.map(function (c) { return csvFeld(c.hole(a)); }).join(";"));
    });
    // BOM, damit Excel die Umlaute richtig liest
    speichereDatei("Abgaben_" + heute() + ".csv", "\ufeff" + zeilen.join("\r\n"), "text/csv");
  }

  function alsJsonSammlung(liste) {
    speichereDatei("Abgaben_" + heute() + ".json", JSON.stringify({
      exportiertAm: new Date().toISOString(), anzahl: liste.length, abgaben: liste
    }, null, 2), "application/json");
  }

  function alsJsonEinzeln(a) {
    speichereDatei("Abgabe_" + sauber(anzeigeName(a)) + "_" + heute() + ".json",
      JSON.stringify(a, null, 2), "application/json");
  }

  /* Lesbare, druckbare Einzeldatei aus der bereits gerenderten Detailansicht */
  function alsHtmlEinzeln(a) {
    var quelle = document.getElementById("detail");
    if (!quelle) return;
    var kopie = quelle.cloneNode(true);
    kopie.querySelectorAll(".knopfzeile").forEach(function (k) { k.remove(); });
    fetch("assets/css/style.css?v=10").then(function (res) { return res.ok ? res.text() : ""; })
      .catch(function () { return ""; })
      .then(function (css) {
        var titel = (istKuerzel(a) ? anzeigeName(a) : a.vorname + " " + a.nachname) + " – " + a.kurs;
        var doc = "<!DOCTYPE html>\n<html lang=\"de\"><head><meta charset=\"utf-8\">" +
          '<meta name="viewport" content="width=device-width, initial-scale=1">' +
          "<title>" + esc(titel) + "</title><style>" + css +
          "\n.kopf{display:none}.huelle{max-width:52rem;margin:0 auto;padding:1.5rem}</style></head><body>" +
          '<main class="huelle">' + kopie.innerHTML + "</main></body></html>";
        speichereDatei("Abgabe_" + sauber(anzeigeName(a)) + "_" + heute() + ".html",
          doc, "text/html");
      });
  }

  /* ---------------- Start ---------------- */
  function los() {
    if (!window.SB.istKonfiguriert()) {
      bereich.innerHTML = meldung("info", "Supabase ist noch nicht eingerichtet",
        "Trage Project URL und anon-/publishable-Key in assets/js/supabase_config.js ein und führe supabase_setup.sql im SQL-Editor aus. Die Schüleranwendung funktioniert auch ohne diese Einrichtung.");
      return;
    }
    if (window.SB.istServiceKey()) {
      bereich.innerHTML = meldung("fehler", "Konfigurationsfehler",
        "In supabase_config.js steht offenbar ein geheimer Schlüssel (service_role). Dieser darf nie im Browser verwendet werden. Bitte durch den anon-/publishable-Key ersetzen.");
      return;
    }
    bereich.innerHTML = '<div class="karte">Verbindung wird aufgebaut …</div>';
    window.SB.hole().then(function (client) {
      sb = client;
      return sb.auth.getSession();
    }).then(function (res) {
      if (res && res.data && res.data.session) pruefeFreigabe();
      else zeigeAnmeldung();
    }).catch(function (e) {
      bereich.innerHTML = meldung("fehler", "Verbindung fehlgeschlagen", String(e && e.message ? e.message : e));
    });
  }

  /* ---------------- Anmeldung ---------------- */
  function zeigeAnmeldung(fehler, email) {
    kontoZeile.textContent = "";
    btnAbmelden.hidden = true;
    bereich.innerHTML =
      '<section class="karte" style="max-width:34rem">' +
        "<h1>Anmeldung</h1>" +
        '<p class="zusatz">Zugriff auf die Abgaben haben nur angemeldete und freigeschaltete Konten.</p>' +
        (fehler ? meldung("fehler", null, fehler) : "") +
        '<div class="feldgruppe">' +
          '<label class="feld"><span>E-Mail</span>' +
            '<input type="email" id="lEmail" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" value="' +
            esc(email || "") + '"></label>' +
          '<label class="feld"><span>Passwort</span>' +
            '<input type="password" id="lPass" autocomplete="current-password"></label>' +
        "</div>" +
        '<div class="knopfzeile"><button type="button" class="knopf" id="btnAnmelden">Anmelden</button></div>' +
        '<p class="zusatz" style="margin-top:.9rem">Die Anmeldung bleibt auf diesem Gerät bestehen, bis du dich abmeldest. ' +
        "Ein neues Konto legst du im Supabase-Dashboard an und schaltest es in der Tabelle <code>lehrkraefte</code> frei (siehe README).</p>" +
      "</section>";

    var btn = document.getElementById("btnAnmelden");
    var fEmail = document.getElementById("lEmail");
    var fPass = document.getElementById("lPass");

    function anmelden() {
      var e = (fEmail.value || "").trim();
      var pw = fPass.value || "";
      if (!e || !pw) { zeigeAnmeldung("Bitte E-Mail und Passwort eingeben.", e); return; }
      btn.disabled = true; btn.textContent = "Wird geprüft \u2026";
      sb.auth.signInWithPassword({ email: e, password: pw }).then(function (res) {
        if (res.error) {
          var t = String(res.error.message || "");
          if (/invalid login/i.test(t)) t = "E-Mail oder Passwort stimmt nicht.";
          else if (/not confirmed/i.test(t)) t = "Das Konto ist noch nicht bestätigt. Im Supabase-Dashboard unter Authentication \u2192 Users bestätigen.";
          zeigeAnmeldung(t, e);
          return;
        }
        pruefeFreigabe();
      }).catch(function (err) {
        zeigeAnmeldung("Die Anmeldung konnte nicht durchgeführt werden: " + String(err && err.message ? err.message : err), e);
      });
    }
    btn.addEventListener("click", anmelden);
    [fEmail, fPass].forEach(function (f) {
      f.addEventListener("keydown", function (ev) { if (ev.key === "Enter") anmelden(); });
    });
    (email ? fPass : fEmail).focus();
  }

  function abmelden() {
    if (!window.confirm("Vom Lehrerbereich abmelden?")) return;
    sb.auth.signOut().then(function () { abgaben = []; ausgewaehlt = null; zeigeAnmeldung(); });
  }
  btnAbmelden.addEventListener("click", abmelden);

  /* Adresse des SQL-Editors aus der Projekt-URL ableiten */
  function sqlEditorLink() {
    var url = (window.SUPABASE_CONFIG || {}).url || "";
    var m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.(co|in)/i);
    return m ? "https://supabase.com/dashboard/project/" + m[1] + "/sql/new"
             : "https://supabase.com/dashboard";
  }

  function zeigeFreischaltung(nutzer, tabelleFehlt, meldungstext) {
    var sql = "insert into public.lehrkraefte (user_id, email)\nvalues ('" +
      nutzer.id + "', '" + (nutzer.email || "") + "')\non conflict (user_id) do nothing;";

    bereich.innerHTML =
      '<section class="karte" style="max-width:46rem">' +
        "<h1>" + (tabelleFehlt ? "Datenbank noch nicht eingerichtet" : "Konto noch nicht freigeschaltet") + "</h1>" +
        (tabelleFehlt
          ? '<p class="lead">Die Anmeldung hat geklappt, aber die Tabelle <code>lehrkraefte</code> ist nicht erreichbar. ' +
            "Führe zuerst den gesamten Inhalt von <code>supabase_setup.sql</code> im SQL-Editor aus.</p>" +
            (meldungstext ? '<p class="zusatz">Meldung der Datenbank: ' + esc(meldungstext) + "</p>" : "")
          : '<p class="lead">Die Anmeldung hat geklappt. Damit dieses Konto die Abgaben sehen darf, ' +
            "muss es einmalig in der Tabelle <code>lehrkraefte</code> eingetragen werden.</p>") +

        '<table class="tabelle" style="margin-bottom:1rem"><tbody>' +
          "<tr><th>Angemeldet als</th><td>" + esc(nutzer.email || "—") + "</td></tr>" +
          "<tr><th>Benutzer-ID</th><td><code>" + esc(nutzer.id) + "</code></td></tr>" +
        "</tbody></table>" +

        "<h3>So schaltest du dieses Konto frei</h3>" +
        "<ol>" +
          '<li>Den SQL-Editor deines Projekts öffnen: <a href="' + sqlEditorLink() + '" target="_blank" rel="noopener">SQL-Editor bei Supabase</a>.</li>' +
          (tabelleFehlt ? "<li>Zuerst den gesamten Inhalt von <code>supabase_setup.sql</code> einfügen und ausführen.</li>" : "") +
          "<li>Den folgenden Befehl einfügen und ausführen – er ist bereits mit deinen Daten gefüllt.</li>" +
          '<li>Danach hier auf <strong>Erneut prüfen</strong> klicken.</li>' +
        "</ol>" +

        '<pre id="sqlBefehl" style="white-space:pre-wrap;background:var(--papier);border:1px solid var(--linie);' +
        'border-radius:6px;padding:.7rem .8rem;font-size:.86rem;overflow-x:auto">' + esc(sql) + "</pre>" +

        '<div class="knopfzeile">' +
          '<button type="button" class="knopf" id="btnKopieren">Befehl kopieren</button>' +
          '<button type="button" class="knopf stumm" id="btnErneut">Erneut prüfen</button>' +
        "</div>" +
        '<p class="zusatz" id="kopierMeldung" style="margin-top:.6rem"></p>' +

        '<p class="zusatz">Weitere Konten schaltest du genauso frei: Konto im Dashboard unter ' +
        "Authentication → Users anlegen, dort anmelden und diesen Schritt wiederholen. " +
        "Entziehen lässt sich die Berechtigung mit <code>delete from public.lehrkraefte where email = '…';</code></p>" +
      "</section>";

    document.getElementById("btnErneut").addEventListener("click", pruefeFreigabe);
    document.getElementById("btnKopieren").addEventListener("click", function () {
      var hinweis = document.getElementById("kopierMeldung");
      function geschafft() { hinweis.textContent = "Befehl kopiert. Jetzt im SQL-Editor einfügen und ausführen."; }
      function misslungen() { hinweis.textContent = "Kopieren nicht möglich – bitte den Befehl oben von Hand markieren."; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sql).then(geschafft, misslungen);
      } else {
        try {
          var bereichAuswahl = document.createRange();
          bereichAuswahl.selectNodeContents(document.getElementById("sqlBefehl"));
          var aus = window.getSelection();
          aus.removeAllRanges(); aus.addRange(bereichAuswahl);
          document.execCommand("copy") ? geschafft() : misslungen();
        } catch (e) { misslungen(); }
      }
    });
  }

  function pruefeFreigabe() {
    bereich.innerHTML = '<div class="karte">Berechtigung wird geprüft …</div>';
    sb.auth.getUser().then(function (u) {
      var nutzer = u && u.data ? u.data.user : null;
      if (!nutzer) { zeigeAnmeldung(); return; }
      kontoZeile.textContent = nutzer.email || "";
      btnAbmelden.hidden = false;
      return sb.from("lehrkraefte").select("user_id").eq("user_id", nutzer.id).maybeSingle()
        .then(function (res) {
          if (res.error) {
            var t = String(res.error.message || "");
            // Fehlende Tabelle oder fehlende Rechte von einer schlichten Leermenge unterscheiden
            zeigeFreischaltung(nutzer, /does not exist|schema cache|relation|permission/i.test(t), t);
            return;
          }
          if (!res.data) { zeigeFreischaltung(nutzer, false, null); return; }
          laden();
        });
    });
  }

  /* ---------------- Daten ---------------- */
  function laden() {
    bereich.innerHTML = '<div class="karte">Abgaben werden geladen …</div>';
    sb.from("abgaben").select("*").order("abgegeben_am", { ascending: false })
      .then(function (res) {
        if (res.error) {
          bereich.innerHTML = meldung("fehler", "Abgaben konnten nicht geladen werden", res.error.message);
          return;
        }
        abgaben = res.data || [];
        zeichne();
      });
  }

  function gefiltert() {
    var s = filter.suche.toLowerCase();
    var liste = abgaben.filter(function (a) {
      var name = ((a.vorname || "") + " " + (a.nachname || "")).toLowerCase();
      if (s && name.indexOf(s) < 0) return false;
      if (filter.kurs && a.kurs !== filter.kurs) return false;
      if (filter.art && (a.art || "abgabe") !== filter.art) return false;
      return true;
    });
    liste.sort(function (a, b) {
      if (filter.sortierung === "name")
        return ((a.nachname || "") + a.vorname).localeCompare((b.nachname || "") + b.vorname, "de");
      var t = new Date(b.abgegeben_am) - new Date(a.abgegeben_am);
      return filter.sortierung === "alt" ? -t : t;
    });
    return liste;
  }

  function zeichne() {
    var kurse = [];
    abgaben.forEach(function (a) { if (a.kurs && kurse.indexOf(a.kurs) < 0) kurse.push(a.kurs); });
    kurse.sort(function (a, b) { return a.localeCompare(b, "de"); });
    var liste = gefiltert();

    bereich.innerHTML =
      '<div class="seiten-kopf"><p class="kapitel">Übersicht</p><h1>Schülerabgaben</h1>' +
      '<p class="lead">' + abgaben.filter(function (a) { return (a.art || "abgabe") === "abgabe"; }).length +
      " verbindliche Abgabe(n), " + abgaben.filter(function (a) { return a.art === "zwischenstand"; }).length +
      " Zwischenstand/Zwischenstände. " + liste.length + " Einträge nach aktuellem Filter.</p></div>" +
      '<div class="lehrer-raster">' +
        "<div>" +
          '<div class="werkzeuge">' +
            '<input type="text" id="fSuche" placeholder="Name suchen" value="' + esc(filter.suche) + '">' +
            '<select id="fKurs"><option value="">Alle Kurse</option>' +
              kurse.map(function (k) {
                return '<option value="' + esc(k) + '"' + (filter.kurs === k ? " selected" : "") + ">" + esc(k) + "</option>";
              }).join("") + "</select>" +
            '<select id="fArt">' +
              '<option value="abgabe"' + (filter.art === "abgabe" ? " selected" : "") + ">Nur Abgaben</option>" +
              '<option value="zwischenstand"' + (filter.art === "zwischenstand" ? " selected" : "") + ">Nur Zwischenstände</option>" +
              '<option value=""' + (filter.art === "" ? " selected" : "") + ">Abgaben und Zwischenstände</option>" +
            "</select>" +
            '<select id="fSort">' +
              '<option value="neu"' + (filter.sortierung === "neu" ? " selected" : "") + ">Neueste zuerst</option>" +
              '<option value="alt"' + (filter.sortierung === "alt" ? " selected" : "") + ">Älteste zuerst</option>" +
              '<option value="name"' + (filter.sortierung === "name" ? " selected" : "") + ">Nach Nachname</option>" +
            "</select>" +
          "</div>" +
          '<ul class="liste">' + (liste.length ? liste.map(function (a) {
            return '<li><button type="button" data-id="' + esc(a.id) + '"' +
              (ausgewaehlt === a.id ? ' class="aktiv"' : "") + ">" +
              "<strong>" + esc(anzeigeName(a)) + "</strong> " +
              ((a.art || "abgabe") === "zwischenstand"
                ? '<span class="merker zwischen">Zwischenstand</span>'
                : '<span class="merker ' + (a.vollstaendig ? "voll" : "teil") + '">' +
                  (a.vollstaendig ? "vollständig" : "unvollständig") + "</span>") +
              '<span class="zeile2">' + esc(a.kurs || "") + " · " +
              new Date(a.abgegeben_am).toLocaleString("de-DE") + "</span></button></li>";
          }).join("") : '<li><div style="padding:.8rem" class="zusatz">Keine Abgaben gefunden.</div></li>') + "</ul>" +
          '<div class="knopfzeile" style="gap:.4rem">' +
            '<button type="button" class="knopf stumm klein" id="btnNeu">Neu laden</button>' +
            '<button type="button" class="knopf stumm klein" id="btnCsv">Auswahl als CSV</button>' +
            '<button type="button" class="knopf stumm klein" id="btnJson">Auswahl als JSON</button>' +
          "</div>" +
          '<p class="zusatz">CSV für die Tabellenkalkulation, JSON als vollständige Sicherung. ' +
          "Heruntergeladen wird jeweils die aktuell gefilterte Auswahl.</p>" +
        "</div>" +
        '<div id="detail"><div class="karte zusatz">Wähle links eine Abgabe aus.</div></div>' +
      "</div>";

    document.getElementById("fSuche").addEventListener("input", function (e) { filter.suche = e.target.value; zeichne(); });
    document.getElementById("fKurs").addEventListener("change", function (e) { filter.kurs = e.target.value; zeichne(); });
    document.getElementById("fArt").addEventListener("change", function (e) { filter.art = e.target.value; zeichne(); });
    document.getElementById("fSort").addEventListener("change", function (e) { filter.sortierung = e.target.value; zeichne(); });
    document.getElementById("btnNeu").addEventListener("click", laden);
    document.getElementById("btnCsv").addEventListener("click", function () {
      var l = gefiltert();
      if (!l.length) { window.alert("Die aktuelle Auswahl ist leer."); return; }
      alsCsv(l);
    });
    document.getElementById("btnJson").addEventListener("click", function () {
      var l = gefiltert();
      if (!l.length) { window.alert("Die aktuelle Auswahl ist leer."); return; }
      alsJsonSammlung(l);
    });
    bereich.querySelectorAll("[data-id]").forEach(function (b) {
      b.addEventListener("click", function () { ausgewaehlt = b.dataset.id; zeichne(); });
    });
    if (ausgewaehlt) zeichneDetail();
  }

  /* ---------------- Detailansicht ---------------- */
  function antwortHtml(a, werte) {
    var v = werte[a.id], h = "";
    function kasten(t) { return '<div class="antwort">' + (t ? esc(t) : "— keine Angabe —") + "</div>"; }

    if (a.typ === "mc") {
      if (v === undefined || v === null) return kasten("");
      h = esc(a.optionen[v]) + (v === a.loesung ? "  ✓" : "  ✗");
      return kasten(h);
    }
    if (a.typ === "multi") {
      if (!Array.isArray(v) || !v.length) return kasten("");
      var soll = a.loesung.slice().sort().join(","), ist = v.slice().sort().join(",");
      return kasten(v.map(function (i) { return "• " + a.optionen[i]; }).join("\n") + (soll === ist ? "\n✓" : "\n✗"));
    }
    if (a.typ === "text") return kasten(v || "");
    if (a.typ === "position") {
      v = v || {};
      return kasten((v.wahl !== undefined && v.wahl !== null ? "Position: " + a.optionen[v.wahl] + "\n\n" : "") + (v.text || ""));
    }
    if (a.typ === "auswahl") return kasten((v || {}).thema || "");
    if (a.typ === "zuordnung") {
      v = v || {};
      return '<div class="antwort">' + a.koerbe.map(function (k) {
        var drin = a.items.filter(function (it) { return v[it.id] === k.id; });
        return "<strong>" + esc(k.label) + "</strong>\n" + (drin.length ? drin.map(function (it) {
          return "  • " + it.text + (it.korb === k.id ? " ✓" : " ✗");
        }).join("\n") : "  —");
      }).join("\n\n") + "</div>";
    }
    if (a.typ === "aussagen") {
      v = v || {};
      return a.items.map(function (it) {
        var e = v[it.id] || {};
        var gew = (e.kat !== undefined && e.kat !== null) ? a.kategorien[e.kat] : null;
        return '<div class="antwort"><strong>' + esc(it.text) + "</strong>\n" +
          (gew ? esc(gew) + (e.kat === it.loesung ? " ✓" : " ✗") : "— keine Einordnung —") +
          (it.begruendung ? "\n\nBegründung: " + esc(e.text || "— fehlt —") : "") + "</div>";
      }).join("");
    }
    return kasten("");
  }

  /* ---------------- Löschen ---------------- */
  function loesche(a, knopf) {
    var wer = anzeigeName(a);
    var was = (a.art || "abgabe") === "zwischenstand" ? "Zwischenstand" : "verbindliche Abgabe";
    var wann = new Date(a.abgegeben_am).toLocaleString("de-DE");
    if (!window.confirm(was + " von " + wer + " (" + wann + ") endgültig löschen?\n\n" +
        "Der Eintrag wird aus der Datenbank entfernt und lässt sich nicht wiederherstellen.")) return;
    if (!window.confirm("Letzte Sicherheitsabfrage: Eintrag von " + wer + " wirklich löschen?")) return;

    knopf.disabled = true;
    knopf.textContent = "Wird gelöscht \u2026";
    sb.from("abgaben").delete().eq("id", a.id).select("id").then(function (res) {
      if (res.error) {
        knopf.disabled = false;
        knopf.textContent = "Eintrag löschen";
        var t = String(res.error.message || "");
        if (/permission|denied|policy|row-level/i.test(t)) {
          t = "Die Datenbank erlaubt diesem Konto kein Löschen. Führe den DELETE-Abschnitt aus " +
              "supabase_setup.sql im SQL-Editor aus.";
        }
        window.alert("Löschen fehlgeschlagen: " + t);
        return;
      }
      if (!res.data || !res.data.length) {
        knopf.disabled = false;
        knopf.textContent = "Eintrag löschen";
        window.alert("Es wurde nichts gelöscht. Vermutlich fehlt die DELETE-Policy in der Datenbank " +
                     "(DELETE-Abschnitt aus supabase_setup.sql ausführen).");
        return;
      }
      abgaben = abgaben.filter(function (x) { return x.id !== a.id; });
      ausgewaehlt = null;
      zeichne();
    }).catch(function (e) {
      knopf.disabled = false;
      knopf.textContent = "Eintrag löschen";
      window.alert("Löschen fehlgeschlagen: " + String(e && e.message ? e.message : e));
    });
  }

  function zeichneDetail() {
    var a = null;
    abgaben.forEach(function (x) { if (x.id === ausgewaehlt) a = x; });
    var ziel = document.getElementById("detail");
    if (!a) { ziel.innerHTML = '<div class="karte zusatz">Abgabe nicht gefunden.</div>'; return; }

    var werte = a.antworten || {};
    var dauer = a.dauer_sekunden ? Math.round(a.dauer_sekunden / 60) + " Minuten" : "nicht erfasst";
    var f = a.fortschritt || {};

    var h = '<section class="karte detail">' +
      "<h1>" + esc(istKuerzel(a) ? anzeigeName(a) : a.vorname + " " + a.nachname) + "</h1>" +
      '<table class="tabelle"><tbody>' +
      "<tr><th>Art</th><td>" + ((a.art || "abgabe") === "zwischenstand"
        ? "Zwischenstand während der Bearbeitung" : "Verbindliche Abgabe") + "</td></tr>" +
      "<tr><th>Kurs / Klasse</th><td>" + esc(a.kurs || "") + "</td></tr>" +
      "<tr><th>Gesendet am</th><td>" + new Date(a.abgegeben_am).toLocaleString("de-DE") + "</td></tr>" +
      "<tr><th>Bearbeitungsstatus</th><td>" + (a.vollstaendig ? "vollständig" : "unvollständig") +
        (f.abgeschlossene_seiten !== undefined ? " (" + f.abgeschlossene_seiten + " von " + f.seiten_gesamt + " Lernschritten)" : "") + "</td></tr>" +
      "<tr><th>Bearbeitungsdauer</th><td>" + esc(dauer) + "</td></tr>" +
      "</tbody></table>" +
      '<div class="knopfzeile" style="gap:.4rem">' +
      '<button type="button" class="knopf stumm klein" data-tu="drucken">Druckansicht</button>' +
      '<button type="button" class="knopf stumm klein" data-tu="html">Als HTML-Datei</button>' +
      '<button type="button" class="knopf stumm klein" data-tu="json">Als JSON-Datei</button>' +
      '<button type="button" class="knopf warn klein" data-tu="loeschen">Eintrag löschen</button>' +
      "</div>";

    window.SEITEN.forEach(function (s) {
      if (!s.aufgaben.length) return;
      h += "<h3>" + esc(s.kapitel + ": " + s.titel) + "</h3>";
      s.aufgaben.forEach(function (auf) {
        h += '<p style="margin:.6rem 0 .1rem"><strong>' + esc(auf.frage) + "</strong></p>" + antwortHtml(auf, werte);
      });
    });

    h += "<h3>Tafelbild</h3><div id='detailTafel'></div>";

    h += "<h3>Textmarkierungen</h3>";
    var mk = a.markierungen || {};
    var hatMk = Object.keys(mk).some(function (k) { return (mk[k] || []).length; });
    if (!hatMk) h += '<p class="zusatz">Keine Markierungen vorhanden.</p>';
    else Object.keys(window.KLIEMANN_TEXT.sections).forEach(function (id) {
      if (!(mk[id] || []).length) return;
      h += window.Leser.statisch(id, mk[id]);
    });

    h += "</section>";
    ziel.innerHTML = h;

    window.Tafel.montieren(document.getElementById("detailTafel"), { tafelbild: a.tafelbild || {} }, null, true);

    ziel.querySelectorAll("[data-tu]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.tu === "drucken") window.print();
        else if (b.dataset.tu === "json") alsJsonEinzeln(a);
        else if (b.dataset.tu === "loeschen") loesche(a, b);
        else setTimeout(function () { alsHtmlEinzeln(a); }, 60);
      });
    });
  }

  los();
})();
