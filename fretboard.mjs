import { addChild } from "./modules/dom.mjs";
import { FretboardImage } from "./modules/fretboard.mjs";
import { Notes } from "./modules/note.mjs";

class GuitarString {
  gauge;
  open_note;
  name;

  static* sixStringStandard(notes) {
    const six_string = [
      [.011, 4],
      [.014, 11],
      [.018, 7],
      [.028, 2],
      [.038, 9],
      [.049, 4]
    ];
    for (const args of six_string) {
      yield new GuitarString(args[0], notes.all[args[1]]);
    }
  }

  constructor(gauge, open_note) {
    this.gauge = gauge;
    this.open_note = open_note;
    this.name = `${open_note.index}`;
  }

  fretFromNote(note) {
    return 12 + (note - this.open_note - 12) % 12;
  }
}

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
  fretboard.draw();
  addButtons();
}, false);

const notes = new Notes();
const fretboard = new FretboardImage(
  document.getElementById('fretboard'),
  Array.from(GuitarString.sixStringStandard(notes))
);
const play_btn = document.getElementById('play_btn');
let intervalId = undefined;
play_btn.addEventListener('click', () => {
  document.getElementById('strike').textContent = 'Bootstrap';
  const bpm_spinner = document.getElementById('bpm');
  bpm_spinner.disabled = !bpm_spinner.disabled;

  if (intervalId === undefined) {
    const delay = 60000 / parseInt(bpm_spinner.value, 10);
    intervalId = setInterval(() => {
      fretboard.nextMark();
    }, delay);
  } else {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}, false);
