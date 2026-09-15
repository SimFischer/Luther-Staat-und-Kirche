# Luthers Verständnis von Staat und Kirche

Interaktive Lernanwendung für den evangelischen Religionsunterricht in der Q1
zur **Zwei-Reiche-Lehre bzw. der Lehre von den zwei Regimenten**, auf der
Grundlage des Textes von **Peter Kliemann, „Luthers Verständnis von Kirche und
Staat“** (Material M04).

Die Anwendung läuft vollständig im Browser und ist ohne serverseitige
Komponenten auf **GitHub Pages** lauffähig. Für die Abgabe und den
Lehrerbereich wird optional **Supabase** genutzt.

> „Von der Freiheit eines Christenmenschen“ ist **nicht** Gegenstand dieser
> Einheit; das folgt in der nächsten Stunde.

---

## 1. Zweck und Aufbau

Die Schülerinnen und Schüler erschließen den Quellentext in acht aufeinander
aufbauenden Lernschritten. Eine Seite wird erst freigegeben, wenn die
vorherige vollständig bearbeitet ist; zu bereits bearbeiteten Seiten kann
jederzeit zurückgekehrt werden.

| Schritt | Inhalt | Textgrundlage |
|---|---|---|
| Start | Orientierung, Aufgaben des Materials | — |
| 1 | Entstehungssituation der Schrift, Wormser Edikt, Leitfrage, Diskussionsimpuls | Z. 1–15 |
| 2 | Geistliches und weltliches Regiment, Abgrenzungen a)–c) | Z. 16–49 |
| 3 | Der Christ steht in beiden Regimenten (Christperson / Weltperson) | Z. 50–65 |
| 4 | Sachfragen, Glaubensfragen, Grenzen staatlicher Macht | Z. 66–98 |
| 5 | Grenze der Obrigkeit und Widerstand (1523 gegenüber späteren Texten) | Z. 99–132 |
| 6 | Interaktives Tafelbild | — |
| 7 | Gegenwartstransfer mit Recherche und Abschlussurteil | — |
| 8 | Erörterung / Stellungnahme (Anforderungsbereich III) mit Strukturhilfe | gesamter Text |
| 9 | Verbindliche Abgabe | — |

Weitere Merkmale:

* **Lernschritt 8** ist die zusammenführende Schreibaufgabe im
  Anforderungsbereich III: eine Erörterung mit abschließender begründeter
  Stellungnahme zu der Frage, ob Bindung an das Evangelium unfreier oder freier
  macht als bloßer Gesetzesgehorsam. Ein großes Schreibfeld (Mindestumfang 900
  Zeichen, Richtwert 400–600 Wörter), eine aufgeklappte Strukturhilfe für
  Einleitung, Hauptteil und Schluss sowie zuklappbare Denkanstöße gehören dazu.
  Die Aufgabe verlangt den Rückgriff auf alle vorangegangenen Lernschritte und
  bereitet die Unterscheidung von innerer und äußerer Freiheit vor, ohne die
  Folgestunde vorwegzunehmen.
* **Vorschaumodus für Lehrkräfte**: `index.html?vorschau=1` hebt die
  Freischaltsperre auf, sodass sich alle Lernschritte ansehen lassen, ohne die
  Aufgaben zu lösen. Er wird erst freigegeben, wenn dieselbe Prüfung besteht wie
  im Lehrerbereich: eine gültige Supabase-Anmeldung **und** ein Eintrag in der
  Tabelle `lehrkraefte`. Beides läuft über die bestehende Sitzung, eine erneute
  Anmeldung ist also nicht nötig; bequem ist der Fußlink im Lehrerbereich.
  Schülerinnen und Schüler, die den Link kennen, sehen stattdessen einen
  Hinweis, und die Lernschritte bleiben der Reihe nach freigeschaltet. Lässt
  sich die Berechtigung nicht prüfen (kein Netz, Supabase nicht eingerichtet),
  bleibt der Modus ebenfalls gesperrt. Er gilt nur für den aktuellen
  Browser-Tab und verändert den gespeicherten Arbeitsstand nicht;
  „Vorschau beenden“ schaltet sofort zurück.
* Der jeweils zugehörige Originalabschnitt bleibt während der Aufgaben oben
  angeheftet sichtbar und lässt sich ein- und ausklappen.
* Bereits gelesene Abschnitte können jederzeit erneut geöffnet werden.
* **Textmarkierungen** in Gelb, Grün, Blau und Rosa; einzeln oder
  abschnittsweise löschbar, dauerhaft gespeichert und Teil der Abgabe.
