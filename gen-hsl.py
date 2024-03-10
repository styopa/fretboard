#!/usr/bin/env python3

import colorsys

notes = {
  'c': 0xff0000,
  'd': 0xffc000,
  'e': 0xffff00,
  'f': 0x00ff00,
  'g': 0x00ffff,
  'a': 0x00c0ff,
  'b': 0xff00ff,
}

to_float = lambda i: float(i) / 255
to_hsl = lambda h, l, s: f'{int(360 * h)}deg {int(100 * s)}% {int(100 * l)}%'
span_opacity = 40

for k, v in notes.items():
  r = v >> 16 & 0xff
  g = v >> 8 & 0xff
  b = v & 0xff
  rgb = map(to_float, (r, g, b))
  hsl = to_hsl(*colorsys.rgb_to_hls(*rgb))
  bg_color = f'{hsl} / {span_opacity}%'
  fill = hsl
  print('')
  print(f'.note-{k} {{')
  print(f'  background-color: hsl({bg_color});')
  print(f'  fill: hsl({fill});')
  print(f'}}')
