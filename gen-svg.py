import sys
svg_dimensions = sys.argv[1:]
(svg_x, svg_y, svg_width, svg_height) = tuple(map(int, svg_dimensions))
print('<svg viewBox="{}">'.format(' '.join(svg_dimensions)))

for i in range(6):
    data = 'M0 {} H {}'.format(
        svg_height / 7.0 * (i + 1),
        svg_width
    )
    print('<path d="{}" class="string" />'.format(data))

for i in range(12):
    t = pow(2, (i + 1) / 12.0)
    data = 'M{} 0 V {}'.format(
        2 * svg_width * (t - 1) / t,
        svg_height
    )
    print('<path d="{}" class="fret" />'.format(data))

print('</svg>')