* **Fehlermeldungen** benennen, was noch fehlt, und verweisen auf die Textstelle.
* Der Arbeitsstand wird laufend lokal im Browser gesichert. Über
  „Arbeit zurücksetzen“ (mit doppelter Sicherheitsabfrage) lässt er sich löschen.
* **Ergebnisse als PDF sichern**: Der Knopf „Ergebnisse als PDF sichern“ (auf der
  Sicherungskarte und auf der Abgabeseite) öffnet eine vollständige Übersicht mit
  allen Lernschritten, den eigenen Antworten, dem Tafelbild und den
  Textmarkierungen. Der Knopf steht auf **jeder Seite** in der Karte „Arbeit
  sichern und fortsetzen“ und zusätzlich auf der Abgabeseite – auch nach der
  verbindlichen Abgabe, etwa zur Klausurvorbereitung.
  Von dort führt „Als PDF sichern / drucken“ in den Druckdialog;
  dort „Als PDF speichern“ wählen. Es werden bewusst **keine Musterlösungen und
  keine Bewertungen** ausgegeben. Zurück geht es mit dem zweiten Knopf oder Escape.
* Unter jeder Seite steht der Bereich **Arbeit sichern und fortsetzen**
  (siehe Abschnitt 2.1).
* iPad-first: Touchflächen ab ca. 46 px, Hoch- und Querformat, Bedienung per
  Finger, Apple Pencil oder Maus. Drag-and-drop hat überall eine Tipp-Alternative.

### Der Quellentext

Der Text steht in `assets/js/text-kliemann.js`, gegliedert in fünf Abschnitte.
Die Zeilenzählung der Vorlage (Z. 1–132) ist erhalten und wird in der Anwendung
angezeigt. Im Feld `quelle` bitte die bibliographische Angabe ergänzen.

---

## 2. Schülerseite starten

`index.html` im Browser öffnen – lokal per Doppelklick oder nach dem Deployment
unter der GitHub-Pages-Adresse:

```
https://<benutzername>.github.io/<repository>/
```

Ohne Supabase-Konfiguration funktioniert die gesamte Lernanwendung uneingeschränkt.
Lediglich bei der Abgabe erscheint der Hinweis „Die Online-Abgabe ist noch nicht
eingerichtet.“; die Arbeit wird dann nur lokal gesichert und kann ausgedruckt werden.

### 2.1 Arbeit sichern und fortsetzen

Unter jeder Seite steht ein Bereich für den Fall, dass eine Stunde nicht reicht:

* **Zwischenstand herunterladen** – speichert den gesamten Stand als
  JSON-Datei (Antworten, Markierungen, Tafelbild, Fortschritt, Name und Kurs).
* **Zwischenstand hochladen** – lädt eine solche Datei nach Rückfrage wieder
  ein, auch auf einem anderen Gerät. Die Arbeit geht dort weiter, wo sie
  aufgehört hat.
* **Zwischenstand an die Lehrkraft senden** – erscheint nur bei eingerichtetem
  Supabase. Der Stand wird als Eintrag mit `art = 'zwischenstand'` gespeichert;
  die Arbeit lässt sich danach normal fortsetzen. Das ersetzt nicht die
  verbindliche Abgabe am Ende.

Vorname, Nachname und Kurs werden in diesem Bereich einmal eingetragen und auf
der Abgabeseite übernommen.

## 3. Lehrerseite starten

```
https://<benutzername>.github.io/<repository>/lehrer.html
```

Die Seite verlangt eine Anmeldung über Supabase Auth **und** eine zusätzliche
Freigabe in der Tabelle `public.lehrkraefte`. Ohne beides werden keine Daten
angezeigt.

Erreichbar ist die Seite über die Adresse oben oder über den kleinen Link
**„Lehreransicht"** in der Fußzeile jeder Schülerseite; von dort führt
„Zur Schüleransicht" wieder zurück.

**Anmelden:** E-Mail und Passwort des im Supabase-Dashboard angelegten Kontos
(siehe Abschnitt 4.3). Die Anmeldung bleibt auf dem Gerät bestehen, bis oben
rechts „Abmelden“ gewählt wird. Ist ein Konto zwar angemeldet, aber nicht in
`lehrkraefte` eingetragen, erscheint ein entsprechender Hinweis und es werden
keine Daten geladen.

