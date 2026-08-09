const GAME_DATA_PT = {
    loreText: `22:00h. O turno acabou. Voc� se joga na cama, sentindo o peso de mais um dia exaustivo de trabalho. O sono vem r�pido, mas o despertar � estranho. Voc� n�o est� em casa.\n\nVoc� acorda em uma sala apertada; � sua frente, um painel cobre a parede de ponta a ponta e, acima dele, um cron�metro digital marca 05:30 em vermelho neon.\n\nO jogo come�ou.`,
    timerSeconds: 330,
    areas: [
        {
            id: 1, name: "Sala do Despertar", subtitle: "O neon vermelho pulsa nas paredes. O ar cheira a metal quente.", theme: "area-neon", explorerHint: "Um monitor antigo pisca no canto da sala...",
            questions: [
                { question: "Qual � o pr�ximo n�mero na sequ�ncia: 2, 4, 6, 8, ?", options: ["9", "10", "12", "11"], correct: 1, explanation: "A sequ�ncia aumenta de 2 em 2. Logo, 8 + 2 = 10." },
                { question: "Se todos os gatos s�o animais, e Rex � um gato, o que podemos afirmar?", options: ["Rex � uma planta", "Rex � um animal", "Todos os animais s�o gatos", "Rex n�o � um animal"], correct: 1, explanation: "Se todos os gatos s�o animais e Rex � um gato, ent�o Rex � um animal." },
                { question: "Um fazendeiro tem 17 ovelhas. Todas, menos 9, fugiram. Quantas restaram?", options: ["8", "9", "17", "0"], correct: 1, explanation: "'Todas menos 9' significa que 9 ficaram." },
                { question: "Se um l�pis custa R$2 e uma borracha custa R$3, quanto custam 2 l�pis e 1 borracha?", options: ["R$5", "R$7", "R$8", "R$6"], correct: 1, explanation: "2 l�pis = R$4, 1 borracha = R$3. Total = R$7." }
            ],
            miniGame: { type: "simon", title: "Sequ�ncia de Mem�ria", description: "Observe a sequ�ncia de cores e repita na ordem correta.", sequenceLength: 4, colors: ["#ff0033", "#00aaff", "#00ff88", "#ffcc00"] }
        },
        {
            id: 2, name: "Corredor dos Espelhos", subtitle: "Reflexos infinitos distorcem sua imagem. Nada � o que parece.", theme: "area-mirrors", explorerHint: "Uma rachadura no espelho brilha estranhamente...",
            questions: [
                { question: "Se 3x + 7 = 22, qual o valor de x?", options: ["3", "5", "7", "4"], correct: 1, explanation: "3x = 22 - 7 = 15, logo x = 5." },
                { question: "Se 2(x - 3) = 10, ent�o x � igual a:", options: ["5", "8", "6", "7"], correct: 1, explanation: "2x - 6 = 10 ? 2x = 16 ? x = 8." },
                { question: "Um n�mero somado com seu dobro resulta em 45. Qual � esse n�mero?", options: ["20", "15", "22", "18"], correct: 1, explanation: "x + 2x = 45 ? 3x = 45 ? x = 15." },
                { question: "Se x + 5 = 12, qual o valor de x?", options: ["5", "6", "7", "8"], correct: 2, explanation: "x = 12 - 5 = 7." }
            ],
            miniGame: { type: "unscramble", title: "Espelho de Palavras", description: "As letras est�o embaralhadas pelo reflexo. Forme a palavra correta.", word: "REFLEXO", hint: "Algo que todo espelho mostra." }
        },
        {
            id: 3, name: "Sala das Engrenagens", subtitle: "Engrenagens rangem. Vapor escapa das paredes de bronze.", theme: "area-steampunk", explorerHint: "Uma engrenagem solta treme no ch�o...",
            questions: [
                { question: "Qual dia vem depois de ter�a-feira?", options: ["Segunda", "Quarta", "Quinta", "Domingo"], correct: 1, explanation: "Depois de ter�a vem quarta-feira." },
                { question: "Se A > B e B > C, quem � o maior?", options: ["B", "C", "A", "Todos iguais"], correct: 2, explanation: "A � maior que B, que � maior que C. Logo A � o maior." },
                { question: "Uma pizza foi dividida em 8 fatias. Voc� comeu 3 e seu amigo comeu 2. Quantas sobraram?", options: ["2", "4", "3", "5"], correct: 2, explanation: "8 - 3 - 2 = 3 fatias sobraram." },
                { question: "Quantos meses do ano t�m 31 dias?", options: ["5", "6", "7", "8"], correct: 2, explanation: "Jan, Mar, Mai, Jul, Ago, Out, Dez = 7 meses com 31 dias." }
            ],
            miniGame: { type: "lock", title: "Cofre de Engrenagens", description: "Decifre a combina��o do cofre usando as pistas.", answer: [3, 7], clues: ["A soma dos dois d�gitos � 10.", "O primeiro d�gito � �mpar e menor que 5."] }
        },
        {
            id: 4, name: "Laborat�rio Digital", subtitle: "C�digo verde cai pelas paredes como chuva. Voc� � dado.", theme: "area-matrix", explorerHint: "Um terminal esquecido exibe um prompt piscando...",
            questions: [
                { question: "Quanto � 1010 em bin�rio convertido para decimal?", options: ["8", "10", "12", "5"], correct: 1, explanation: "1�8 + 0�4 + 1�2 + 0�1 = 10." },
                { question: "Quantos bits existem em 1 byte?", options: ["4", "8", "16", "32"], correct: 1, explanation: "1 byte = 8 bits." },
                { question: "Qual linguagem � mais usada para criar sites?", options: ["Python", "Java", "HTML", "C++"], correct: 2, explanation: "HTML � a linguagem base de toda p�gina web." },
                { question: "O que significa 'Wi-Fi'?", options: ["Wireless Fidelity", "Wide Finder", "Wire File", "Window First"], correct: 0, explanation: "Wi-Fi vem de 'Wireless Fidelity'." }
            ],
            miniGame: { type: "cipher", title: "Decodificador", description: "Ajuste o deslocamento para decifrar a mensagem secreta.", encoded: "IXJD", decoded: "FUGA", correctShift: 3, hint: "A resposta � uma palavra que significa escapar." }
        },
        {
            id: 5, name: "O Vazio", subtitle: "Tudo desaparece. A realidade treme. S� resta... isto.", theme: "area-void", explorerHint: "Um fragmento de realidade flutua � deriva...",
            questions: [
                { question: "Ao jogar uma moeda, qual a chance de cair cara?", options: ["25%", "50%", "75%", "100%"], correct: 1, explanation: "Uma moeda tem dois lados, ent�o a chance � 50%." },
                { question: "Qual o resultado de 100 � 4?", options: ["20", "25", "30", "50"], correct: 1, explanation: "100 dividido por 4 = 25." },
                { question: "Qual planeta do sistema solar � conhecido como 'planeta vermelho'?", options: ["J�piter", "V�nus", "Marte", "Saturno"], correct: 2, explanation: "Marte � conhecido pela sua cor avermelhada." },
                { question: "Se voc� virar uma luva direita do avesso, ela servir� para qual m�o?", options: ["Direita", "Esquerda", "Ambas", "Nenhuma"], correct: 1, explanation: "Ao virar do avesso, a luva espelha." }
            ],
            miniGame: { type: "order", title: "Fragmentos do Vazio", description: "Clique nos fragmentos na ordem correta (1 ? 8) antes que a realidade colapse.", count: 8 }
        }
    ],
    badges: [
        { id: "despertar", name: "Despertar", icon: "??", description: "Complete a �rea 1 � Sala do Despertar." },
        { id: "reflexo", name: "Reflexo", icon: "??", description: "Complete a �rea 2 � Corredor dos Espelhos." },
        { id: "mecanico", name: "Mec�nico", icon: "??", description: "Complete a �rea 3 � Sala das Engrenagens." },
        { id: "hacker", name: "Hacker", icon: "??", description: "Complete a �rea 4 � Laborat�rio Digital." },
        { id: "voidwalker", name: "Voidwalker", icon: "???", description: "Complete a �rea 5 � O Vazio." },
        { id: "speedrunner", name: "Speedrunner", icon: "?", description: "Complete o jogo com mais de 1 minuto sobrando." },
        { id: "perfeccionista", name: "Perfeccionista", icon: "??", description: "Termine o jogo errando no m�ximo 4 perguntas." },
        { id: "meio_caminho", name: "Meio Caminho", icon: "???", description: "Complete 3 �reas." },
        { id: "curioso", name: "Curioso", icon: "??", description: "Encontre o easter egg escondido." },
        { id: "explorador", name: "Explorador", icon: "??", description: "Interaja com todos os elementos secretos." }
    ],
    endings: {
        trueEnd: { id: "true", title: "TRUE END", text: "O cen�rio se dissolve em pixels. O ar pesado do escrit�rio some e voc� desperta em uma plan�cie verde infinita.\n\nUma casa solit�ria range ao vento logo � frente.\n\nAo girar a ma�aneta...\n\n? To be continued.", theme: "ending-true" },
        limbo: { id: "limbo", title: "LIMBO", text: "Voc� cruzou a linha de chegada, mas o vazio ainda te persegue.\n\nVoc� est� em um espa�o branco infinito com uma placa:\n\n\"Tente novamente. N�o deixe segredos para tr�s.\"", theme: "ending-limbo" },
        backrooms: { id: "backrooms", title: "THE BACKROOMS", text: "O cron�metro zera. O zumbido das luzes fluorescentes aumenta at� ficar insuport�vel.\n\nVoc� est� em um labirinto de paredes amarelas e carpete �mido.\n\nO tempo acabou aqui, mas algo acabou de come�ar ali na frente...", theme: "ending-backrooms" }
    },
    areaCompleteText: [
        "A porta se abre com um estalo. O neon morre atr�s de voc�.",
        "Os espelhos racham em un�ssono. O caminho se revela.",
        "As engrenagens param. O sil�ncio � ensurdecedor.",
        "O c�digo para de cair. Uma sa�da se materializa.",
        "O vazio te aceita. Voc� est� livre... ou nem tanto."
    ],
    secondPlayLoreText: `22:00h. O turno acabou. Voc� se joga na cama, sentindo o peso de mais um dia exaustivo de trabalho. O sono vem r�pido, mas o despertar � estranho. Voc� n�o est� em casa.\n\nVoc� acorda em uma sala apertada; � sua frente, um painel cobre a parede de ponta a ponta e, acima dele, um cron�metro digital marca 05:30 em vermelho neon.\n\nVoc� lembra do que eu disse, n�? Tente zerar dessa vez sem deixar nada pra tr�s.....`,
    funnyMessages: [
        "Dica: respire fundo. Ou n�o, tanto faz.",
        "Sabia que um polvo tem 3 cora��es? Agora sabe.",
        "Loading... piada engra�ada... ERROR 404",
        "Voc� j� piscou 47 vezes desde que come�ou.",
        "Se voc� errar, eu n�o vou te julgar. Mentira, vou sim.",
        "Plot twist: o jogo joga voc�.",
        "O cron�metro t� correndo. Eu tamb�m estaria.",
        "Fato in�til: bananas s�o tecnicamente berries.",
        "Parab�ns! Voc� achou uma mensagem secreta! ...ou n�o.",
        "O dev desse jogo t� orgulhoso de voc�. Provavelmente.",
        "N�o, n�o tem como pausar. Boa sorte.",
        "Voc� sabia que flamingos podem beber �gua fervente? Bizarro."
    ],
    optionsConfig: [
        { key: "skipIntro", label: "?? Pular Intro", type: "toggle", useful: true, desc: "Pula o texto de introdu��o � muito �til pra quem j� viu" },
        { key: "pizzaMode", label: "?? Modo Pizza", type: "toggle", useful: false, desc: "Transforma o cursor em uma pizza. Por que n�o?" },
        { key: "rotation", label: "?? Girar Tela", type: "slider", min: 0, max: 360, useful: false, desc: "Gira a tela inteira. Totalmente desnecess�rio." },
        { key: "partyMode", label: "?? Modo Festa", type: "toggle", useful: false, desc: "CONFETE INFINITO PRA SEMPRE!!!" },
        { key: "silenceVolume", label: "?? Volume do Sil�ncio", type: "slider", min: 0, max: 100, useful: false, desc: "Controla o volume do som que n�o existe" }
    ]
};

