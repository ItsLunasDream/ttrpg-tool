"""Setzt die Aufnahmen von itch-bilder.cjs zu fertigen Bildern zusammen.

Aufruf: python3 scripts/itch-bilder.py <ordner>
Legt je Aufnahme <name>.png in <ordner>/fertig ab.
"""
import json
import os
import sys

from PIL import Image

ordner = sys.argv[1]
daten = json.load(open(os.path.join(ordner, 'bilder.json')))
fertig = os.path.join(ordner, 'fertig')
os.makedirs(fertig, exist_ok=True)
for bild in daten['bilder']:
    leinwand = Image.new('RGB', (daten['breite'], daten['hoehe']), (20, 22, 28))
    for teil in bild['teile']:
        stueck = Image.open(os.path.join(ordner, teil['datei'])).convert('RGB')
        # Die Aufnahme kann bei Skalierung groesser sein als die Lage.
        stueck = stueck.resize((teil['width'], teil['height']))
        leinwand.paste(stueck, (teil['x'], teil['y']))
    leinwand.save(os.path.join(fertig, bild['name'] + '.png'))
print(len(daten['bilder']), 'Bilder in', fertig)
