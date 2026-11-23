// Chernobyl Ucronia - Il disastro sventato
// Motore dell'avventura testuale. Funziona nel browser (window.ChernobylGame) e in Node (module.exports).
(function (root) {
  'use strict';

  var H = function (h, m) { return h * 60 + (m || 0); };
  var START = H(15);           // 25 aprile, 15:00
  var NIGHT = H(23, 10);       // inizio del turno di notte
  var T_KIEV = H(24, 20);      // 00:20 richiamata da Kiev
  var T_CRASH = H(24, 28);     // 00:28 la potenza crolla
  var T_RODS = H(24, 43);      // 00:43 estrazione delle barre
  var T_TEST = H(25, 23);      // 01:23 inizio del test
  var SAVE_KEY = 'chernobyl-ucronia-salvataggio';

  // ---------- Luoghi ----------
  var ROOMS = {
    stazione: {
      name: 'Stazione degli autobus',
      exits: { n: 'piazza', o: 'bar' },
      desc: function (g) {
        return 'Una pensilina di cemento e un orologio fermo da anni. Il sole di aprile scalda l\'asfalto. ' +
          'Qui si ferma la navetta per la centrale: parte ogni ora, al minuto zero (SALI SULLA NAVETTA, 1 rublo). ' +
          'A nord la piazza, a ovest il bar sul fiume.';
      }
    },
    piazza: {
      name: 'Piazza Lenin',
      exits: { s: 'stazione', n: 'hotel', e: 'palazzo', o: 'universam' },
      desc: function () {
        return 'Il cuore di Pripyat. Bambini in bicicletta, madri con le borse della spesa, operai che tornano dal turno. ' +
          'Sui lampioni sono già appese le bandiere rosse per il Primo Maggio. ' +
          'A nord l\'Hotel Polissja, a est il Palazzo della cultura, a ovest l\'Universam, a sud la stazione.';
      }
    },
    hotel: {
      name: 'Hotel Polissja, la tua camera',
      exits: { s: 'piazza' },
      desc: function () {
        return 'Una camera stretta: letto di ferro, tappeto marrone, una radio che trasmette musica leggera. ' +
          'Dalla finestra, oltre i tetti, si vedono i camini bianchi e rossi della centrale. L\'uscita è a sud.';
      }
    },
    palazzo: {
      name: 'Palazzo della cultura Energetik',
      exits: { o: 'piazza', e: 'parco' },
      desc: function (g) {
        return 'Marmo, vetrate e un busto di Lenin all\'ingresso. In fondo al corridoio c\'è l\'ufficio del Partito. ' +
          (g.npcHere('lisin') ? 'La porta è aperta: il compagno Lisin è alla scrivania.' : 'La porta dell\'ufficio è chiusa. Un cartello: "Ricevimento dalle 16 alle 19".') +
          ' A ovest la piazza, a est il parco.';
      }
    },
    parco: {
      name: 'Parco dei divertimenti',
      exits: { o: 'palazzo' },
      desc: function () {
        return 'Una ruota panoramica gialla, nuova di zecca, con le cabine ancora coperte dai teli. ' +
          'Un cartello dice che sarà inaugurata il Primo Maggio. Gli autoscontri sono fermi. ' +
          'Per un attimo c\'è un silenzio strano. L\'uscita è a ovest.';
      }
    },
    universam: {
      name: 'Universam',
      exits: { e: 'piazza', s: 'bar' },
      desc: function (g) {
        if (g.s.t >= H(19)) return 'Il supermercato è chiuso. Dietro la vetrina, scaffali mezzi vuoti al buio. A est la piazza, a sud il bar.';
        return 'Il supermercato del quartiere. Sugli scaffali scatolette, pane nero e poco altro. Alla cassa una signora con il fazzoletto in testa. ' +
          'Si possono comprare vodka (5 rubli) e sigarette Belomorkanal (2 rubli). Chiude alle 19. A est la piazza, a sud il bar.';
      }
    },
    bar: {
      name: 'Bar sul fiume',
      exits: { n: 'universam', e: 'stazione' },
      desc: function (g) {
        return 'Un chiosco con quattro tavolini sul fiume Pripyat. Si vende birra alla spina (1 rublo). ' +
          (g.npcHere('orlov') ? 'A un tavolino un vecchio con la giacca lisa gioca a scacchi da solo: è Orlov.' : 'I tavolini sono vuoti.') +
          ' A nord l\'Universam, a est la stazione.';
      }
    },
    guardia: {
      name: 'Centrale, posto di guardia',
      exits: { n: 'corridoio1', o: 'spogliatoio' },
      desc: function () {
        return 'Il cancello della centrale nucleare V.I. Lenin. Un soldato in garitta controlla i documenti e distribuisce i dosimetri. ' +
          'A nord si entra nella centrale, a ovest c\'è lo spogliatoio. Da qui la navetta torna in città ogni ora.';
      }
    },
    spogliatoio: {
      name: 'Spogliatoio',
      exits: { e: 'guardia' },
      desc: function () {
        return 'File di armadietti grigi e panche di legno. Odore di sapone e di sudore. Un armadietto ha il lucchetto rotto. L\'uscita è a est.';
      }
    },
    corridoio1: {
      name: 'Corridoio dorato, inizio',
      exits: { s: 'guardia', o: 'ufficioturni', n: 'archivio', e: 'corridoio2' },
      desc: function () {
        return 'Comincia qui il famoso corridoio dorato: centinaia di metri di vetri color oro che collegano i quattro blocchi. ' +
          'A ovest l\'ufficio turni, a nord l\'archivio tecnico, a est il corridoio continua, a sud l\'uscita.';
      }
    },
    corridoio2: {
      name: 'Corridoio dorato, a metà',
      exits: { o: 'corridoio1', n: 'ufficiobelov', s: 'mensa', e: 'corridoio3' },
      desc: function () {
        return 'Il corridoio prosegue, la luce gialla fa sembrare tutto più caldo. A nord l\'ufficio del capoturno, a sud la mensa.';
      }
    },
    corridoio3: {
      name: 'Corridoio dorato, blocco 4',
      exits: { o: 'corridoio2', n: 'salacontrollo', e: 'turbine' },
      desc: function () {
        return 'In fondo al corridoio, una porta blindata con la scritta "Sala controllo, blocco 4". A est la sala turbine.';
      }
    },
    ufficioturni: {
      name: 'Ufficio turni',
      exits: { e: 'corridoio1' },
      desc: function (g) {
        return 'Schedari, un calendario con una ragazza in costume e un posacenere pieno. Sulla scrivania c\'è il registro di turno. ' +
          (g.npcHere('fedor') ? 'Dietro la scrivania c\'è Fedor, l\'impiegato, che fuma l\'ultima sigaretta del pacchetto.' : 'Fedor è uscito a fumare.') +
          ' L\'uscita è a est.';
      }
    },
    archivio: {
      name: 'Archivio tecnico, ingresso',
      exits: { s: 'corridoio1', n: 'deposito' },
      desc: function (g) {
        return 'Una stanzetta con una scrivania e un cassetto. A nord una porta di ferro chiusa a chiave porta al deposito dei documenti. ' +
          (g.npcHere('nina') ? 'Alla scrivania c\'è Nina, l\'archivista, che timbra pratiche.' : 'La scrivania è vuota: Nina ha finito il turno.') +
          ' A sud il corridoio.';
      }
    },
    deposito: {
      name: 'Deposito dell\'archivio',
      exits: { s: 'archivio' },
      desc: function () {
        return 'Scaffali fino al soffitto, faldoni e polvere. Su uno scaffale in fondo c\'è una cartella rossa con il timbro "SEGRETO". A sud l\'uscita.';
      }
    },
    ufficiobelov: {
      name: 'Ufficio del capoturno',
      exits: { s: 'corridoio2' },
      desc: function (g) {
        return 'Una scrivania con tre telefoni, uno dei quali rosso, e un elenco di numeri appeso al muro: "Dispaccio elettrico di Kiev". ' +
          (g.npcHere('belov') ? 'Sergej Belov, il capoturno, sta preparando il programma della notte.' : 'Non c\'è nessuno.') +
          ' A sud il corridoio.';
      }
    },
    mensa: {
      name: 'Mensa',
      exits: { n: 'corridoio2' },
      desc: function (g) {
        return 'Tavoli lunghi, vassoi di alluminio, minestra di cavolo. ' +
          (g.npcHere('marcenko') ? 'A un tavolo da solo c\'è un ragazzo magro con gli occhiali: Jurij Marcenko, l\'operatore delle barre.' : 'A quest\'ora la mensa è quasi vuota.') +
          ' L\'uscita è a nord.';
      }
    },
    turbine: {
      name: 'Sala turbine',
      exits: { o: 'corridoio3' },
      desc: function () {
        return 'Una sala lunga come un campo di calcio, con le turbine verdi grandi come case. Il rumore è assordante. ' +
          'Gli ingegneri preparano il test di stanotte: vogliono vedere se la turbina, rallentando, dà abbastanza corrente alle pompe. A ovest il corridoio.';
      }
    },
    salacontrollo: {
      name: 'Sala controllo, blocco 4',
      exits: { s: 'corridoio3' },
      desc: function (g) {
        return 'Una parete intera di quadranti, lampadine e interruttori. Al centro il pannello delle barre di controllo, una griglia di piccoli indicatori luminosi. ' +
          'Sotto un coperchio di plastica c\'è il pulsante AZ-5. Kozlov cammina avanti e indietro, Belov è alla console, Marcenko al pannello delle barre. ' +
          'Scrivi STATO per leggere gli strumenti. A sud il corridoio.';
      }
    }
  };

  // ---------- Oggetti ----------
  var ITEMS = {
    ordine: { name: 'l\'ordine di servizio', words: ['ORDINE', 'FOGLIO', 'DOCUMENTO', 'DOCUMENTI'], take: true },
    manuale: { name: 'il manuale dell\'RBMK', words: ['MANUALE', 'LIBRO'], take: true },
    vodka: { name: 'una bottiglia di vodka', words: ['VODKA', 'BOTTIGLIA'], take: true },
    sigarette: { name: 'un pacchetto di Belomorkanal', words: ['SIGARETTE', 'PACCHETTO', 'BELOMORKANAL'], take: true },
    dosimetro: { name: 'un dosimetro', words: ['DOSIMETRO'], take: true },
    camice: { name: 'un camice bianco', words: ['CAMICE'], take: true },
    cartellino: { name: 'il cartellino di un tecnico assente', words: ['CARTELLINO', 'TESSERINO'], take: true },
    registro: { name: 'il registro di turno', words: ['REGISTRO'], take: false },
    appunti: { name: 'gli appunti copiati dal registro', words: ['APPUNTI', 'COPIA'], take: true },
    richiesta: { name: 'la richiesta firmata da Belov', words: ['RICHIESTA', 'FIRMA', 'PERMESSO'], take: true },
    chiave: { name: 'la chiave del deposito', words: ['CHIAVE'], take: true },
    rapporto: { name: 'il rapporto riservato', words: ['RAPPORTO', 'CARTELLA', 'LETTERA'], take: true },
    telefono: { name: 'il telefono rosso', words: ['TELEFONO'], take: false },
    scacchiera: { name: 'la scacchiera', words: ['SCACCHIERA', 'SCACCHI'], take: false },
    armadietto: { name: 'l\'armadietto con il lucchetto rotto', words: ['ARMADIETTO'], take: false },
    cassetto: { name: 'il cassetto della scrivania', words: ['CASSETTO', 'SCRIVANIA'], take: false },
    pannello: { name: 'il pannello delle barre', words: ['PANNELLO', 'BARRE', 'STRUMENTI', 'QUADRANTI'], take: false },
    az5: { name: 'il pulsante AZ-5', words: ['AZ5', 'PULSANTE', 'BOTTONE'], take: false },
    ruota: { name: 'la ruota panoramica', words: ['RUOTA'], take: false }
  };

  var ITEM_DESC = {
    ordine: function (g) { return g.s.f.timbro ? 'Ordine di servizio per l\'ingegnere Pavel Sorokin, con il timbro rosso del Partito. Ora puoi entrare in centrale.' : 'Ordine di servizio per l\'ingegnere Pavel Sorokin: "Verifica tecnica, blocco 4". Manca il timbro del Partito locale.'; },
    manuale: 'Un manuale spesso, con la copertina grigia: "Reattore RBMK-1000, istruzioni per il personale". Puoi LEGGERLO.',
    vodka: 'Stolichnaya, mezzo litro. Un ottimo modo per farsi degli amici a Pripyat.',
    sigarette: 'Belomorkanal, le sigarette più forti dell\'Unione Sovietica. Le preferite di Fedor.',
    dosimetro: 'Una penna di metallo che misura le radiazioni. Senza, in sala controllo non si entra.',
    camice: 'Un camice bianco di cotone, con il cappello abbinato. Puoi INDOSSARLO.',
    cartellino: 'Il cartellino di "V. Ignatenko, tecnico". La foto non ti somiglia per niente.',
    registro: 'Un librone con la copertina rigida: tutti gli eventi di ogni turno. Puoi LEGGERLO, se Fedor te lo lascia fare.',
    appunti: 'I tuoi appunti: picchi di potenza dopo gli arresti di emergenza, e la nota "Come a Leningrado, 1975?".',
    richiesta: 'Una richiesta di consultazione dell\'archivio, firmata da Sergej Belov.',
    chiave: 'Una chiave grossa, con un\'etichetta: "Deposito".',
    rapporto: 'Una lettera del 1983 di un istituto di ricerca di Mosca, timbrata "SEGRETO". Puoi LEGGERLA.',
    telefono: 'Il telefono rosso collega direttamente con il dispaccio elettrico di Kiev. Puoi TELEFONARE.',
    scacchiera: 'Una partita a metà. Il nero sta perdendo.',
    armadietto: function (g) { return g.s.f.armadiettoAperto ? 'L\'armadietto è aperto.' : 'Sull\'etichetta c\'è scritto "Ignatenko". Il lucchetto è rotto: puoi APRIRLO.'; },
    cassetto: function (g) { return g.npcHere('nina') ? 'Nina ci tiene la mano sopra.' : 'Un cassetto di legno, chiuso ma senza serratura.'; },
    pannello: function (g) { return g.statusText(); },
    az5: 'Il pulsante dell\'arresto di emergenza: fa scendere tutte le barre nel nocciolo insieme. È sotto un coperchio di plastica. SPIEGA AZ5 per sapere come funziona.',
    ruota: 'Gialla, con le cabine coperte. Non ha mai girato.'
  };

  // ---------- Glossario (SPIEGA) ----------
  var GLOSSARY = {
    RBMK: 'RBMK-1000: il tipo di reattore di Chernobyl. Usa la grafite per rallentare i neutroni e l\'acqua per raffreddare. A piena potenza produce 3200 MW di calore.',
    MW: 'MW (megawatt): misura la potenza. Il test di stanotte va fatto fra 700 e 1000 MW. Sotto i 700 MW il reattore diventa instabile.',
    BARRE: 'Barre di controllo: aste di boro che assorbono i neutroni. Dentro il nocciolo frenano la reazione, fuori la lasciano correre.',
    ORM: 'ORM (margine operativo di reattività): quante barre, contate come barre intere, sono ancora dentro il nocciolo. Il regolamento chiede almeno 15. Sotto 15 il reattore va spento.',
    XENO: 'Avvelenamento da xeno: dopo ore a bassa potenza si accumula xeno, un gas che assorbe neutroni e "soffoca" il reattore. La potenza non risale e gli operatori sono tentati di estrarre barre.',
    VUOTO: 'Coefficiente di vuoto positivo: nell\'RBMK, quando l\'acqua bolle e diventa vapore, la potenza sale invece di scendere. Più vapore vuol dire più potenza, e più potenza vuol dire più vapore.',
    GRAFITE: 'Punte di grafite: in fondo a ogni barra c\'è un pezzo di grafite. Quando la barra scende dalla posizione tutta estratta, per qualche secondo la grafite prende il posto dell\'acqua e la potenza sale.',
    AZ5: 'AZ-5: il pulsante di arresto di emergenza. Fa scendere tutte le barre insieme. Con molte barre dentro funziona. Con l\'ORM bassissimo, le punte di grafite fanno salire la potenza tutte insieme, nel punto peggiore.',
    TEST: 'Test di rundown: si stacca il vapore dalla turbina e si guarda se, rallentando, produce abbastanza corrente per far girare le pompe dell\'acqua finché partono i generatori diesel.',
    DOSIMETRO: 'Dosimetro: misura quante radiazioni hai preso. In sala controllo è obbligatorio.'
  };
  var GLOSS_ALIAS = { 'AZ-5': 'AZ5', MEGAWATT: 'MW', BARRA: 'BARRE', XENON: 'XENO', COEFFICIENTE: 'VUOTO', VAPORE: 'VUOTO', PUNTE: 'GRAFITE', PUNTA: 'GRAFITE', RUNDOWN: 'TEST', REATTORE: 'RBMK' };

  var STOP = ['IL', 'LO', 'LA', 'I', 'GLI', 'LE', 'L', 'UN', 'UNO', 'UNA', 'AL', 'ALLO', 'ALLA', 'AI', 'AGLI', 'ALLE', 'DEL', 'DELLO', 'DELLA', 'DEI', 'DEGLI', 'DELLE', 'SUL', 'SULLA', 'CON', 'COL', 'A', 'AD', 'DI', 'DA', 'IN', 'NEL', 'NELLA', 'PER', 'MIO', 'MIA'];
  var DIRS = { N: 'n', NORD: 'n', S: 's', SUD: 's', E: 'e', EST: 'e', O: 'o', OVEST: 'o', W: 'o' };
  var DIR_NAMES = { n: 'nord', s: 'sud', e: 'est', o: 'ovest' };

  var NPC_WORDS = {
    lisin: ['LISIN', 'COMPAGNO', 'FUNZIONARIO'],
    fedor: ['FEDOR', 'IMPIEGATO'],
    orlov: ['ORLOV', 'VECCHIO'],
    belov: ['BELOV', 'SERGEJ', 'CAPOTURNO'],
    nina: ['NINA', 'ARCHIVISTA'],
    marcenko: ['MARCENKO', 'JURIJ', 'RAGAZZO', 'OPERATORE'],
    kozlov: ['KOZLOV', 'ANATOLIJ'],
    soldato: ['SOLDATO', 'GUARDIA'],
    cassiera: ['CASSIERA', 'SIGNORA']
  };

  function norm(str) {
    return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/AZ-5/g, 'AZ5').replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function clock(t) {
    var m = ((t % 1440) + 1440) % 1440;
    var hh = Math.floor(m / 60), mm = m % 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }

  function Game(opts) {
    opts = opts || {};
    this.rng = opts.rng || Math.random;
    this.storage = opts.storage || null;
    this.reset();
  }

  Game.prototype.reset = function () {
    this.s = {
      loc: 'stazione', t: START, rubli: 10, moves: 0, cred: 2,
      where: { ordine: 'hotel', manuale: 'hotel', camice: 'spogliatoio', registro: 'ufficioturni', telefono: 'ufficiobelov', scacchiera: 'bar', armadietto: 'spogliatoio', cassetto: 'archivio', rapporto: 'deposito', pannello: 'salacontrollo', az5: 'salacontrollo', ruota: 'parco' },
      f: {}, ind: {}, menu: null, quiz: null, fedorBack: -1, lisinLock: 0, worn: false, over: false, seen: {}, events: {}
    };
  };

  Game.prototype.npcHere = function (id) {
    var s = this.s, t = s.t, loc = s.loc;
    switch (id) {
      case 'lisin': return loc === 'palazzo' && t >= H(16) && t < H(19);
      case 'fedor': return loc === 'ufficioturni' && s.moves >= s.fedorBack;
      case 'orlov': return loc === 'bar' && t < H(21) && !s.f.orlovGone;
      case 'belov': return (loc === 'ufficiobelov' && ((t >= H(18) && t < H(19)) || (t >= H(22, 30) && t < NIGHT))) || (loc === 'salacontrollo' && t >= NIGHT);
      case 'nina': return loc === 'archivio' && t < H(20);
      case 'marcenko': return (loc === 'mensa' && t >= H(22) && t < H(22, 40)) || (loc === 'salacontrollo' && t >= NIGHT);
      case 'kozlov': return loc === 'salacontrollo' && t >= NIGHT;
      case 'soldato': return loc === 'guardia';
      case 'cassiera': return loc === 'universam' && t < H(19);
    }
    return false;
  };

  Game.prototype.has = function (id) { return this.s.where[id] === 'inv'; };
  Game.prototype.give = function (id) { this.s.where[id] = 'inv'; };
  Game.prototype.drop = function (id) { delete this.s.where[id]; };
  Game.prototype.indizi = function () { return Object.keys(this.s.ind).length; };
  Game.prototype.addCred = function (n) { this.s.cred = Math.max(0, Math.min(10, this.s.cred + n)); };
  Game.prototype.found = function (id, text) {
    if (this.s.ind[id]) return text;
    this.s.ind[id] = true;
    this.addCred(2);
    return text + '\n\n*** INDIZIO TROVATO (' + this.indizi() + '/3) ***' + (this.indizi() === 3 ? '\nOra hai capito tutto. Il difetto è nelle barre, e stanotte qualcuno potrebbe premere il pulsante sbagliato.' : '');
  };

  Game.prototype.leve = function () {
    var f = this.s.f, n = 0;
    if (f.richiesta && f.belovMet && this.s.cred >= 4) n++;
    if (f.marcenkoAlly && this.s.events.rods) n++;
    if (f.rapportoShown) n++;
    if (f.kievCallback) n++;
    return n;
  };

  // ---------- Strumenti della notte ----------
  Game.prototype.power = function () {
    var t = this.s.t;
    if (t < NIGHT) return 3200;
    if (t < H(24)) return Math.round(1600 - (t - NIGHT) / 50 * 840);
    if (t < T_CRASH) return 760;
    if (t < T_RODS) return 30;
    if (t < T_TEST) return 200;
    return 200;
  };
  Game.prototype.orm = function () {
    var t = this.s.t;
    if (t < T_CRASH) return 26;
    if (t < T_RODS) return 18;
    if (t < H(25, 3)) return 9;
    if (t < H(25, 20)) return 7;
    return 6;
  };

  function bar(value, max, width) {
    var n = Math.max(0, Math.min(width, Math.round(value / max * width)));
    return '[' + new Array(n + 1).join('#') + new Array(width - n + 1).join('.') + ']';
  }

  Game.prototype.statusText = function () {
    var s = this.s, out = [];
    out.push('ORA ......... ' + clock(s.t) + (s.t >= H(24) ? ' (26 aprile)' : ' (25 aprile)'));
    out.push('RUBLI ....... ' + s.rubli);
    out.push('CREDIBILITA\' ' + bar(s.cred, 10, 10) + ' ' + s.cred + '/10');
    out.push('INDIZI ...... ' + this.indizi() + '/3');
    if (s.t >= NIGHT && s.loc === 'salacontrollo') {
      out.push('POTENZA ..... ' + bar(this.power(), 3200, 16) + ' ' + this.power() + ' MW');
      out.push('ORM ......... ' + bar(this.orm(), 30, 16) + ' ' + this.orm() + ' barre');
      if (this.indizi() === 3) out.push('Margine sicuro: ORM almeno 15. Sotto, il pulsante AZ-5 è una trappola.');
    }
    return out.join('\n');
  };

  // ---------- Uscita del testo ----------
  Game.prototype.look = function () {
    var r = ROOMS[this.s.loc], s = this.s;
    var txt = '== ' + r.name.toUpperCase() + ' ==\n' + r.desc(this);
    var vis = [];
    for (var id in s.where) {
      if (s.where[id] === s.loc && ITEMS[id].take) vis.push(ITEMS[id].name);
    }
    if (vis.length) txt += '\nVedi: ' + vis.join(', ') + '.';
    return txt;
  };

  Game.prototype.start = function () {
    this.reset();
    return [
      'CHERNOBYL UCRONIA',
      'Il disastro sventato',
      '',
      'Pripyat, Ucraina sovietica. Venerdì 25 aprile 1986, ore 15:00.',
      '',
      'Sei Pavel Sorokin, giovane ingegnere nucleare. Ti hanno mandato qui da un\'altra centrale per una verifica tecnica sul blocco 4. Non conosci nessuno, e nessuno ti deve niente.',
      'Stanotte sul reattore 4 si farà un test di sicurezza già rinviato più volte. Qualcosa, nei numeri che hai visto in treno, non ti torna.',
      '',
      'Scrivi AIUTO per i comandi. Di giorno ogni azione costa 5 minuti, di notte 1 minuto.',
      '',
      this.look()
    ].join('\n');
  };

  // ---------- Il tempo che passa ----------
  Game.prototype.tick = function (minutes) {
    var s = this.s, out = [];
    var before = s.t;
    s.t += minutes;
    s.moves++;
    if (before < NIGHT && s.t >= NIGHT) {
      s.t = Math.max(s.t, NIGHT);
      out.push('\nSono le 23:10. Dal dispaccio di Kiev arriva l\'autorizzazione: il test sul blocco 4 si fa stanotte. Inizia il turno di notte. Da ora ogni azione costa un minuto.');
    }
    if (before < H(16) && s.t >= H(16) && s.loc === 'palazzo') out.push('\nSono le 16. Il compagno Lisin arriva, apre l\'ufficio e si siede alla scrivania.');
    if (before < H(18) && s.t >= H(18) && s.loc === 'ufficiobelov') out.push('\nEntra Sergej Belov, il capoturno, con una pila di fogli sotto il braccio.');
    if (before < H(22) && s.t >= H(22) && s.loc === 'mensa') out.push('\nEntra un ragazzo magro con gli occhiali e si siede da solo con la sua minestra: è Marcenko.');
    if (before < H(19) && s.t >= H(19) && s.loc === 'universam') out.push('\nLa cassiera abbassa la saracinesca: si chiude.');
    if (before < H(20) && s.t >= H(20) && s.loc === 'archivio') out.push('\nNina guarda l\'orologio, mette via le pratiche e se ne va. Chiude il cassetto, ma non a chiave.');
    if (before < H(21) && s.t >= H(21) && s.loc === 'bar' && !s.f.orlovGone) out.push('\nOrlov ripone gli scacchi e se ne va a dormire, borbottando.');
    if (s.fedorBack === s.moves && s.loc === 'ufficioturni') out.push('\nFedor rientra, con l\'odore di fumo addosso.');
    out.push(this.nightEvents());
    return out.join('');
  };

  Game.prototype.nightEvents = function () {
    var s = this.s, ev = s.events, out = [];
    if (s.over || s.menu) return '';
    if (s.t >= T_KIEV && !ev.kiev) {
      ev.kiev = true;
      if (s.f.kievCalled) {
        s.f.kievCallback = true;
        if (s.loc === 'salacontrollo') out.push('\n\nSquilla il telefono rosso. Belov risponde, ascolta, ti guarda. "È il dispaccio di Kiev. Hanno letto la tua segnalazione. Dicono che il test può aspettare, se il capo ingegnere è d\'accordo." Kozlov diventa rosso. "Čërt voz\'mi!"');
        else out.push('\n\nIn lontananza senti squillare un telefono. Forse è Kiev che richiama la sala controllo.');
      }
    }
    if (s.t >= T_CRASH && !ev.crash) {
      ev.crash = true;
      if (s.loc !== 'salacontrollo') return out.join('');
      if (s.f.fakeBadge && this.rng() < 0.5) {
        out.push('\n\nKozlov si ferma davanti a te e legge il cartellino. "Ignatenko? Ignatenko è a casa con la febbre. Tu chi sei?" Due guardie ti accompagnano fuori.');
        out.push(this.lose('fuori'));
        return out.join('');
      }
      out.push('\n\n00:28. Marcenko cambia il sistema di regolazione e sbaglia qualcosa. La potenza crolla: 30 MW, il reattore quasi spento. Kozlov sbatte la mano sulla console. "Bljat\'! Riportatela su!"\nPer la prima volta, qualcuno ti guarda.');
      out.push('\n' + this.openMenu('crash'));
      return out.join('');
    }
    if (s.t >= T_RODS && !ev.rods) {
      ev.rods = true;
      if (s.loc !== 'salacontrollo') return out.join('');
      out.push('\n\n00:43. Lo xeno soffoca il reattore. Kozlov ordina di estrarre le barre, una dopo l\'altra.');
      if (s.f.marcenkoAlly) out.push('\nMarcenko toglie le mani dal pannello. "No. Ho sentito cosa ha detto l\'ingegnere Sorokin. Non ne tiro fuori altre." Kozlov lo fissa. "Tvoju mat\'! Ti faccio licenziare!" Ma nessuno si muove.');
      else out.push('\nMarcenko obbedisce. Le lucine delle barre si spengono a una a una. La potenza risale a 200 MW, ma l\'ORM scende: 18, 14, 11, 9.');
      out.push('\n' + this.openMenu('rods'));
      return out.join('');
    }
    if (s.t >= T_TEST && !ev.test) {
      ev.test = true;
      if (s.loc !== 'salacontrollo') {
        out.push('\n\n01:23. Sei lontano dalla sala controllo quando il pavimento trema.');
        out.push(this.lose('storia'));
        return out.join('');
      }
      out.push('\n\n01:23:04. "Si comincia", dice Kozlov. La valvola del vapore si chiude, la turbina rallenta, le pompe girano più piano. L\'acqua nel nocciolo si scalda. Bolle. La potenza comincia a salire, sempre più in fretta.\nBelov allunga la mano verso il coperchio del pulsante AZ-5.');
      out.push('\n' + this.openMenu('test'));
    }
    return out.join('');
  };

  // ---------- Menu a scelte (momenti librogame) ----------
  var QUIZ = [
    { q: '"Prima domanda, compagno. Chi ha costruito questa centrale?"', a: ['Il popolo sovietico.', 'Una ditta italiana.', 'Gli americani, ma non si dice.'], ok: 0 },
    { q: '"Seconda domanda. Il reattore RBMK è..."', a: ['...pericoloso, se usato male.', '...il più sicuro del mondo.', '...non saprei, sono appena arrivato.'], ok: 1 },
    { q: '"Ultima domanda. Se notassi un problema alla centrale, a chi lo diresti?"', a: ['Ai giornali occidentali.', 'Al Partito, prima di tutto.', 'A nessuno.'], ok: 1 }
  ];

  Game.prototype.menuOptions = function (id) {
    var g = this, s = this.s, f = s.f;
    if (id === 'quiz') {
      var q = QUIZ[s.quiz.i];
      return { text: q.q, opts: q.a.map(function (a, i) { return { label: a, run: function () { return g.quizAnswer(i); } }; }) };
    }
    if (id === 'marcenko') {
      return {
        text: 'Marcenko alza gli occhi dalla minestra. "Sì? È nuovo, lei?"',
        opts: [
          { label: 'Parlare della Dinamo Kiev.', run: function () { return '"Blochin è finito", dice lui, e per la prima volta sorride. Parlate di calcio per un po\'.'; } },
          { label: 'Spiegargli il difetto delle punte di grafite.', run: function () {
            if (g.indizi() < 2) return 'Cominci a spiegare, ma ti accorgi che non sai abbastanza. Marcenko ti guarda perplesso. "Lei ha delle prove?"';
            f.marcenkoAlly = true;
            return 'Gli spieghi tutto, con calma: la grafite in fondo alle barre, la potenza che sale invece di scendere, cosa succede con poche barre dentro. Marcenko diventa pallido. "Gospodi... E io stanotte sono al pannello." Ti stringe la mano. "Se me lo chiede, non estraggo niente."';
          } },
          { label: 'Salutarlo e andare.', run: function () { return '"Buon appetito", dici. Lui annuisce.'; } }
        ]
      };
    }
    if (id === 'crash') {
      var opts = [];
      if (g.has('rapporto') && !f.rapportoShown) opts.push({ label: 'Mostrare il rapporto riservato a Kozlov.', run: function () {
        f.rapportoShown = true; g.addCred(1);
        return 'Gli metti sotto il naso la cartella rossa. Kozlov legge, e per un attimo smette di camminare. "Chi ti ha dato questa roba?" Belov si avvicina e legge da sopra la sua spalla.\n\n' + g.openMenu('crash');
      } });
      opts.push({ label: 'Proporre di fermare il test.', run: function () {
        if (g.leve() >= 3) return g.win('presto');
        if (g.leve() === 2) return 'Kozlov esita, guarda Belov, guarda te. "Non ancora. Prima rimettiamo su la potenza." Hai seminato il dubbio, ma non basta.';
        g.addCred(-1);
        return '"Fermare il test? Dopo tre anni di rinvii? Idi k čërtu, ragazzino." Nessuno ti difende.';
      } });
      opts.push({ label: 'Restare in silenzio e osservare.', run: function () { return 'Taci. Kozlov urla ordini, Marcenko suda.'; } });
      return { text: 'Cosa fai?', opts: opts };
    }
    if (id === 'rods') {
      return {
        text: 'Cosa fai?',
        opts: [
          { label: 'Protestare con le prove in mano.', run: function () {
            if (g.leve() >= 3) return g.win('presto');
            if (g.leve() === 2) return 'Belov ti dà ragione a mezza voce, ma Kozlov è il capo. "Si fa il test e basta." Ti resta un\'ultima carta, al momento giusto.';
            g.addCred(-1);
            return 'Kozlov non ti lascia nemmeno finire. "Fuori dai piedi."';
          } },
          { label: 'Tacere e aspettare.', run: function () { return 'Aspetti. Il reattore ronza, gli strumenti tremano appena.'; } }
        ]
      };
    }
    if (id === 'test') {
      return {
        text: 'Hai pochi secondi.',
        opts: [
          { label: 'Premere subito AZ-5.', run: function () { return g.lose('az5'); } },
          { label: 'Fermare la mano di Belov e reinserire le barre a mano, una alla volta.', run: function () {
            if (g.leve() >= 2) return g.win('tardi');
            return 'Afferri il polso di Belov. Kozlov ti spinge via. "Sei impazzito?" Qualcuno preme il pulsante.' + g.lose('az5');
          } },
          { label: 'Non fare niente.', run: function () { return 'Resti immobile. Belov solleva il coperchio e preme.' + g.lose('az5'); } }
        ]
      };
    }
    return null;
  };

  Game.prototype.openMenu = function (id) {
    var m = this.menuOptions(id);
    this.s.menu = id;
    var lines = [m.text];
    m.opts.forEach(function (o, i) { lines.push('  ' + (i + 1) + ') ' + o.label); });
    lines.push('(Scrivi il numero della tua scelta.)');
    return lines.join('\n');
  };

  Game.prototype.quizAnswer = function (i) {
    var s = this.s, q = QUIZ[s.quiz.i], out;
    if (i !== q.ok) s.quiz.wrong++;
    s.quiz.i++;
    if (s.quiz.i < QUIZ.length) return (i === q.ok ? 'Lisin annuisce.' : 'Lisin alza un sopracciglio e scrive qualcosa.') + '\n\n' + this.openMenu('quiz');
    if (s.quiz.wrong >= 2) {
      s.lisinLock = s.t + 60; s.quiz = null; this.addCred(-1);
      return '"Mi sembra confuso, compagno. Torni fra un\'ora, quando avrà le idee più chiare." Lisin ti indica la porta.';
    }
    s.quiz = null; s.f.timbro = true;
    return '"Bene, bene." Lisin prende il timbro, ci soffia sopra e lo preme sul tuo ordine di servizio. "Benvenuto a Pripyat, ingegnere."';
  };

  // ---------- Finali ----------
  Game.prototype.win = function (kind) {
    this.s.over = true;
    var t = [];
    if (kind === 'presto') {
      t.push('Belov si alza. "Basta. Con questo margine di barre il regolamento dice di spegnere. Il test si rinvia." Kozlov apre la bocca, la richiude. Dopo un lungo silenzio annuisce. Marcenko reinserisce le barre una alla volta e il reattore si addormenta piano, come deve.');
    } else {
      t.push('Togli la mano di Belov dal coperchio. "Non il pulsante. Le barre, a mano, una alla volta!" Marcenko ti guarda, poi obbedisce. Una barra. Due. Tre. Il vapore cala, la potenza scende. Kozlov ha le mani nei capelli e impreca in tutte le lingue che conosce. Alle 01:31 il reattore è fermo. Nessuno parla. Qualcuno si mette a piangere.');
    }
    t.push('');
    t.push('*** HAI SVENTATO IL DISASTRO ***');
    t.push('');
    t.push('26 aprile 1986. La Pravda, pagina sei: "Regolare manutenzione al blocco 4 della centrale di Chernobyl."');
    t.push('1 maggio 1986. A Pripyat la ruota panoramica gira per la prima volta. Ci salgono centinaia di bambini.');
    t.push('Estate 1986. Il rapporto sulle punte di grafite arriva a Mosca. Tutti gli RBMK dell\'Unione vengono modificati in silenzio.');
    t.push('1987. Pavel Sorokin riceve una medaglia che non può mostrare a nessuno.');
    t.push('');
    t.push('Grazie per aver giocato. Scrivi RICOMINCIA per una nuova partita.');
    return '\n\n' + t.join('\n');
  };

  Game.prototype.lose = function (kind) {
    this.s.over = true;
    var t = [];
    if (kind === 'az5' || kind === 'storia') {
      if (kind === 'az5') t.push('\n\nIl coperchio si alza, il dito preme. Le barre cominciano a scendere, e con loro le punte di grafite. Per qualche secondo la potenza, invece di scendere, sale. Trecento, mille, trentamila megawatt.');
      t.push('\n01:23:40.');
      t.push('01:23:44.');
    } else {
      t.push('\n\nTi lasciano su una panca fuori dalla centrale. Guardi i camini nel buio.');
      t.push('\n01:23:44.');
    }
    t.push('');
    t.push('Nella storia vera, alle 01:23 del 26 aprile 1986 il reattore 4 di Chernobyl esplose. Due persone morirono quella notte, altre ventotto di radiazioni nelle settimane seguenti. Pripyat fu evacuata il 27 aprile e non è mai più stata abitata.');
    t.push('');
    t.push('Scrivi RICOMINCIA per riprovare.');
    return t.join('\n');
  };

  // ---------- Il parser ----------
  Game.prototype.findItem = function (words, scope) {
    var s = this.s;
    for (var id in ITEMS) {
      var here = s.where[id] === 'inv' || s.where[id] === s.loc;
      if (scope === 'inv') here = s.where[id] === 'inv';
      if (!here) continue;
      for (var i = 0; i < words.length; i++) if (ITEMS[id].words.indexOf(words[i]) >= 0) return id;
    }
    return null;
  };
  Game.prototype.findNpc = function (words) {
    for (var id in NPC_WORDS) {
      if (!this.npcHere(id)) continue;
      for (var i = 0; i < words.length; i++) if (NPC_WORDS[id].indexOf(words[i]) >= 0) return id;
    }
    return null;
  };
  Game.prototype.anyNpc = function () {
    for (var id in NPC_WORDS) if (this.npcHere(id)) return id;
    return null;
  };

  Game.prototype.input = function (line) {
    var raw = norm(line);
    var s = this.s;
    if (!raw) return 'Scrivi un comando. AIUTO per l\'elenco.';
    var w = raw.split(' ');
    var verb = w[0];

    if (verb === 'RICOMINCIA' || verb === 'RESTART') return this.start();
    if (verb === 'CARICA') return this.load();
    if (s.over) return 'La partita è finita. Scrivi RICOMINCIA per giocare ancora, oppure CARICA.';

    if (s.menu) {
      var m = this.menuOptions(s.menu);
      var n = parseInt(raw, 10);
      if (!(n >= 1 && n <= m.opts.length)) return 'Scegli un numero da 1 a ' + m.opts.length + '.';
      s.menu = null;
      var res = m.opts[n - 1].run();
      if (!s.menu && !s.over) res += this.nightEvents();
      return res;
    }

    if (s.f.awaitRiddle) {
      s.f.awaitRiddle = false;
      if (/VUOTO|POSITIV/.test(raw)) {
        s.f.orlovTold = true;
        return this.found('orlov', 'Orlov ti guarda a lungo, poi sorride con i denti storti. "Coefficiente di vuoto positivo. Allora sei un ingegnere vero."\nSi versa un altro bicchiere. "Leningrado, 1975. Un reattore come questo. Durante un arresto di emergenza la potenza, invece di scendere, è salita. Si è acceso da solo, capisci? Hanno detto che era colpa degli operatori. Ma io c\'ero. Il problema è nelle barre, ragazzo. Nelle barre." Poi guarda il fiume e non dice più niente.');
      }
      s.f.orlovGone = true;
      return '"Lo sapevo. Sei uno del Partito." Orlov raccoglie gli scacchi e se ne va senza salutare. Non ti parlerà più.';
    }

    if (/^[0-9]+$/.test(raw)) return 'Non c\'è nessuna scelta da fare adesso.';
    var args = w.slice(1).filter(function (x) { return STOP.indexOf(x) < 0; });

    // comandi che non costano tempo
    if (verb === 'AIUTO' || verb === 'HELP' || verb === '?') return this.help();
    if (verb === 'ORA') return 'Sono le ' + clock(s.t) + (s.t >= H(24) ? ' del 26 aprile.' : ' del 25 aprile.');
    if (verb === 'STATO') return this.statusText();
    if (verb === 'INVENTARIO' || verb === 'INV' || verb === 'I') return this.inventory();
    if (verb === 'SPIEGA') return this.explain(args);
    if (verb === 'SALVA') return this.save();
    if (verb === 'GUARDA' && !args.length || verb === 'G' || verb === 'L' || verb === 'DESCRIVI') return this.look();

    // comandi che fanno passare il tempo
    var result = this.act(verb, args, raw);
    if (result === null) return 'Non capisco. Prova con verbi come VAI, PRENDI, LEGGI, PARLA, DAI, MOSTRA. AIUTO per l\'elenco.';
    if (typeof result === 'object') return result.text; // azioni che gestiscono il tempo da sole
    var step = s.t >= NIGHT ? 1 : 5;
    return result + this.tick(step);
  };

  Game.prototype.act = function (verb, args, raw) {
    var s = this.s, g = this;
    if (verb === 'VAI' || verb === 'ANDARE' || verb === 'ENTRA' || verb === 'ESCI') {
      if (!args.length) return 'Dove vuoi andare? (N, S, E, O)';
      verb = args[0];
    }
    if (DIRS[verb]) return this.move(DIRS[verb]);

    if (verb === 'ASPETTA' || verb === 'Z' || verb === 'ATTENDI') return this.wait();
    if (verb === 'ESAMINA' || verb === 'GUARDA' || verb === 'OSSERVA') return this.examine(args);
    if (verb === 'PRENDI' || verb === 'RACCOGLI') {
      if (args[0] === 'NAVETTA' || args[0] === 'AUTOBUS') return this.shuttle();
      return this.take(args);
    }
    if (verb === 'LASCIA' || verb === 'POSA') return this.dropCmd(args);
    if (verb === 'LEGGI') return this.read(args);
    if (verb === 'INDOSSA' || verb === 'METTI' || verb === 'VESTI') return this.wear(args);
    if (verb === 'APRI') return this.open(args);
    if (verb === 'COMPRA' || verb === 'ACQUISTA') return this.buy(args);
    if (verb === 'DAI' || verb === 'OFFRI' || verb === 'REGALA') return this.giveCmd(args);
    if (verb === 'MOSTRA' || verb === 'FAI') return this.show(args);
    if (verb === 'PARLA' || verb === 'SALUTA' || verb === 'CONVINCI') return this.talk(args);
    if (verb === 'CHIEDI' || verb === 'DOMANDA') return this.ask(args);
    if (verb === 'SALI') return this.shuttle();
    if (verb === 'CAMMINA') return this.walk();
    if (verb === 'TELEFONA' || verb === 'CHIAMA' || (verb === 'USA' && args[0] === 'TELEFONO')) return this.phone();
    if (verb === 'PREMI' || verb === 'SPINGI') {
      if (args.indexOf('AZ5') >= 0 || args.indexOf('PULSANTE') >= 0) {
        if (s.loc !== 'salacontrollo') return 'Non c\'è nessun pulsante qui.';
        if (s.t < NIGHT) return 'La sala è chiusa.';
        return { text: 'Sollevi il coperchio e premi.' + this.lose('az5') };
      }
      return 'Non c\'è niente da premere.';
    }
    if (verb === 'BEVI') {
      if (this.has('vodka')) return 'Non è il momento di ubriacarsi, Pavel. Quella bottiglia serve a qualcun altro.';
      return 'Non hai niente da bere.';
    }
    if (verb === 'USA') return 'Prova con un verbo più preciso: LEGGI, APRI, INDOSSA, DAI, MOSTRA, TELEFONA.';
    if (verb === 'DORMI') return 'Dormire stanotte? Proprio stanotte?';
    return null;
  };

  Game.prototype.move = function (d) {
    var s = this.s, r = ROOMS[s.loc], to = r.exits[d];
    if (!to) return 'Non puoi andare a ' + DIR_NAMES[d] + '.';
    if (s.loc === 'guardia' && to === 'corridoio1') {
      if (!this.has('ordine')) return 'Il soldato ti sbarra la strada. "Documenti, compagno."';
      if (!s.f.timbro) return 'Il soldato legge l\'ordine e scuote la testa. "Manca il timbro del Partito. Senza, non entra nessuno."';
    }
    if (s.loc === 'archivio' && to === 'deposito' && !s.f.depositoAperto) return 'La porta di ferro è chiusa a chiave.';
    if (s.loc === 'corridoio3' && to === 'salacontrollo') {
      if (s.t < NIGHT) return 'La porta è chiusa. Si apre per il turno di notte, alle 23:10.';
      if (!s.worn) return 'Il sorvegliante ti ferma. "Senza camice qui non si entra."';
      if (!this.has('dosimetro')) return 'Il sorvegliante ti ferma. "Il dosimetro, compagno. Lo ritiri al posto di guardia."';
      if (!s.f.belovMet) {
        if (!this.has('cartellino')) return 'Il sorvegliante scorre la lista del turno. "Sorokin? Non c\'è. Non entra." Ti serve che il capoturno ti conosca, oppure un altro modo per entrare.';
        if (!s.f.fakeBadge) { s.f.fakeBadge = true; this.addCred(-2); }
      }
    }
    s.loc = to;
    var extra = '';
    if (to === 'salacontrollo' && !s.seen.salacontrollo) {
      extra = s.f.fakeBadge ? '\nMostri il cartellino di Ignatenko tenendo il pollice sulla foto. Il sorvegliante sbadiglia e ti fa passare.\n' : '\nIl sorvegliante trova il tuo nome sulla lista: Belov ti ha aggiunto. Entri.\n';
    }
    s.seen[to] = true;
    return extra + this.look();
  };

  Game.prototype.wait = function () {
    var s = this.s;
    if (s.t >= NIGHT && s.loc === 'salacontrollo') {
      var next = [T_KIEV, T_CRASH, T_RODS, T_TEST].filter(function (x) { return x > s.t; })[0];
      if (!next) return 'Aspetti.';
      return { text: 'Aspetti. Il tempo passa lento, gli strumenti ronzano.' + this.tick(next - s.t) };
    }
    return { text: 'Aspetti un po\'.' + this.tick(s.t >= NIGHT ? 10 : 15) };
  };

  Game.prototype.shuttle = function () {
    var s = this.s;
    if (s.loc !== 'stazione' && s.loc !== 'guardia') return 'Qui non passa nessuna navetta.';
    if (s.rubli < 1) return 'Non hai più rubli per la navetta. Puoi sempre CAMMINARE: ci vogliono 45 minuti.';
    s.rubli--;
    var dep = Math.ceil(s.t / 60) * 60;
    var to = s.loc === 'stazione' ? 'guardia' : 'stazione';
    var wait = dep - s.t;
    var msg = (wait > 0 ? 'Aspetti la navetta delle ' + clock(dep) + '. ' : 'La navetta è lì che parte. ') + 'Paghi un rublo e sali. Venti minuti di strada fra i pini, ' + (to === 'guardia' ? 'con i camini della centrale che si avvicinano.' : 'fino alle prime case di Pripyat.');
    s.loc = to;
    return { text: msg + this.tick(dep - s.t + 20) + '\n\n' + this.look() };
  };

  Game.prototype.walk = function () {
    var s = this.s;
    if (s.loc !== 'stazione' && s.loc !== 'guardia') return 'Cammini avanti e indietro. Non serve a molto.';
    var to = s.loc === 'stazione' ? 'guardia' : 'stazione';
    s.loc = to;
    return { text: 'Tre chilometri a piedi lungo la strada, con le scarpe sbagliate.' + this.tick(45) + '\n\n' + this.look() };
  };

  Game.prototype.examine = function (args) {
    var s = this.s;
    var id = this.findItem(args);
    if (id) { var d = ITEM_DESC[id]; return typeof d === 'function' ? d(this) : d; }
    var npc = this.findNpc(args);
    if (npc) return this.npcDesc(npc);
    if (args.indexOf('CAMINI') >= 0 || args.indexOf('CENTRALE') >= 0) return 'I camini a strisce bianche e rosse della centrale V.I. Lenin. Quattro reattori, il quarto è il più nuovo.';
    return 'Non vedi niente di speciale.';
  };

  Game.prototype.npcDesc = function (id) {
    var d = {
      lisin: 'Il compagno Lisin, funzionario del Partito. Giacca grigia, distintivo all\'occhiello, sorriso che non arriva agli occhi.',
      fedor: 'Fedor, l\'impiegato dell\'ufficio turni. Il pacchetto di sigarette sulla scrivania è vuoto, e lui ha l\'aria di chi ne vorrebbe un altro.',
      orlov: 'Mikhail Orlov, ingegnere in pensione. Mani rovinate, occhi svegli. Guarda la scacchiera e ogni tanto il fiume.',
      belov: 'Sergej Belov, il capoturno. Onesto, stanco, con la cravatta allentata.',
      nina: 'Nina Gavrilenko, l\'archivista. Occhiali sulla punta del naso, nessuna voglia di fare favori a sconosciuti.',
      marcenko: 'Jurij Marcenko, venticinque anni, operatore del pannello delle barre. Ha l\'aria di chi esegue gli ordini.',
      kozlov: 'Anatolij Kozlov, vice capo ingegnere. Duro, competente, deciso a finire il test stanotte, costi quel che costi.',
      soldato: 'Un ragazzo di leva con il fucile in spalla e il colletto troppo largo.',
      cassiera: 'Una signora con il fazzoletto in testa. Conta i rubli due volte.'
    };
    return d[id];
  };

  Game.prototype.take = function (args) {
    var s = this.s;
    if (args[0] === 'DOSIMETRO' && s.loc === 'guardia') return this.ask(['DOSIMETRO']);
    if (args[0] === 'CHIAVE' && s.loc === 'archivio' && s.f.cassettoAperto && s.where.chiave === 'archivio') return this.takeKey();
    var id = this.findItem(args);
    if (!id || s.where[id] === 'inv') return id ? 'Ce l\'hai già.' : 'Non lo vedi qui.';
    if (!ITEMS[id].take) return 'Non puoi prenderlo.';
    this.give(id);
    if (id === 'rapporto') return this.found('rapporto', 'Prendi la cartella rossa. Dentro c\'è una lettera. Ti conviene LEGGERLA.');
    return 'Preso: ' + ITEMS[id].name + '.';
  };

  Game.prototype.takeKey = function () {
    var s = this.s;
    this.give('chiave');
    if (this.rng() < 1 / 3) {
      this.addCred(-3);
      return 'Proprio mentre prendi la chiave, una guardia passa davanti alla porta. "Cosa fa lei lì?" Balbetti una scusa. Ti lascia andare, ma domani lo sapranno tutti. (La tua credibilità crolla.)';
    }
    return 'Prendi la chiave. Nessuno ti ha visto. Il cuore ti batte forte.';
  };

  Game.prototype.dropCmd = function (args) {
    var id = this.findItem(args, 'inv');
    if (!id) return 'Non ce l\'hai.';
    if (id === 'camice' && this.s.worn) this.s.worn = false;
    this.s.where[id] = this.s.loc;
    return 'Lasciato: ' + ITEMS[id].name + '.';
  };

  Game.prototype.inventory = function () {
    var s = this.s, list = [];
    for (var id in s.where) if (s.where[id] === 'inv') list.push(ITEMS[id].name + (id === 'camice' && s.worn ? ' (indossato)' : ''));
    return 'Hai ' + s.rubli + ' rubli' + (list.length ? ' e:\n- ' + list.join('\n- ') : ' e nient\'altro.');
  };

  Game.prototype.read = function (args) {
    var s = this.s, id = this.findItem(args);
    if (!id) return 'Non c\'è niente del genere da leggere qui.';
    if (id === 'manuale') {
      s.f.manuale = true;
      return 'Sfogli il manuale. Al capitolo 7 trovi una frase sottolineata a matita da qualcuno prima di te:\n"Il reattore RBMK presenta un coefficiente di VUOTO POSITIVO: se l\'acqua del circuito si trasforma in vapore, la potenza aumenta."\nA margine qualcuno ha scritto: "E nessuno ci pensa mai."';
    }
    if (id === 'registro') {
      if (this.npcHere('fedor')) return 'Allunghi la mano verso il registro. Fedor ci mette sopra il gomito. "Non è roba per estranei, compagno ingegnere." Poi guarda il suo pacchetto vuoto e sospira.';
      this.give('appunti');
      return this.found('registro', 'Sfogli in fretta il registro. Vecchi arresti di emergenza, tutti in ordine. Ma tre volte, accanto alla parola AZ-5, qualcuno ha scritto a matita: "Picco di potenza nei primi secondi. Strano." E in margine, con un\'altra calligrafia: "Come a Leningrado, 1975?"\nCopi tutto sul tuo taccuino.');
    }
    if (id === 'rapporto') {
      return 'Una lettera del 1983, timbrata SEGRETO, da un istituto di ricerca di Mosca: "Durante prove sull\'RBMK è stato osservato che l\'inserimento delle barre di controllo dalla posizione completamente estratta provoca, nei primi secondi, un aumento della reattività, a causa delle punte di grafite. Con basso margine di barre il fenomeno può diventare pericoloso. Si raccomanda di modificare le barre." In fondo, una nota a penna: "Non distribuire."';
    }
    if (id === 'appunti') return ITEM_DESC.appunti;
    if (id === 'ordine') return ITEM_DESC.ordine(this);
    if (id === 'richiesta') return ITEM_DESC.richiesta;
    if (id === 'cartellino') return ITEM_DESC.cartellino;
    return 'Non c\'è niente da leggere.';
  };

  Game.prototype.wear = function (args) {
    var id = this.findItem(args, 'inv');
    if (id !== 'camice') return this.findItem(args) === 'camice' ? 'Prima devi prenderlo.' : 'Non puoi indossarlo.';
    if (this.s.worn) return 'Lo hai già addosso.';
    this.s.worn = true;
    return 'Indossi il camice bianco e il cappello. Adesso sembri uno di loro.';
  };

  Game.prototype.open = function (args) {
    var s = this.s, id = this.findItem(args);
    if (id === 'armadietto') {
      if (s.f.armadiettoAperto) return 'È già aperto.';
      s.f.armadiettoAperto = true; s.where.cartellino = 'spogliatoio';
      return 'Apri l\'armadietto di Ignatenko. Dentro c\'è un camice appeso e, attaccato al taschino, il suo cartellino.';
    }
    if (id === 'cassetto') {
      if (this.npcHere('nina')) return 'Nina ti guarda male. "Le serve qualcosa?"';
      if (s.f.cassettoAperto) return 'È già aperto.';
      s.f.cassettoAperto = true;
      if (s.where.chiave === undefined) s.where.chiave = 'archivio';
      return 'Apri il cassetto. Matite, timbri, una mela. E una chiave grossa con l\'etichetta "Deposito".';
    }
    if (args.indexOf('PORTA') >= 0 && s.loc === 'archivio') {
      if (s.f.depositoAperto) return 'È già aperta.';
      if (this.has('chiave')) { s.f.depositoAperto = true; return 'Giri la chiave. La porta di ferro si apre con un cigolio. A nord c\'è il deposito.'; }
      return this.npcHere('nina') ? 'Nina scuote la testa. "Senza una richiesta firmata dal capoturno, no."' : 'È chiusa a chiave.';
    }
    if (args.indexOf('PORTA') >= 0) return 'Basta andare nella direzione giusta.';
    return 'Non puoi aprirlo.';
  };

  Game.prototype.buy = function (args) {
    var s = this.s;
    if (s.loc === 'bar' && args.indexOf('BIRRA') >= 0) {
      if (s.rubli < 1) return 'Non hai rubli.';
      s.rubli--; return 'Una birra tiepida e schiumosa. Buona, ma ora hai un rublo in meno.';
    }
    if (s.loc !== 'universam') return 'Qui non si vende niente del genere.';
    if (s.t >= H(19)) return 'È chiuso.';
    var what = args.indexOf('VODKA') >= 0 || args.indexOf('BOTTIGLIA') >= 0 ? 'vodka' : (args.indexOf('SIGARETTE') >= 0 || args.indexOf('BELOMORKANAL') >= 0 || args.indexOf('PACCHETTO') >= 0 ? 'sigarette' : null);
    if (!what) return 'La cassiera: "Vodka o sigarette. Il resto è finito."';
    var price = what === 'vodka' ? 5 : 2;
    if (this.has(what) || s.f['used_' + what]) return 'Ne hai già presa una, basta così.';
    if (s.rubli < price) return 'Non hai abbastanza rubli. Ne servono ' + price + '.';
    s.rubli -= price; this.give(what);
    return 'Paghi ' + price + ' rubli. La cassiera ti dà ' + ITEMS[what].name + ' senza alzare lo sguardo.';
  };

  Game.prototype.giveCmd = function (args) {
    var s = this.s;
    var id = this.findItem(args, 'inv');
    if (!id) return 'Non hai niente del genere.';
    var npc = this.findNpc(args) || this.anyNpc();
    if (!npc) return 'Non c\'è nessuno a cui darlo.';
    if (id === 'sigarette' && npc === 'fedor') {
      this.drop('sigarette'); s.f.used_sigarette = true;
      s.fedorBack = s.moves + 4; // tre mosse libere dopo questa
      return 'Gli occhi di Fedor si illuminano. "Belomorkanal! Lei è un vero compagno." Si alza. "Vado a fumarne una qui fuori. Non tocchi niente, eh." Esce. Hai poco tempo.';
    }
    if (id === 'vodka' && npc === 'orlov') {
      this.drop('vodka'); s.f.used_vodka = true; s.f.orlovFriend = true;
      return 'Metti la bottiglia sul tavolino. Orlov la guarda, guarda te, e sposta un pedone per farti posto. "Siediti, ragazzo. Cosa vuoi sapere?" (Puoi CHIEDERGLI qualcosa.)';
    }
    if (id === 'richiesta' && npc === 'nina') return this.show(args);
    if (id === 'vodka') return 'Non ci pensa nemmeno. "Sono in servizio."';
    return 'Non sembra interessato.';
  };

  Game.prototype.show = function (args) {
    var s = this.s;
    var id = this.findItem(args, 'inv');
    var npc = this.findNpc(args) || this.anyNpc();
    if (!id) return 'Non hai niente del genere.';
    if (!npc) return 'Non c\'è nessuno a cui mostrarlo.';
    if (npc === 'belov' && (id === 'appunti')) {
      s.f.belovMet = true;
      if (s.t >= NIGHT) return 'Belov legge in fretta. "Ne parliamo dopo, Sorokin." Ma ora ti guarda in un altro modo.';
      if (s.f.richiesta) return '"Li ho già visti, Sorokin. Ho firmato, no?"';
      s.f.richiesta = true; this.give('richiesta');
      return 'Belov legge i tuoi appunti, si gratta la nuca. "Leningrado... ne ho sentito parlare. Va bene. Vada in archivio e guardi cosa c\'è." Firma un modulo e te lo dà. "Le aggiungo anche alla lista del turno di stanotte. Voglio averla vicino."';
    }
    if (npc === 'nina' && id === 'richiesta') {
      s.f.depositoAperto = true;
      return 'Nina legge la firma, sospira e prende un mazzo di chiavi. Apre la porta di ferro. "Ha dieci minuti. Non metta in disordine." A nord c\'è il deposito.';
    }
    if (npc === 'kozlov' && id === 'rapporto') {
      if (s.t < T_CRASH) return 'Kozlov non ti degna di uno sguardo. "Adesso no. Il reattore va benissimo." Devi aspettare il momento giusto.';
      if (s.f.rapportoShown) return 'L\'ha già letto.';
      s.f.rapportoShown = true; this.addCred(1);
      return 'Kozlov legge la lettera. Per un attimo smette di camminare.';
    }
    if (npc === 'soldato' && id === 'ordine') return this.ask(['DOSIMETRO']);
    if (npc === 'marcenko') return this.talk(['MARCENKO']);
    return 'Lo guarda senza capire cosa vuoi.';
  };

  Game.prototype.talk = function (args) {
    var s = this.s;
    var npc = this.findNpc(args) || this.anyNpc();
    if (!npc) return 'Non c\'è nessuno con cui parlare.';
    switch (npc) {
      case 'lisin':
        if (s.f.timbro) return '"Buon lavoro, ingegnere. E niente iniziative personali, mi raccomando."';
        if (!this.has('ordine')) return '"Chi è lei? Documenti, compagno. Torni quando ha il suo ordine di servizio."';
        if (s.t < s.lisinLock) return '"Le ho detto di tornare più tardi."';
        s.quiz = { i: 0, wrong: 0 };
        return 'Lisin prende il tuo ordine, lo legge e lo appoggia sulla scrivania. "Prima del timbro, qualche domanda di verifica. È la procedura."\n\n' + this.openMenu('quiz');
      case 'fedor': return '"Ufficio turni. Il registro non si tocca." Poi, fra sé: "E ho finito le sigarette..."';
      case 'orlov':
        if (!s.f.orlovFriend) return 'Orlov non alza gli occhi dalla scacchiera. "Non parlo con gli sconosciuti. E ho la gola secca."';
        if (s.f.orlovTold) return '"Ti ho detto tutto, ragazzo. Adesso vai, e stai attento stanotte."';
        return '"Allora? Chiedi." (Prova a CHIEDERGLI di qualcosa.)';
      case 'belov':
        s.f.belovMet = true;
        if (s.t >= NIGHT) return 'Belov, a bassa voce: "Kozlov vuole finire stanotte a ogni costo. Se ha qualcosa da dire, lo dica con le prove in mano."';
        return 'Belov ti stringe la mano. "Sorokin, la verifica tecnica. Bene, bene." Ti guarda meglio. "Ha l\'aria preoccupata. Se ha visto qualcosa, me lo mostri." Ti aggiunge alla lista del turno di notte.';
      case 'nina': return '"L\'archivio si consulta solo con una richiesta firmata dal capoturno. Chiudo alle venti."';
      case 'marcenko': return this.openMenu('marcenko');
      case 'kozlov':
        if (s.t < T_CRASH) return 'Kozlov ti squadra. "Lei è quello della verifica? Allora verifichi in silenzio. Stanotte si fa il test, è rinviato da tre anni."';
        return '"Parla, se hai qualcosa di utile da dire. Altrimenti zitto."';
      case 'soldato': return '"Documenti e dosimetro. Il dosimetro lo do io, se ha l\'ordine timbrato."';
      case 'cassiera': return '"Vodka cinque rubli, sigarette due. Altro non c\'è."';
    }
    return 'Non risponde.';
  };

  Game.prototype.ask = function (args) {
    var s = this.s;
    var npc = this.anyNpc();
    if (args.indexOf('DOSIMETRO') >= 0) {
      if (s.loc !== 'guardia') return 'I dosimetri li distribuiscono al posto di guardia.';
      if (this.has('dosimetro')) return 'Ce l\'hai già.';
      if (!this.has('ordine') || !s.f.timbro) return 'Il soldato: "Prima il timbro del Partito sull\'ordine di servizio."';
      this.give('dosimetro');
      return 'Il soldato controlla il timbro e ti dà un dosimetro a penna. "Lo tenga sempre addosso."';
    }
    if (npc === 'orlov' && (args.indexOf('LENINGRADO') >= 0 || args.indexOf('1975') >= 0)) {
      if (!s.f.orlovFriend) return 'Orlov fa finta di non sentire. Ha la gola secca.';
      if (s.f.orlovTold) return '"Ti ho già raccontato tutto."';
      if (!s.ind.registro) return '"Leningrado? Bella città. Perché me lo chiedi?" Non sai abbastanza per insistere.';
      s.f.awaitRiddle = true;
      return 'Orlov smette di sorridere. "Leningrado..." Ti fissa. "Prima dimmi una cosa, così capisco se sei un ingegnere o uno del Partito. In un RBMK, quando l\'acqua bolle e diventa vapore, che cosa succede? Come si chiama quel guaio?"\n(Scrivi la tua risposta.)';
    }
    if (npc === 'orlov') return '"Di questo non so niente." Orlov sposta un alfiere.';
    if (npc) return this.talk([]);
    return 'Non c\'è nessuno a cui chiedere.';
  };

  Game.prototype.phone = function () {
    var s = this.s;
    if (s.loc !== 'ufficiobelov') return 'Qui non c\'è un telefono.';
    if (s.f.kievCalled) return 'Hai già chiamato. Ora devono richiamare loro.';
    if (s.t >= H(23)) return 'Il dispaccio di Kiev: "Il test è già autorizzato, compagno. Buonanotte." Clic.';
    if (this.indizi() < 3) { this.addCred(-1); return 'Chiami il dispaccio di Kiev e provi a spiegare. "Ha delle prove? Chi è lei?" Non sai abbastanza per convincerli. Ti riattaccano in faccia.'; }
    s.f.kievCalled = true;
    return 'Chiami il dispaccio di Kiev. Parli dei picchi di potenza, di Leningrado, del rapporto di Mosca. Dall\'altra parte un lungo silenzio. "Va bene, ingegnere. Ne parlo con il mio capo. Richiameremo."';
  };

  Game.prototype.explain = function (args) {
    if (!args.length) return 'Cosa vuoi che ti spieghi? Termini: ' + Object.keys(GLOSSARY).join(', ') + '.';
    var k = args[0];
    k = GLOSS_ALIAS[k] || k;
    if (GLOSSARY[k]) return GLOSSARY[k];
    return 'Non conosco questo termine. Prova con: ' + Object.keys(GLOSSARY).join(', ') + '.';
  };

  Game.prototype.help = function () {
    return [
      'COMANDI',
      'Muoversi: N, S, E, O (oppure VAI NORD...)',
      'Guardarsi intorno: GUARDA. Esaminare: ESAMINA <cosa>',
      'Oggetti: PRENDI, LASCIA, LEGGI, APRI, INDOSSA, INVENTARIO (I)',
      'Persone: PARLA CON <chi>, CHIEDI DI <cosa>, DAI <cosa>, MOSTRA <cosa> A <chi>',
      'Negozi: COMPRA <cosa>. Viaggi: SALI SULLA NAVETTA, CAMMINA',
      'Tempo: ORA, ASPETTA. Situazione: STATO',
      'Termini tecnici: SPIEGA <termine> (es. SPIEGA ORM)',
      'Partita: SALVA, CARICA, RICOMINCIA',
      'Nei momenti di scelta scrivi il numero.'
    ].join('\n');
  };

  Game.prototype.save = function () {
    if (!this.storage) return 'Il salvataggio non è disponibile qui.';
    try { this.storage.setItem(SAVE_KEY, JSON.stringify(this.s)); return 'Partita salvata alle ' + clock(this.s.t) + '.'; }
    catch (e) { return 'Non riesco a salvare in questo browser.'; }
  };

  Game.prototype.load = function () {
    if (!this.storage) return 'Il salvataggio non è disponibile qui.';
    try {
      var d = this.storage.getItem(SAVE_KEY);
      if (!d) return 'Non c\'è nessuna partita salvata.';
      this.s = JSON.parse(d);
      return 'Partita caricata.\n\n' + this.look();
    } catch (e) { return 'Non riesco a caricare la partita.'; }
  };

  Game.prototype.isOver = function () { return this.s.over; };
  Game.prototype.time = function () { return clock(this.s.t); };

  Game.H = H; Game.clock = clock;
  if (typeof module !== 'undefined' && module.exports) module.exports = Game;
  else root.ChernobylGame = Game;
})(this);
