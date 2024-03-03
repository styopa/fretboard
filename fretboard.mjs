import { addChild, addText } from "./modules/dom.mjs";
import { FretboardImage } from "./modules/fretboard.mjs";
import { Note, Tuning } from "./modules/note.mjs";

function onNoteSelect(evt) {
  const digits = evt.currentTarget.id.match(/\d+/)[0];
  const note = Note.all[parseInt(digits, 10)];
  fretboard.mark(note);
  document.getElementById('play_btn').disabled = false;
}

const container = document.getElementById('fretboard_container');
const fretboard = new FretboardImage(Tuning.sixStringStandard());
container.appendChild(fretboard.element);
const play_btn = document.getElementById('play_btn');
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