**Sichten:** Links die Liste mit Namenssuche, Kursfilter, Sortierung und dem
Umschalter zwischen verbindlichen Abgaben, Zwischenständen und beidem. Ein
Klick öffnet rechts die Detailansicht mit Name, Kurs, Zeitpunkt,
Bearbeitungsstatus und -dauer, allen Antworten der Lernseiten, den Zuordnungen
mit ✓/✗, den Textmarkierungen im Originalabschnitt, dem erarbeiteten Tafelbild,
den Rechercheergebnissen und dem Abschlussurteil.

**Herunterladen:**

| Schaltfläche | Ergebnis |
|---|---|
| Auswahl als CSV | `Abgaben_JJJJ-MM-TT.csv` mit einer Zeile je Eintrag: Name, Kurs, Art, Zeitpunkt, Vollständigkeit, Dauer, je Lernschritt die Zahl der richtigen Zuordnungen und alle Freitextantworten. Semikolon-getrennt und mit BOM, öffnet sich in Excel und LibreOffice direkt mit korrekten Umlauten. |
| Auswahl als JSON | Vollständige Sicherung aller angezeigten Einträge, einschließlich Markierungen und Tafelbild. |
| Als HTML-Datei | Eine einzelne Abgabe als in sich geschlossene, druckbare Datei im Layout der Anwendung – mit Markierungen und Tafelbild. |
| Als JSON-Datei | Eine einzelne Abgabe als Rohdatensatz. |

Die beiden Sammel-Downloads berücksichtigen immer die gerade eingestellten
Filter. Zusätzlich gibt es die Druckansicht des Browsers.

---

## 4. Supabase einrichten

### 4.1 Projekt anlegen und SQL ausführen

