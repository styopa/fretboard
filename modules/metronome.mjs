import { Note } from "./note.mjs";

export class Metronome {
  #oscillator;
  #gain;
  #context;
  #a_aeolian;

  constructor() {
    this.#a_aeolian = Array.from(Note.all.since(Note.fromSymbol('A')));
    this.#context = new window.AudioContext();

    this.#gain = new GainNode(this.#context);
    this.#gain.connect(this.#context.destination);
    this.#gain.gain.setValueAtTime(0, this.#context.currentTime);

    this.#oscillator = new OscillatorNode(this.#context);
    this.#oscillator.connect(this.#gain);
    this.#oscillator.start();
  }

  play(note) {
    const i = this.#a_aeolian.indexOf(note);
    const freq = 440 * (2 ** (1 / 12)) ** i;
    const smoothing_interval = 0.02;
    const length = 0.1;
    const now = this.#context.currentTime;

    this.#oscillator.frequency.setValueAtTime(freq, now);
    this.#gain.gain.setTargetAtTime(1, now, smoothing_interval);
    this.#gain.gain.setTargetAtTime(0, now + length, smoothing_interval);
  }
}
