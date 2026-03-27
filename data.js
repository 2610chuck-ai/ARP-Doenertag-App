export const employees = [
  'Boos, Viktor',
  'Brüstle, Alexander',
  'Danner, Sebastian',
  'Dariusz/Bogdan',
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
    image:
      'https://images.unsplash.com/photo-1699728088614-7d1d4277414b?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Klassiker mit Dönerfleisch, Salat und Sauce'
  },
  Box: {
    image:
      'https://images.unsplash.com/photo-1773620494884-940e0db95e46?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Schnelle Lunch-Optionen mit Pommes und Toppings'
  },
  Lahmacun: {
    image:
      'https://images.unsplash.com/photo-1773620494884-940e0db95e46?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Gerollt, würzig und perfekt für Sonderwünsche'
  },
  Pide: {
    image:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Ofenfrisch, herzhaft und ideal für die Mittagspause'
  },
  Seele: {
    image:
      'https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Belegte Brotspezialitäten im Streetfood-Stil'
  },
  Specials: {
    image:
      'https://images.unsplash.com/photo-1699728088614-7d1d4277414b?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Snack- und Tellergerichte für mehr Auswahl'
  },
  Pizzen: {
    image:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Pizza-Klassiker und Spezialitäten aus dem Ofen'
  },
  Getränke: {
    image:
      'https://images.unsplash.com/photo-1585068873189-e2df7346dca0?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Kaltgetränke, Softdrinks und Ayran'
  },
  'Warme Getränke': {
    image:
      'https://images.unsplash.com/photo-1658646479124-bc31e6849497?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Kaffee, Cappuccino, Espresso und Tee'
  }
};

