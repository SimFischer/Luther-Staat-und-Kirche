/* =====================================================================
   SUPABASE-KONFIGURATION  —  HIER EINTRAGEN
   ---------------------------------------------------------------------
   Es werden GENAU ZWEI Werte benötigt. Beide findest du in deinem
   Supabase-Projekt unter:  Project Settings -> API

     1. url      = "Project URL"        (z. B. https://abcdefgh.supabase.co)
     2. anonKey  = "anon public key"    (auch "publishable key" genannt)

   WICHTIG:
   Trage hier NIEMALS den "service_role"-Schlüssel ein. Dieser Schlüssel
   umgeht alle Sicherheitsregeln und darf das Backend nie verlassen.
   Der anon/publishable Key ist für den Einsatz im Browser vorgesehen und
   wird durch Row Level Security (siehe supabase_setup.sql) abgesichert.

   Solange die Felder leer sind, funktioniert die gesamte Lernanwendung
   normal weiter; nur die Online-Abgabe ist dann deaktiviert.
   ===================================================================== */

window.SUPABASE_CONFIG = {
  url:     "https://tfvzbhnvxiouhiprxqgh.supabase.co",
  anonKey: "sb_publishable_ByVUpP6kZW6rmXT8mrh5Zg_LqAE11Y8"
};
