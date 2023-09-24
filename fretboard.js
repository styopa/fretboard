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

class Notes {
  static {
    Notes.all = 'C C♯ D D♯ E F F♯ G G♯ A B♭ B'.split(' ');
    Notes.natural = Notes.all.filter(str => str.length == 1);
    Notes.id_prefix = 'note_radio_'
  }

  static toId(name) {
    return Notes.id_prefix + Notes.all.indexOf(name);
  }

  static fromId(id) {
    return parseInt(id.replace(Notes.id_prefix, ''), 10);
  }
}

class GuitarString {
  gauge;
  #note;

  constructor(gauge, open_note) {
    this.gauge = gauge;
    this.#note = open_note;
  }

  fretFromNote(note) {
    return 12 + (note - this.#note - 12) % 12;
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
    const six_string = [
      [.011, 4],
      [.014, 11],
      [.018, 7],
      [.028, 2],
      [.038, 9],
      [.049, 4]
    ];
    for (const args of six_string) {
      this.#strings.push(new GuitarString(...args));
    }

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
}

function onNoteSelect(evt) {
  console.log(Notes.fromId(evt.currentTarget.id));
  fretboard.mark(2);
}

function addButtons() {
  const radios = document.getElementById('note_radios');
  for (const note of Notes.all) {
    const id = Notes.toId(note);
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

window.addEventListener('load', function () {
  fretboard.draw();
  addButtons();
}, false);

fretboard = new Fretboard(document.getElementById('fretboard'));
