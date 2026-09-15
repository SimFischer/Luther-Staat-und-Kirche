/* Lernschritte, Aufgaben, Rückmeldungen und Hinweise. */
window.SEITEN = [

/* ---------------------------------------------------------------- 0 */
{
  id: "start", kurz: "Start", kapitel: "Einstieg",
  titel: "Luthers Verständnis von Staat und Kirche",
  lead: "Zwei-Reiche-Lehre bzw. Lehre von den zwei Regimenten. Du erschließt den Text von Peter Kliemann Schritt für Schritt. Jede Seite wird erst freigegeben, wenn die vorherige vollständig bearbeitet ist; zu bereits bearbeiteten Seiten kannst du jederzeit zurückkehren.",
  abschnitt: null,
  start: true,
  aufgaben: []
},

/* ---------------------------------------------------------------- 1 */
{
  id: "s1", kurz: "1", kapitel: "Lernschritt 1",
  titel: "Die Entstehungssituation der Schrift",
  lead: "Lies zuerst den Abschnitt. Bearbeite danach die Aufgaben. Der Text bleibt dabei oben sichtbar und kann ein- und ausgeklappt werden.",
  abschnitt: "s1",
  aufgaben: [
    { id: "a1", typ: "mc",
      frage: "In welchem Jahr ist Luthers Schrift „Von weltlicher Obrigkeit, wie weit man ihr Gehorsam schuldig sei“ erschienen?",
      optionen: ["1517", "1521", "1523", "1530"], loesung: 2,
      hinweis: "Die Jahreszahl der Schrift steht im ersten Abschnitt. Prüfe sie noch einmal genau." },

    { id: "a2", typ: "mc",
      frage: "Welches Reichsgesetz bildet den unmittelbaren historischen Hintergrund?",
      optionen: ["Confessio Augustana (1530)", "Wormser Edikt (1521)", "Speyerer Protestation (1529)", "Augsburger Religionsfrieden (1555)"],
      loesung: 1,
      hinweis: "Der Text nennt ein Edikt mit Jahreszahl. Achte darauf, welches der genannten Ereignisse zeitlich überhaupt vor der Schrift liegen kann." },

    { id: "a3", typ: "multi",
      frage: "Was war in der Folge in einigen deutschen Ländern verboten worden?",
      zusatz: "Mehrfachauswahl.",
      optionen: ["Luthers Schriften", "Luthers Übersetzung des Neuen Testaments", "der Gottesdienst in deutscher Sprache", "das Abendmahl in beiderlei Gestalt"],
      loesung: [0, 1],
      hinweis: "Der Abschnitt nennt genau zwei Dinge, die verboten wurden. Du hast noch nicht beide ausgewählt oder eine Angabe zu viel." },

    { id: "a4", typ: "mc",
      frage: "Worüber wollte Luther Herzog Johann von Sachsen, die Fürsten und die Untertanen belehren?",
      optionen: [
        "Wie hoch die Abgaben eines Landesherrn sein dürfen",
        "Wer das Recht hat, Bischöfe einzusetzen",
        "Wo die Grenze des Gehorsams gegenüber der von Gott gesetzten Obrigkeit erreicht ist",
        "Ob ein Christ überhaupt ein weltliches Amt annehmen darf"],
      loesung: 2,
      hinweis: "Der letzte Satz des Abschnitts nennt Luthers Absicht ausdrücklich. Lies ihn erneut." },

    { id: "a5", typ: "position",
      frage: "Darf eine Regierung ihren Bürgerinnen und Bürgern vorschreiben, was sie glauben müssen?",
      zusatz: "Hier gibt es keine vorgegebene richtige Antwort. Beziehe Position und begründe sie.",
      optionen: ["Ja", "Nein", "Nur unter bestimmten Bedingungen"],
      minLen: 120,
      hinweisWahl: "Du hast noch keine Position ausgewählt.",
      hinweisText: "Deine Begründung fehlt noch oder ist sehr knapp. Formuliere mindestens zwei bis drei Sätze." }
  ]
},

/* ---------------------------------------------------------------- 2 */
{
  id: "s2", kurz: "2", kapitel: "Lernschritt 2",
  titel: "Geistliches und weltliches Regiment",
  lead: "Erschließe aus dem Abschnitt, wie Luther die beiden Regierweisen Gottes unterscheidet.",
  abschnitt: "s2",
  aufgaben: [
    { id: "b1", typ: "zuordnung",
      frage: "Ordne die Begriffe und Aussagen dem jeweiligen Regiment zu.",
      zusatz: "Tippe zuerst einen Begriff an, dann das Feld, in das er gehört. Bereits zugeordnete Begriffe lassen sich wieder herausnehmen.",
      koerbe: [{ id: "g", label: "Geistliches Regiment" }, { id: "w", label: "Weltliches Regiment" }],
      items: [
        { id: "i1",  text: "Wort Gottes / Evangelium", korb: "g" },
        { id: "i2",  text: "Liebe", korb: "g" },
        { id: "i3",  text: "Glaube", korb: "g" },
        { id: "i4",  text: "Vergebung", korb: "g" },
        { id: "i5",  text: "geistliche Fragen", korb: "g" },
        { id: "i6",  text: "Recht und Gesetze", korb: "w" },
        { id: "i7",  text: "weltliche Macht und Gewalt", korb: "w" },
        { id: "i8",  text: "Fürsten, Soldaten und andere Amtspersonen", korb: "w" },
        { id: "i9",  text: "Schutz der Guten", korb: "w" },
        { id: "i10", text: "Bestrafung der Bösen", korb: "w" },
        { id: "i11", text: "äußere Ordnung", korb: "w" }
      ],
      hinweisLeer: "Es liegen noch Begriffe im Vorrat. Jeder Begriff muss einem Regiment zugeordnet werden.",
      hinweisFalsch: "Eine Zuordnung passt noch nicht. Achte darauf, ob es hier um Glauben und Gewissen oder um äußere Ordnung geht." },

    { id: "b2", typ: "text",
      frage: "Der Text nennt etwas, das beide Regimente gemeinsam haben. Formuliere es in einem eigenen Satz.",
      minLen: 25,
      schluessel: [["reich gottes", "reiches gottes", "gottes reich"]],
      platzhalter: "Beide Regimente …",
      hinweisLeer: "Deine Antwort fehlt noch.",
      hinweisSchluessel: "Der gemeinsame Kern ist noch nicht präzise genug. Lies den Satz unmittelbar vor der Erklärung des geistlichen und weltlichen Regiments erneut: Was verbindet beide?" },

    { id: "b3", typ: "mc",
      frage: "Mit welchen Mitteln regiert Gott nach Luther im geistlichen Regiment?",
      optionen: [
        "Mit Gesetz und Schwert",
        "Ausschließlich mit seinem Wort und seiner Liebe",
        "Mit Wort und Liebe und, wo nötig, mit Zwang",
        "Durch Fürsten und Amtspersonen"],
      loesung: 1,
      hinweis: "Prüfe noch einmal, mit welchen Mitteln die beiden Regimente jeweils wirken." },

    { id: "b4", typ: "mc",
      frage: "Warum braucht Gott nach Luther „vorläufig noch eine andere Regierweise“?",
      optionen: [
        "Weil die meisten Menschen keine Christen sind",
        "Weil die Kirche zu wenig Macht besitzt",
        "Weil die Fürsten es von ihm verlangt haben",
        "Weil das Reich Gottes erst angebrochen und noch im Kampf mit dem Reich des Bösen ist"],
      loesung: 3,
      hinweis: "Der Text begründet dies mit dem Stand des Reiches Gottes. Lies die Sätze zum geistlichen Regiment noch einmal genau." },

    { id: "b5", typ: "multi",
      frage: "Wogegen grenzt Luther seine Konzeption ausdrücklich ab?",
      zusatz: "Mehrfachauswahl.",
      optionen: [
        "Gegen die Einflussnahme weltlicher Fürsten auf die Verkündigung und Verbreitung des Evangeliums",
        "Gegen jede Form weltlicher Obrigkeit überhaupt",
        "Gegen die Verquickung geistlicher und weltlicher Kompetenzen in einer Hand",
        "Gegen den Versuch, das Evangelium unmittelbar und mit Gewalt in Politik umzusetzen"],
      loesung: [0, 2, 3],
      hinweis: "Der Text nennt seine Abgrenzungen ausdrücklich unter a) bis c). Eine deiner Angaben gehört nicht dazu oder es fehlt noch eine." }
  ]
},

/* ---------------------------------------------------------------- 3 */
{
  id: "s3", kurz: "3", kapitel: "Lernschritt 3",
  titel: "Der Christ steht in beiden Regimenten",
  lead: "Lies den Abschnitt aufmerksam und prüfe eine verbreitete Vorstellung an ihm.",
  abschnitt: "s3",
  aufgaben: [
    { id: "c1", typ: "text",
      frage: "Häufig hört man: „Christen gehören zum geistlichen Regiment; das weltliche Regiment ist für Nichtchristen zuständig.“ Prüfe diese Aussage am Text und begründe, was an ihr nicht stimmt.",
      minLen: 140,
      platzhalter: "Der Text zeigt, dass …",
      hinweisLeer: "Deine Begründung fehlt noch oder ist sehr knapp. Belege sie an einer konkreten Stelle des Abschnitts." },

    { id: "c2", typ: "mc",
      frage: "Wo verläuft nach Luther die Grenzlinie zwischen Reich Gottes und Reich des Bösen?",
      optionen: [
        "Zwischen Christen und Nichtchristen",
        "Zwischen Kirche und Staat",
        "Mitten durch den einzelnen Christenmenschen hindurch",
        "Zwischen Klerus und Laien"],
      loesung: 2,
      hinweis: "Du hast den Menschen bisher nur einem Bereich zugeordnet. Lies den Abschnitt zur Christperson und Weltperson erneut." },

    { id: "c3", typ: "mc",
      frage: "Rückgriff auf die letzte Stunde: Mit welchem Begriffspaar beschreibt der Text dieselbe Doppelbestimmung des Menschen?",
      optionen: [
        "Gesetz und Evangelium",
        "Sünder und Gerechtfertigter zugleich",
        "Klerus und Laien",
        "Glaube und Werke"],
      loesung: 1,
      hinweis: "Der Text stellt mehrere Begriffspaare unmittelbar nebeneinander. Eines davon kennst du aus der letzten Stunde." },

    { id: "c4", typ: "mc",
      frage: "Welches Prinzip setzt Luther gegen die traditionelle Unterscheidung von Klerus und Laien?",
      optionen: [
        "Das Widerstandsrecht",
        "Die Zwei-Reiche-Lehre",
        "Die Rechtfertigung allein aus Glauben",
        "Das allgemeine Priestertum aller Gläubigen"],
      loesung: 3,
      hinweis: "Der Abschnitt nennt dieses Prinzip mit einem festen Begriff. Suche die Stelle, an der es der Unterscheidung von Klerus und Laien gegenübergestellt wird." },

    { id: "c5", typ: "text",
      frage: "Erkläre in zwei bis drei Sätzen, warum ein und derselbe Mensch als Christperson und als Weltperson in beiden Regimenten Aufgaben wahrnimmt.",
      minLen: 150,
      platzhalter: "Weil …",
      hinweisLeer: "Deine Erklärung fehlt noch oder ist sehr knapp. Beziehe beide Begriffe – Christperson und Weltperson – ausdrücklich ein." }
  ]
},

/* ---------------------------------------------------------------- 4 */
{
  id: "s4", kurz: "4", kapitel: "Lernschritt 4",
  titel: "Sachfragen, Glaubensfragen und die Grenzen staatlicher Macht",
  lead: "Entscheide bei jeder Aussage selbst. Erst danach erscheint die fachliche Rückmeldung.",
  abschnitt: "s4",
  aufgaben: [
    { id: "d1", typ: "aussagen",
      frage: "Prüfe die folgenden Aussagen am Text.",
      kategorien: ["trifft zu", "muss präzisiert werden", "trifft nicht zu"],
      items: [
        { id: "d1a", text: "Die Regierung darf sich in Glaubensfragen einmischen.", loesung: 2, begruendung: true,
          rueck: "Genau hier liegt nach Luther die Grenze der Obrigkeit: Wo sie über Glauben und Gewissen verfügen will – etwa indem sie Bibelübersetzungen verbietet –, überschreitet sie ihre Zuständigkeit." },
        { id: "d1b", text: "Der Glaube muss sich aus politischen Sachfragen vollständig heraushalten.", loesung: 2,
          rueck: "Der Text nennt es ausdrücklich unverantwortlich zu behaupten, der christliche Glaube habe mit weltlichen Dingen nichts zu tun. Gefordert ist nicht Rückzug, sondern Unterscheidung." },
        { id: "d1c", text: "Aus dem christlichen Glauben ergibt sich für jede politische Frage eindeutig eine bestimmte Lösung.", loesung: 2,
          rueck: "In weltlichen Dingen, die auch Nichtchristen betreffen, kennt auch der Glaube keine Patentlösungen; dort hilft fachlich qualifiziertes Abwägen und Diskutieren." },
        { id: "d1d", text: "Religion ist Privatsache und hat in der Politik nichts zu suchen.", loesung: 1, begruendung: true,
          rueck: "In dieser Pauschalität nicht haltbar: Geistliche Fragen lassen sich nicht argumentativ entscheiden, zugleich sollen Gläubige ihren Glauben im politischen und gesellschaftlichen Engagement bewähren. Zu unterscheiden ist, nicht zu trennen." },
        { id: "d1e", text: "Die vernünftige Sachanalyse und Fragen der Wertung sollen nicht vorschnell vermischt werden.", loesung: 0,
          rueck: "Das empfiehlt der Text um der Klarheit und Sachlichkeit des Entscheidungsprozesses willen: Glaubensfragen sollen Glaubensfragen und Sachfragen Sachfragen bleiben." },
        { id: "d1f", text: "Das Evangelium lässt sich unmittelbar mit einer bestimmten parteipolitischen Position gleichsetzen.", loesung: 2,
          rueck: "Da für Menschen nie eindeutig zu entscheiden ist, wo genau das Reich Gottes ist, kann es eine für alle Christinnen und Christen verbindliche Identifikation dieser Art nicht geben." },
        { id: "d1g", text: "Es gibt politische und gesellschaftliche Entwicklungen, die vom biblischen Menschen- und Wirklichkeitsverständnis her nicht mehr gebilligt werden können.", loesung: 0,
          rueck: "Das hält der Text ausdrücklich fest. Strittig – auch unter Christen – bleibt, wo genau dieser Punkt liegt und welche Handlungsweisen daraus folgen." }
      ],
      hinweisLeer: "Es fehlen noch Entscheidungen. Jede Aussage braucht eine Einordnung.",
      hinweisBegruendung: "Bei mindestens einer Aussage fehlt noch deine Begründung." }
  ]
},

/* ---------------------------------------------------------------- 5 */
{
  id: "s5", kurz: "5", kapitel: "Lernschritt 5",
  titel: "Die Grenze der Obrigkeit und die Frage des Widerstands",
  lead: "Der letzte Abschnitt des Textes klärt, wie sich der Christ gegenüber der Obrigkeit verhalten soll.",
  abschnitt: "s5",
  aufgaben: [
    { id: "e1", typ: "mc",
      frage: "Wie beurteilt Luther grundsätzlich das Verhältnis des Christen zur Obrigkeit – auch dort, wo Fürsten schlecht regieren?",
      optionen: [
        "Der Christ soll sie stürzen, sobald sie ungerecht handelt",
        "Der Christ soll ihr grundsätzlich untertan sein, weil auch eine schlechte Obrigkeit besser ist als Chaos und Anarchie",
        "Der Christ soll sich aus allen politischen Dingen zurückziehen",
        "Der Christ soll sie nur so lange achten, wie sie selbst christlich ist"],
      loesung: 1,
      hinweis: "Der Text begründet Luthers Haltung mit einer Alternative, die er für noch schlechter hält. Suche diese Begründung." },

    { id: "e2", typ: "mc",
      frage: "Wann ist nach der Schrift von 1523 Widerstand gefordert?",
      optionen: [
        "Wenn die Obrigkeit die Abgaben erhöht",
        "Sobald ein Fürst persönlich unmoralisch lebt",
        "Wenn die Obrigkeit ihre Grenzen überschreitet und sich in Glaubensfragen einmischt",
        "Wenn die Mehrheit der Untertanen es verlangt"],
      loesung: 2,
      hinweis: "Der Text nennt ein konkretes Beispiel für eine solche Grenzüberschreitung. Prüfe, worum es dabei geht." },

    { id: "e3", typ: "mc",
      frage: "Welche Form des Widerstands lässt die Schrift von 1523 zu?",
      optionen: [
        "Den bewaffneten Aufstand",
        "Den Tyrannenmord",
        "Den Steuerboykott",
        "Allein den gewaltlosen Widerstand des Wortes"],
      loesung: 3,
      hinweis: "Der Text benennt die zugelassene Form des Widerstands ausdrücklich und schränkt sie zugleich ein." },

    { id: "e4", typ: "zuordnung",
      frage: "Ordne die Aussagen den Schriften zu.",
      zusatz: "Die Unterscheidung zwischen 1523 und den späteren Texten ist wichtig.",
      koerbe: [
        { id: "a", label: "„Von weltlicher Obrigkeit“ (1523)" },
        { id: "b", label: "Spätere Texte Luthers (1526 / 1539)" }],
      items: [
        { id: "f1", text: "Jegliche Form des aktiven Widerstands wird ausgeschlossen.", korb: "a" },
        { id: "f2", text: "Gefordert ist allein der gewaltlose Widerstand des Wortes.", korb: "a" },
        { id: "f3", text: "Dem Christen wird die Inkaufnahme persönlicher Nachteile bis hin zum Märtyrertod zugemutet.", korb: "a" },
        { id: "f4", text: "Der Tyrannenmord wird skeptisch beurteilt, weil Tyrannen noch beeinflussbar seien.", korb: "b" },
        { id: "f5", text: "Erwogen wird der Fall, dass die Obrigkeit ihre Aufgaben in gar keiner Weise mehr wahrnimmt.", korb: "b" },
        { id: "f6", text: "Im äußersten Fall soll man „aus allen Dörfern und Flecken zulaufen, Mann bei Mann“.", korb: "b" }
      ],
      hinweisLeer: "Es liegen noch Aussagen im Vorrat.",
      hinweisFalsch: "Eine Zuordnung passt noch nicht. Achte auf die Jahreszahlen, die der Text den einzelnen Schriften zuordnet." },

    { id: "e5", typ: "text",
      frage: "Erkläre in eigenen Worten, wie sich der Mensch nach Luther gegenüber der Obrigkeit verhalten soll.",
      minLen: 170,
      platzhalter: "Grundsätzlich …",
      hinweisLeer: "Deine Erklärung fehlt noch oder ist sehr knapp. Berücksichtige sowohl den Regelfall als auch den Fall der Grenzüberschreitung." }
  ]
},

/* ---------------------------------------------------------------- 6 */
{
  id: "tafel", kurz: "6", kapitel: "Lernschritt 6",
  titel: "Das Tafelbild erarbeiten",
  lead: "Baue das Schaubild aus deinem Textverständnis auf. Tippe einen Baustein an und dann das Feld, in das er gehört – oder ziehe ihn mit dem Finger, dem Pencil oder der Maus dorthin. Eingesetzte Bausteine lassen sich jederzeit wieder entfernen.",
  abschnitt: null,
  tafel: true,
  hilfe: "Beginne oben mit der Person. Überlege anschließend, welche zwei Perspektiven auf dieselbe Person unterschieden werden – und welches Regiment jeweils dazugehört. Nicht jeder Baustein im Vorrat gehört ins Bild.",
  aufgaben: []
},

/* ---------------------------------------------------------------- 7 */
{
  id: "transfer", kurz: "7", kapitel: "Lernschritt 7",
  titel: "Gegenwartstransfer",
  lead: "Inwiefern lässt sich Luthers Konzept der Zwei-Regimente-Lehre auf heutige politische Diskussionen anwenden? Und gibt es Bereiche, in denen eine klare Trennung von Religion und Politik heute nicht möglich oder nicht wünschenswert ist?",
  abschnitt: null,
  aufgaben: [
    { id: "t0", typ: "auswahl",
      frage: "Wähle einen aktuellen Konflikt, an dem du das prüfst.",
      optionen: ["Sterbehilfe", "Schwangerschaftsabbruch", "Migration und Asyl", "Krieg und Frieden",
                 "Klimapolitik", "Religionsunterricht", "Religiöse Symbole im öffentlichen Raum", "Sonntagsöffnung"],
      eigenes: "Eigenes Thema",
      hinweis: "Du hast noch kein Thema gewählt." },

    { id: "t1", typ: "text",
      frage: "1. Welche Position vertritt dazu eine Kirche oder eine Religionsgemeinschaft?",
      zusatz: "Nenne die Quelle, die du benutzt hast.",
      minLen: 120, hinweisLeer: "Zu Rechercheschritt 1 fehlt noch deine Antwort oder sie ist sehr knapp." },

    { id: "t2", typ: "text",
      frage: "2. Welche religiösen, ethischen und sachlichen Argumente werden verwendet?",
      minLen: 150, hinweisLeer: "Zu Rechercheschritt 2 fehlt noch deine Antwort oder sie ist sehr knapp." },

    { id: "t3", typ: "text",
      frage: "3. Welche Aspekte gehören eher zu den Sachfragen, welche zu den Glaubens- oder Wertfragen?",
      minLen: 150, hinweisLeer: "Zu Rechercheschritt 3 fehlt noch deine Antwort oder sie ist sehr knapp." },

    { id: "t4", typ: "text",
      frage: "4. Hilft Luthers Unterscheidung der beiden Regimente, diesen Konflikt zu analysieren?",
      minLen: 150, hinweisLeer: "Zu Rechercheschritt 4 fehlt noch deine Antwort oder sie ist sehr knapp." },

    { id: "t5", typ: "text",
      frage: "5. Wo stößt diese Unterscheidung an ihre Grenzen?",
      minLen: 120, hinweisLeer: "Zu Rechercheschritt 5 fehlt noch deine Antwort oder sie ist sehr knapp." },

    { id: "t6", typ: "text",
      frage: "Abschlussurteil",
      zusatz: "Formuliere ein begründetes Urteil: Wie tragfähig ist Luthers Unterscheidung der beiden Regimente für den von dir gewählten Konflikt?",
      minLen: 300,
      platzhalter: "Mein Urteil lautet …",
      hinweisLeer: "Dein Abschlussurteil fehlt noch oder ist zu knapp. Es soll deine Position erkennbar begründen." }
  ]
},

/* ---------------------------------------------------------------- 8 */
{
  id: "stellungnahme", kurz: "8", kapitel: "Lernschritt 8",
  titel: "Erörterung: gebunden – und trotzdem frei?",
  lead: "Zum Abschluss bringst du alles zusammen, was du erarbeitet hast: die Entstehungssituation der Schrift, die beiden Regimente, die Doppelbestimmung des Menschen, die Grenzen der Obrigkeit, die Frage des Widerstands und deinen Gegenwartsbezug. Schreibe einen zusammenhängenden Text \u2013 keine Stichpunkte.",
  abschnitt: null,
  aufgaben: [
    { id: "z1", typ: "text",
      frage: "Luther mutet dem Menschen zu, zugleich in zwei Ordnungen zu leben: als Christperson an das Evangelium gebunden, als Weltperson an Gesetz, Amt und Obrigkeit. Erörtere, ob ein Mensch, der sich ganz an das Evangelium gebunden weiß, dadurch unfreier oder freier ist als einer, der allein den staatlichen Gesetzen folgt. Nimm am Schluss begründet Stellung.",
      zusatz: "Belege deine Überlegungen am Text und beziehe deine Ergebnisse aus den Lernschritten 1 bis 7 ein. Richtwert: etwa 400 bis 600 Wörter.",
      minLen: 900,
      zeilen: 18,
      platzhalter: "Beginne mit der Fragestellung und arbeite dich dann Schritt für Schritt durch deine Argumente \u2026",
      strukturOffen: true,
      strukturTitel: "Strukturhilfe: Einleitung \u2013 Hauptteil \u2013 Schluss",
      struktur: [
        { titel: "Einleitung",
          zusatz: "Kurz halten \u2013 etwa ein Zehntel deines Textes.",
          punkte: [
            "Benenne Verfasser, Schrift und Entstehungssituation in einem Satz (Jahr, Anlass, Adressat).",
            "Führe zum Kern hin: Luther unterscheidet zwei Regimente und bestimmt den Menschen doppelt.",
            "Formuliere die Leitfrage, die du bearbeitest, in eigenen Worten.",
            "Kündige an, wie du vorgehst."
          ] },
        { titel: "Hauptteil",
          zusatz: "Der längste Teil. Baue ihn in klaren Abschnitten auf und belege jede Aussage am Text.",
          punkte: [
            "Darstellung: Erkläre Luthers Position \u2013 geistliches und weltliches Regiment, ihre Mittel, ihr gemeinsamer Ursprung und ihr jeweiliges Ziel.",
            "Darstellung: Zeige, warum nach Luther derselbe Mensch in beiden Regimenten steht und wo die Grenze zwischen Reich Gottes und Reich des Bösen verläuft.",
            "Argumente für \u201egebunden heißt unfrei\u201c: Wer sich einer Ordnung unterstellt, gibt Selbstbestimmung ab; Gehorsam gegenüber schlechter Obrigkeit wirkt wie Fremdbestimmung.",
            "Argumente dagegen: Unterscheide äußere und innere Freiheit. Woran ist der Mensch nach Luther gebunden \u2013 und wovon ist er dadurch gerade nicht mehr abhängig?",
            "Prüfe die Grenze staatlicher Macht: Warum kann nach Luther niemand zum Glauben gezwungen werden \u2013 und was heißt das für die Freiheit des Einzelnen?",
            "Beziehe den Widerstandsgedanken ein: Wer freiwillig gehorcht, kann auch begründet widersprechen. Was folgt daraus für deine Frage?",
            "Gegenwartsbezug: Nutze deinen Konflikt aus Lernschritt 7 und die Unterscheidung von Sachfragen und Glaubensfragen.",
            "Wäge ab: Nimm mindestens einen Einwand gegen deine eigene Linie ernst und antworte darauf."
          ] },
        { titel: "Schluss",
          zusatz: "Keine neuen Argumente mehr \u2013 aber eine klare Position.",
          punkte: [
            "Bündele dein Ergebnis in zwei bis drei Sätzen.",
            "Nimm begründet Stellung: Wie beantwortest du die Leitfrage?",
            "Benenne, was für dich offen bleibt oder wo Luthers Denken an Grenzen stößt."
          ] }
      ],
      anstoesse: [
        "Kann Gehorsam freiwillig sein \u2013 und ändert das etwas an seinem Wert?",
        "Wem gegenüber ist der Christ nach Luther frei \u2013 und wem gegenüber dient er?",
        "Ist jemand, der aus Überzeugung dient, weniger frei als jemand, der nichts tun muss?",
        "Was bedeutet es für den Zwingenden und für den Gezwungenen, dass Glaube sich nicht erzwingen lässt?",
        "Könnte es sein, dass Freiheit und Dienst bei Luther keine Gegensätze sind, sondern zusammengehören?"
      ],
      hinweisLeer: "Deine Erörterung fehlt noch oder ist sehr knapp. Arbeite Einleitung, Hauptteil und Schluss aus und belege deine Aussagen am Text." }
  ]
},

/* ---------------------------------------------------------------- 9 */
{
  id: "abgabe", kurz: "9", kapitel: "Abschluss",
  titel: "Arbeit abgeben",
  lead: "Trage deinen Namen und deinen Kurs ein und gib deine Arbeit verbindlich ab.",
  abschnitt: null,
  abgabe: true,
  aufgaben: []
}
];
