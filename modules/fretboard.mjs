import { Note, Tuning } from "./note.mjs";

class SvgContainer {
  static namespace = 'http://www.w3.org/2000/svg';

  element;

  constructor(name) {
    this.element = document.createElementNS(this.constructor.namespace, name);
  }

  setAttributes(attributes) {
    for (const name in attributes) {
      let attr = document.createAttribute(name);
      attr.value = attributes[name];
      this.element.setAttributeNode(attr);
    }
  }

  appendChild(custom_element) {
    this.element.appendChild(custom_element.element)
  }
}

class Nut extends SvgContainer {
  constructor(x, height) {
    super('path');
    this.setAttributes({
      d: `M ${x} 0 V ${height}`,
      class: 'nut'
    });
  }
}

class Frets extends SvgContainer {
  constructor(fret_positions, height) {
    super('path');
    this.setAttributes({
      d: fret_positions.map((x) => `M ${x} 0 V ${height}`).join(' '),
      class: 'fret'
    });
  }
}

class HorizontalLine extends SvgContainer {
  constructor(y, length, stroke, css_class) {
    super('path');
    this.setAttributes({
      d: `M 0 ${y} H ${length}`,
      'stroke-width': stroke,
      class: css_class
    });
  }
}

class Group extends SvgContainer {
  constructor() {
    super('g');
  }
}

class MarkerGroup extends Group {
  markers = [];

  constructor(fret_positions, string_positions, note_positions) {
    super();
    // measure distance between strings, not between first string and edge
    const radius = (string_positions[1] - string_positions[0]) / 2;
    for (let i = 0; i < note_positions.length; i++) {
      const y = string_positions[i];
      for (const pos of note_positions[i]) {
        const x = fret_positions[pos.pos] - radius;
        const marker = new Marker(x, y, radius, pos.note.toClassName(), pos.note);
        this.markers.push(marker);
        this.appendChild(marker);
      }
    }
  }

  clearSelection() {
    this.markers.map((marker) => marker.unselect());
  }
}

class Marker extends Group {
  circle;
  text;

  constructor(x, y, radius, css_class = undefined, label = '') {
    super();
    this.setAttributes({
      class: 'marker',
    });
    const circle = new SvgContainer('circle');
    const attrs = {
      cx: x,
      cy: y,
      r: radius * 0.9,
    };
    if (css_class) attrs.class = css_class;
    circle.setAttributes(attrs);
    this.appendChild(circle);
    if (label) {
      const text = new SvgContainer('text');
      text.element.textContent = label;
      text.setAttributes({
        x: x,
        y: y,
        'font-size': radius * 1.2,
      })
      this.appendChild(text);
    }
  }

  toggleHighlight() {
    this.element.classList.toggle('hilite');
  }
}

class Inlay extends SvgContainer {
  constructor(x, y, r) {
    super('circle');
    this.setAttributes({
      cx: x,
      cy: y,
      r: r,
      class: 'inlay'
    });
  }
}

export class FretboardImage {
  static width = 1400;
  static height = 300;
  static margin_x = 20;
  static num_frets = 12;
  fret_positions = [];
  string_positions = [];
  tuning = undefined;
  markers = undefined;
  svg = undefined;

  constructor(svg) {
    this.tuning = Tuning.sixStringStandard();
    this.markers = undefined;
    this.svg = svg;

    const nut = new Nut(this.constructor.margin_x, this.constructor.height);
    svg.appendChild(nut.element);

    // frets
    for (const i of Array(this.constructor.num_frets).keys()) {
      const x = this.constructor.margin_x +
                (this.constructor.width - this.constructor.margin_x * 2)
                * (2 - 1.059463 ** (this.constructor.num_frets - i - 1));
      this.fret_positions.push(x);
    }
    const frets = new Frets(this.fret_positions, this.constructor.height);
    svg.appendChild(frets.element);

    // inlays
    for (const i of [3, 5, 7, 9, 12]) {
      let x = (this.fret_positions[i - 2] + this.fret_positions[i - 1]) / 2;
      const inlay = new Inlay(x, this.constructor.height / 2, 15);
      svg.appendChild(inlay.element);
    }

    // strings
    const gauges = [9, 12, 16, 24, 32, 44, 60, 80].map((i) => i / 1000);
    const string_count = this.tuning.strings.length;
    for (let i = 0; i < string_count; i++) {
      const y = this.constructor.height / (string_count + 1) * (i + 1);
      this.string_positions.push(y);
      const line = new HorizontalLine(y, this.constructor.width, gauges[i] * 70, 'string');
      svg.appendChild(line.element);
    }
  }

  selectRandomNotes(n) {
    const notes = Note.natural.randomElements(n);
    const markers = new MarkerGroup(
      this.fret_positions,
      this.string_positions,
      this.tuning.findNotes(notes),
      notes
    );
    if (this.markers === undefined) {
      this.svg.appendChild(markers.element);
    } else {
      this.svg.replaceChild(markers.element, this.markers.element)
    }
    this.markers = markers;
    return notes;
  }
}