# Werkzeuge zur Auslese des SRD

Python, nicht Teil des Builds. Gebraucht werden `pypdf` und `pdfplumber`
(`pip install pypdf pdfplumber`). Aufgerufen aus `packages/srd`:

```
python3 werkzeug/glossar_lesen.py  /tmp/glossar.json   # beide Sprachen auslesen (~1 min)
python3 werkzeug/glossar_pruefen.py /tmp/glossar.json  # Paarliste pruefen, 0 Widersprueche erwartet
```

- `glossar_lesen.py`: Eintraege, Absaetze, Unterpunkte nach Schriftart; die
  ausdrueckliche Liste der Satzfehler des Originals (`KORREKTUREN`).
- `glossar_tabellen.py`: Tabellen und Listen nach der Lage der Woerter.
- `glossar_paare.json`: welcher englische Eintrag welcher deutsche ist, von
  Hand zugeordnet und von `glossar_pruefen.py` gegen Aufbau, Wuerfel, SG und
  Verweise geprueft.
