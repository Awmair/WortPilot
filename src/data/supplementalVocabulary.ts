import type { VocabItem } from "../types";

type WordPart = {
  de: string;
  en: string;
};

type CompoundBank = {
  id: string;
  tags: string[];
  prefixes: WordPart[];
  suffixes: WordPart[];
};

const SUPPLEMENTAL_TARGET = 2600;

function asciiGerman(value: string) {
  return value
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("Ä", "Ae")
    .replaceAll("Ö", "Oe")
    .replaceAll("Ü", "Ue")
    .replaceAll("ß", "ss");
}

function slug(value: string) {
  return asciiGerman(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function compounds(bank: CompoundBank): VocabItem[] {
  const rows: VocabItem[] = [];
  for (const prefix of bank.prefixes) {
    for (const suffix of bank.suffixes) {
      const de = `${prefix.de}${suffix.de}`;
      const ascii = asciiGerman(de);
      rows.push({
        id: `sv-${bank.id}-${slug(de)}`,
        de,
        ascii: ascii === de ? undefined : ascii,
        en: `${prefix.en} ${suffix.en}`,
        tags: bank.tags,
      });
    }
  }
  return rows;
}

function roundRobin(groups: VocabItem[][], target: number) {
  const seen = new Set<string>();
  const output: VocabItem[] = [];
  let index = 0;

  while (output.length < target && groups.some((group) => index < group.length)) {
    for (const group of groups) {
      const item = group[index];
      if (!item) continue;
      const key = item.de.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(item);
      if (output.length === target) return output;
    }
    index += 1;
  }

  return output;
}

const businessBank: CompoundBank = {
  id: "business",
  tags: ["business"],
  prefixes: [
    { de: "Kunden", en: "customer" }, { de: "Projekt", en: "project" }, { de: "Angebots", en: "proposal" },
    { de: "Rechnungs", en: "invoice" }, { de: "Vertrags", en: "contract" }, { de: "Zahlungs", en: "payment" },
    { de: "Liefer", en: "delivery" }, { de: "Bestell", en: "order" }, { de: "Termin", en: "appointment" },
    { de: "Meeting", en: "meeting" }, { de: "Team", en: "team" }, { de: "Partner", en: "partner" },
    { de: "Kontakt", en: "contact" }, { de: "Adress", en: "address" }, { de: "Budget", en: "budget" },
    { de: "Kosten", en: "cost" }, { de: "Preis", en: "price" }, { de: "Rabatt", en: "discount" },
    { de: "Umsatz", en: "revenue" }, { de: "Gewinn", en: "profit" }, { de: "Markt", en: "market" },
    { de: "Verkaufs", en: "sales" }, { de: "Einkaufs", en: "purchasing" }, { de: "Support", en: "support" },
    { de: "Service", en: "service" }, { de: "Qualitäts", en: "quality" }, { de: "Risiko", en: "risk" },
    { de: "Chancen", en: "opportunity" }, { de: "Strategie", en: "strategy" }, { de: "Analyse", en: "analysis" },
    { de: "Berichts", en: "report" }, { de: "Dokument", en: "document" }, { de: "Formular", en: "form" },
    { de: "Unterschrifts", en: "signature" }, { de: "Freigabe", en: "approval" }, { de: "Aufgaben", en: "task" },
    { de: "Fristen", en: "deadline" }, { de: "Prioritäts", en: "priority" }, { de: "Entscheidungs", en: "decision" },
    { de: "Vereinbarungs", en: "agreement" }, { de: "Prozess", en: "process" }, { de: "Leistungs", en: "performance" },
    { de: "Agentur", en: "agency" }, { de: "Firmen", en: "company" }, { de: "Büro", en: "office" },
    { de: "Arbeits", en: "work" }, { de: "Monats", en: "monthly" }, { de: "Jahres", en: "annual" },
  ],
  suffixes: [
    { de: "portal", en: "portal" }, { de: "bereich", en: "area" }, { de: "plan", en: "plan" },
    { de: "liste", en: "list" }, { de: "status", en: "status" }, { de: "nummer", en: "number" },
    { de: "datum", en: "date" }, { de: "formular", en: "form" }, { de: "dokument", en: "document" },
    { de: "ordner", en: "folder" }, { de: "bericht", en: "report" }, { de: "analyse", en: "analysis" },
    { de: "übersicht", en: "overview" }, { de: "vorlage", en: "template" }, { de: "regel", en: "rule" },
    { de: "schritt", en: "step" }, { de: "gruppe", en: "group" }, { de: "kanal", en: "channel" },
    { de: "konto", en: "account" }, { de: "profil", en: "profile" }, { de: "akte", en: "file" },
    { de: "mappe", en: "folder" }, { de: "tabelle", en: "table" }, { de: "notiz", en: "note" },
    { de: "protokoll", en: "minutes" }, { de: "prüfung", en: "check" }, { de: "freigabe", en: "approval" },
    { de: "änderung", en: "change" }, { de: "anfrage", en: "request" }, { de: "antwort", en: "answer" },
    { de: "meldung", en: "message" }, { de: "hinweis", en: "notice" }, { de: "ziel", en: "goal" },
    { de: "phase", en: "phase" }, { de: "paket", en: "package" }, { de: "wert", en: "value" },
  ],
};

const techBank: CompoundBank = {
  id: "tech",
  tags: ["internet", "tech"],
  prefixes: [
    { de: "Daten", en: "data" }, { de: "Datei", en: "file" }, { de: "Cloud", en: "cloud" },
    { de: "Netzwerk", en: "network" }, { de: "Server", en: "server" }, { de: "Browser", en: "browser" },
    { de: "App", en: "app" }, { de: "Geräte", en: "device" }, { de: "Handy", en: "phone" },
    { de: "Laptop", en: "laptop" }, { de: "Bildschirm", en: "screen" }, { de: "Tastatur", en: "keyboard" },
    { de: "Passwort", en: "password" }, { de: "Benutzer", en: "user" }, { de: "Profil", en: "profile" },
    { de: "Anmelde", en: "login" }, { de: "Zugriffs", en: "access" }, { de: "Sicherheits", en: "security" },
    { de: "Datenschutz", en: "privacy" }, { de: "Cookie", en: "cookie" }, { de: "Such", en: "search" },
    { de: "Chat", en: "chat" }, { de: "Nachrichten", en: "message" }, { de: "Kommentar", en: "comment" },
    { de: "Beitrags", en: "post" }, { de: "Kanal", en: "channel" }, { de: "Foto", en: "photo" },
    { de: "Bild", en: "image" }, { de: "Video", en: "video" }, { de: "Audio", en: "audio" },
    { de: "Aufnahme", en: "recording" }, { de: "Kamera", en: "camera" }, { de: "Mikrofon", en: "microphone" },
    { de: "Backup", en: "backup" }, { de: "Sync", en: "sync" }, { de: "Versions", en: "version" },
    { de: "Update", en: "update" }, { de: "Fehler", en: "error" }, { de: "Warn", en: "warning" },
    { de: "Status", en: "status" }, { de: "Code", en: "code" }, { de: "Funktions", en: "function" },
  ],
  suffixes: [
    { de: "ablage", en: "storage" }, { de: "archiv", en: "archive" }, { de: "bereich", en: "area" },
    { de: "dienst", en: "service" }, { de: "fenster", en: "window" }, { de: "feld", en: "field" },
    { de: "filter", en: "filter" }, { de: "fluss", en: "flow" }, { de: "formular", en: "form" },
    { de: "gerät", en: "device" }, { de: "gruppe", en: "group" }, { de: "hinweis", en: "notice" },
    { de: "konto", en: "account" }, { de: "link", en: "link" }, { de: "liste", en: "list" },
    { de: "menü", en: "menu" }, { de: "meldung", en: "message" }, { de: "modus", en: "mode" },
    { de: "ordner", en: "folder" }, { de: "paket", en: "package" }, { de: "prüfung", en: "check" },
    { de: "regel", en: "rule" }, { de: "seite", en: "page" }, { de: "schutz", en: "protection" },
    { de: "schritt", en: "step" }, { de: "speicher", en: "storage" }, { de: "status", en: "status" },
    { de: "suche", en: "search" }, { de: "system", en: "system" }, { de: "taste", en: "key" },
    { de: "verlauf", en: "history" }, { de: "version", en: "version" }, { de: "zugang", en: "access" },
    { de: "übersicht", en: "overview" }, { de: "änderung", en: "change" },
  ],
};

const aiBank: CompoundBank = {
  id: "ai",
  tags: ["ai", "automation"],
  prefixes: [
    { de: "KI", en: "AI" }, { de: "Prompt", en: "prompt" }, { de: "Modell", en: "model" },
    { de: "Training", en: "training" }, { de: "Datensatz", en: "dataset" }, { de: "Workflow", en: "workflow" },
    { de: "Regel", en: "rule" }, { de: "Vorlagen", en: "template" }, { de: "Integrations", en: "integration" },
    { de: "API", en: "API" }, { de: "Skript", en: "script" }, { de: "Bot", en: "bot" },
    { de: "Assistenten", en: "assistant" }, { de: "Agenten", en: "agent" }, { de: "Klassifizierungs", en: "classification" },
    { de: "Zusammenfassungs", en: "summary" }, { de: "Übersetzungs", en: "translation" }, { de: "Erkennungs", en: "recognition" },
    { de: "Empfehlungs", en: "recommendation" }, { de: "Automations", en: "automation" }, { de: "Auslöser", en: "trigger" },
    { de: "Aktions", en: "action" }, { de: "Warteschlangen", en: "queue" }, { de: "Bewertungs", en: "evaluation" },
    { de: "Genauigkeits", en: "accuracy" }, { de: "Eingabe", en: "input" }, { de: "Ausgabe", en: "output" },
    { de: "Text", en: "text" }, { de: "Bild", en: "image" }, { de: "Audio", en: "audio" },
  ],
  suffixes: [
    { de: "antwort", en: "answer" }, { de: "ausgabe", en: "output" }, { de: "bericht", en: "report" },
    { de: "bewertung", en: "evaluation" }, { de: "daten", en: "data" }, { de: "eingabe", en: "input" },
    { de: "ergebnis", en: "result" }, { de: "fehler", en: "error" }, { de: "feld", en: "field" },
    { de: "filter", en: "filter" }, { de: "fluss", en: "flow" }, { de: "hinweis", en: "hint" },
    { de: "lauf", en: "run" }, { de: "liste", en: "list" }, { de: "modus", en: "mode" },
    { de: "prüfung", en: "check" }, { de: "regel", en: "rule" }, { de: "schritt", en: "step" },
    { de: "status", en: "status" }, { de: "system", en: "system" }, { de: "test", en: "test" },
    { de: "text", en: "text" }, { de: "version", en: "version" }, { de: "vorlage", en: "template" },
    { de: "ziel", en: "goal" }, { de: "zusammenfassung", en: "summary" },
  ],
};

const lifestyleBank: CompoundBank = {
  id: "lifestyle",
  tags: ["home", "lifestyle"],
  prefixes: [
    { de: "Haus", en: "house" }, { de: "Wohnungs", en: "apartment" }, { de: "Zimmer", en: "room" },
    { de: "Tür", en: "door" }, { de: "Fenster", en: "window" }, { de: "Wand", en: "wall" },
    { de: "Boden", en: "floor" }, { de: "Tisch", en: "table" }, { de: "Stuhl", en: "chair" },
    { de: "Sofa", en: "sofa" }, { de: "Bett", en: "bed" }, { de: "Schrank", en: "cabinet" },
    { de: "Regal", en: "shelf" }, { de: "Lampen", en: "lamp" }, { de: "Küchen", en: "kitchen" },
    { de: "Bad", en: "bathroom" }, { de: "Dusch", en: "shower" }, { de: "Spiegel", en: "mirror" },
    { de: "Taschen", en: "bag" }, { de: "Kleidungs", en: "clothing" }, { de: "Schuh", en: "shoe" },
    { de: "Uhren", en: "watch" }, { de: "Brillen", en: "glasses" }, { de: "Geld", en: "money" },
    { de: "Karten", en: "card" }, { de: "Wasser", en: "water" }, { de: "Kaffee", en: "coffee" },
    { de: "Tee", en: "tea" }, { de: "Milch", en: "milk" }, { de: "Brot", en: "bread" },
    { de: "Käse", en: "cheese" }, { de: "Obst", en: "fruit" }, { de: "Gemüse", en: "vegetable" },
    { de: "Salat", en: "salad" }, { de: "Fleisch", en: "meat" }, { de: "Fisch", en: "fish" },
    { de: "Zucker", en: "sugar" }, { de: "Salz", en: "salt" }, { de: "Pfeffer", en: "pepper" },
  ],
  suffixes: [
    { de: "bereich", en: "area" }, { de: "box", en: "box" }, { de: "dose", en: "container" },
    { de: "ecke", en: "corner" }, { de: "fach", en: "compartment" }, { de: "farbe", en: "color" },
    { de: "form", en: "shape" }, { de: "griff", en: "handle" }, { de: "halter", en: "holder" },
    { de: "korb", en: "basket" }, { de: "lampe", en: "lamp" }, { de: "liste", en: "list" },
    { de: "maschine", en: "machine" }, { de: "messer", en: "knife" }, { de: "platz", en: "place" },
    { de: "plan", en: "plan" }, { de: "regal", en: "shelf" }, { de: "reiniger", en: "cleaner" },
    { de: "schlüssel", en: "key" }, { de: "schrank", en: "cabinet" }, { de: "seite", en: "side" },
    { de: "set", en: "set" }, { de: "tasche", en: "bag" }, { de: "teller", en: "plate" },
    { de: "tuch", en: "cloth" }, { de: "uhr", en: "clock" }, { de: "vorrat", en: "supply" },
    { de: "wagen", en: "cart" }, { de: "zeichen", en: "sign" },
  ],
};

const travelBank: CompoundBank = {
  id: "travel",
  tags: ["city", "travel"],
  prefixes: [
    { de: "Stadt", en: "city" }, { de: "Dorf", en: "village" }, { de: "Straßen", en: "street" },
    { de: "Platz", en: "square" }, { de: "Bahnhof", en: "station" }, { de: "Haltestellen", en: "stop" },
    { de: "Zug", en: "train" }, { de: "Bus", en: "bus" }, { de: "Bahn", en: "rail" },
    { de: "Auto", en: "car" }, { de: "Fahrrad", en: "bike" }, { de: "Flug", en: "flight" },
    { de: "Ticket", en: "ticket" }, { de: "Reise", en: "trip" }, { de: "Urlaubs", en: "vacation" },
    { de: "Hotel", en: "hotel" }, { de: "Reservierungs", en: "reservation" }, { de: "Pass", en: "passport" },
    { de: "Koffer", en: "suitcase" }, { de: "Gepäck", en: "luggage" }, { de: "Eingangs", en: "entrance" },
    { de: "Ausgangs", en: "exit" }, { de: "Supermarkt", en: "supermarket" }, { de: "Bäckerei", en: "bakery" },
    { de: "Apotheken", en: "pharmacy" }, { de: "Bank", en: "bank" }, { de: "Post", en: "post" },
    { de: "Restaurant", en: "restaurant" }, { de: "Café", en: "cafe" }, { de: "Kino", en: "cinema" },
    { de: "Museum", en: "museum" }, { de: "Park", en: "park" }, { de: "Wetter", en: "weather" },
  ],
  suffixes: [
    { de: "adresse", en: "address" }, { de: "ausgang", en: "exit" }, { de: "bereich", en: "area" },
    { de: "eingang", en: "entrance" }, { de: "fenster", en: "window" }, { de: "frage", en: "question" },
    { de: "gebühr", en: "fee" }, { de: "halle", en: "hall" }, { de: "hinweis", en: "notice" },
    { de: "karte", en: "map" }, { de: "kasse", en: "checkout" }, { de: "linie", en: "line" },
    { de: "liste", en: "list" }, { de: "nummer", en: "number" }, { de: "plan", en: "plan" },
    { de: "preis", en: "price" }, { de: "punkt", en: "point" }, { de: "raum", en: "room" },
    { de: "schild", en: "sign" }, { de: "schalter", en: "counter" }, { de: "seite", en: "side" },
    { de: "service", en: "service" }, { de: "station", en: "station" }, { de: "status", en: "status" },
    { de: "ticket", en: "ticket" }, { de: "verbindung", en: "connection" }, { de: "zeit", en: "time" },
    { de: "zone", en: "zone" },
  ],
};

const peopleBank: CompoundBank = {
  id: "people",
  tags: ["people", "family"],
  prefixes: [
    { de: "Familien", en: "family" }, { de: "Mutter", en: "mother" }, { de: "Vater", en: "father" },
    { de: "Eltern", en: "parents" }, { de: "Kinder", en: "children" }, { de: "Freundes", en: "friend" },
    { de: "Nachbar", en: "neighbor" }, { de: "Lehrer", en: "teacher" }, { de: "Ärzte", en: "doctor" },
    { de: "Fahrer", en: "driver" }, { de: "Gast", en: "guest" }, { de: "Besucher", en: "visitor" },
    { de: "Mitglieds", en: "member" }, { de: "Kunden", en: "customer" }, { de: "Kollegen", en: "colleague" },
    { de: "Mitarbeiter", en: "employee" }, { de: "Chef", en: "boss" }, { de: "Team", en: "team" },
    { de: "Partner", en: "partner" }, { de: "Nutzer", en: "user" }, { de: "Lerner", en: "learner" },
  ],
  suffixes: [
    { de: "adresse", en: "address" }, { de: "antwort", en: "answer" }, { de: "bereich", en: "area" },
    { de: "besuch", en: "visit" }, { de: "frage", en: "question" }, { de: "gruppe", en: "group" },
    { de: "hilfe", en: "help" }, { de: "hinweis", en: "notice" }, { de: "karte", en: "card" },
    { de: "konto", en: "account" }, { de: "liste", en: "list" }, { de: "meldung", en: "message" },
    { de: "name", en: "name" }, { de: "nummer", en: "number" }, { de: "plan", en: "plan" },
    { de: "profil", en: "profile" }, { de: "rolle", en: "role" }, { de: "seite", en: "page" },
    { de: "status", en: "status" }, { de: "termin", en: "appointment" }, { de: "treffen", en: "meeting" },
    { de: "wunsch", en: "wish" }, { de: "ziel", en: "goal" },
  ],
};

const healthBank: CompoundBank = {
  id: "health",
  tags: ["health"],
  prefixes: [
    { de: "Körper", en: "body" }, { de: "Kopf", en: "head" }, { de: "Augen", en: "eye" },
    { de: "Ohren", en: "ear" }, { de: "Mund", en: "mouth" }, { de: "Hand", en: "hand" },
    { de: "Arm", en: "arm" }, { de: "Bein", en: "leg" }, { de: "Fuß", en: "foot" },
    { de: "Herz", en: "heart" }, { de: "Gesundheits", en: "health" }, { de: "Krankheits", en: "illness" },
    { de: "Schmerz", en: "pain" }, { de: "Hilfe", en: "help" }, { de: "Ruhe", en: "rest" },
    { de: "Schlaf", en: "sleep" }, { de: "Sport", en: "sport" }, { de: "Training", en: "training" },
    { de: "Energie", en: "energy" },
  ],
  suffixes: [
    { de: "bereich", en: "area" }, { de: "gefühl", en: "feeling" }, { de: "hilfe", en: "help" },
    { de: "hinweis", en: "notice" }, { de: "kontrolle", en: "check" }, { de: "liste", en: "list" },
    { de: "messung", en: "measurement" }, { de: "pause", en: "break" }, { de: "plan", en: "plan" },
    { de: "punkt", en: "point" }, { de: "regel", en: "rule" }, { de: "ruhe", en: "rest" },
    { de: "schutz", en: "protection" }, { de: "status", en: "status" }, { de: "termin", en: "appointment" },
    { de: "training", en: "training" }, { de: "übung", en: "exercise" }, { de: "wert", en: "value" },
  ],
};

const natureBank: CompoundBank = {
  id: "nature",
  tags: ["nature", "things"],
  prefixes: [
    { de: "Natur", en: "nature" }, { de: "Baum", en: "tree" }, { de: "Blatt", en: "leaf" },
    { de: "Blumen", en: "flower" }, { de: "Gras", en: "grass" }, { de: "Erd", en: "earth" },
    { de: "Luft", en: "air" }, { de: "Feuer", en: "fire" }, { de: "Wind", en: "wind" },
    { de: "Himmels", en: "sky" }, { de: "Wolken", en: "cloud" }, { de: "Stern", en: "star" },
    { de: "Farb", en: "color" }, { de: "Papier", en: "paper" }, { de: "Stift", en: "pen" },
    { de: "Buch", en: "book" }, { de: "Heft", en: "notebook" }, { de: "Flaschen", en: "bottle" },
    { de: "Glas", en: "glass" }, { de: "Tassen", en: "cup" }, { de: "Messer", en: "knife" },
    { de: "Gabel", en: "fork" }, { de: "Löffel", en: "spoon" }, { de: "Teller", en: "plate" },
  ],
  suffixes: [
    { de: "bild", en: "image" }, { de: "box", en: "box" }, { de: "deckel", en: "lid" },
    { de: "ecke", en: "corner" }, { de: "farbe", en: "color" }, { de: "form", en: "shape" },
    { de: "griff", en: "handle" }, { de: "halter", en: "holder" }, { de: "karte", en: "card" },
    { de: "korb", en: "basket" }, { de: "liste", en: "list" }, { de: "mappe", en: "folder" },
    { de: "muster", en: "pattern" }, { de: "papier", en: "paper" }, { de: "platte", en: "plate" },
    { de: "punkt", en: "point" }, { de: "rand", en: "edge" }, { de: "seite", en: "side" },
    { de: "set", en: "set" }, { de: "stück", en: "piece" }, { de: "teil", en: "part" },
    { de: "wert", en: "value" }, { de: "zeichen", en: "sign" },
  ],
};

export const supplementalVocabulary: VocabItem[] = roundRobin(
  [
    compounds(businessBank),
    compounds(techBank),
    compounds(aiBank),
    compounds(lifestyleBank),
    compounds(travelBank),
    compounds(peopleBank),
    compounds(healthBank),
    compounds(natureBank),
  ],
  SUPPLEMENTAL_TARGET,
);
