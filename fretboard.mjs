import { FretboardImage } from "./modules/fretboard.mjs";
import { Metronome } from "./modules/metronome.mjs";

const svg = document.getElementById('fretboard');
const btn_randomize = document.getElementById('new_notes');
const btn_play = document.getElementById('play_btn');
const input_num_notes = document.getElementById('num_notes');
const input_direction = document.getElementById('direction');
const input_bpm = document.getElementById('bpm');
const svg_fretboard = new FretboardImage(svg);

let intervalId = undefined;

function toggleForms() {
  [
    input_num_notes,
    btn_randomize,
    input_direction,
    input_bpm,
  ].map((elem) => elem.disabled = !elem.disabled);
}

function toggleMetronome() {
  toggleForms();
  btn_play.textContent = input_bpm.disabled ? 'Stop' : 'Play';

  if (intervalId === undefined) {
    svg_fretboard.markers.selectAll(false);
    const direction = parseInt(input_direction.value, 10);
    let start_forward, bounce;
    switch (direction) {
      case 1:
        start_forward = true, bounce = false;
        break;
      case -1:
        start_forward = false, bounce = false;
        break;
      default:
        start_forward = true, bounce = true;
    }
    const delay = 60000 / parseInt(bpm.value, 10);
    intervalId = setInterval(() => {
      const note = svg_fretboard.markers.selectNext(start_forward, bounce);
      metronome.play(note);
    }, delay);
  } else {
    clearInterval(intervalId);
    intervalId = undefined;
    svg_fretboard.markers.selectAll(true);
  }
}

function randomizeNotes() {
  const n = parseInt(input_num_notes.value, 10);
  const notes = svg_fretboard.selectRandomNotes(n);
  const selected_notes = document.getElementById('selected_notes');
  while (selected_notes.firstChild) {
    selected_notes.removeChild(selected_notes.firstChild);
  }
  for (const note of notes) {
    const span = document.createElement('span');
    const attr = document.createAttribute('class');
    attr.value = `rounded-2 px-2 py-1 ${note.toClassName()}`;
    span.setAttributeNode(attr);
    span.textContent = note;
    selected_notes.appendChild(span);
  }
}

let metronome = undefined;
btn_randomize.addEventListener('click', randomizeNotes);
input_num_notes.addEventListener('change', randomizeNotes);
btn_play.addEventListener('click', () => {
  if (metronome === undefined) metronome = new Metronome();
  toggleMetronome();
});
document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') randomizeNotes();
})