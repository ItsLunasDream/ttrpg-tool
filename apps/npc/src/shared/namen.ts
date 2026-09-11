import type { Paar } from './tabellen';

/**
 * Namen fuer Figuren.
 *
 * Drei Listen zu je hundert, und die Mischung ist Absicht: ungefaehr ein
 * Drittel bodenstaendig (Namen, die man auch auf einem Dorfplatz hoeren
 * koennte), der Rest fantastisch. Ein Generator, der nur „Zyrelle
 * Sturmweber" ausspuckt, ermuedet nach dem dritten Wirt.
 *
 * Die Einteilung meint den Klang, nicht die Figur. Wer den Wirt „Mara"
 * nennen will, nimmt einen Namen aus der weiblichen Liste — welches
 * Geschlecht die Figur hat, entscheidet der Tisch.
 */

export const WEIBLICH = [
  'Mara', 'Elsbeth', 'Greta', 'Hilda', 'Rosa', 'Agnes', 'Berta', 'Ida',
  'Lena', 'Frieda', 'Marta', 'Klara', 'Wilma', 'Edda', 'Gerda', 'Irma',
  'Alma', 'Thea', 'Bruna', 'Hanne',
  'Alwyn', 'Seraphine', 'Ysolde', 'Elowen', 'Maeve', 'Rowena', 'Brienne',
  'Sabriel', 'Elenwe', 'Caitlyn', 'Morwen', 'Nimue', 'Ceridwen', 'Isolde',
  'Guinevere', 'Arwyn', 'Elspeth', 'Fionnuala', 'Siobhan', 'Deirdre',
  'Zyrelle', 'Vaeloria', 'Kethryn', 'Xandria', 'Illyria', 'Ravenna',
  'Thessaly', 'Ombra', 'Sylvaine', 'Nyxara', 'Verithia', 'Amarantha',
  'Belisandra', 'Corvina', 'Drusilla', 'Evanthe', 'Faelyn', 'Galadwen',
  'Halcyone', 'Ianthe',
  'Jorunn', 'Kyra', 'Liadan', 'Mirabel', 'Naeris', 'Oriane', 'Perrin',
  'Quenna', 'Rhiannon', 'Solveig', 'Talwyn', 'Ulrica', 'Vesper', 'Wrenna',
  'Xiomara', 'Yrsa', 'Zinnia', 'Astrid', 'Bryndis', 'Cyra',
  'Dagny', 'Eilif', 'Freydis', 'Gunnhild', 'Hervor', 'Ingrid', 'Jarnsaxa',
  'Kolfinna', 'Ljufa', 'Magnhild', 'Nanna', 'Oddny', 'Ragnhild', 'Sigrun',
  'Thordis', 'Unnur', 'Valdis', 'Yngvild', 'Thyra', 'Runa'
] as const;

export const MAENNLICH = [
  'Alric', 'Bertram', 'Hagen', 'Konrad', 'Ludwig', 'Otto', 'Rudolf', 'Werner',
  'Gunter', 'Heinrich', 'Adalbert', 'Eckhart', 'Friedrich', 'Gerhard',
  'Hartmut', 'Ingo', 'Joris', 'Klaus', 'Lorenz', 'Manfred',
  'Aldric', 'Baelfor', 'Cedric', 'Dunmar', 'Eldrin', 'Faramond', 'Gwydion',
  'Halvard', 'Ivor', 'Jareth', 'Kaelen', 'Lucan', 'Maddox', 'Nolwen',
  'Orrin', 'Perceval', 'Quillon', 'Roderic', 'Sturmson', 'Tristan',
  'Vaerith', 'Zorander', 'Khordan', 'Malakar', 'Tharivol', 'Xerath',
  'Grimwald', 'Balthazar', 'Corvus', 'Drakkon', 'Emberic', 'Fenwick',
  'Galdor', 'Hesperos', 'Ithilien', 'Jorvik', 'Kaldur', 'Lyander',
  'Morgrath', 'Nyxos',
  'Osric', 'Pellinore', 'Ragnar', 'Sigurd', 'Torbjorn', 'Ulric', 'Varian',
  'Wulfric', 'Yorick', 'Zephyrin', 'Anselm', 'Brand', 'Cuthbert', 'Dagfinn',
  'Eadric', 'Frodwin', 'Godric', 'Hrothgar', 'Ivarr', 'Jorund',
  'Kettil', 'Leofric', 'Mundil', 'Njal', 'Ottar', 'Ragnvald', 'Steinar',
  'Thorvald', 'Ulfar', 'Vigmar', 'Wystan', 'Yngvar', 'Brokk', 'Durin',
  'Fundin', 'Gloin', 'Harbard', 'Kili', 'Nori', 'Oin'
] as const;

