import { vocabulary } from "../data/course";
import { SpeakableGerman } from "./SpeakableGerman";

type Props = {
  text: string;
  rate: number;
};

const terms = vocabulary
  .flatMap((item) => [
    { text: item.de, phonetic: item.phonetic, ascii: item.ascii },
    ...(item.ascii ? [{ text: item.ascii, phonetic: item.phonetic, ascii: undefined }] : []),
  ])
  .sort((a, b) => b.text.length - a.text.length);

export function TextWithGermanAudio({ text, rate }: Props) {
  const parts: Array<string | { text: string; phonetic?: string; ascii?: string }> = [];
  let index = 0;

  while (index < text.length) {
    const match = terms.find((term) => {
      if (!text.startsWith(term.text, index)) return false;
      const before = index === 0 ? " " : text[index - 1];
      const after = text[index + term.text.length] ?? " ";
      return !/[A-Za-zÄÖÜäöüß]/.test(before) && !/[A-Za-zÄÖÜäöüß]/.test(after);
    });

    if (match) {
      parts.push(match);
      index += match.text.length;
    } else {
      const next = terms
        .map((term) => text.indexOf(term.text, index + 1))
        .filter((position) => position > -1)
        .sort((a, b) => a - b)[0];
      const end = next ?? text.length;
      parts.push(text.slice(index, end));
      index = end;
    }
  }

  return (
    <>
      {parts.map((part, partIndex) =>
        typeof part === "string" ? (
          <span key={`${partIndex}-${part}`}>{part}</span>
        ) : (
          <SpeakableGerman
            key={`${partIndex}-${part.text}`}
            text={part.text}
            phonetic={part.phonetic}
            ascii={part.ascii}
            rate={rate}
          />
        )
      )}
    </>
  );
}
