function add_attr(element, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  element.setAttributeNode(attr);
}

function add_path(element, data, cls) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  add_attr(path, 'd', data);
  add_attr(path, 'class', cls);
  element.appendChild(path);
}

function get_fret_x(width, i) {
  return width * (2 - 1.059463 ** (13 - i));
}

function get_string_y(height, i) {
  return height / 7 * i;
}

function draw_fretboard() {
  const svg = document.getElementById('fretboard');
  const width = 700, height = 200;

  for (let i = 1; i <= 6; i++) {
    add_path(svg, `M0 ${get_string_y(height, i)} H ${width}`, 'string');
  }

  for (let i = 1; i <= 13; i++) {
    add_path(svg, `M${get_fret_x(width, i)} 0 V ${height}`, 'fret');
  }
}

window.addEventListener('load', draw_fretboard, false);
