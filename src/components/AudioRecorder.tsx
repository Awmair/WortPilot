import { Mic, Play, Square, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { SpeakableGerman } from "./SpeakableGerman";

type Props = {
  phrase: string;
  phonetic?: string;
  rate: number;
};

export function AudioRecorder({ phrase, phonetic, rate }: Props) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [rating, setRating] = useState<string>("Not rated");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const next = new MediaRecorder(stream);
    chunks.current = [];
    next.ondataavailable = (event) => chunks.current.push(event.data);
    next.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks.current, { type: next.mimeType || "audio/webm" });
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
      setRecording(false);
    };
    recorder.current = next;
    next.start();
    setRecording(true);
  }

  function stop() {
    recorder.current?.stop();
  }

  return (
    <section className="panel practice-panel">
      <div>
        <p className="eyebrow">Talk-back</p>
        <h2>Hear it, say it, replay it</h2>
      </div>
      <SpeakableGerman text={phrase} phonetic={phonetic} rate={rate} block />
      <div className="button-row">
        <button className="primary" type="button" onClick={recording ? stop : start}>
          {recording ? <Square size={18} /> : <Mic size={18} />}
          {recording ? "Stop" : "Record"}
        </button>
        {audioUrl ? (
          <>
            <button type="button" onClick={() => new Audio(audioUrl).play()}>
              <Play size={18} />
              Play mine
            </button>
            <button type="button" onClick={() => setAudioUrl(undefined)}>
              <Trash2 size={18} />
              Delete
            </button>
          </>
        ) : null}
      </div>
      <div className="segmented" aria-label="Pronunciation self rating">
        {["Good", "Unsure", "Retry"].map((item) => (
          <button
            key={item}
            className={rating === item ? "active" : ""}
            type="button"
            onClick={() => setRating(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="muted">Recording stays on this device. Drive sync stores progress only.</p>
    </section>
  );
}
