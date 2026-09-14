/* Interaktives Tafelbild: Bausteine per Tippen oder Ziehen einordnen.
   Die Verbindungslinien werden aus den Feldpositionen berechnet. */
(function () {
  "use strict";

  var FELDER = [
    { id: "mensch",    klasse: "s-mensch betont" },
    { id: "welt",      klasse: "s-welt" },
    { id: "christ",    klasse: "s-christ" },
    { id: "wreg",      klasse: "s-wreg kasten" },
    { id: "dienst",    klasse: "s-dienst" },
    { id: "greg",      klasse: "s-greg kasten" },
    { id: "gesetze",   klasse: "s-gesetze" },
    { id: "liebe",     klasse: "s-liebe" },
    { id: "regierung", klasse: "s-regierung" },
    { id: "glaube",    klasse: "s-glaube" },
    { id: "wider",     klasse: "s-wider" }
  ];

  var BAUSTEINE = [
    { id: "b1",  text: "(Christen-)Mensch",                                     feld: "mensch" },
    { id: "b2",  text: "Weltperson",                                            feld: "welt" },
    { id: "b3",  text: "Christperson",                                          feld: "christ" },
    { id: "b4",  text: "Weltliches Regiment",                                   feld: "wreg" },
    { id: "b5",  text: "Geistliches Regiment",                                  feld: "greg" },
    { id: "b6",  text: "beide stehen im Dienste des Reiches Gottes",            feld: "dienst" },
    { id: "b7",  text: "Die Politik benötigt Gesetze",                          feld: "gesetze" },
    { id: "b8",  text: "Im Reich Gottes herrschen Liebe und Friede",            feld: "liebe" },
    { id: "b9",  text: "Die Regierung darf sich nicht in Glaubensfragen einmischen", feld: "regierung" },
    { id: "b10", text: "Glaube bewährt sich im politischen Engagement, muss sich aber aus Sachfragen heraushalten", feld: "glaube" },
    { id: "b11", text: "ABER: Wenn die Regierung ihre Aufgabe nicht wahrnimmt, ist Widerstand nötig.", feld: "wider" },
    { id: "x1",  text: "Die Obrigkeit verkündigt das Evangelium",               feld: null },
    { id: "x2",  text: "Christen sind von den weltlichen Gesetzen befreit",     feld: null }
  ];

  var LINIEN = [
    { von: "mensch",  nach: "welt",      pfeil: true  },
    { von: "mensch",  nach: "christ",    pfeil: true  },
    { von: "welt",    nach: "wreg",      fein: true   },
    { von: "christ",  nach: "greg",      fein: true   },
    { von: "wreg",    nach: "dienst",    fein: true   },
    { von: "dienst",  nach: "greg",      fein: true   },
    { von: "gesetze", nach: "regierung", fein: true   },
    { von: "regierung", nach: "liebe",   pfeil: true  },
    { von: "glaube",  nach: "gesetze",   pfeil: true  },
    { von: "liebe",   nach: "glaube",    fein: true   }
  ];

  function baustein(bid) {
    for (var i = 0; i < BAUSTEINE.length; i++) if (BAUSTEINE[i].id === bid) return BAUSTEINE[i];
    return null;
  }

  /* Schnittpunkt der Verbindungsstrecke mit dem Rand des Feldes */
  function rand(r, zx, zy) {
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    var dx = zx - cx, dy = zy - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    var tx = dx ? (r.w / 2) / Math.abs(dx) : Infinity;
    var ty = dy ? (r.h / 2) / Math.abs(dy) : Infinity;
    var t = Math.min(tx, ty);
    return { x: cx + dx * t, y: cy + dy * t };
  }

  function montieren(ziel, state, beiAenderung, nurAnzeige) {
    if (!state.tafelbild) state.tafelbild = {};
    var gewaehlt = null;

    ziel.innerHTML =
      '<div class="tafel-huelle">' +
        '<div class="tafel' + (nurAnzeige ? " tafel-statisch" : "") + '">' +
          '<svg class="linien" aria-hidden="true"><defs>' +
            '<marker id="pf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
              '<path d="M0,0 L10,5 L0,10 z" fill="#3a5878"></path></marker>' +
          "</defs></svg>" +
          FELDER.map(function (f) {
            return '<div class="slot ' + f.klasse + '" data-feld="' + f.id + '"></div>';
          }).join("") +
        "</div>" +
        (nurAnzeige ? "" :
          '<div class="tafel-vorrat" data-rolle="vorrat"></div>' +
          '<div class="knopfzeile"><button type="button" class="knopf stumm klein" data-rolle="leeren">Tafelbild leeren</button>' +
          '<span class="zusatz" data-rolle="status" style="margin:0"></span></div>') +
      "</div>";

    var tafel  = ziel.querySelector(".tafel");
    var svg    = ziel.querySelector("svg.linien");
    var vorrat = ziel.querySelector('[data-rolle="vorrat"]');
    var status = ziel.querySelector('[data-rolle="status"]');

    function zeichnen() {
      var basis = tafel.getBoundingClientRect();
      var pos = {};
      Array.prototype.forEach.call(tafel.querySelectorAll(".slot"), function (el) {
        var r = el.getBoundingClientRect();
        pos[el.dataset.feld] = { x: r.left - basis.left, y: r.top - basis.top, w: r.width, h: r.height };
      });
      svg.setAttribute("viewBox", "0 0 " + Math.round(basis.width) + " " + Math.round(basis.height));
      var inhalt = svg.querySelector("defs").outerHTML;
      LINIEN.forEach(function (l) {
        var a = pos[l.von], b = pos[l.nach];
        if (!a || !b) return;
        var p1 = rand(a, b.x + b.w / 2, b.y + b.h / 2);
        var p2 = rand(b, a.x + a.w / 2, a.y + a.h / 2);
        inhalt += '<line x1="' + p1.x.toFixed(1) + '" y1="' + p1.y.toFixed(1) +
                  '" x2="' + p2.x.toFixed(1) + '" y2="' + p2.y.toFixed(1) +
                  '" stroke="#3a5878" stroke-width="' + (l.fein ? 1 : 1.6) +
                  '" opacity="' + (l.fein ? .45 : .8) + '"' +
                  (l.pfeil ? ' marker-end="url(#pf)"' : "") + "></line>";
      });
      svg.innerHTML = inhalt;
    }

    function malen() {
      Array.prototype.forEach.call(tafel.querySelectorAll(".slot"), function (el) {
        var bid = state.tafelbild[el.dataset.feld];
        var b = bid ? baustein(bid) : null;
        if (b) {
          el.classList.add("voll");
          el.innerHTML = window.Leser.esc(b.text) +
            (nurAnzeige ? "" : '<button type="button" class="weg" data-weg="' + el.dataset.feld +
             '" aria-label="Baustein entfernen">×</button>');
        } else {
          el.classList.remove("voll");
          el.innerHTML = '<span class="leer">hier einordnen</span>';
        }
      });
      if (vorrat) {
        var benutzt = Object.keys(state.tafelbild).map(function (k) { return state.tafelbild[k]; });
        vorrat.innerHTML = BAUSTEINE.filter(function (b) { return benutzt.indexOf(b.id) < 0; })
          .map(function (b) {
            return '<button type="button" class="baustein' + (gewaehlt === b.id ? " gewaehlt" : "") +
                   '" data-baustein="' + b.id + '">' + window.Leser.esc(b.text) + "</button>";
          }).join("") || '<span class="zusatz" style="margin:0">Alle Bausteine sind eingeordnet.</span>';
      }
      if (status) {
        var offen = FELDER.filter(function (f) { return !state.tafelbild[f.id]; }).length;
        status.textContent = offen ? offen + " von " + FELDER.length + " Feldern sind noch leer."
                                   : "Alle Felder sind belegt.";
      }
      requestAnimationFrame(zeichnen);
    }

    function setzen(feldId, bid) {
      Object.keys(state.tafelbild).forEach(function (k) {
        if (state.tafelbild[k] === bid) delete state.tafelbild[k];
      });
      state.tafelbild[feldId] = bid;
      gewaehlt = null;
      malen();
      beiAenderung && beiAenderung();
    }

    if (!nurAnzeige) {
      ziel.addEventListener("click", function (ev) {
        var weg = ev.target.closest("[data-weg]");
        if (weg) {
          ev.stopPropagation();
          delete state.tafelbild[weg.dataset.weg];
          malen(); beiAenderung && beiAenderung();
          return;
        }
        var bs = ev.target.closest("[data-baustein]");
        if (bs) { gewaehlt = (gewaehlt === bs.dataset.baustein) ? null : bs.dataset.baustein; malen(); return; }
        var slot = ev.target.closest(".slot");
        if (slot) {
          if (gewaehlt) { setzen(slot.dataset.feld, gewaehlt); }
          else if (state.tafelbild[slot.dataset.feld]) {
            gewaehlt = state.tafelbild[slot.dataset.feld];
            delete state.tafelbild[slot.dataset.feld];
            malen(); beiAenderung && beiAenderung();
          }
        }
      });

      /* Ziehen (Pointer Events – funktioniert mit Finger, Pencil und Maus) */
      ziel.addEventListener("pointerdown", function (ev) {
        var bs = ev.target.closest("[data-baustein]");
        if (!bs) return;
        var startX = ev.clientX, startY = ev.clientY, geist = null, aktiv = false;
        var bid = bs.dataset.baustein;

        function bewegen(e) {
          if (!aktiv && Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) < 8) return;
          if (!aktiv) {
            aktiv = true;
            bs.classList.add("geist");
            geist = bs.cloneNode(true);
            geist.className = "baustein zieh-geist";
            document.body.appendChild(geist);
          }
          geist.style.left = e.clientX + "px";
          geist.style.top = e.clientY + "px";
          geist.hidden = true;
          var unten = document.elementFromPoint(e.clientX, e.clientY);
          geist.hidden = false;
          Array.prototype.forEach.call(tafel.querySelectorAll(".slot"), function (s) { s.classList.remove("ziel"); });
          var slot = unten && unten.closest ? unten.closest(".slot") : null;
          if (slot) slot.classList.add("ziel");
        }
        function loslassen(e) {
          window.removeEventListener("pointermove", bewegen);
          window.removeEventListener("pointerup", loslassen);
          window.removeEventListener("pointercancel", loslassen);
          Array.prototype.forEach.call(tafel.querySelectorAll(".slot"), function (s) { s.classList.remove("ziel"); });
          if (!aktiv) return;
          if (geist) { geist.hidden = true; }
          var unten = document.elementFromPoint(e.clientX, e.clientY);
          if (geist) geist.remove();
          bs.classList.remove("geist");
          var slot = unten && unten.closest ? unten.closest(".slot") : null;
          if (slot) setzen(slot.dataset.feld, bid);
          else malen();
        }
        window.addEventListener("pointermove", bewegen);
        window.addEventListener("pointerup", loslassen);
        window.addEventListener("pointercancel", loslassen);
      });

      ziel.addEventListener("click", function (ev) {
        var l = ev.target.closest('[data-rolle="leeren"]');
        if (!l) return;
        if (!window.confirm("Alle eingeordneten Bausteine wieder in den Vorrat zurücklegen?")) return;
        state.tafelbild = {}; gewaehlt = null; malen(); beiAenderung && beiAenderung();
      });
    }

    window.addEventListener("resize", zeichnen);
    malen();
    return { malen: malen, zeichnen: zeichnen };
  }

  /* Prüfung mit gestuften Hinweisen – ohne Lösungsverrat */
  function pruefen(state) {
    var t = state.tafelbild || {};
    var leer = FELDER.filter(function (f) { return !t[f.id]; });
    if (leer.length) {
      return ["Es " + (leer.length === 1 ? "ist noch 1 Feld" : "sind noch " + leer.length + " Felder") +
              " leer. Beginne oben mit der Person und überlege, welche zwei Perspektiven auf denselben Menschen der Text unterscheidet."];
    }
    var fehler = [];
    var ablenker = FELDER.filter(function (f) { var b = baustein(t[f.id]); return b && !b.feld; });
    if (ablenker.length) {
      fehler.push("Mindestens ein eingeordneter Baustein widerspricht dem Text. Prüfe, welche Aussagen Luther gerade nicht vertritt.");
    }
    var falschOben = ["mensch", "welt", "christ", "wreg", "greg"].filter(function (id) {
      var b = baustein(t[id]); return !b || b.feld !== id;
    });
    if (falschOben.length) {
      fehler.push("Der obere Teil stimmt noch nicht. Lies den Abschnitt zur Christperson und Weltperson erneut: Welche Perspektive gehört zu welchem Regiment?");
    }
    if (baustein(t.dienst) && baustein(t.dienst).feld !== "dienst") {
      fehler.push("Der Baustein zwischen den beiden Regimenten benennt das Gemeinsame. Lies den Satz, der die Beschreibung der beiden Regimente einleitet, erneut.");
    }
    if ((baustein(t.gesetze) && baustein(t.gesetze).feld !== "gesetze") ||
        (baustein(t.liebe) && baustein(t.liebe).feld !== "liebe")) {
      fehler.push("Prüfe noch einmal, mit welchen Mitteln die beiden Regimente jeweils wirken.");
    }
    if ((baustein(t.regierung) && baustein(t.regierung).feld !== "regierung") ||
        (baustein(t.glaube) && baustein(t.glaube).feld !== "glaube") ||
        (baustein(t.wider) && baustein(t.wider).feld !== "wider")) {
      fehler.push("Die drei unteren Aussagen sind noch nicht in der richtigen Reihenfolge. Achte darauf, welche Aussage die Grenze der Obrigkeit beschreibt, welche das Verhältnis von Glaube und Sachfragen und welche den Ausnahmefall.");
    }
    if (!fehler.length) {
      var falsch = FELDER.filter(function (f) { var b = baustein(t[f.id]); return !b || b.feld !== f.id; });
      if (falsch.length) fehler.push(falsch.length + " Zuordnung" + (falsch.length === 1 ? " passt" : "en passen") + " noch nicht.");
    }
    return fehler;
  }

  window.Tafel = { montieren: montieren, pruefen: pruefen, FELDER: FELDER, BAUSTEINE: BAUSTEINE, baustein: baustein };
})();