export const NEUTRAL = [
  'Robin', 'Jule', 'Kim', 'Toni', 'Alex', 'Sam', 'Charlie', 'Jamie',
  'Finn', 'Nikita', 'Sascha', 'Mika', 'Noa', 'Luca', 'Ari', 'Eli',
  'Ren', 'Kai', 'Jori', 'Nell',
  'Ash', 'Wren', 'Rowan', 'Sage', 'Briar', 'Cove', 'Dell', 'Eron',
  'Fable', 'Gale', 'Haven', 'Isen', 'Juniper', 'Kestrel', 'Linden',
  'Marlow', 'Nerys', 'Onyx', 'Peregrine', 'Quarrel',
  'Vex', 'Zenith', 'Shael', 'Thistle', 'Umbra', 'Vale', 'Whisper', 'Yarrow',
  'Zephyr', 'Aster', 'Bramble', 'Cinder', 'Dusk', 'Ember', 'Flint',
  'Glimmer', 'Hollow', 'Indigo', 'Jasper', 'Kindle',
  'Lark', 'Moss', 'Nox', 'Ochre', 'Pike', 'Quill', 'Rook', 'Slate',
  'Tarn', 'Vesper', 'Willow', 'Yew', 'Zinn', 'Arden', 'Blaise', 'Caspian',
  'Denna', 'Ellery', 'Fenn', 'Greer',
  'Halle', 'Ives', 'Jory', 'Keir', 'Lowen', 'Merrit', 'Nevin', 'Oakes',
  'Prynn', 'Rune', 'Sorrel', 'Teagan', 'Uri', 'Verity', 'Wyn', 'Ziv',
  'Auren', 'Brisk', 'Corr', 'Dace'
] as const;

/**
 * Beinamen und Familiennamen.
 *
 * Nicht jede Figur bekommt einen: bei einer Wache am Tor fragt niemand nach
 * dem Nachnamen, und ein Generator, der immer zwei Namen liefert, klingt
 * nach Adelsregister.
 *
 * Zweisprachig, anders als die Rufnamen: „Eisenfaust" ist eine Beschreibung
 * und keine Kennung. Ein Rufname bleibt dagegen in jeder Sprache derselbe —
 * Mara heisst nirgends anders.
 */
export const BEINAMEN: readonly Paar[] = [
  { de: 'Eisenfaust', en: 'Ironfist' },
  { de: 'Grauhaupt', en: 'Greyhead' },
  { de: 'Sturmweber', en: 'Stormweaver' },
  { de: 'Hollenbeck', en: 'Hollowbeck' },
  { de: 'Rabenstein', en: 'Ravenstone' },
  { de: 'Wintermund', en: 'Wintermouth' },
  { de: 'Steinbach', en: 'Stonebrook' },
  { de: 'Morgenroth', en: 'Dawnred' },
  { de: 'Dunkelbrunn', en: 'Darkwell' },
  { de: 'Hochbaum', en: 'Hightree' },
  { de: 'Kesselflick', en: 'Kettlepatch' },
  { de: 'Wagemut', en: 'Boldheart' },
  { de: 'Fassbinder', en: 'Cooper' },
  { de: 'Krummholz', en: 'Crookwood' },
  { de: 'Mohnfeld', en: 'Poppyfield' },
  { de: 'Silberdorn', en: 'Silverthorn' },
  { de: 'Aschenwald', en: 'Ashwood' },
  { de: 'Rotbart', en: 'Redbeard' },
  { de: 'Nebelfern', en: 'Mistfar' },
  { de: 'Hagelgrund', en: 'Hailground' },
  { de: 'die Ältere', en: 'the Elder' },
  { de: 'vom Hügel', en: 'of the Hill' },
  { de: 'aus Talwinkel', en: 'of Valecorner' },
  { de: 'der Dritte', en: 'the Third' },
  { de: 'ohne Land', en: 'Landless' },
  { de: 'Zwiefinger', en: 'Twofinger' },
  { de: 'Halbschuh', en: 'Halfshoe' },
  { de: 'Dreibein', en: 'Threelegs' },
  { de: 'Leisetritt', en: 'Softstep' },
  { de: 'Spätzünder', en: 'Slowspark' }
];
