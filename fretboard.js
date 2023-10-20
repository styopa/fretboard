function addAttr(element, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  element.setAttributeNode(attr);
}

function addChild(parnt, child_name, attrs, text) {
  const child = document.createElement(child_name);
  for (const name in attrs) {
    addAttr(child, name, attrs[name]);
  }
  if (text !== undefined) {
    child.appendChild(document.createTextNode(text));
  }
  parnt.appendChild(child);
  return child;
}

function addText(parnt, text) {
  parnt.appendChild(document.createTextNode(text));
}

class Note {
  #name;
  #index;

  static {
    Note.names = 'C C♯ D D♯ E F F♯ G G♯ A B♭ B'.split(' ');
    //Note.natural = Note.names.filter(str => str.length == 1);
  }

  static* all() {
    for (const name of Note.names) {
      yield new Note(name);
    }
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return this.#index;
      default:
        return this.#name;
    }
  }

  constructor(value) {
    let i = undefined;
    switch (typeof value) {
      case 'number':
        i = value;
        break;
      case 'string':
        i = Note.names.indexOf(value.toUpperCase());
        break;
      default:
        throw new TypeError(value);
    }

    this.#index = i;
    this.#name = Note.names[i];
  }
}

class GuitarString {
  gauge;
  #open_note;
  name;

  static* sixStringStandard() {
    const six_string = [
      [.011, 4],
      [.014, 11],
      [.018, 7],
      [.028, 2],
      [.038, 9],
      [.049, 4]
    ];
    for (const args of six_string) {
      yield new GuitarString(...args);
    }
  }

  constructor(gauge, open_note) {
    this.gauge = gauge;
    const note = new Note(open_note);
    this.#open_note = note
    this.name = `${note}`;
  }

  fretFromNote(note) {
    return 12 + (note - this.#open_note - 12) % 12;
  }
}

class Fretboard {
  #svg;
  #width;
  #height;
  #margin;
  #fret_x;
  #string_y;
  #marks;
  #strings;
  #current_mark;

  constructor(svg) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    this.#margin = 20;
    this.#width = dimensions[2];
    this.#height = dimensions[3];

    // precalculate positions
    this.#fret_x = []
    const width_12_frets = this.#width - this.#margin * 2;
    for (let i = 1; i < 13; i++) {
      const nut_to_fret = width_12_frets * (2 - 1.059463 ** (12 - i));
      this.#fret_x[i] = this.#margin + nut_to_fret;
    }

    this.#string_y = []
    for (let i = 0; i < 6; i++) {
      this.#string_y[i] = this.#height / 7 * (i + 1);
    }

    this.#strings = [];
    for (const string of GuitarString.sixStringStandard()) {
      this.#strings.push(string);
    }
    this.#current_mark = 0;

    this.#marks = [];
  }

  draw() {
    const nut = this.addLine(true, this.#margin, 'nut');
    addAttr(nut, 'stroke-width', 8);

    this.addInlays();

    // draw frets
    for (let i = 1; i < 13; i++) {
      const x = this.#fret_x[i];
      const fret = this.addLine(true, x, 'fret');
      addAttr(fret, 'stroke-width', 4);
    }

    // draw strings
    let i = 0;
    for (const string of this.#strings) {
      let line = this.addLine(false, this.#string_y[i], 'string');
      addAttr(line, 'stroke-width', string.gauge * 50);
      let mark = this.addSvgChild(this.#svg, 'circle', {r: 8, class: 'mark', cy: this.#string_y[i]});
      this.#marks.push(mark);
      i++;
    }
  }

  addLine(vertical, pos, cls) {
    const params = vertical ?
      [pos, 0, 'V', this.#height] :
      [0, pos, 'H', this.#width];
    params.unshift('M');
    return this.addSvgChild(this.#svg, 'path', {
      d: params.join(' '),
      class: cls
    });
  }

  addSvgChild(parnt, child_name, attrs) {
    const child = document.createElementNS(
      'http://www.w3.org/2000/svg',
      child_name
    );
    for (const name in attrs) {
      addAttr(child, name, attrs[name]);
    }
    parnt.appendChild(child);
    return child;
  }

  getInlayX(i) {
    return (this.#fret_x[i] + this.#fret_x[i - 1]) / 2;
  }

  addInlays() {
    const inlay_attrs = {
      cx: undefined,
      cy: this.#height / 2,
      r: 4,
      class: 'inlay'
    }

    for (let i of [3, 5, 7, 9]) {
      inlay_attrs.cx = this.getInlayX(i);
      this.addSvgChild(this.#svg, 'circle', inlay_attrs);
    }

    // double inlay on 12th fret
    inlay_attrs.cx = this.getInlayX(12);
    const inlay_y = this.#height * 5 / 14;
    for (const y of [inlay_y, this.#height - inlay_y]) {
      inlay_attrs.cy = y;
      this.addSvgChild(this.#svg, 'circle', inlay_attrs);
    }
  }

  mark(note) {
    let i = 0;

    for (let string of this.#strings) {
      let fret = string.fretFromNote(note);
      let mark = this.#marks[i++];
      mark.style.visibility = 'hidden';
      mark.setAttribute('cx', this.#fret_x[fret] - mark.getAttribute('r'));
      mark.style.visibility = 'visible';
    }
  }

  nextMark() {
    this.#marks[this.#current_mark].classList.remove('hilite');
    const max = this.#marks.length;
    this.#current_mark = (--(this.#current_mark) % max + max) % max;
    this.#marks[this.#current_mark].classList.add('hilite');
  }
}

function onNoteSelect(evt) {
  const digits = evt.currentTarget.id.match(/\d+/)[0];
  const note = new Note(parseInt(digits, 10));
  fretboard.mark(note);
  document.getElementById('play_btn').disabled = false;
}

function addButtons() {
  const radios = document.getElementById('note_radios');
  for (const note of Note.all()) {
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

const fretboard = new Fretboard(document.getElementById('fretboard'));
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
