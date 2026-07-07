import { Volume2 } from "lucide-react";
import { useState } from "react";
import { speakGerman } from "../lib/speech";

type Props = {
  text: string;
  phonetic?: string;
  ascii?: string;
  rate?: number;
  block?: boolean;
};

export function SpeakableGerman({ text, phonetic, ascii, rate = 0.82, block = false }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    setSpeaking(true);
    speakGerman(text, rate, () => setSpeaking(false));
  };

  return (
    <span className={block ? "speak-block-wrap" : "speak-inline-wrap"}>
      <button
        className={`de ${speaking ? "speaking" : ""}`}
        type="button"
        onClick={speak}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            speak();
          }
        }}
        aria-label={`Hear ${text}`}
      >
        <span>{text}</span>
        <Volume2 size={14} aria-hidden="true" />
      </button>
      {ascii ? <code>{ascii}</code> : null}
      {phonetic ? <span className="phonetic">{phonetic}</span> : null}
    </span>
  );
}
