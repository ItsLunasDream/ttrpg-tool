# Werkzeuge zur Auslese des SRD

Python, nicht Teil des Builds. Gebraucht werden `pypdf` und `pdfplumber`
(`pip install pypdf pdfplumber`). Aufgerufen aus `packages/srd`:

```
python3 werkzeug/glossar_lesen.py  /tmp/glossar.json   # beide Sprachen auslesen (~1 min)
python3 werkzeug/glossar_pruefen.py /tmp/glossar.json  # Paarliste pruefen, 0 Widersprueche erwartet
python3 werkzeug/glossar_erzeugen.py /tmp/glossar.json # schreibt src/glossar.ts
python3 werkzeug/monster_lesen.py  /tmp/monster.json   # Wertekaesten beider Sprachen (einige Minuten)
python3 werkzeug/monster_erzeugen.py /tmp/monster.json # paart ueber die Zahlen, schreibt src/monster.ts
# Magische Gegenstaende: erst die Zeilen beider PDFs ablegen, dann lesen
python3 -c "import pickle,sys; sys.path.insert(0,'werkzeug'); from monster_lesen import lies_zeilen as z; [pickle.dump(z(s),open(f'/tmp/zeilen_{s}.pkl','wb')) for s in ('en','de')]"
python3 werkzeug/gegenstaende_lesen.py /tmp/zeilen_en.pkl /tmp/zeilen_de.pkl /tmp/gegenstaende.json
python3 werkzeug/gegenstaende_eichung.py /tmp/gegenstaende.json ../../apps/magicitems/src/shared/eichpunkte.ts
python3 werkzeug/tand_lesen.py src/tand.ts             # Trinkets / Requisiten, 1W100, beide Sprachen
```

- `glossar_lesen.py`: Eintraege, Absaetze, Unterpunkte nach Schriftart; die
  ausdrueckliche Liste der Satzfehler des Originals (`KORREKTUREN`).
- `glossar_tabellen.py`: Tabellen und Listen nach der Lage der Woerter.
- `glossar_paare.json`: welcher englische Eintrag welcher deutsche ist, von
  Hand zugeordnet und von `glossar_pruefen.py` gegen Aufbau, Wuerfel, SG und
  Verweise geprueft.
- `gegenstaende_lesen.py`: magische Gegenstaende beider Sprachen, erkannt an
  der Kopfzeile mit Kategorie und Seltenheit; gepaart nur, wo eindeutig.
- `gegenstaende_eichung.py`: Eichpunkte fuer den Magic Item Creator. Welcher
  Gegenstand fuer welche Wirkung steht, ist von Hand gewaehlt (`AUSWAHL`);
  die Zahlen kommen aus dem PDF.
- `tand_lesen.py`: die Tabelle „Trinkets" / „Requisiten", gepaart ueber die
  Nummer; bricht ab, wenn eine der hundert Nummern fehlt.
