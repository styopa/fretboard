import { addAttr } from "./dom.mjs";

class Fretboard {
  #strings;

  constructor(strings) {
    for (const string of strings) {
      this.#strings.push(string);
    }
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
  #mark_radius;
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

    // same diameter as the distance between strings:
    // two marks on adjacent strings won't overlap
    this.#mark_radius = this.#string_y[0] * 0.5;

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
      }
    ).bind(this);

    addLine(this.#margin, 0, 8, 'nut');

    this.addInlays();

    // draw frets
    for (let fret = 1; fret <= 12; fret++) {
      const x = this.#fret_x[fret];
      addLine(x, 0, 4, 'fret');
    }

    // draw strings
    let i = 0;
    for (const string of this.#strings) {
      addLine(0, this.#string_y[i], string.gauge * 50, 'string');
      let svg_attrs = {
        class: 'mark',
        r: this.#mark_radius,
        cy: this.#string_y[i]
      };
      let mark = this.addSvgChild(this.#svg, 'g', { class: 'mark' });
      let circle = this.addSvgChild(mark, 'circle', svg_attrs);
      let text = this.addSvgChild(mark, 'text', { x: '50%', y: '50%' });
      this.#marks.push(mark);
      i++;
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