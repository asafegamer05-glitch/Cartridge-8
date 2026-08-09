# 🌀 SEKIVERSE

**Um jogo de escape room no browser** com 5 áreas temáticas, puzzles de lógica, sistema de conquistas e 3 finais diferentes.

> *"22:00h. O turno acabou. Você se joga na cama, sentindo o peso de mais um dia exaustivo de trabalho. O sono vem rápido, mas o despertar é estranho. Você não está em casa..."*

**[▶ Jogar Agora](https://asafegamer05-glitch.github.io/sekiverse/)**

---

## 📖 Sobre o Jogo

Sekiverse é um jogo de escape room que roda diretamente no navegador. Você acorda em uma sala misteriosa com um cronômetro de **5 minutos e 30 segundos**. Resolva puzzles, complete mini-games e escape antes que o tempo acabe — ou descubra o que acontece quando ele zera.

### ✨ Features

- 🎨 **5 áreas temáticas** com visual CSS único (Neon, Espelhos, Steampunk, Matrix, Vazio)
- 🧩 **25 desafios** — perguntas de lógica + 5 mini-games interativos
- ⏱️ **Cronômetro de 5:30** — pressão real, decisões rápidas
- 🏆 **10 conquistas** escondidas para desbloquear
- 🔚 **3 finais diferentes** baseados na sua performance
- 💾 **Sistema de save** — exporta e importa seu progresso como `.json`
- ⚙️ **Menu de opções** com 5 configurações (4 inúteis e 1 muito útil 😉)
- 🎉 **Side stuff** — confete, glitch pets, mensagens engraçadas, contador de cliques
- 🕳️ **Área 5 com efeitos visuais** — tremor, buracos negros, distorção progressiva
- 📱 **Responsivo** — funciona em desktop e mobile

---

## 🎮 Como Jogar

1. Abra o jogo no navegador
2. Clique em **Play** no menu principal
3. Leia a lore (ou pule — tem a opção nas configurações!)
4. Resolva os puzzles de cada área para avançar
5. Complete as 5 áreas antes do tempo acabar
6. Descubra qual dos 3 finais você alcança!

### Mini-games

| Área | Mini-game | Como funciona |
|------|-----------|---------------|
| 1 | 🎵 Memória de Cores | Observe a sequência e repita na ordem |
| 2 | 🔤 Espelho de Palavras | Desembaralhe as letras para formar a palavra |
| 3 | 🔒 Cofre de Engrenagens | Use as pistas para descobrir a combinação |
| 4 | 🔐 Decodificador | Ajuste o deslocamento para decifrar a mensagem |
| 5 | 🎯 Fragmentos do Vazio | Clique nos números em ordem crescente |

---

## 🚀 Como Rodar Localmente

O Sekiverse é **100% client-side** — não precisa de backend, banco de dados ou build. Basta baixar e abrir.

### 📥 Passo 1: Baixar o projeto

**Opção A — Git Clone:**
```bash
git clone https://github.com/asafegamer05-glitch/sekiverse.git
cd sekiverse
```

**Opção B — Download ZIP:**
1. Clique no botão verde **`<> Code`** no topo desta página
2. Clique em **`Download ZIP`**
3. Extraia o ZIP em qualquer pasta do seu PC

### 🖥️ Passo 2: Abrir o jogo

1. Abra a pasta `sekiverse/` no VS Code
2. Instale a extensão **Live Server** (se não tiver)
3. Clique com botão direito no `index.html` → **Open with Live Server**

### Opção 2: Python

```bash
cd sekiverse
python -m http.server 8080
# Abra http://localhost:8080
```

### Opção 3: Node.js

```bash
npx -y serve ./sekiverse
```

### Opção 4: Abrir direto

Dê um duplo-clique no `index.html`. Funciona na maioria dos browsers, mas alguns recursos podem não carregar por restrições de CORS (usar
pelo github-pages tambem funciona igual esse).

---

## 📁 Estrutura do Projeto

```
sekiverse/
├── index.html          # Página principal
├── README.md           # Este arquivo
├── css/
│   ├── main.css        # Estilos base, layout, HUD, menus
│   ├── areas.css       # Temas visuais das 5 áreas
│   └── animations.css  # Keyframes e transições
├── js/
│   ├── data.js         # Dados do jogo (perguntas, badges, config)
│   ├── timer.js        # Cronômetro countdown
│   ├── badges.js       # Sistema de conquistas
│   ├── ui.js           # Manipulação DOM e efeitos visuais
│   ├── puzzles.js      # Renderização de perguntas e mini-games
│   └── game.js         # Motor principal do jogo
└── img/
    └── true-ending-bg.jpg  # Imagem de fundo do True Ending
```

---

## 🛠️ Tecnologias

- **HTML5** — Estrutura semântica
- **CSS3** — Animações, temas, glassmorphism, gradientes
- **JavaScript (Vanilla)** — Sem frameworks, sem dependências
- **localStorage** — Save system persistente
- **Google Fonts** — Inter, JetBrains Mono, Orbitron

---

## 🏆 Conquistas

<details>
<summary>🔍 Ver lista de conquistas (contém spoilers!)</summary>

| Badge | Nome | Como desbloquear |
|-------|------|------------------|
| 🌅 | Despertar | Complete a Área 1 |
| 🪞 | Reflexo | Complete a Área 2 |
| ⚙️ | Mecânico | Complete a Área 3 |
| 💻 | Hacker | Complete a Área 4 |
| 🕳️ | Voidwalker | Complete a Área 5 |
| 🛤️ | Meio Caminho | Complete 3 áreas |
| ⚡ | Speedrunner | Termine com 1+ minuto sobrando |
| 💎 | Perfeccionista | Erre no máximo 4 perguntas |
| 🔍 | Curioso | Encontre o easter egg no menu |
| 🧭 | Explorador | Interaja com os elementos secretos de todas as áreas |

</details>

---

## 🔚 Finais

<details>
<summary>🔍 Ver finais (contém spoilers!)</summary>

| Final | Condição |
|-------|----------|
| 💀 **Backrooms** | O tempo acabou |
| 🌫️ **Limbo** | Completou as 5 áreas (mas não tem todas as conquistas, ou é a primeira vez) |
| ✨ **True End** | Todas as 10 conquistas + já ter visto o Limbo uma vez |

</details>

---

## 💾 Sistema de Save

O jogo salva automaticamente no `localStorage` do browser. Você também pode:

- **Exportar** seu save como arquivo `.json` (menu Opções → Exportar Save)
- **Importar** um save `.json` de outro dispositivo
- **Apagar** todo o progresso

---

## 🙋 Créditos

**Feito por [asafgamer](https://asafegamer05-glitch.github.io/Portf-lio-/)**

---

## 📄 Licença

Este projeto é de código aberto. Sinta-se livre para estudar, modificar e compartilhar.