export const menuItems = [
  {
    category: 'Döner',
    items: [
      { id: '01', name: 'Döner klein', price: 5.00 },
      { id: '02', name: 'Döner Kebap', price: 8.00 },
      { id: '03', name: 'Döner Kebap XXL', price: 13.00 },
      { id: '04', name: 'Vegetarisch mit Käse', price: 8.00 },
      { id: '05', name: 'Vegetarisch XXL mit Käse', price: 13.00 },
      { id: '07', name: 'Yufka Kebap', subtitle: 'zusammengerollt', price: 9.00 },
      { id: '08', name: 'Yufka Spezial', subtitle: 'mit Pommes und Salat', price: 10.00 },
      { id: '09', name: 'Yufka Vegetarisch', subtitle: 'mit Käse', price: 9.00 },
      { id: '10', name: 'Falafel Yufka', subtitle: 'mit Salat', price: 9.00 },
      { id: '11', name: 'Döner Teller', subtitle: 'mit Salat und Pommes', price: 13.00 },
      { id: '12', name: 'Falafel Teller', subtitle: 'mit Salat und Pommes', price: 13.00 },
      { id: '13', name: 'Dönerfleisch 1 Kg', subtitle: 'nur zum Mitnehmen', price: 32.00 }
    ]
  },
  {
    category: 'Box',
    items: [
      { id: '15', name: 'Döner Box', subtitle: 'mit Pommes', price: 8.00 },
      { id: '16', name: 'Döner Box', subtitle: 'mit Salat', price: 8.00 },
      { id: '17', name: 'Döner Box', subtitle: 'mit Pommes und Salat', price: 9.00 },
      { id: '18', name: 'Döner Box', subtitle: 'nur mit Fleisch', price: 11.00 },
      { id: '19', name: 'Vegi Box', subtitle: 'mit Pommes, Käse und Salat', price: 8.00 },
      { id: '20', name: 'Falafel Box', subtitle: 'mit Pommes und Salat', price: 8.00 },
      { id: '21', name: 'Pommes Box', price: 5.00 }
    ]
  },
  {
    category: 'Lahmacun',
    items: [
      { id: '25', name: 'Lahmacun', subtitle: 'gerollt', price: 7.00 },
      { id: '26', name: 'Lahmacun mit Salat', subtitle: 'gerollt', price: 9.00 },
      { id: '27', name: 'Lahmacun Spezial', subtitle: 'mit Salat und Dönerfleisch gerollt', price: 10.00 },
      { id: '28', name: 'Fladenbrot', price: 2.50 },
      { id: '29', name: 'Ketchup oder Mayonnaise', price: 0.50 },
      { id: '30', name: 'Extra Soße', price: 1.00 },
      { id: '31', name: 'Extra Fleisch', price: 2.00 },
      { id: '32', name: 'Käse', price: 1.00 },
      { id: '33', name: 'Pizzateig', price: 1.00 }
    ]
  },
  {
    category: 'Pide',
    items: [
      { id: '35', name: 'Pide', subtitle: 'mit Hackfleisch, Käse, Ei', price: 10.00 },
      { id: '36', name: 'Pide', subtitle: 'mit Hackfleisch, Käse', price: 9.00 },
      { id: '37', name: 'Pide', subtitle: 'mit Käse', price: 8.50 },
      { id: '38', name: 'Pide', subtitle: 'mit Käse, Spinat und Ei', price: 11.00 },
      { id: '39', name: 'Pide', subtitle: 'mit Spinat, Käse, Ei, dazu Beilagensalat', price: 15.00 },
      { id: '40', name: 'Pide', subtitle: 'mit Dönerfleisch und Käse', price: 12.00 },
      { id: '41', name: 'Pide', subtitle: 'mit Sucuk und Käse', price: 11.00 },
      { id: '42', name: 'Pide', subtitle: 'mit Putenschinken, Rindersalami, Pilzen', price: 11.00 }
    ]
  },
  {
    category: 'Seele',
    items: [
      { id: '50', name: 'Seele Sucuk', subtitle: 'mit Knoblauchwurst, Pilzen', price: 11.00 },
      { id: '51', name: 'Seele vegetarisch', subtitle: 'mit Pilzen, Paprika und frischen Tomaten', price: 10.00 },
      { id: '52', name: 'Seele Issa', subtitle: 'mit Dönerfleisch, Peperoni', price: 11.50 },
      { id: '53', name: 'Seele König', subtitle: 'scharf, mit Dönerfleisch, Sucuk und Zwiebeln', price: 12.50 }
    ]
  },
  {
    category: 'Specials',
    items: [
      { id: '54', name: 'Putenschnitzel', subtitle: 'mit Salat und Pommes', price: 11.00 },
      { id: '55', name: 'Chicken Nuggets 9 Stück', subtitle: 'mit Pommes', price: 10.00 },
      { id: '56', name: 'Gemischter Salat klein', subtitle: 'mit allem und Käse', price: 7.00 },
      { id: '57', name: 'Gemischter Salat groß', subtitle: 'mit allem und Käse', price: 8.00 },
      { id: '58', name: 'Thunfisch Salat', price: 10.00 },
      { id: '59', name: 'Gemischter Salat mit Dönerfleisch', price: 10.00 }
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
      {
        id: '82',
        name: 'Spezial mit Champignons, Artischocken, Oliven, Spargel, Salami, Formvorderschinken, Paprika (29 cm)',
        price: 13.5
      },
      { id: '83', name: 'Frutti di Mare mit Meeresfrüchten und Knoblauchgewürz (29 cm)', price: 14.0 },
      { id: '84', name: 'Napoli mit Sardellen, Oliven, Zwiebeln (29 cm)', price: 13.0 },
      { id: '85', name: 'Romana mit Schinken, Salami (29 cm)', price: 10.0 },
      { id: 'X1', name: 'Pizza nach Wunsch pro Zutat', price: 1.0 }
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
      { id: 'W06', name: 'Cacao mit Milch', price: 3.3 },
      { id: 'W07', name: 'Cappuccino mit Kakao', price: 3.3 },
      { id: 'W08', name: 'Espresso Macchiato', price: 2.2 },
      { id: 'W09', name: 'Latte Macchiato', price: 3.3 },
      { id: 'W10', name: 'Tee', price: 2.0 }
    ]
  }
];
