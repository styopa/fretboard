#!/usr/bin/env python3
import wave, math, sys

FRAME_RATE = 22050
NUM_SECONDS = 0.1
CONCERT_A = 440
AEOLIAN = [0, 2, 3, 5, 7, 8, 10]

def sine_wave(freq):
    for frame in range(round(NUM_SECONDS * FRAME_RATE)):
        time = frame / FRAME_RATE
        amplitude = math.sin(2 * math.pi * freq * time)
        yield round((amplitude + 1) / 2 * 255)

def pitch_to_freq(i):
    return round(pow(pow(2, 1 / 12), i) * CONCERT_A)

def write_file(i):
    symbol = chr(ord('a') + i)
    file_name = f'{symbol}.wav'
    print(f'Writing {file_name}...', file=sys.stderr)
    with wave.open(file_name, 'wb') as wave_file:
        wave_file.setparams((1, 1, FRAME_RATE, 1, 'NONE', ''))
        freq = pitch_to_freq(AEOLIAN[i])
        wave_file.writeframes(bytes(sine_wave(freq)))

for i in range(len(AEOLIAN)):
    write_file(i)