1. Unter [supabase.com](https://supabase.com) ein Projekt anlegen.
2. Im Dashboard **SQL Editor → New query** öffnen.
3. Den **gesamten Inhalt von `supabase_setup.sql`** einfügen und ausführen.

Damit entstehen die Tabellen `abgaben` und `lehrkraefte`, die Prüffunktion
`ist_lehrkraft()` sowie die Row-Level-Security-Regeln:

* Schülerinnen und Schüler dürfen **nur einfügen** – nicht lesen, ändern oder löschen.
* **Kein Klarname in der Datenbank**: Übertragen wird nur ein Kürzel aus je zwei
  Buchstaben von Vor- und Nachname (Simon Fischer → `SiFi`), dazu die Angabe zu
  Kurs bzw. Klasse. Der vollständige Name wird zwar eingegeben, bleibt aber
  ausschließlich in der lokalen Speicherung des Schülergeräts und erscheint nur
  im eigenen PDF. Unterhalb der Namensfelder zeigt die Anwendung laufend an, was
  tatsächlich gesendet wird.
  Zu beachten: Bei gleichen Anfangsbuchstaben im selben Kurs ist das Kürzel nicht
  eindeutig – die Kursliste vorab prüfen. Und: Ein Kürzel ist eine
  Pseudonymisierung, keine Anonymisierung; die Daten bleiben personenbezogen,
  weil die Lehrkraft sie zuordnen kann. Die datenschutzrechtliche Bewertung des
  Gesamtverfahrens (Auftragsverarbeitungsvertrag, Genehmigung durch die Schule,
  Verarbeitungsverzeichnis) ersetzt das nicht.
* Lesen dürfen ausschließlich angemeldete und freigeschaltete Lehrkräfte.
* **Löschen** dürfen ebenfalls nur freigeschaltete Lehrkräfte – über den Knopf
  „Eintrag löschen“ in der Detailansicht des Lehrerbereichs (doppelte
  Sicherheitsabfrage). Nützlich für Testabgaben und versehentliche
  Doppelabgaben. Ein gelöschter Eintrag ist endgültig weg; auf dem Free-Plan
  gibt es keine automatischen Backups, deshalb vorher „Auswahl als JSON“ sichern.
* Für `UPDATE` gibt es keine Regel: eingegangene Abgaben bleiben unverändert.
* Die Spalte `art` unterscheidet `zwischenstand` und `abgabe`.

Die Datei lässt sich auch auf einem bereits eingerichteten Projekt erneut
ausführen; die Spalte `art` wird dabei nachgetragen.

### 4.2 Die beiden Werte eintragen

Im Supabase-Dashboard unter **Project Settings → API** findest du genau zwei
Werte. Trage sie in `assets/js/supabase_config.js` ein:

```js
window.SUPABASE_CONFIG = {
  url:     "https://DEIN-PROJEKT.supabase.co",   // "Project URL"
  anonKey: "DEIN-ANON-ODER-PUBLISHABLE-KEY"      // "anon public" / publishable key
};
```

> **Niemals** den `service_role`-Schlüssel eintragen. Er umgeht sämtliche
> Sicherheitsregeln und darf das Backend nie verlassen. Die Anwendung erkennt
> einen versehentlich eingetragenen geheimen Schlüssel und verweigert dann den Start.

### 4.3 Lehrerkonto freischalten

1. **Authentication → Users → „Add user“**: E-Mail und Passwort vergeben,
   „Auto Confirm User“ aktivieren.
2. Im SQL-Editor ausführen (E-Mail anpassen):

   ```sql
   insert into public.lehrkraefte (user_id, email)
   select id, email from auth.users
   where email = 'lehrkraft@schule.de'
   on conflict (user_id) do nothing;
   ```

   **Bequemer:** Melde dich einfach in `lehrer.html` an. Ist das Konto noch
   nicht freigeschaltet, zeigt die Seite genau den passenden SQL-Befehl an –
   bereits mit deiner Benutzer-ID und E-Mail gefüllt, mit Schaltfläche zum
   Kopieren, einem Link zum SQL-Editor deines Projekts und „Erneut prüfen“.
   Dasselbe gilt, falls `supabase_setup.sql` noch gar nicht ausgeführt wurde;
   darauf weist die Seite dann eigens hin.

3. Berechtigung wieder entziehen:

   ```sql
   delete from public.lehrkraefte where email = 'lehrkraft@schule.de';
   ```

**Empfehlung:** Unter **Authentication → Providers → Email** die
Selbstregistrierung deaktivieren, damit sich niemand eigenständig ein Konto anlegt.

---

## 5. GitHub Pages aktivieren

1. Repository auf GitHub öffnen.
2. **Settings → Pages**.
3. Unter *Build and deployment*: **Source: „Deploy from a branch“**,
   **Branch: `main`**, **Folder: `/ (root)`**, dann **Save**.
4. Nach ein bis zwei Minuten ist die Seite unter
   `https://<benutzername>.github.io/<repository>/` erreichbar.

Die Datei `.nojekyll` schaltet die Jekyll-Verarbeitung ab.

### Zwischengespeicherte Dateien

`index.html` und `lehrer.html` hängen an jeden Verweis auf CSS und JavaScript
eine Versionsnummer an (`assets/js/app.js?v=5`). Dadurch holt jeder Browser nach
einer Änderung automatisch die neue Datei.

**Wichtig:** Wenn du eine Datei unter `assets/` änderst, zähle diese Nummer in
beiden HTML-Dateien hoch (`?v=6`, `?v=7` …) – sonst behalten Geräte, die die
Seite schon einmal geöffnet haben, unter Umständen den alten Stand. In
`assets/js/lehrer.js` steht dieselbe Nummer noch einmal beim Laden des
Stylesheets für den HTML-Export.

> Hinweis zum Datenschutz: Eine über GitHub Pages veröffentlichte Seite ist
> öffentlich erreichbar. Personenbezogene Daten liegen ausschließlich in
> Supabase und sind durch Row Level Security geschützt.

---

## 6. Dateien

```
index.html                     Schüleranwendung
lehrer.html                    Lehrerbereich
supabase_setup.sql             Tabellen, Funktion und RLS-Regeln
.nojekyll                      Auslieferung ohne Jekyll-Verarbeitung
assets/css/style.css           Gesamtes Design
assets/js/supabase_config.js   >>> HIER Project URL und anon Key eintragen
assets/js/supabase_client.js   Nachladen des Supabase-SDK, Schlüsselprüfung
assets/js/text-kliemann.js     Quellentext, in Abschnitte gegliedert
assets/js/seiten.js            Lernschritte, Aufgaben, Rückmeldungen, Hinweise
assets/js/storage.js           Lokale Zwischenspeicherung
assets/js/leser.js             Angeheftete Leseansicht und Textmarkierungen
assets/js/tafelbild.js         Interaktives Tafelbild
assets/js/app.js               Ablaufsteuerung, Prüfung, Sicherung, Abgabe
assets/js/lehrer.js            Anmeldung, Übersicht, Detail- und Druckansicht
```

## 7. Anpassungen

* **Aufgaben, Rückmeldungen, Hinweise** ändern: `assets/js/seiten.js`.
* **Tafelbild** (Bausteine, Felder, Verbindungen): `assets/js/tafelbild.js`.
* **Farben, Typografie, Abstände**: die Variablen am Anfang von `assets/css/style.css`.
* **Textabschnitte** neu zuschneiden: `assets/js/text-kliemann.js`; die
  Zuordnung Abschnitt → Lernseite steht in `assets/js/seiten.js` im Feld `abschnitt`.
