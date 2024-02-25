import { addChild, addText, addAttr } from "./modules/dom.mjs";
import { FretboardImage } from "./modules/fretboard.mjs";
import { Notes } from "./modules/note.mjs";

function onNoteSelect(evt) {
  const digits = evt.currentTarget.id.match(/\d+/)[0];
  const note = notes.all[parseInt(digits, 10)];
  fretboard.mark(note);
  document.getElementById('play_btn').disabled = false;
}

function addButtons() {
  const radios = document.getElementById('note_radios');
  for (const note of notes.all) {
    const id = `note_radio_${+note}`;
    const radio = addChild(radios, 'input', {
      type: 'radio',
      class: 'btn-check',
      name: 'notes',
      id: id,
      autocomplete: 'off'
    });
    addChild(radios, 'label', {
      class: 'btn btn-outline-primary',
      for: id
    }, note);
    radio.addEventListener('change', onNoteSelect);
  }
}

window.addEventListener('load', () => {
  addButtons();
}, false);

const notes = new Notes();
const container = document.getElementById('fretboard_container');
const fretboard = new FretboardImage(notes);
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
