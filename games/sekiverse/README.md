# ?? SEKIVERSE

**Um jogo de escape room no browser** com 5 �reas tem�ticas, puzzles de l�gica, sistema de conquistas e 3 finais diferentes.

> *"22:00h. O turno acabou. Voc� se joga na cama, sentindo o peso de mais um dia exaustivo de trabalho. O sono vem r�pido, mas o despertar � estranho. Voc� n�o est� em casa..."*

**[? Jogar Agora](https://asafegamer05-glitch.github.io/sekiverse/)**

---

## ?? Sobre o Jogo

Sekiverse � um jogo de escape room que roda diretamente no navegador. Voc� acorda em uma sala misteriosa com um cron�metro de **5 minutos e 30 segundos**. Resolva puzzles, complete mini-games e escape antes que o tempo acabe � ou descubra o que acontece quando ele zera.

### ? Features

- ?? **5 �reas tem�ticas** com visual CSS �nico (Neon, Espelhos, Steampunk, Matrix, Vazio)
- ?? **25 desafios** � perguntas de l�gica + 5 mini-games interativos
- ?? **Cron�metro de 5:30** � press�o real, decis�es r�pidas
- ?? **10 conquistas** escondidas para desbloquear
- ?? **3 finais diferentes** baseados na sua performance
- ?? **Sistema de save** � exporta e importa seu progresso como `.json`
- ?? **Menu de op��es** com 5 configura��es (4 in�teis e 1 muito �til ??)
- ?? **Side stuff** � confete, glitch pets, mensagens engra�adas, contador de cliques
- ??? **�rea 5 com efeitos visuais** � tremor, buracos negros, distor��o progressiva
- ?? **Responsivo** � funciona em desktop e mobile

---

## ?? Como Jogar

1. Abra o jogo no navegador
2. Clique em **Play** no menu principal
3. Leia a lore (ou pule � tem a op��o nas configura��es!)
4. Resolva os puzzles de cada �rea para avan�ar
5. Complete as 5 �reas antes do tempo acabar
6. Descubra qual dos 3 finais voc� alcan�a!

### Mini-games

| �rea | Mini-game | Como funciona |
|------|-----------|---------------|
| 1 | ?? Mem�ria de Cores | Observe a sequ�ncia e repita na ordem |
| 2 | ?? Espelho de Palavras | Desembaralhe as letras para formar a palavra |
| 3 | ?? Cofre de Engrenagens | Use as pistas para descobrir a combina��o |
| 4 | ?? Decodificador | Ajuste o deslocamento para decifrar a mensagem |
| 5 | ?? Fragmentos do Vazio | Clique nos n�meros em ordem crescente |

---

## ?? Como Rodar Localmente

O Sekiverse � **100% client-side** � n�o precisa de backend, banco de dados ou build. Basta baixar e abrir.

### ?? Passo 1: Baixar o projeto

**Op��o A � Git Clone:**
```bash
git clone https://github.com/asafegamer05-glitch/sekiverse.git
cd sekiverse
```

**Op��o B � Download ZIP:**
1. Clique no bot�o verde **`<> Code`** no topo desta p�gina
2. Clique em **`Download ZIP`**
3. Extraia o ZIP em qualquer pasta do seu PC

### ??? Passo 2: Abrir o jogo

1. Abra a pasta `sekiverse/` no VS Code
2. Instale a extens�o **Live Server** (se n�o tiver)
3. Clique com bot�o direito no `index.html` ? **Open with Live Server**

### Op��o 2: Python

```bash
cd sekiverse
python -m http.server 8080
# Abra http://localhost:8080
```

### Op��o 3: Node.js

```bash
npx -y serve ./sekiverse
```

### Op��o 4: Abrir direto

D� um duplo-clique no `index.html`. Funciona na maioria dos browsers, mas alguns recursos podem n�o carregar por restri��es de CORS (usar
pelo github-pages tambem funciona igual esse).

---

## ?? Estrutura do Projeto

```
sekiverse/
+-- index.html          # P�gina principal
+-- README.md           # Este arquivo
+-- css/
�   +-- main.css        # Estilos base, layout, HUD, menus
�   +-- areas.css       # Temas visuais das 5 �reas
�   +-- animations.css  # Keyframes e transi��es
+-- js/
�   +-- data.js         # Dados do jogo (perguntas, badges, config)
�   +-- timer.js        # Cron�metro countdown
�   +-- badges.js       # Sistema de conquistas
�   +-- ui.js           # Manipula��o DOM e efeitos visuais
�   +-- puzzles.js      # Renderiza��o de perguntas e mini-games
�   +-- game.js         # Motor principal do jogo
+-- img/
    +-- true-ending-bg.jpg  # Imagem de fundo do True Ending
```

---

## ??? Tecnologias

- **HTML5** � Estrutura sem�ntica
- **CSS3** � Anima��es, temas, glassmorphism, gradientes
- **JavaScript (Vanilla)** � Sem frameworks, sem depend�ncias
- **localStorage** � Save system persistente
- **Google Fonts** � Inter, JetBrains Mono, Orbitron

---

## ?? Conquistas

<details>
<summary>?? Ver lista de conquistas (cont�m spoilers!)</summary>

| Badge | Nome | Como desbloquear |
|-------|------|------------------|
| ?? | Despertar | Complete a �rea 1 |
| ?? | Reflexo | Complete a �rea 2 |
| ?? | Mec�nico | Complete a �rea 3 |
| ?? | Hacker | Complete a �rea 4 |
| ??? | Voidwalker | Complete a �rea 5 |
| ??? | Meio Caminho | Complete 3 �reas |
| ? | Speedrunner | Termine com 1+ minuto sobrando |
| ?? | Perfeccionista | Erre no m�ximo 4 perguntas |
| ?? | Curioso | Encontre o easter egg no menu |
| ?? | Explorador | Interaja com os elementos secretos de todas as �reas |

</details>

---

## ?? Finais

<details>
<summary>?? Ver finais (cont�m spoilers!)</summary>

| Final | Condi��o |
|-------|----------|
| ?? **Backrooms** | O tempo acabou |
| ??? **Limbo** | Completou as 5 �reas (mas n�o tem todas as conquistas, ou � a primeira vez) |
| ? **True End** | Todas as 10 conquistas + j� ter visto o Limbo uma vez |

</details>

---

## ?? Sistema de Save

O jogo salva automaticamente no `localStorage` do browser. Voc� tamb�m pode:

- **Exportar** seu save como arquivo `.json` (menu Op��es ? Exportar Save)
- **Importar** um save `.json` de outro dispositivo
- **Apagar** todo o progresso

---

## ?? Cr�ditos

**Feito por [asafgamer](https://asafegamer05-glitch.github.io/Portf-lio-/)**

---

## ?? Licen�a

Este projeto � de c�digo aberto. Sinta-se livre para estudar, modificar e compartilhar.
