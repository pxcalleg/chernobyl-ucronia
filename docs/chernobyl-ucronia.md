# Chernobyl Ucronia - Il disastro sventato

Avventura testuale in stile anni 80 (Applesoft BASIC, come *Avventura nel Castello*), con scelte alla librogame nei momenti chiave.

**Decisioni prese (23 novembre 2026):** nomi di fantasia, protagonista ingegnere esterno, breve epilogo solo in caso di vittoria. Il fulcro è scoprire il difetto delle barre e gestirlo. Termini tecnici veri, spiegati alla perfezione. Tutto in italiano, con imprecazioni in russo. Si può vincere anche con due indizi su tre.

## Premessa
Pripyat, venerdì 25 aprile 1986. Stanotte sul reattore 4 si farà un test di sicurezza già rinviato più volte. Qualcosa nei registri non torna, e tu sei l'unico che se ne accorge. Hai una notte per capire cosa c'è di sbagliato nel reattore e impedire che il test lo faccia esplodere.

## Il protagonista
**Pavel Sorokin**, giovane ingegnere appena trasferito da un'altra centrale per una verifica tecnica. Non conosce nessuno e nessuno gli deve nulla. All'inizio **non sa** del difetto: lo scopre giocando.

## Il difetto (il cuore del gioco)
Le barre di controllo hanno in fondo una punta di grafite. Quando si inseriscono tutte insieme con il pulsante di emergenza **AZ-5**, per qualche secondo la grafite spinge via l'acqua e la potenza **sale** invece di scendere. A piena potenza non è grave. Ma con il reattore instabile e quasi tutte le barre estratte, premere AZ-5 lo fa esplodere.
La trappola finale è questa: il pulsante "sicuro" è proprio quello che uccide. Chi non ha scoperto il difetto lo preme e perde.

## Struttura
### Atto 1 - L'indagine (25 aprile, pomeriggio e sera)
Esplorazione libera a parser di Pripyat e della centrale. Con **tre indizi** Pavel capisce il difetto fino in fondo. Con **due** ha capito abbastanza per provarci, ma la notte è molto più difficile (vedi Difficoltà). Con uno o nessuno ha solo un sospetto e nessuno lo ascolta.
1. **Il registro di turno**: picchi di potenza strani registrati durante vecchi arresti di emergenza.
2. **Il vecchio Orlov**: un ingegnere in pensione al bar di Pripyat racconta, se lo conquisti, un incidente insabbiato in un'altra centrale anni prima.
3. **Il rapporto riservato**: nell'archivio tecnico, chiuso a chiave, una lettera di un istituto di ricerca che descrive il problema delle punte di grafite. Mai fatta circolare.

Ogni indizio trovato è anche una **prova** da mostrare in sala controllo.

