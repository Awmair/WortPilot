import {
  ArrowDownAZ,
  Bell,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Cloud,
  Download,
  FileText,
  Flame,
  GraduationCap,
  Home,
  MessageCircle,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AudioRecorder } from "./components/AudioRecorder";
import { SpeakableGerman } from "./components/SpeakableGerman";
import { TextWithGermanAudio } from "./components/TextWithGermanAudio";
import { lessons, quizQuestions, vocabulary } from "./data/course";
import { restoreProfileFromDrive, saveProfileToDrive } from "./lib/driveSync";
import { speakGerman } from "./lib/speech";
import { initVoices } from "./lib/speech";
import { createDefaultProfile, getProfile, normalizeProfile, replaceProfile, saveProfile } from "./lib/storage";
import type { Lesson, QuizQuestion, UserProfile, VocabItem } from "./types";

type View = "dashboard" | "lesson" | "quiz" | "vocab" | "practice" | "sync";
type SyncState = "unsynced" | "syncing" | "synced" | "issue";
type VocabFilter = "all" | "learned" | "locked";

const builtinClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function normalize(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

function now() {
  return new Date().toISOString();
}

function isCorrect(question: QuizQuestion, answer: string) {
  const clean = normalize(answer);
  return question.acceptable.some((accepted) => clean === normalize(accepted) || clean.includes(normalize(accepted)));
}

function learnedVocabLimit(profile: UserProfile) {
  const starterCount = vocabulary.filter((item) => (item.unlockStage ?? 0) === 0).length;
  const correctAnswers = profile.quizHistory.filter((item) => item.correct).length;
  return Math.min(
    vocabulary.length,
    starterCount +
      profile.courseProgress.completedLessonIds.length * 90 +
      correctAnswers * 12 +
      profile.courseProgress.streak * 5,
  );
}

function isVocabLearned(item: VocabItem, index: number, learnedLimit: number) {
  return (item.unlockStage ?? 0) === 0 || index < learnedLimit;
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function GermanList({ items, rate }: { items: { de: string; phonetic?: string; ascii?: string; en?: string }[]; rate: number }) {
  return (
    <div className="example-grid">
      {items.map((item) => (
        <div className="example" key={`${item.de}-${item.en}`}>
          <SpeakableGerman text={item.de} phonetic={item.phonetic} ascii={item.ascii} rate={rate} block />
          {item.en ? <p>{item.en}</p> : null}
        </div>
      ))}
    </div>
  );
}

function SmartText({ text, rate }: { text: string; rate: number }) {
  return <TextWithGermanAudio text={text} rate={rate} />;
}

function Dashboard({
  profile,
  setView,
  currentLesson,
}: {
  profile: UserProfile;
  setView: (view: View) => void;
  currentLesson: Lesson;
}) {
  const dueReviews = profile.reviewQueue.filter((item) => new Date(item.dueAt) <= new Date()).length;
  const correctAnswers = profile.quizHistory.filter((item) => item.correct).length;
  const lastSynced = profile.settings.lastSyncedAt ? new Date(profile.settings.lastSyncedAt).toLocaleString() : "Not synced";
  const quizPercent = Math.round((profile.quizHistory.length / quizQuestions.length) * 100);
  const studyCardTitle = currentLesson.id === "refresher" ? "Refresher quiz" : currentLesson.title;

  return (
    <main className="screen">
      <section className="hero">
        <div className="hero-copy">
          <div className="app-mark-row">
            <img src={`${import.meta.env.BASE_URL}app-icon.png`} alt="" className="app-icon" />
            <div>
              <p className="eyebrow">WortPilot</p>
              <p className="muted compact">Business German for AI freelancers</p>
            </div>
          </div>
          <h1>Build practical German with confidence.</h1>
          <p className="lead">One focused PWA for email German, business vocabulary, tap-to-hear pronunciation, talk-back practice, and Drive-backed progress.</p>
          <div className="hero-actions">
            <button className="primary" type="button" onClick={() => setView("lesson")}>
              <BookOpen size={18} />
              Continue lesson
            </button>
            <button type="button" onClick={() => setView("practice")}>
              <Mic size={18} />
              Speak back
            </button>
          </div>
        </div>

        <aside className="study-card" aria-label="Today's study card">
          <div className="study-card-top">
            <div>
              <p className="eyebrow">Today</p>
              <h2>{studyCardTitle}</h2>
            </div>
            <span className="sync-pill">
              <Cloud size={14} />
              Drive
            </span>
          </div>
          <SpeakableGerman text="Mit freundlichen Grüßen" phonetic="mit FROYND-likh-en GRUE-sen" ascii="Mit freundlichen Gruessen" rate={profile.settings.ttsRate} block />
          <div className="progress-shell" aria-label={`Quiz progress ${quizPercent}%`}>
            <span style={{ width: `${quizPercent}%` }} />
          </div>
          <div className="micro-grid">
            <span><Flame size={15} /> {profile.courseProgress.streak} streak</span>
            <span><GraduationCap size={15} /> {profile.quizHistory.length}/{quizQuestions.length} quiz</span>
            <span><Bell size={15} /> {dueReviews} due</span>
            <span><ShieldCheck size={15} /> local first</span>
          </div>
        </aside>
      </section>

      <section className="workflow-strip" aria-label="Learning workflow">
        <div>
          <BookOpen size={18} />
          <span>Learn</span>
        </div>
        <div>
          <CircleHelp size={18} />
          <span>Recall</span>
        </div>
        <div>
          <MessageCircle size={18} />
          <span>Write</span>
        </div>
        <div>
          <Mic size={18} />
          <span>Speak</span>
        </div>
        <div>
          <Cloud size={18} />
          <span>Sync</span>
        </div>
      </section>

      <section className="stats-row">
        <Stat label="Streak" value={profile.courseProgress.streak} />
        <Stat label="Due reviews" value={dueReviews} />
        <Stat label="Quiz ✓" value={correctAnswers} />
        <Stat label="Weak points" value={profile.weakPoints.length} />
      </section>

      <section className="panel next-panel">
        <div>
          <p className="eyebrow">Next action</p>
          <h2>{currentLesson.title}</h2>
          <p><SmartText text={currentLesson.lead} rate={profile.settings.ttsRate} /></p>
        </div>
        <button className="primary" type="button" onClick={() => setView("lesson")}>
          <BookOpen size={18} />
          Open lesson
        </button>
      </section>

      <section className="grid-2">
        <button className="tile" type="button" onClick={() => setView("quiz")}>
          <CircleHelp />
          <span>Refresher quiz</span>
          <small>{profile.quizHistory.length}/{quizQuestions.length} answered</small>
        </button>
        <button className="tile" type="button" onClick={() => setView("vocab")}>
          <ArrowDownAZ />
          <span>Vocabulary bank</span>
          <small>{vocabulary.length} total words</small>
        </button>
        <button className="tile featured" type="button" onClick={() => setView("lesson")}>
          <FileText />
          <span>Email format coach</span>
          <small>salutations, commas, sign-offs</small>
        </button>
        <button className="tile" type="button" onClick={() => setView("practice")}>
          <Mic />
          <span>Talk-back practice</span>
          <small>TTS + local recording</small>
        </button>
        <button className="tile" type="button" onClick={() => setView("sync")}>
          <Cloud />
          <span>Drive profile</span>
          <small>{lastSynced}</small>
        </button>
      </section>

      <section className="insight-panel">
        <div>
          <Sparkles size={18} />
          <strong>Weak-point radar</strong>
        </div>
        <p>
          {profile.weakPoints.length
            ? profile.weakPoints.map((item) => item.label).join(" · ")
            : "Ready to watch: schreiben vs sprechen · kaufen · Kunde · heute · salutation commas"}
        </p>
      </section>
    </main>
  );
}

function LessonView({
  lesson,
  profile,
  onComplete,
}: {
  lesson: Lesson;
  profile: UserProfile;
  onComplete: () => void;
}) {
  return (
    <main className="screen lesson">
      <section className="lesson-head">
        <p className="eyebrow">{lesson.eyebrow}</p>
        <h1>{lesson.title}</h1>
        <p className="lead"><SmartText text={lesson.lead} rate={profile.settings.ttsRate} /></p>
        <div className="hero-phrase">
          <SpeakableGerman text={lesson.hero.de} phonetic={lesson.hero.phonetic} ascii={lesson.hero.ascii} rate={profile.settings.ttsRate} block />
        </div>
        <div className="callout">Tap any green German word or phrase to hear it.</div>
      </section>

      <section className="panel why">
        <h2>Why this matters</h2>
        <p><SmartText text={lesson.why} rate={profile.settings.ttsRate} /></p>
      </section>

      {lesson.sections.map((section) => (
        <section className="panel" key={section.title}>
          <h2>{section.title}</h2>
          <p><SmartText text={section.body} rate={profile.settings.ttsRate} /></p>
          <GermanList items={section.examples} rate={profile.settings.ttsRate} />
        </section>
      ))}

      <section className="panel">
        <h2>Words you just banked</h2>
        <GermanList items={lesson.sections.flatMap((section) => section.examples)} rate={profile.settings.ttsRate} />
      </section>

      <section className="panel recap">
        <h2>Recap</h2>
        <ul>
          {lesson.recap.map((item) => (
            <li key={item}><SmartText text={item} rate={profile.settings.ttsRate} /></li>
          ))}
        </ul>
        <p className="next-line"><SmartText text={`Next: ${lesson.next}`} rate={profile.settings.ttsRate} /></p>
        <button className="primary" type="button" onClick={onComplete}>
          <CheckCircle2 size={18} />
          Mark complete
        </button>
      </section>
    </main>
  );
}

function QuizView({
  profile,
  setProfile,
}: {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const latestByQuestion = new Map(profile.quizHistory.map((record) => [record.questionId, record]));

  async function submit(question: QuizQuestion) {
    const answer = answers[question.id] ?? "";
    const correct = isCorrect(question, answer);
    const updatedAt = now();
    const quizRecord = {
      id: `${question.id}-${updatedAt}`,
      questionId: question.id,
      answer,
      correct,
      updatedAt,
    };
    const weakPoints = correct || !question.weakPoint
      ? profile.weakPoints
      : [
          ...profile.weakPoints.filter((item) => item.id !== question.weakPoint),
          {
            id: question.weakPoint,
            label: question.weakPoint,
            misses: (profile.weakPoints.find((item) => item.id === question.weakPoint)?.misses ?? 0) + 1,
            updatedAt,
          },
        ];
    const reviewQueue = [
      ...profile.reviewQueue.filter((item) => item.id !== question.id),
      {
        id: question.id,
        dueAt: new Date(Date.now() + (correct ? 3 : 1) * 86400000).toISOString(),
        intervalDays: correct ? 3 : 1,
        updatedAt,
      },
    ];
    const next = {
      ...profile,
      updatedAt,
      quizHistory: [...profile.quizHistory.filter((item) => item.questionId !== question.id), quizRecord],
      weakPoints,
      reviewQueue,
      courseProgress: {
        ...profile.courseProgress,
        streak: profile.courseProgress.streak + 1,
        lastStudiedAt: updatedAt,
      },
    };
    await saveProfile(next);
    setProfile(next);
  }

  return (
    <main className="screen">
      <section className="page-title">
        <p className="eyebrow">Active recall</p>
        <h1>Refresher quiz</h1>
        <p className="lead">Weighted toward weak points from the handoff. Answer, check, then drill misses.</p>
      </section>

      <div className="quiz-list">
        {quizQuestions.map((question, index) => {
          const result = latestByQuestion.get(question.id);
          return (
            <section className={`panel quiz-card ${result ? (result.correct ? "correct" : "wrong") : ""}`} key={question.id}>
              <div className="quiz-top">
                <span>{index + 1}</span>
                <strong>{question.type}</strong>
              </div>
              <p><SmartText text={question.prompt} rate={profile.settings.ttsRate} /></p>
              {question.german ? <GermanList items={question.german} rate={profile.settings.ttsRate} /> : null}
              {question.choices ? (
                <div className="segmented">
                  {question.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => {
                        setAnswers((old) => ({ ...old, [question.id]: choice }));
                        if (vocabulary.some((item) => item.de === choice || item.ascii === choice)) {
                          speakGerman(choice, profile.settings.ttsRate);
                        }
                      }}
                    >
                      <SmartText text={choice} rate={profile.settings.ttsRate} />
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                value={answers[question.id] ?? result?.answer ?? ""}
                onChange={(event) => setAnswers((old) => ({ ...old, [question.id]: event.target.value }))}
                placeholder="Type your answer"
              />
              <div className="button-row">
                <button className="primary" type="button" onClick={() => submit(question)}>
                  Check
                </button>
                {result ? <span className={result.correct ? "ok" : "bad"}>{result.correct ? "✓ Correct" : "✗ Drill this"}</span> : null}
              </div>
              {result ? <p className="explanation"><SmartText text={question.explanation} rate={profile.settings.ttsRate} /></p> : null}
            </section>
          );
        })}
      </div>
    </main>
  );
}

function VocabView({ profile }: { profile: UserProfile }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VocabFilter>("learned");
  const learnedLimit = learnedVocabLimit(profile);
  const vocabWithState = vocabulary.map((item, index) => ({
    item,
    learned: isVocabLearned(item, index, learnedLimit),
  }));
  const learnedCount = vocabWithState.filter(({ learned }) => learned).length;
  const lockedCount = vocabulary.length - learnedCount;
  const filtered = vocabWithState
    .filter(({ learned }) => filter === "all" || (filter === "learned" ? learned : !learned))
    .filter(({ item }) => {
      const haystack = `${item.de} ${item.ascii ?? ""} ${item.en ?? ""} ${item.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });

  return (
    <main className="screen">
      <section className="page-title">
        <p className="eyebrow">Banked words</p>
        <h1>Vocabulary</h1>
        <p className="lead">General, lifestyle, internet, tech, AI, business, email, and weak-point words. Every German item speaks.</p>
      </section>
      <div className="vocab-toolbar">
        <div className="segmented vocab-filter" aria-label="Vocabulary filter">
          {[
            ["all", `All ${vocabulary.length}`],
            ["learned", `Learned ${learnedCount}`],
            ["locked", `Locked ${lockedCount}`],
          ].map(([name, label]) => (
            <button
              className={filter === name ? "active" : ""}
              key={name}
              type="button"
              onClick={() => setFilter(name as VocabFilter)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search German, English, or tag" />
        </label>
      </div>
      <section className="vocab-list">
        {filtered.map(({ item, learned }) => (
          <article className={`vocab-card ${item.weak ? "weak" : ""} ${learned ? "" : "locked"}`} key={item.id}>
            <div className="vocab-card-top">
              <SpeakableGerman text={item.de} phonetic={item.phonetic} ascii={item.ascii} rate={profile.settings.ttsRate} block />
              <span className={`vocab-state ${learned ? "learned" : "locked"}`}>{learned ? "Learned" : "Locked"}</span>
            </div>
            <p>{item.en}</p>
            <div className="tags">
              {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
              {!learned ? <span>unlocks later</span> : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function PracticeView({ profile }: { profile: UserProfile }) {
  const phrases = [
    { de: "Mit freundlichen Grüßen", phonetic: "mit FROYND-likh-en GRUE-sen" },
    { de: "Sehr geehrte Frau Weber,", phonetic: "zayr guh-AIR-tuh frow VAY-ber" },
    { de: "Sehr geehrter Herr Klein,", phonetic: "zayr guh-AIR-ter hair kline" },
    { de: "Ich schreibe Ihnen heute.", phonetic: "ikh SHRY-buh EE-nen HOY-tuh" },
  ];
  return (
    <main className="screen">
      <section className="page-title">
        <p className="eyebrow">Pronunciation loop</p>
        <h1>Talk-back practice</h1>
        <p className="lead">The app speaks, you record, then you compare. Recordings are local-only.</p>
      </section>
      {phrases.map((phrase) => (
        <AudioRecorder key={phrase.de} phrase={phrase.de} phonetic={phrase.phonetic} rate={profile.settings.ttsRate} />
      ))}
    </main>
  );
}

function SyncView({
  profile,
  setProfile,
}: {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}) {
  const [clientId, setClientId] = useState(profile.settings.googleClientId ?? builtinClientId ?? "");
  const [syncState, setSyncState] = useState<SyncState>(profile.settings.lastSyncedAt ? "synced" : "unsynced");
  const [status, setStatus] = useState("Unsynced changes stay on this device until you save and sync.");
  const fileInput = useRef<HTMLInputElement | null>(null);

  async function saveClientId() {
    const next = { ...profile, settings: { ...profile.settings, googleClientId: clientId } };
    await saveProfile(next);
    setProfile(next);
    setSyncState("unsynced");
    setStatus("Google client ID saved locally.");
  }

  async function saveAndSync() {
    setSyncState("syncing");
    setStatus("Opening Google sign-in...");
    try {
      const next = await saveProfileToDrive({ ...profile, settings: { ...profile.settings, googleClientId: clientId } }, clientId);
      await replaceProfile(next);
      setProfile(next);
      setSyncState("synced");
      setStatus("Synced to your hidden Google Drive app data file.");
    } catch (error) {
      setSyncState("issue");
      setStatus(error instanceof Error ? error.message : "Sync issue. Your local data is still safe on this device.");
    }
  }

  async function restoreFromDrive() {
    setSyncState("syncing");
    setStatus("Opening Google sign-in...");
    try {
      const restored = await restoreProfileFromDrive(clientId);
      const next = normalizeProfile({
        ...restored,
        settings: {
          ...restored.settings,
          googleClientId: clientId,
        },
      });
      await replaceProfile(next);
      setProfile(next);
      setSyncState("synced");
      setStatus("Restored from Drive. Local profile was replaced with the Drive copy.");
    } catch (error) {
      setSyncState("issue");
      setStatus(error instanceof Error ? error.message : "Restore issue. Your local data was not changed.");
    }
  }

  function exportJson() {
    downloadFile("german-learning-profile.json", JSON.stringify(profile, null, 2), "application/json");
  }

  async function importJson(file: File) {
    try {
      const text = await file.text();
      const next = normalizeProfile(JSON.parse(text));
      await replaceProfile(next);
      setProfile(next);
      setSyncState("unsynced");
      setStatus("Profile imported locally. Tap Save & Sync when you want to back it up.");
    } catch {
      setSyncState("issue");
      setStatus("Import issue. That JSON file could not be used, and local data was not changed.");
    }
  }

  function exportCalendar() {
    const start = new Date();
    start.setHours(profile.settings.reminderHour, 0, 0, 0);
    const stamp = start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "UID:german-pro-daily-review",
      `DTSTART:${stamp}`,
      "RRULE:FREQ=DAILY",
      "SUMMARY:German review",
      "DESCRIPTION:Open German Pro and clear due reviews.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    downloadFile("german-review-reminder.ics", ics, "text/calendar");
  }

  return (
    <main className="screen">
      <section className="page-title">
        <p className="eyebrow">Profile</p>
        <h1>Google Drive sync</h1>
        <p className="lead">Uses a hidden app data file. It stores progress, quiz history, weak points, settings, and review queue. Audio recordings stay local.</p>
      </section>

      <section className="panel">
        <h2>Drive setup</h2>
        <p className="muted">Add your Google OAuth browser client ID. No client secret is used. On GitHub Pages, this can also come from the `VITE_GOOGLE_CLIENT_ID` repository secret.</p>
        <input value={clientId} onChange={(event) => setClientId(event.target.value)} placeholder="Google OAuth web client ID" />
        <div className="button-row">
          <button type="button" onClick={saveClientId}>Save ID</button>
          <button className="primary" type="button" onClick={saveAndSync} disabled={!clientId || syncState === "syncing"}>
            <Cloud size={18} />
            Save & Sync
          </button>
          <button type="button" onClick={restoreFromDrive} disabled={!clientId || syncState === "syncing"}>
            <Download size={18} />
            Restore from Drive
          </button>
        </div>
        <p className={`sync-state ${syncState}`}>{syncState === "issue" ? "Sync issue" : syncState === "syncing" ? "Syncing" : syncState === "synced" ? "Synced" : "Unsynced"}</p>
        {status ? <p className="status">{status}</p> : null}
        <p className="muted">Last sync: {profile.settings.lastSyncedAt ? new Date(profile.settings.lastSyncedAt).toLocaleString() : "never"}</p>
      </section>

      <section className="panel">
        <h2>Backup</h2>
        <div className="button-row">
          <button type="button" onClick={exportJson}>
            <Download size={18} />
            Export JSON
          </button>
          <button type="button" onClick={() => fileInput.current?.click()}>
            <Upload size={18} />
            Import JSON
          </button>
          <button type="button" onClick={exportCalendar}>
            <Bell size={18} />
            Calendar reminder
          </button>
        </div>
        <input
          ref={fileInput}
          className="hidden"
          type="file"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) importJson(file);
          }}
        />
      </section>
    </main>
  );
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => createDefaultProfile());
  const [view, setView] = useState<View>("dashboard");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initVoices();
    getProfile().then((stored) => {
      setProfile(stored);
      setReady(true);
    });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
    }
  }, []);

  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === profile.courseProgress.currentLessonId) ?? lessons[0],
    [profile.courseProgress.currentLessonId]
  );

  async function completeLesson() {
    const nextLesson = currentLesson.id === "refresher" ? "module-2-step-3" : currentLesson.id;
    const next = {
      ...profile,
      courseProgress: {
        ...profile.courseProgress,
        currentLessonId: nextLesson,
        completedLessonIds: [...new Set([...profile.courseProgress.completedLessonIds, currentLesson.id])],
        streak: profile.courseProgress.streak + 1,
        lastStudiedAt: now(),
      },
    };
    await saveProfile(next);
    setProfile(next);
    setView("dashboard");
  }

  if (!ready) {
    return <main className="loading">Loading WortPilot...</main>;
  }

  return (
    <div className="app">
      <nav className="topbar" aria-label="Primary navigation">
        <div className="nav-actions">
          {[
            ["dashboard", "Home", Home],
            ["lesson", "Lesson", BookOpen],
            ["quiz", "Quiz", CircleHelp],
            ["vocab", "A-Z", ArrowDownAZ],
            ["practice", "Speak", Mic],
            ["sync", "Sync", Cloud],
          ].map(([name, label, Icon]) => (
            <button
              key={name as string}
              className={view === name ? "active" : ""}
              type="button"
              onClick={() => setView(name as View)}
              title={label as string}
              aria-label={label as string}
            >
              <Icon size={18} />
              <span className="nav-label">{label as string}</span>
            </button>
          ))}
        </div>
      </nav>

      {view === "dashboard" ? <Dashboard profile={profile} currentLesson={currentLesson} setView={setView} /> : null}
      {view === "lesson" ? <LessonView lesson={currentLesson} profile={profile} onComplete={completeLesson} /> : null}
      {view === "quiz" ? <QuizView profile={profile} setProfile={setProfile} /> : null}
      {view === "vocab" ? <VocabView profile={profile} /> : null}
      {view === "practice" ? <PracticeView profile={profile} /> : null}
      {view === "sync" ? <SyncView profile={profile} setProfile={setProfile} /> : null}
    </div>
  );
}
