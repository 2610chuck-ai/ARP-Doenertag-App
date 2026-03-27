export const employees = [
  'Boos, Viktor',
  'Brüstle, Alexander',
  'Danner, Sebastian',
  'Finkbeiner, Tim',
  'Fischer, Hardo',
  'Genullis, Werner',
  'Harter, Thomas',
  'Hecking, Paul',
  'Hilgenberg, Max',
  'Hirsch, Simon',
  'Jakovovic, Dusko',
  'Jäckle, Eckhard',
  'Lütz, Kai',
  'Michel Muller',
  'Minet, Simon',
  'Scheerer, Heinz Michael',
  'Schmid, Karl-Heinz',
  'Schrempp, Thomas',
  'Trick, Jürgen',
  'Tuyan, Fatih',
  'Uhl, Rüdiger',
  'Wössner, Wolfgang'
].sort((a, b) => a.localeCompare(b, 'de'));

export const categoryMedia = {
  Döner: {
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Döner, Yufka, Teller und Klassiker'
  },
  Box: {
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Boxen mit Pommes, Salat und Fleisch'
  },
  Lahmacun: {
    image: 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Lahmacun, Extras und Beilagen'
  },
  Pide: {
    image: 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Ofenfrische Pide-Varianten'
  },
  Seele: {
    image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Seele-Spezialitäten mit Käse'
  },
  Specials: {
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Schnitzel, Nuggets und Salate'
  },
  Pizzen: {
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Pizza-Klassiker und Spezialitäten'
  },
  Getränke: {
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Softdrinks, Wasser, Ayran und mehr'
  },
  'Warme Getränke': {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Kaffee, Cappuccino, Espresso und Tee'
  }
};

