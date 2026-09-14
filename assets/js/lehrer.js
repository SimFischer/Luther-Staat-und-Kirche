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
  function zeigeAnmeldung(fehler) {
    kontoZeile.textContent = "";
    btnAbmelden.hidden = true;
    bereich.innerHTML =
      '<section class="karte" style="max-width:34rem">' +
        "<h1>Anmeldung</h1>" +
        '<p class="zusatz">Nur freigeschaltete Lehrkräfte erhalten Zugriff auf die Abgaben.</p>' +
        (fehler ? meldung("fehler", null, fehler) : "") +
        '<div class="feldgruppe">' +
          '<label class="feld"><span>E-Mail</span><input type="text" id="lEmail" autocomplete="username" inputmode="email"></label>' +
          '<label class="feld"><span>Passwort</span><input type="password" id="lPass" autocomplete="current-password"></label>' +
        "</div>" +
        '<div class="knopfzeile"><button type="button" class="knopf" id="btnAnmelden">Anmelden</button></div>' +
      "</section>";

    var btn = document.getElementById("btnAnmelden");
    function anmelden() {
      var email = (document.getElementById("lEmail").value || "").trim();
      var pass = document.getElementById("lPass").value || "";
      if (!email || !pass) { zeigeAnmeldung("Bitte E-Mail und Passwort eingeben."); return; }
      btn.disabled = true; btn.textContent = "Wird geprüft …";
      sb.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
        if (res.error) { zeigeAnmeldung("Anmeldung fehlgeschlagen: " + res.error.message); return; }
        pruefeFreigabe();
      });
    }
    btn.addEventListener("click", anmelden);
    document.getElementById("lPass").addEventListener("keydown", function (e) {
      if (e.key === "Enter") anmelden();
    });
  }

  function abmelden() {
    sb.auth.signOut().then(function () { zeigeAnmeldung(); });
  }
  btnAbmelden.addEventListener("click", abmelden);

  function pruefeFreigabe() {
    bereich.innerHTML = '<div class="karte">Berechtigung wird geprüft …</div>';
    sb.auth.getUser().then(function (u) {
      var nutzer = u && u.data ? u.data.user : null;
      if (!nutzer) { zeigeAnmeldung(); return; }
      kontoZeile.textContent = nutzer.email || "";
      btnAbmelden.hidden = false;
      return sb.from("lehrkraefte").select("user_id").eq("user_id", nutzer.id).maybeSingle()
        .then(function (res) {
          if (res.error || !res.data) {
            bereich.innerHTML = meldung("fehler", "Kein Zugriff",
              "Dieses Konto ist noch nicht als Lehrkraft freigeschaltet. Die Freischaltung erfolgt über einen Eintrag in der Tabelle public.lehrkraefte (siehe supabase_setup.sql).");
            return;
          }
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
              "<strong>" + esc((a.nachname || "") + ", " + (a.vorname || "")) + "</strong> " +
              ((a.art || "abgabe") === "zwischenstand"
                ? '<span class="merker zwischen">Zwischenstand</span>'
                : '<span class="merker ' + (a.vollstaendig ? "voll" : "teil") + '">' +
                  (a.vollstaendig ? "vollständig" : "unvollständig") + "</span>") +
              '<span class="zeile2">' + esc(a.kurs || "") + " · " +
              new Date(a.abgegeben_am).toLocaleString("de-DE") + "</span></button></li>";
          }).join("") : '<li><div style="padding:.8rem" class="zusatz">Keine Abgaben gefunden.</div></li>') + "</ul>" +
          '<div class="knopfzeile"><button type="button" class="knopf stumm klein" id="btnNeu">Neu laden</button></div>' +
        "</div>" +
        '<div id="detail"><div class="karte zusatz">Wähle links eine Abgabe aus.</div></div>' +
      "</div>";

    document.getElementById("fSuche").addEventListener("input", function (e) { filter.suche = e.target.value; zeichne(); });
    document.getElementById("fKurs").addEventListener("change", function (e) { filter.kurs = e.target.value; zeichne(); });
    document.getElementById("fArt").addEventListener("change", function (e) { filter.art = e.target.value; zeichne(); });
    document.getElementById("fSort").addEventListener("change", function (e) { filter.sortierung = e.target.value; zeichne(); });
    document.getElementById("btnNeu").addEventListener("click", laden);
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

  function zeichneDetail() {
    var a = null;
    abgaben.forEach(function (x) { if (x.id === ausgewaehlt) a = x; });
    var ziel = document.getElementById("detail");
    if (!a) { ziel.innerHTML = '<div class="karte zusatz">Abgabe nicht gefunden.</div>'; return; }

    var werte = a.antworten || {};
    var dauer = a.dauer_sekunden ? Math.round(a.dauer_sekunden / 60) + " Minuten" : "nicht erfasst";
    var f = a.fortschritt || {};

    var h = '<section class="karte detail">' +
      "<h1>" + esc(a.vorname + " " + a.nachname) + "</h1>" +
      '<table class="tabelle"><tbody>' +
      "<tr><th>Art</th><td>" + ((a.art || "abgabe") === "zwischenstand"
        ? "Zwischenstand während der Bearbeitung" : "Verbindliche Abgabe") + "</td></tr>" +
      "<tr><th>Kurs / Klasse</th><td>" + esc(a.kurs || "") + "</td></tr>" +
      "<tr><th>Gesendet am</th><td>" + new Date(a.abgegeben_am).toLocaleString("de-DE") + "</td></tr>" +
      "<tr><th>Bearbeitungsstatus</th><td>" + (a.vollstaendig ? "vollständig" : "unvollständig") +
        (f.abgeschlossene_seiten !== undefined ? " (" + f.abgeschlossene_seiten + " von " + f.seiten_gesamt + " Lernschritten)" : "") + "</td></tr>" +
      "<tr><th>Bearbeitungsdauer</th><td>" + esc(dauer) + "</td></tr>" +
      "</tbody></table>" +
      '<div class="knopfzeile"><button type="button" class="knopf stumm klein" onclick="window.print()">Druckansicht</button></div>';

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
  }

  los();
})();
