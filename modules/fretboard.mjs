import { addAttr } from "./dom.mjs";

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

class VerticalLine extends SvgContainer {
  constructor(x, height, css_class) {
    super('path');
    this.setAttributes({
      d: `M ${x} 0 V ${height}`,
      class: css_class
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

class CustomSvgElement {
  static namespace = 'http://www.w3.org/2000/svg';

  element;

  static createElement(name, attributes) {
    const element = document.createElementNS(this.constructor.namespace, name);
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

class Group extends SvgContainer {
  constructor() {
    super('g');
  }
}

class MarkerGroup extends Group {
  markers = [];

  constructor(fret_positions, string_positions, selections) {
    super();
    // measure distance between strings, not between first string and edge
    const diameter = string_positions[1] - string_positions[0];
    for (let i = 0; i < selections.length; i++) {
      const y = string_positions[i] - diameter / 2;
      //console.log(`String ${i}: y = ${y}`)
      for (const pos of selections[i]) {
        const x = fret_positions[pos] - diameter;
        //console.log(x, y, diameter);
        const marker = new Marker(x, y, diameter);
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
  #css_class;

  constructor(x, y, diameter) {
    super('g');
    this.setAttributes({
      class: 'marker',
    });
    this.circle = new SvgContainer('circle');
    this.circle.setAttributes({
      cx: x + diameter / 2,
      cy: y + diameter / 2,
      r: diameter / 2 * 0.9,
    });
    this.appendChild(this.circle);
    //this.text = this.constructor.createElement('text').appendTo(this);
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

export class FretboardImage extends SvgContainer {
  static width = 1400;
  static height = 200;
  static margin_x = 20;
  static num_frets = 12;
  #notes;
  fret_positions = [];
  string_positions = [];

  constructor(notes) {
    super('svg');
    this.setAttributes({
      viewBox: [
        0,
        0,
        this.constructor.width,
        this.constructor.height,
      ].join(' '),
      width: this.constructor.width,
      height: this.constructor.height,
      class: 'fretboard',
      xmlns: this.constructor.namespace
    })
    this.#notes = notes;

    const nut = new VerticalLine(this.constructor.margin_x, this.constructor.height, 'nut');
    this.appendChild(nut);

    // frets
    for (const i of Array(this.constructor.num_frets).keys()) {
      const x = this.constructor.margin_x +
                (this.constructor.width - this.constructor.margin_x * 2)
                * (2 - 1.059463 ** (this.constructor.num_frets - i - 1));
      this.fret_positions.push(x);
      const fret = new VerticalLine(x, this.constructor.height, 'fret');
      this.appendChild(fret);
    }

    // inlays
    for (const i of [3, 5, 7, 9, 12]) {
      let x = (this.fret_positions[i - 2] + this.fret_positions[i - 1]) / 2;
      const inlay = new Inlay(x, this.constructor.height / 2, 15);
      this.appendChild(inlay);
    }

    // strings
    const gauges = [ .011, .014, .018, .028, .038, .049, ];
    for (let i = 0; i < gauges.length; i++) {
      const y = this.constructor.height / (gauges.length + 1) * (i + 1);
      this.string_positions.push(y);
      const line = new HorizontalLine(y, this.constructor.width, gauges[i] * 60, 'string');
      this.appendChild(line);
    }

    const mg = new MarkerGroup( this.fret_positions,
                                this.string_positions,
                                [[0], [1], [2], [3], [4], [5]]);
    this.appendChild(mg);
  }
}