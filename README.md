# 🕹️ Cartridge-8 — Console Fictício (v1.3)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Cartridge-8 é um projeto de console retrô fictício com interface de "console" completa: 📺 bezel de TV, 🌈 filtro CRT, 📼 estante 3D de cartuchos, 👤 sistema de perfis multi-usuário, 🛠️ aplicativos integrados e 🎮 8 jogos exclusivos.

- 🚀 Demo principal: `games/demo` (STAR BLASTER)
- ⚙️ Engine: `main.js`
- 💾 Banco de perfis (IndexedDB): `profiles-db.js`
- 📁 Jogos adicionais: pasta `games/`

## 🌐 Demo online
Demo hospedado (GitHub Pages): https://asafegamer05-glitch.github.io/Cartridge-8/

## ✨ Recursos

- 📺 Interface estilo console com bezel, filtro CRT (scanlines, ruído, vinheta) e estante 3D de cartuchos
- 👥 Sistema de **multi-perfis** com tela "Quem está jogando?" no boot, criação/edição/exclusão de perfil e teclado virtual para mobile
- 💾 Persistência via **IndexedDB** (`profiles-db.js`), com saves isolados por perfil e por jogo
- 🎯 Dois modos de jogo por perfil:
  - 🟢 **Sandbox** — todos os jogos desbloqueados
  - 🔴 **Hardcore** — jogos começam trancados 🔒 e são desbloqueados com moedas 🪙, ganhas com o tempo de jogo
- 📦 Exportação/importação de perfil em `.zip` (via JSZip), para backup ou transferência entre dispositivos
- 🎵 Sintetizador WebAudio (C8-Soundwave) e 🎨 editor de sprites (Pixel Studio 8)
- 🌐 Multiplayer P2P via WebRTC (sinalização manual)
- 🕹️ Suporte a gamepad e controles touch para navegação em todas as telas

## 🎮 Jogos inclusos

| Jogo | Gênero | Dev |
|---|---|---|
| 🚀 STAR BLASTER | Shooter | Antigravity Studios |
| 🔫 Airsoft Simulator | FPS | asafgamery |
| 🏃 Super Aventureiro | Plataforma | asafgamery |
| 🏃 Super Aventureiro 2 | Plataforma | asafgamery |
| 🕵️ Super Aventureiro 2: Agent Edition | Plataforma / Ação | asafgamery |
| 🏖️ Super Aventureiro 2: Beach Expansion | Plataforma / DLC | asafgamery |
| 🧟 Zombie Rush | Sobrevivência Top-Down | asafgamery |
| 👻 Sekiverse | Terror / Puzzle | asafgamery |

## 💻 Como rodar localmente

Sirva os arquivos por HTTP (recomendado para funcionamento consistente do IndexedDB, do demo e do WebRTC).

Com Python 3:

```bash
python -m http.server 8000
```

Com Node (serve):

```bash
npx serve .
```

Abra `http://localhost:8000/index.html` para acessar o console. 🎉

## 🌐 Notas rápidas sobre WebRTC

- A comunicação multiplayer usa RTCPeerConnection + DataChannel.
- A sinalização é manual (copiar/colar SDP). Para travessia de NAT mais confiável, considere um servidor TURN.
- ⚠️ Deve ser servido via HTTPS ou `localhost`.

## 👤 Notas sobre o sistema de perfis

- 🔢 Limite de 5 perfis por navegador (dados salvos em IndexedDB, não sincronizados entre dispositivos).
- 📤 Use a opção **EXPORTAR PERFIL** (menu Opções) para gerar um `.zip` de backup, e 📥 **IMPORTAR PERFIL** para restaurá-lo em outro navegador/dispositivo.
- 🪙 No modo Hardcore, cada jogo custa 10 moedas para ser desbloqueado; moedas são acumuladas automaticamente com o tempo.

## 🤝 Contribuindo

- Faça um fork 🍴 e abra um Pull Request com suas mudanças.

## 📜 Licença

Este projeto está licenciado sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes. 

---

Feito com muito amor e ódio por asafgamery ☕❤️.