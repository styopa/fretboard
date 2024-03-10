import { FretboardImage } from "./modules/fretboard.mjs";

const svg = document.getElementById('fretboard');
const rand_btn = document.getElementById('new_notes');
const play_btn = document.getElementById('play_btn');
const num_notes = document.getElementById('num_notes');
const fretboard = new FretboardImage(svg);

let intervalId = undefined;
play_btn.addEventListener('click', () => {
  document.getElementById('strike').textContent = 'Bootstrap';
  const bpm_spinner = document.getElementById('bpm');
  bpm_spinner.disabled = !bpm_spinner.disabled;

  if (intervalId === undefined) {
    const delay = 60000 / parseInt(bpm_spinner.value, 10);
    intervalId = setInterval(() => {
      //fretboard.nextMark();
    }, delay);
  } else {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}, false);

function randomizeNotes() {
  const n = parseInt(num_notes.value, 10);
  const notes = fretboard.selectRandomNotes(n);
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

rand_btn.addEventListener('click', randomizeNotes);
num_notes.addEventListener('change', randomizeNotes);