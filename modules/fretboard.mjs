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
    return self;
  }
}

class Marker extends CustomSvgElement {
  circle;
  text;
  #css_class;

  constructor() {
    super('g', {class: 'mark'});
    this.circle = this.constructor.createElement('circle').appendTo(self);
    this.text = this.constructor.createElement('text').appendTo(self);
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
}

class MarkerGroup {
  #markers;
  #selection;

  constructor(n_strings, n_frets) {
    this.#markers = [];
    for (let i = 0; i < n_strings; i++) {
      this.#markers[i] = new Array(n_frets);
    }
  }

  addMarker(string, fret, marker) {
    this.#markers[string][fret] = marker;
  }

  clearSelection() {
    this.#selection.map((marker) => marker.unselect());
    this.#selection.length = 0;
  }
}

export class FretboardImage {
  #svg;
  #width;
  #height;
  #margin;
  #fret_x;
  #string_y;
  #marks;
  #current_mark;
  #strings;

  constructor(svg, strings) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    this.#margin = 20;
    this.#width = dimensions[2];
    this.#height = dimensions[3];

    this.#strings = strings;

    // precalculate positions
    this.#fret_x = [];
    const width_12_frets = this.#width - this.#margin * 2;
    for (let i = 1; i < 13; i++) {
      const nut_to_fret = width_12_frets * (2 - 1.059463 ** (12 - i));
      this.#fret_x[i] = this.#margin + nut_to_fret;
    }

    this.#string_y = [];
    for (let i = 0; i < this.#strings.length; i++) {
      this.#string_y[i] = this.#height / (this.#strings.length + 1) * (i + 1);
    }

    this.#current_mark = 0;
    this.#marks = [];
  }

  draw() {
    const addLine = (function (x, y, stroke_width, css_class) {
      const orientation = x === 0 ? 'H' : 'V';
      const length = x === 0 ? this.#width : this.#height;
      return this.addSvgChild(this.#svg, 'path', {
        d: `M ${x} ${y} ${orientation} ${length}`,
        "stroke-width": stroke_width,
        class: css_class
      });
    }).bind(this);

    const addMarker = (function (string, fret) {
      let svg_attrs = {
        class: 'mark',
        r: this.#string_y[0] * 0.45,
        cx: this.#fret_x[fret],
        cy: this.#string_y[string]
      };
      let mark = this.addSvgChild(this.#svg, 'g', { class: 'mark' });
      let circle = this.addSvgChild(mark, 'circle', svg_attrs);
      let text = this.addSvgChild(mark, 'text', { x: '50%', y: '50%' });
      this.#marks.push(mark);
    }).bind(this);

    addLine(this.#margin, 0, 8, 'nut');

    this.addInlays();

    // draw frets
    for (let i = 1; i <= 12; i++) {
      addLine(this.#fret_x[i], 0, 4, 'fret');
    }

    // draw strings
    for (let i = 0; i < this.#strings.length; i++) {
      addLine(0, this.#string_y[i], this.#strings[i].gauge * 50, 'string');
    }
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

  addInlays() {
    const getInlayX = (function (i) {
      return (this.#fret_x[i] + this.#fret_x[i - 1]) / 2;
    }).bind(this);

    const attrs = {
      cx: undefined,
      cy: this.#height / 2,
      r: 4,
      class: 'inlay'
    };

    for (let i of [3, 5, 7, 9]) {
      attrs.cx = getInlayX(i);
      this.addSvgChild(this.#svg, 'circle', attrs);
    }

    // double inlay on 12th fret
    attrs.cx = getInlayX(12);
    const inlay_y = this.#height * 5 / 14;
    for (const y of [inlay_y, this.#height - inlay_y]) {
      attrs.cy = y;
      this.addSvgChild(this.#svg, 'circle', attrs);
    }
  }

  mark(note) {
    let i = 0;

    for (const string of this.#strings) {
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