import { addAttr } from "./dom.mjs";

class CustomSvgElement {
  static svg_ns = 'http://www.w3.org/2000/svg';

  element;

  static createElement(name, attributes) {
    const element = document.createElementNS(this.constructor.svg_ns, name);
    for (const name in attributes) {
      let attr = document.createAttribute(name);
      attr.value = attributes[name];
      element.setAttributeNode(attr);
    }
    return element;
  }

  constructor(name, attributes) {
    this.element = this.constructor.createElement(name, attributes);
  }

  appendTo(parent) {
    parent.element.appendChild(this.element);
    return this;
  }
}

class Marker extends CustomSvgElement {
  circle;
  text;
  #css_class;

  static all = [];
  static selected = [];
  static n_frets = undefined;
  static n_strings = undefined;

  constructor(attrs) {
    super('g', {class: 'mark'});
    this.circle = this.constructor.createElement('circle', attrs).appendTo(this);
    this.text = this.constructor.createElement('text').appendTo(this);
  }

  select(text = '', css_class = undefined) {
    this.text.innerText = text;
    if (css_class !== undefined) {
      this.#css_class = css_class;
      this.element.classList.add(css_class);
    }
    this.element.style.visibility = 'visible';
  }

  unselect() {
    this.element.style.visibility = 'hidden';
    if (this.#css_class !== undefined) {
      this.element.classList.remove(this.#css_class);
    }
  }

  toggleHighlight() {
    this.element.classList.toggle('highlight');
  }

  clearSelection() {
    this.constructor.selected.map((marker) => marker.unselect());
    this.constructor.selected.length = 0;
  }
}

class Group extends CustomSvgElement {
  constructor(attrs = undefined) {
    super('g', attrs);
  }
}

class VerticalLine extends CustomSvgElement {
  static height = undefined;
  x;

  constructor(x, css_class) {
    super('path', {d: `M ${x} 0 V ${VerticalLine.height}`, class: css_class, 'stroke-width': 8});
    this.x = x;
  }
}

class GuitarString extends Group {
  notes;

  static *sixStringStandard(fretboard, notes) {
    const tuning = [
      [.011, 'e'],
      [.014, 'B'],
      [.018, 'G'],
      [.028, 'D'],
      [.038, 'A'],
      [.049, 'E']
    ];
    let box_height = fretboard.height / (tuning.length + 1);
    for (let i = 0; i < tuning.length; i++) {
      let open_note = notes.find(tuning[i][1]);
      let string_notes = notes.all.since(open_note);
      let y = box_height * (i + 1);
      yield new GuitarString(y, fretboard, box_height, tuning[i][0], string_notes);
    }
  }

  constructor(y, fretboard, box_height, gauge, notes) {
    super({class: 'string'});
    this.notes = Array.from(notes);
    const path_attrs = {
      d: `M 0 ${y} H ${fretboard.width}`,
      'stroke-width': 50 * gauge
    };
    (new CustomSvgElement('path', path_attrs)).appendTo(this);
    let i = 0;
    for (const note of notes) {
      let group = new Group();
      group.appendTo(this);
      const circle_attrs = {
        cx: fretboard.frets[i++].x,
        cy: y,
        r: box_height * 0.49
      }
      (new Marker(circle_attrs)).appendTo(this);
    }
  }
}

class Inlay extends CustomSvgElement {
  static #radius = 4;

  constructor(x, y) {
    const attrs = {
      cx: x,
      cy: y,
      r: Inlay.#radius,
      class: 'inlay'
    };
    super('circle', attrs);
  }
}

export class FretboardImage {
  width;
  height;
  #margin;
  frets;
  #notes;

  constructor(svg, notes) {
    const width = 700;
    const height = 150;
    this.element = svg;
    this.#margin = 20;
    this.width = width;
    this.height = height;
    this.#notes = notes;
    this.frets = [];

    VerticalLine.height = this.height;
    (new VerticalLine(this.#margin, 'nut')).appendTo(this);

    // draw frets
    const fret_count = 12;
    for (let i = 0; i < fret_count; i++) {
      let x = this.#margin + (this.width - this.#margin) * (2 - 1.059463 ** (fret_count - i - 1));
      let fret = new VerticalLine(x, 'fret');
      fret.appendTo(this);
      this.frets.push(fret);
    }

    for (const i of [3, 5, 7, 9, 12]) {
      let x = (this.frets[i - 2].x + this.frets[i - 1].x) / 2;
      (new Inlay(x, this.height / 2)).appendTo(this);
    }

    for (const str of GuitarString.sixStringStandard(this, this.#notes)) {
      str.appendTo(this);
    }
  }
}