const rawMenuItems = [
  {
    category: 'Döner',
    items: [
      { id: '01', name: 'Döner klein', price: 5.0, notePlaceholder: 'z. B. alles, ohne Zwiebeln, scharf' },
      { id: '02', name: 'Döner Kebap', price: 8.0, notePlaceholder: 'z. B. alles, nur Fleisch, ohne Rotkraut, scharf' },
      { id: '03', name: 'Döner Kebap XXL', price: 13.0, notePlaceholder: 'z. B. alles, extra scharf, ohne Zwiebeln' },
      { id: '04', name: 'Vegetarisch mit Käse', price: 8.0, notePlaceholder: 'z. B. mit allem, ohne Zwiebeln' },
      { id: '05', name: 'Vegetarisch XXL mit Käse', price: 13.0, notePlaceholder: 'z. B. mit allem, ohne Tomaten' },
      { id: '07', name: 'Yufka Kebap', subtitle: 'zusammengerollt', price: 9.0, notePlaceholder: 'z. B. nur Fleisch, Mais, Soße, scharf' },
      { id: '08', name: 'Yufka Spezial', subtitle: 'mit Pommes und Salat', price: 10.0, notePlaceholder: 'z. B. ohne Zwiebeln, mit viel Soße, scharf' },
      { id: '09', name: 'Yufka Vegetarisch', subtitle: 'mit Käse', price: 9.0, notePlaceholder: 'z. B. mit allem, ohne Weißkraut' },
      { id: '10', name: 'Falafel Yufka', subtitle: 'mit Salat', price: 9.0, notePlaceholder: 'z. B. nur Salat und Soße, scharf' },
      { id: '11', name: 'Döner Teller', subtitle: 'mit Salat und Pommes', price: 13.0, notePlaceholder: 'z. B. getrennt, ohne Zwiebeln, extra Soße' },
      { id: '12', name: 'Falafel Teller', subtitle: 'mit Salat und Pommes', price: 13.0, notePlaceholder: 'z. B. extra Soße, ohne Tomaten' },
      { id: '13', name: 'Dönerfleisch 1 Kg', subtitle: 'nur zum Mitnehmen', price: 32.0, notePlaceholder: 'z. B. bitte gut verpacken' }
    ]
  },
  {
    category: 'Box',
    items: [
      { id: '15', name: 'Döner Box', subtitle: 'mit Pommes', price: 8.0, notePlaceholder: 'z. B. nur Fleisch und Pommes, scharf' },
      { id: '16', name: 'Döner Box', subtitle: 'mit Salat', price: 8.0, notePlaceholder: 'z. B. ohne Zwiebeln, extra Soße' },
      { id: '17', name: 'Döner Box', subtitle: 'mit Pommes und Salat', price: 9.0, notePlaceholder: 'z. B. wenig Salat, mehr Pommes, scharf' },
      { id: '18', name: 'Döner Box', subtitle: 'nur mit Fleisch', price: 11.0, notePlaceholder: 'z. B. mit extra Soße, scharf' },
      { id: '19', name: 'Vegi Box', subtitle: 'mit Pommes, Käse und Salat', price: 8.0, notePlaceholder: 'z. B. ohne Käse, mit mehr Salat' },
      { id: '20', name: 'Falafel Box', subtitle: 'mit Pommes und Salat', price: 8.0, notePlaceholder: 'z. B. extra Soße, ohne Zwiebeln' },
      { id: '21', name: 'Pommes Box', price: 5.0, notePlaceholder: 'z. B. mit Ketchup, Mayo oder beidem' }
    ]
  },
  {
    category: 'Lahmacun',
    items: [
      { id: '25', name: 'Lahmacun', subtitle: 'gerollt', price: 7.0, notePlaceholder: 'z. B. ohne Salat, scharf' },
      { id: '26', name: 'Lahmacun mit Salat', subtitle: 'gerollt', price: 9.0, notePlaceholder: 'z. B. ohne Zwiebeln, mit extra Soße' },
      { id: '27', name: 'Lahmacun Spezial', subtitle: 'mit Salat und Dönerfleisch gerollt', price: 10.0, notePlaceholder: 'z. B. nur Fleisch, wenig Salat, scharf' },
      { id: '28', name: 'Fladenbrot', price: 2.5, notePlaceholder: 'z. B. extra dazu' },
      { id: '29', name: 'Ketchup oder Mayonnaise', price: 0.5, notePlaceholder: 'z. B. Ketchup, Mayo oder beides' },
      { id: '30', name: 'Extra Soße', price: 1.0, notePlaceholder: 'z. B. Cocktail, Joghurt oder scharf' },
      { id: '31', name: 'Extra Fleisch', price: 2.0, notePlaceholder: 'z. B. extra zum Hauptgericht' },
      { id: '32', name: 'Käse', price: 1.0, notePlaceholder: 'z. B. extra zum Hauptgericht' },
      { id: '33', name: 'Pizzateig', price: 1.0, notePlaceholder: 'z. B. extra dazu' }
    ]
  },
  {
    category: 'Pide',
    items: [
      { id: '35', name: 'Pide', subtitle: 'mit Hackfleisch, Käse, Ei', price: 10.0, notePlaceholder: 'z. B. gut gebacken' },
      { id: '36', name: 'Pide', subtitle: 'mit Hackfleisch, Käse', price: 9.0, notePlaceholder: 'z. B. ohne Käse' },
      { id: '37', name: 'Pide', subtitle: 'mit Käse', price: 8.5, notePlaceholder: 'z. B. extra knusprig' },
      { id: '38', name: 'Pide', subtitle: 'mit Käse, Spinat und Ei', price: 11.0, notePlaceholder: 'z. B. ohne Ei' },
      { id: '39', name: 'Pide', subtitle: 'mit Spinat, Käse, Ei, dazu Beilagensalat', price: 15.0, notePlaceholder: 'z. B. Salat extra verpacken' },
      { id: '40', name: 'Pide', subtitle: 'mit Dönerfleisch und Käse', price: 12.0, notePlaceholder: 'z. B. extra Fleisch, scharf' },
      { id: '41', name: 'Pide', subtitle: 'mit Sucuk und Käse', price: 11.0, notePlaceholder: 'z. B. ohne Käse, gut gebacken' },
      { id: '42', name: 'Pide', subtitle: 'mit Putenschinken, Rindersalami, Pilzen', price: 11.0, notePlaceholder: 'z. B. ohne Pilze' }
    ]
  },
  {
    category: 'Seele',
    items: [
      { id: '50', name: 'Seele Sucuk', subtitle: 'mit Knoblauchwurst, Pilzen', price: 11.0, notePlaceholder: 'z. B. ohne Pilze' },
      { id: '51', name: 'Seele vegetarisch', subtitle: 'mit Pilzen, Paprika und frischen Tomaten', price: 10.0, notePlaceholder: 'z. B. ohne Paprika' },
      { id: '52', name: 'Seele Issa', subtitle: 'mit Dönerfleisch, Peperoni', price: 11.5, notePlaceholder: 'z. B. extra scharf, ohne Peperoni' },
      { id: '53', name: 'Seele König', subtitle: 'scharf, mit Dönerfleisch, Sucuk und Zwiebeln', price: 12.5, notePlaceholder: 'z. B. weniger scharf, ohne Zwiebeln' }
    ]
  },
  {
    category: 'Specials',
    items: [
      { id: '54', name: 'Putenschnitzel', subtitle: 'mit Salat und Pommes', price: 11.0, notePlaceholder: 'z. B. Soße extra, ohne Salat' },
      { id: '55', name: 'Chicken Nuggets 9 Stück', subtitle: 'mit Pommes', price: 10.0, notePlaceholder: 'z. B. mit Ketchup und Mayo' },
      { id: '56', name: 'Gemischter Salat klein', subtitle: 'mit allem und Käse', price: 7.0, notePlaceholder: 'z. B. ohne Zwiebeln, ohne Käse' },
      { id: '57', name: 'Gemischter Salat groß', subtitle: 'mit allem und Käse', price: 8.0, notePlaceholder: 'z. B. ohne Tomaten, extra Soße' },
      { id: '58', name: 'Thunfisch Salat', price: 10.0, notePlaceholder: 'z. B. ohne Zwiebeln, extra Soße' },
      { id: '59', name: 'Gemischter Salat mit Dönerfleisch', price: 10.0, notePlaceholder: 'z. B. extra Fleisch, ohne Zwiebeln' }
    ]
  },
  {
    category: 'Pizzen',
    items: [
      { id: '60', name: 'Margherita (29 cm)', price: 7.5 },
      { id: '61', name: 'Zwiebel (29 cm)', price: 8.5 },
      { id: '62', name: 'Schinken mit Putenschinken (29 cm)', price: 9.0 },
      { id: '63', name: 'Salami mit Rindersalami (29 cm)', price: 9.0 },
      { id: '64', name: 'Champignons (29 cm)', price: 8.5 },
      { id: '65', name: 'Paprika (29 cm)', price: 8.5 },
      { id: '66', name: 'Peperoni (29 cm)', price: 8.5 },
      { id: '68', name: 'Mozzarella (29 cm)', price: 9.5 },
      { id: '69', name: 'Artischocken (29 cm)', price: 9.5 },
      { id: '70', name: 'Spargel (29 cm)', price: 9.0 },
      { id: '71', name: 'Sucuk mit Knoblauchwurst (29 cm)', price: 9.5 },
      { id: '72', name: 'Pizza Kebap (29 cm)', price: 11.0 },
      { id: '73', name: 'Ananas (29 cm)', price: 9.0 },
      { id: '74', name: 'Thunfisch mit Zwiebeln (29 cm)', price: 11.0 },
      { id: '75', name: 'Sardellen (29 cm)', price: 11.0 },
      { id: '76', name: 'Hawaii mit Putenschinken und Ananas (29 cm)', price: 10.0 },
      { id: '77', name: 'Gemischt mit Rindersalami, Putenschinken, Paprika, Champignons (29 cm)', price: 11.0 },
      { id: '78', name: 'Vegetarisch mit Artischocken, Spargel, Paprika, Champignons, Oliven (29 cm)', price: 10.0 },
      { id: '79', name: 'König mit Weichkäse, Kebap, Zwiebeln, Peperoni, Tomaten (29 cm)', price: 13.0 },
      { id: '80', name: 'Vier Jahreszeiten (29 cm)', price: 11.0 },
      { id: '81', name: 'Grandiose mit frischen Tomaten, Weichkäse, Zwiebeln und Oliven (29 cm)', price: 11.0 },
      { id: '82', name: 'Spezial mit Champignons, Artischocken, Oliven, Spargel, Salami, Formvorderschinken, Paprika (29 cm)', price: 13.5 },
      { id: '83', name: 'Frutti di Mare mit Meeresfrüchten und Knoblauchgewürz (29 cm)', price: 14.0 },
      { id: '84', name: 'Napoli mit Sardellen, Oliven, Zwiebeln (29 cm)', price: 13.0 },
      { id: '85', name: 'Romana mit Schinken, Salami (29 cm)', price: 10.0 },
      { id: 'X1', name: 'Pizza nach Wunsch pro Zutat', price: 1.0, notePlaceholder: 'z. B. Extra Pilze, Zwiebeln, Sucuk' }
    ]
  },
  {
    category: 'Getränke',
    items: [
      { id: 'G01', name: 'Coca Cola 0,33 l', price: 2.5 },
      { id: 'G02', name: 'Mezzo Mix 0,33 l', price: 2.5 },
      { id: 'G03', name: 'Fanta 0,33 l', price: 2.5 },
      { id: 'G04', name: 'Sprite 0,33 l', price: 2.5 },
      { id: 'G05', name: 'Uludag 0,33 l', price: 2.5 },
      { id: 'G06', name: 'Coca Cola 0,5 l', price: 3.0 },
      { id: 'G07', name: 'Mezzo Mix 0,5 l', price: 3.0 },
      { id: 'G08', name: 'Cola Zero 0,5 l', price: 3.0 },
      { id: 'G09', name: 'Sprite 0,5 l', price: 3.0 },
      { id: 'G10', name: 'Fanta 0,5 l', price: 3.0 },
      { id: 'G11', name: 'Uludag 0,5 l', price: 3.0 },
      { id: 'G12', name: 'Apfelsaftschorle 0,5 l', price: 3.0 },
      { id: 'G13', name: 'Cola light 0,5 l', price: 3.0 },
      { id: 'G14', name: 'Fuze Tea 0,4 l', price: 3.0 },
      { id: 'G15', name: 'Tetra Pack 0,5 l', price: 2.0 },
      { id: 'G16', name: 'Mineralwasser 0,5 l', price: 2.0 },
      { id: 'G17', name: 'Mineralwasser Still 0,5 l', price: 2.0 },
      { id: 'G18', name: 'Red Bull 0,25 l', price: 3.0 },
      { id: 'G19', name: 'Ayran 0,25 l', price: 2.0 },
      { id: 'G20', name: 'Alpirsbacher Pils 0,5 l', price: 3.0 },
      { id: 'G21', name: 'Alpirsbacher Spezial 0,5 l', price: 3.0 },
      { id: 'G22', name: 'Alpirsbacher Radler 0,5 l', price: 3.0 }
    ]
  },
  {
    category: 'Warme Getränke',
    items: [
      { id: 'W01', name: 'Schwarzer Kaffee', price: 2.5 },
      { id: 'W02', name: 'Kaffee mit Milch', price: 3.0 },
      { id: 'W03', name: 'Kaffee mit Kakao', price: 3.1 },
      { id: 'W04', name: 'Cappuccino', price: 3.2 },
      { id: 'W05', name: 'Espresso', price: 2.0 },
      { id: 'W06', name: 'Kakao mit Milch', price: 3.3 },
      { id: 'W07', name: 'Cappuccino mit Kakao', price: 3.3 },
      { id: 'W08', name: 'Espresso Macchiato', price: 2.2 },
      { id: 'W09', name: 'Latte Macchiato', price: 3.3 },
      { id: 'W10', name: 'Tee', price: 2.0 }
    ]
  }
];