const GAME_DATA_EN = {
    loreText: `10:00 PM. Your shift is over. You throw yourself onto the bed, feeling the weight of another exhausting workday. Sleep comes fast, but awakening is strange. You are not at home.\n\nYou wake up in a cramped room; in front of you, a panel covers the wall from end to end, and above it, a digital timer reads 05:30 in neon red.\n\nThe game has begun.`,
    timerSeconds: 330,
    areas: [
        {
            id: 1, name: "Awakening Room", subtitle: "Red neon pulses on the walls. The air smells of hot metal.", theme: "area-neon", explorerHint: "An old monitor blinks in the corner of the room...",
            questions: [
                { question: "What is the next number in the sequence: 2, 4, 6, 8, ?", options: ["9", "10", "12", "11"], correct: 1, explanation: "The sequence increases by 2. Thus, 8 + 2 = 10." },
                { question: "If all cats are animals, and Rex is a cat, what can we state?", options: ["Rex is a plant", "Rex is an animal", "All animals are cats", "Rex is not an animal"], correct: 1, explanation: "If all cats are animals and Rex is a cat, then Rex is an animal." },
                { question: "A farmer has 17 sheep. All but 9 ran away. How many are left?", options: ["8", "9", "17", "0"], correct: 1, explanation: "'All but 9' means 9 stayed." },
                { question: "If a pencil costs $2 and an eraser costs $3, how much for 2 pencils and 1 eraser?", options: ["$5", "$7", "$8", "$6"], correct: 1, explanation: "2 pencils = $4, 1 eraser = $3. Total = $7." }
            ],
            miniGame: { type: "simon", title: "Memory Sequence", description: "Observe the color sequence and repeat in the correct order.", sequenceLength: 4, colors: ["#ff0033", "#00aaff", "#00ff88", "#ffcc00"] }
        },
        {
            id: 2, name: "Hall of Mirrors", subtitle: "Infinite reflections distort your image. Nothing is what it seems.", theme: "area-mirrors", explorerHint: "A crack in the mirror glows strangely...",
            questions: [
                { question: "If 3x + 7 = 22, what is the value of x?", options: ["3", "5", "7", "4"], correct: 1, explanation: "3x = 22 - 7 = 15, so x = 5." },
                { question: "If 2(x - 3) = 10, then x equals:", options: ["5", "8", "6", "7"], correct: 1, explanation: "2x - 6 = 10 ? 2x = 16 ? x = 8." },
                { question: "A number added to its double is 45. What is this number?", options: ["20", "15", "22", "18"], correct: 1, explanation: "x + 2x = 45 ? 3x = 45 ? x = 15." },
                { question: "If x + 5 = 12, what is the value of x?", options: ["5", "6", "7", "8"], correct: 2, explanation: "x = 12 - 5 = 7." }
            ],
            miniGame: { type: "unscramble", title: "Mirror Words", description: "The letters have been mirrored and scrambled. Form the correct word.", word: "REFLEX", hint: "Something every mirror shows." }
        },
        {
            id: 3, name: "Gear Room", subtitle: "Gears grind. Steam escapes from the bronze walls.", theme: "area-steampunk", explorerHint: "A loose gear trembles on the floor...",
            questions: [
                { question: "What day comes after Tuesday?", options: ["Monday", "Wednesday", "Thursday", "Sunday"], correct: 1, explanation: "After Tuesday comes Wednesday." },
                { question: "If A > B and B > C, who is the biggest?", options: ["B", "C", "A", "All equal"], correct: 2, explanation: "A is greater than B, which is greater than C. Thus A is the greatest." },
                { question: "A pizza was divided into 8 slices. You ate 3 and your friend 2. How many are left?", options: ["2", "4", "3", "5"], correct: 2, explanation: "8 - 3 - 2 = 3 slices left." },
                { question: "How many months of the year have 31 days?", options: ["5", "6", "7", "8"], correct: 2, explanation: "Jan, Mar, May, Jul, Aug, Oct, Dec = 7 months." }
            ],
            miniGame: { type: "lock", title: "Gear Vault", description: "Decipher the vault's combination using the clues.", answer: [3, 7], clues: ["The sum of the two digits is 10.", "The first digit is odd and less than 5."] }
        },
        {
            id: 4, name: "Digital Lab", subtitle: "Green code falls on the walls like rain. You are data.", theme: "area-matrix", explorerHint: "A forgotten terminal shows a blinking prompt...",
            questions: [
                { question: "What is 1010 in binary converted to decimal?", options: ["8", "10", "12", "5"], correct: 1, explanation: "1�8 + 0�4 + 1�2 + 0�1 = 10." },
                { question: "How many bits are in 1 byte?", options: ["4", "8", "16", "32"], correct: 1, explanation: "1 byte = 8 bits." },
                { question: "Which language is most used to create websites?", options: ["Python", "Java", "HTML", "C++"], correct: 2, explanation: "HTML is the base language of every web page." },
                { question: "What does 'Wi-Fi' stand for?", options: ["Wireless Fidelity", "Wide Finder", "Wire File", "Window First"], correct: 0, explanation: "Wi-Fi comes from 'Wireless Fidelity'." }
            ],
            miniGame: { type: "cipher", title: "Decoder", description: "Adjust the shift to decrypt the secret message.", encoded: "IOHH", decoded: "FLEE", correctShift: 3, hint: "The answer is a word that means to run away." }
        },
        {
            id: 5, name: "The Void", subtitle: "Everything vanishes. Reality trembles. Only this remains.", theme: "area-void", explorerHint: "A fragment of reality drifts aimlessly...",
            questions: [
                { question: "When flipping a coin, what is the chance of heads?", options: ["25%", "50%", "75%", "100%"], correct: 1, explanation: "A coin has two sides. The chance is 50%." },
                { question: "What is the result of 100 � 4?", options: ["20", "25", "30", "50"], correct: 1, explanation: "100 divided by 4 = 25." },
                { question: "Which planet in the solar system is known as the 'red planet'?", options: ["Jupiter", "Venus", "Mars", "Saturn"], correct: 2, explanation: "Mars is known for its reddish surface." },
                { question: "If you turn a right glove inside out, which hand will it fit?", options: ["Right", "Left", "Both", "None"], correct: 1, explanation: "Turning it inside out mirrors the glove." }
            ],
            miniGame: { type: "order", title: "Void Fragments", description: "Click the fragments in the correct order (1 ? 8) before reality collapses.", count: 8 }
        }
    ],
    badges: [
        { id: "despertar", name: "Awakening", icon: "??", description: "Complete Area 1 � Awakening Room." },
        { id: "reflexo", name: "Reflection", icon: "??", description: "Complete Area 2 � Hall of Mirrors." },
        { id: "mecanico", name: "Mechanic", icon: "??", description: "Complete Area 3 � Gear Room." },
        { id: "hacker", name: "Hacker", icon: "??", description: "Complete Area 4 � Digital Lab." },
        { id: "voidwalker", name: "Voidwalker", icon: "???", description: "Complete Area 5 � The Void." },
        { id: "speedrunner", name: "Speedrunner", icon: "?", description: "Complete the game with more than 1 minute left." },
        { id: "perfeccionista", name: "Perfectionist", icon: "??", description: "Finish the game getting at most 4 wrong answers." },
        { id: "meio_caminho", name: "Halfway There", icon: "???", description: "Complete 3 areas." },
        { id: "curioso", name: "Curious", icon: "??", description: "Find the hidden easter egg." },
        { id: "explorador", name: "Explorer", icon: "??", description: "Interact with all the secret elements." }
    ],
    endings: {
        trueEnd: { id: "true", title: "TRUE END", text: "The scenery dissolves into pixels. The heavy office air vanishes and you awaken in an endless green plain.\n\nA lone house creaks against the wind just ahead.\n\nAs you turn the doorknob...\n\n? To be continued.", theme: "ending-true" },
        limbo: { id: "limbo", title: "LIMBO", text: "You crossed the finish line, but the void still stalks you.\n\nYou are in an endless white space with a sign:\n\n\"Try again. Leave no secrets behind.\"", theme: "ending-limbo" },
        backrooms: { id: "backrooms", title: "THE BACKROOMS", text: "The timer hits zero. The hum of fluorescent lights grows until it's unbearable.\n\nYou are in a maze of yellow walls and damp carpet.\n\nTime is up here, but something has just begun right ahead...", theme: "ending-backrooms" }
    },
    areaCompleteText: [
        "The door snaps open. The neon dies behind you.",
        "The mirrors crack in unison. The path reveals itself.",
        "The gears halt. The silence is deafening.",
        "The code stops falling. An exit materializes.",
        "The void accepts you. You are free... or not."
    ],
    secondPlayLoreText: `10:00 PM. Your shift is over. You throw yourself onto the bed, feeling the weight of another exhausting workday. Sleep comes fast, but awakening is strange. You are not at home.\n\nYou wake up in a cramped room; in front of you, a panel covers the wall from end to end, and above it, a digital timer reads 05:30 in neon red.\n\nYou remember what I said, right? Try to finish this time without leaving anything behind.....`,
    funnyMessages: [
        "Tip: take a deep breath. Or don't, whatever.",
        "Did you know an octopus has 3 hearts? Now you do.",
        "Loading... funny joke... ERROR 404",
        "You've blinked 47 times since you started.",
        "If you get it wrong, I won't judge you. Just kidding, I will.",
        "Plot twist: the game is playing you.",
        "The timer is running. I would be too.",
        "Useless fact: bananas are technically berries.",
        "Congratulations! You found a secret message! ...or not.",
        "The dev of this game is proud of you. Probably.",
        "No, there is no pause button. Good luck.",
        "Did you know flamingos can drink boiling water? Bizarre."
    ],
    optionsConfig: [
        { key: "skipIntro", label: "?? Skip Intro", type: "toggle", useful: true, desc: "Skips the intro text � very useful for returning players" },
        { key: "pizzaMode", label: "?? Pizza Mode", type: "toggle", useful: false, desc: "Turns the cursor into a pizza. Why not?" },
        { key: "rotation", label: "?? Spin Screen", type: "slider", min: 0, max: 360, useful: false, desc: "Spins the whole screen. Totally unnecessary." },
        { key: "partyMode", label: "?? Party Mode", type: "toggle", useful: false, desc: "INFINITE CONFETTI FOREVER!!!" },
        { key: "silenceVolume", label: "?? Silence Volume", type: "slider", min: 0, max: 100, useful: false, desc: "Controls the volume of the sound that doesn't exist" }
    ]
};

const GAME_DATA = window.currentLang === 'en' ? GAME_DATA_EN : GAME_DATA_PT;
