let germanVoice: SpeechSynthesisVoice | undefined;

function findGermanVoice() {
  if (!("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  germanVoice =
    voices.find((voice) => /google/i.test(voice.name) && /de[-_]/i.test(voice.lang)) ??
    voices.find((voice) => /de[-_]/i.test(voice.lang)) ??
    voices.find((voice) => /german|deutsch/i.test(voice.name));
  return germanVoice;
}

export function initVoices() {
  findGermanVoice();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = findGermanVoice;
  }
}

export function speakGerman(text: string, rate = 0.82, onDone?: () => void) {
  if (!("speechSynthesis" in window)) {
    onDone?.();
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/\n/g, ". "));
  utterance.lang = "de-DE";
  utterance.rate = rate;
  utterance.voice = germanVoice ?? findGermanVoice() ?? null;
  utterance.onend = () => onDone?.();
  utterance.onerror = () => onDone?.();
  window.speechSynthesis.speak(utterance);
  return true;
}