function foodPhotoUrl(query, seed) {
  return `https://source.unsplash.com/640x480/?${encodeURIComponent(query)}&sig=${encodeURIComponent(seed)}`;
}

function buildPhotoQuery(category, item) {
  const text = `${item.name} ${item.subtitle || ''}`.toLowerCase();

  if (category === 'Döner') {
    if (text.includes('falafel teller')) return 'falafel plate fries salad';
    if (text.includes('döner teller')) return 'doner kebab plate fries salad';
    if (text.includes('falafel yufka')) return 'falafel wrap';
    if (text.includes('yufka spezial')) return 'doner wrap fries salad';
    if (text.includes('yufka vegetarisch')) return 'vegetarian wrap cheese';
    if (text.includes('yufka')) return 'doner kebab wrap';
    if (text.includes('vegetarisch')) return 'vegetarian sandwich cheese';
    if (text.includes('1 kg')) return 'sliced kebab meat';
    if (text.includes('xxl')) return 'big doner kebab sandwich';
    return 'doner kebab sandwich';
  }

  if (category === 'Box') {
    if (text.includes('falafel')) return 'falafel box fries salad';
    if (text.includes('vegi')) return 'vegetarian fries box salad';
    if (text.includes('nur mit fleisch')) return 'kebab meat box';
    if (text.includes('pommes box')) return 'french fries box';
    if (text.includes('mit salat')) return 'doner box salad';
    return 'doner box fries';
  }

  if (category === 'Lahmacun') {
    if (text.includes('lahmacun spezial')) return 'lahmacun doner wrap';
    if (text.includes('lahmacun mit salat')) return 'lahmacun salad wrap';
    if (text.includes('lahmacun')) return 'lahmacun turkish flatbread';
    if (text.includes('fladenbrot')) return 'turkish flatbread';
    if (text.includes('ketchup')) return 'ketchup mayonnaise sauce';
    if (text.includes('extra soße')) return 'yogurt sauce dip';
    if (text.includes('extra fleisch')) return 'sliced kebab meat';
    if (text.includes('käse')) return 'grated cheese';
    return 'pizza dough';
  }

  if (category === 'Pide') {
    if (text.includes('sucuk')) return 'pide sucuk cheese';
    if (text.includes('dönerfleisch')) return 'pide doner meat cheese';
    if (text.includes('spinat')) return 'pide spinach cheese egg';
    if (text.includes('hackfleisch')) return 'pide minced meat';
    return 'cheese pide';
  }

  if (category === 'Seele') {
    if (text.includes('sucuk')) return 'turkish sandwich sucuk mushrooms';
    if (text.includes('vegetarisch')) return 'vegetarian sandwich paprika tomatoes';
    if (text.includes('issa')) return 'doner sandwich peppers';
    return 'spicy doner sandwich';
  }

  if (category === 'Specials') {
    if (text.includes('putenschnitzel')) return 'schnitzel fries salad';
    if (text.includes('nuggets')) return 'chicken nuggets fries';
    if (text.includes('thunfisch')) return 'tuna salad';
    if (text.includes('dönerfleisch')) return 'salad kebab meat';
    return 'mixed salad cheese';
  }

  if (category === 'Pizzen') {
    if (text.includes('kebap')) return 'doner kebab pizza';
    if (text.includes('hawaii')) return 'hawaiian pizza';
    if (text.includes('thunfisch')) return 'tuna onion pizza';
    if (text.includes('sardellen')) return 'anchovy pizza';
    if (text.includes('vegetarisch')) return 'vegetarian pizza';
    if (text.includes('mozzarella')) return 'mozzarella pizza';
    if (text.includes('sucuk')) return 'sucuk pizza';
    if (text.includes('ananas')) return 'pineapple pizza';
    if (text.includes('meeresfrüchten')) return 'seafood pizza';
    if (text.includes('napoli')) return 'olive anchovy pizza';
    if (text.includes('romana')) return 'ham salami pizza';
    if (text.includes('vier jahreszeiten')) return 'quattro stagioni pizza';
    if (text.includes('margherita')) return 'margherita pizza';
    if (text.includes('zwiebel')) return 'onion pizza';
    if (text.includes('champignons')) return 'mushroom pizza';
    if (text.includes('paprika')) return 'pepper pizza';
    if (text.includes('peperoni')) return 'pepperoni pizza';
    if (text.includes('artischocken')) return 'artichoke pizza';
    if (text.includes('spargel')) return 'asparagus pizza';
    if (text.includes('grandiose')) return 'tomato feta olive pizza';
    if (text.includes('spezial')) return 'loaded deluxe pizza';
    if (text.includes('pizza nach wunsch')) return 'pizza toppings';
    return 'pizza';
  }

  if (category === 'Getränke') {
    if (text.includes('red bull')) return 'energy drink can';
    if (text.includes('ayran')) return 'ayran yogurt drink';
    if (text.includes('wasser')) return 'mineral water bottle';
    if (text.includes('apfelsaftschorle')) return 'apple spritzer bottle';
    if (text.includes('fuze tea')) return 'iced tea bottle';
    if (text.includes('uludag')) return 'orange soda bottle';
    if (text.includes('mezzo mix')) return 'cola orange soda';
    if (text.includes('sprite')) return 'lemon soda can';
    if (text.includes('fanta')) return 'orange soda can';
    if (text.includes('cola')) return 'cola can';
    if (text.includes('pils') || text.includes('spezial') || text.includes('radler')) return 'beer bottle';
    return 'soft drink';
  }

  if (category === 'Warme Getränke') {
    if (text.includes('latte')) return 'latte macchiato';
    if (text.includes('cappuccino')) return 'cappuccino';
    if (text.includes('espresso')) return 'espresso coffee';
    if (text.includes('kakao')) return 'hot cocoa';
    if (text.includes('tee')) return 'tea cup';
    return 'coffee cup';
  }

  return `${category} ${item.name}`;
}

function buildNotePlaceholder(category, item) {
  if (item.notePlaceholder) return item.notePlaceholder;

  if (category === 'Pizzen') return 'z. B. extra knusprig, ohne Zwiebeln, Zusatzwunsch';
  if (category === 'Getränke') return 'z. B. gekühlt oder extra dazu';
  if (category === 'Warme Getränke') return 'z. B. mit Zucker oder ohne Zucker';
  return 'z. B. Sonderwunsch eingeben';
}

export const menuItems = rawMenuItems.map((category) => ({
  ...category,
  items: category.items.map((item) => ({
    ...item,
    notePlaceholder: buildNotePlaceholder(category.category, item),
    image: item.image || foodPhotoUrl(buildPhotoQuery(category.category, item), item.id)
  }))
}));
