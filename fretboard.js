function addAttr(element, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  element.setAttributeNode(attr);
}

function addChild(parnt, child_name, attrs, text) {
  const child = document.createElement(child_name);
  for (let name in attrs) {
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
  }

  static toId(label) {
    return label.toLowerCase()
      .replaceAll('♯', 'sharp')
      .replaceAll('♭', 'flat');
  }
}

class Fretboard {
  #svg;
  #width;
  #height;
  #margin;

  constructor(svg) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    this.#margin = 20;
    this.#width = dimensions[2];
    this.#height = dimensions[3];

    const nut = this.addLine(true, this.#margin, 'nut');
    addAttr(nut, 'stroke-width', 8);

    this.addInlays();

    // draw frets
    for (let i = 1; i < 13; i++) {
      let x = this.getFretX(i);
      //console.log(`Fret ${i} distance from nut ${Math.round(x)}`);
      let fret = this.addLine(true, x, 'fret');
      addAttr(fret, 'stroke-width', 4);
    }

    // draw strings
    const gauges = [.011, .014, .018, .028, .038, .049];
    for (let i = 0; i < 6; i++) {
      let str = this.addLine(false, this.getStringY(i + 1), 'string');
      addAttr(str, 'stroke-width', gauges[i] * 50);
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

  getFretX(i) {
    const len_12_frets = this.#width - this.#margin * 2;
    const len_from_nut = len_12_frets * (2 - 1.059463 ** (12 - i));
    return this.#margin + len_from_nut;
  }

  getStringY(i) {
    return this.#height / 7 * i;
  }

  addSvgChild(parnt, child_name, attrs) {
    const child = document.createElementNS(
      'http://www.w3.org/2000/svg',
      child_name
    );
    for (let name in attrs) {
      addAttr(child, name, attrs[name]);
    }
    parnt.appendChild(child);
    return child;
  }

  getInlayX(i) {
    return (this.getFretX(i) + this.getFretX(i - 1)) / 2;
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
    let inlay_y = this.#height * 5 / 14;
    for (let y of [inlay_y, this.#height - inlay_y]) {
      inlay_attrs.cy = y;
      this.addSvgChild(this.#svg, 'circle', inlay_attrs);
    }
  }
}

function addButtons() {
  const radios = document.getElementById('note_radios');
  for (let note of Notes.all) {
    let id = Notes.toId(note);
    addChild(radios, 'input', {
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
  }
}

window.addEventListener('load', function () {
  const svg = document.getElementById('fretboard');
  const f = new Fretboard(svg);
  addButtons();
}, false);