### Atto 2 - La notte (23:10 - 01:23)
Un orologio avanza a ogni comando. In sala controllo il vice capo ingegnere vuole chiudere il test a ogni costo, la potenza crolla, gli operatori estraggono barre per risollevarla. Pavel deve **gestire il difetto**:
- far rinviare il test (servono prove e l'appoggio del capoturno);
- impedire che le barre scendano sotto il margine di sicurezza;
- se la situazione precipita, **non** premere AZ-5 e trovare un'altra via per ridurre la potenza piano.

### Finale
- **Vittoria**: breve epilogo. Il test è rinviato, il rapporto arriva a Mosca, gli RBMK vengono modificati. Qualche riga in stile telegiornale su un 1986 che non è mai successo.
- **Sconfitta**: alle 01:23:40 lo schermo si ferma. Una riga sobria con la data vera.

## Meccaniche
- **Orologio**: ogni azione costa minuti. Alcune porte si chiudono se arrivi tardi (Orlov va a dormire, l'archivista stacca alle 20).
- **Indicatori** (comando STATO, a fosfori verdi): *Potenza*, *Barre inserite*, *Credibilità*, *Indizi 0/3*.
- **Credibilità**: sale con le prove e gli alleati, scende se insisti senza prove o se disobbedisci troppo presto.
- **Momenti librogame**: nei confronti decisivi il parser si ferma e compaiono scelte numerate.

## Personaggi (nomi di fantasia)
- **Anatolij Kozlov**, vice capo ingegnere. Duro, competente, deciso a finire il test stanotte.
- **Sergej Belov**, capoturno. Onesto, sotto pressione, può diventare il tuo alleato chiave.
- **Jurij Marčenko**, giovane operatore al pannello delle barre. Esegue gli ordini, ma ha paura.
- **Nina Gavrilenko**, archivista tecnica. Ha le chiavi dell'archivio.
- **Mikhail Orlov**, ingegnere in pensione, sa più di quanto dice.
- **Compagno Lisin**, funzionario del Partito. Non vuole problemi né scandali.

## Cosa lo rende speciale
Il giocatore conosce la storia vera, ma deve scoprire *perché* è andata così e convincere gli altri prima delle 01:23. Il tono è teso e rispettoso: è un evento reale con vittime reali.

## Difficoltà: due o tre indizi
- **Tre indizi**: Pavel parte con Credibilità alta, Belov lo ascolta subito e il gioco gli suggerisce il margine sicuro di barre.
- **Due indizi**: si può vincere lo stesso, ma Pavel parte con Credibilità bassa, deve trovare le parole giuste nei confronti librogame e non riceve aiuti sul margine: deve leggere gli strumenti da solo.
- **Uno o nessuno**: in pratica non si vince, ma il gioco lascia provare (e morire).

## Termini tecnici (veri, spiegati nel gioco)
Ogni termine compare la prima volta in sala controllo, e Pavel lo spiega in una frase semplice. Il comando SPIEGA <termine> lo ripete quando vuoi.
- **RBMK-1000**: il tipo di reattore. Usa grafite per rallentare i neutroni e acqua per raffreddare. Produce 3200 MW di calore a piena potenza.
- **MW (megawatt)**: misura della potenza. Il test doveva farsi a 700-1000 MW; quella notte la potenza crollò a circa 30 MW e poi fu riportata a circa 200, troppo poco per un reattore stabile.
- **Barre di controllo**: aste di boro che assorbono neutroni. Dentro il nocciolo frenano la reazione, fuori la lasciano correre.
- **ORM (margine operativo di reattività)**: quante barre "equivalenti" sono ancora dentro il nocciolo. Il regolamento chiedeva almeno 15; quella notte erano scese a circa 6-8. È l'indicatore *Barre inserite* del gioco.
- **Avvelenamento da xeno**: dopo ore a bassa potenza si accumula xeno, un gas che assorbe neutroni e "soffoca" il reattore. Per questo la potenza non risaliva e gli operatori estrassero quasi tutte le barre.
- **Coefficiente di vuoto positivo**: nell'RBMK, se l'acqua bolle e diventa vapore, la potenza aumenta invece di diminuire. Più vapore significa più potenza, che significa più vapore.
- **Punte di grafite**: in fondo a ogni barra c'è un pezzo di grafite. Quando la barra scende dalla posizione tutta estratta, per i primi secondi la grafite prende il posto dell'acqua e la potenza sale. È il difetto del gioco.
- **AZ-5**: il pulsante di arresto di emergenza, che fa scendere tutte le barre insieme. Con l'ORM alto funziona. Con l'ORM bassissimo e il coefficiente di vuoto positivo, le punte di grafite fanno salire la potenza tutte insieme ed è l'esplosione.
- **Test di rundown della turbina**: la prova di quella notte. Si voleva verificare se la turbina, rallentando, produce abbastanza elettricità per far girare le pompe dell'acqua finché partono i generatori diesel.

## Imprecazioni in russo
I personaggi parlano italiano, ma quando la situazione precipita imprecano in russo (traslitterato, con traduzione la prima volta). Kozlov è il più colorito, Belov impreca solo quando è terrorizzato, e Pavel le impara durante la notte.
- *Čërt!*: "Diavolo!"
- *Čërt voz'mi!*: "Che il diavolo se lo porti!"
- *Bljat'!*: l'imprecazione russa per eccellenza, tipo "Cazzo!"
- *Tvoju mat'!*: "Tua madre!", insulto rivolto a qualcuno.
- *Gospodi!*: "Signore!", quando si ha paura.
- *Idi k čërtu!*: "Va' al diavolo!"
