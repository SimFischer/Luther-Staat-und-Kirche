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
| 8 | Verbindliche Abgabe | — |

Weitere Merkmale:

* Der jeweils zugehörige Originalabschnitt bleibt während der Aufgaben oben
  angeheftet sichtbar und lässt sich ein- und ausklappen.
* Bereits gelesene Abschnitte können jederzeit erneut geöffnet werden.
* **Textmarkierungen** in Gelb, Grün, Blau und Rosa; einzeln oder
  abschnittsweise löschbar, dauerhaft gespeichert und Teil der Abgabe.
* **Fehlermeldungen** benennen, was noch fehlt, und verweisen auf die Textstelle.
* Der Arbeitsstand wird laufend lokal im Browser gesichert. Über
  „Arbeit zurücksetzen“ (mit doppelter Sicherheitsabfrage) lässt er sich löschen.
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

Angezeigt werden Name, Kurs, Zeitpunkt, Bearbeitungsstatus und -dauer, alle
Antworten der Lernseiten, Zuordnungen, Textmarkierungen, das erarbeitete
Tafelbild, die Rechercheergebnisse und das Abschlussurteil. Über die Auswahl
oben lässt sich zwischen verbindlichen Abgaben, Zwischenständen und beidem
umschalten; dazu kommen Namenssuche, Kursfilter, Sortierung und eine
Druckansicht der einzelnen Abgabe.

---

## 4. Supabase einrichten

### 4.1 Projekt anlegen und SQL ausführen

1. Unter [supabase.com](https://supabase.com) ein Projekt anlegen.
2. Im Dashboard **SQL Editor → New query** öffnen.
3. Den **gesamten Inhalt von `supabase_setup.sql`** einfügen und ausführen.

Damit entstehen die Tabellen `abgaben` und `lehrkraefte`, die Prüffunktion
`ist_lehrkraft()` sowie die Row-Level-Security-Regeln:

* Schülerinnen und Schüler dürfen **nur einfügen** – nicht lesen, ändern oder löschen.
* Lesen dürfen ausschließlich angemeldete und freigeschaltete Lehrkräfte.
* Für `UPDATE` und `DELETE` gibt es keine Regel.
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
