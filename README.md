# ??? Cartridge-8 � Console Fict�cio (v1.3)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Cartridge-8 � um projeto de console retr� fict�cio com interface de "console" completa: ?? bezel de TV, ?? filtro CRT, ?? estante 3D de cartuchos, ?? sistema de perfis multi-usu�rio, ??? aplicativos integrados e ?? 8 jogos exclusivos.

- ?? Demo principal: `games/demo` (STAR BLASTER)
- ?? Engine: `main.js`
- ?? Banco de perfis (IndexedDB): `profiles-db.js`
- ?? Jogos adicionais: pasta `games/`

## ?? Demo online
Demo hospedado (GitHub Pages): https://asafegamer05-glitch.github.io/Cartridge-8/

## ? Recursos

- ?? Interface estilo console com bezel, filtro CRT (scanlines, ru�do, vinheta) e estante 3D de cartuchos
- ?? Sistema de **multi-perfis** com tela "Quem est� jogando?" no boot, cria��o/edi��o/exclus�o de perfil e teclado virtual para mobile
- ?? Persist�ncia via **IndexedDB** (`profiles-db.js`), com saves isolados por perfil e por jogo
- ?? Dois modos de jogo por perfil:
  - ?? **Sandbox** � todos os jogos desbloqueados
  - ?? **Hardcore** � jogos come�am trancados ?? e s�o desbloqueados com moedas ??, ganhas com o tempo de jogo
- ?? Exporta��o/importa��o de perfil em `.zip` (via JSZip), para backup ou transfer�ncia entre dispositivos
- ?? Sintetizador WebAudio (C8-Soundwave) e ?? editor de sprites (Pixel Studio 8)
- ?? Multiplayer P2P via WebRTC (sinaliza��o manual)
- ??? Suporte a gamepad e controles touch para navega��o em todas as telas

## ?? Jogos inclusos

| Jogo | G�nero | Dev |
|---|---|---|
| ?? STAR BLASTER | Shooter | Antigravity Studios |
| ?? Airsoft Simulator | FPS | asafgamery |
| ?? Super Aventureiro | Plataforma | asafgamery |
| ?? Super Aventureiro 2 | Plataforma | asafgamery |
| ??? Super Aventureiro 2: Agent Edition | Plataforma / A��o | asafgamery |
| ??? Super Aventureiro 2: Beach Expansion | Plataforma / DLC | asafgamery |
| ?? Zombie Rush | Sobreviv�ncia Top-Down | asafgamery |
| ?? Sekiverse | Terror / Puzzle | asafgamery |

## ?? Como rodar localmente

Sirva os arquivos por HTTP (recomendado para funcionamento consistente do IndexedDB, do demo e do WebRTC).

Com Python 3:

```bash
python -m http.server 8000
```

Com Node (serve):

```bash
npx serve .
```

Abra `http://localhost:8000/index.html` para acessar o console. ??

## ?? Notas r�pidas sobre WebRTC

- A comunica��o multiplayer usa RTCPeerConnection + DataChannel.
- A sinaliza��o � manual (copiar/colar SDP). Para travessia de NAT mais confi�vel, considere um servidor TURN.
- ?? Deve ser servido via HTTPS ou `localhost`.

## ?? Notas sobre o sistema de perfis

- ?? Limite de 5 perfis por navegador (dados salvos em IndexedDB, n�o sincronizados entre dispositivos).
- ?? Use a op��o **EXPORTAR PERFIL** (menu Op��es) para gerar um `.zip` de backup, e ?? **IMPORTAR PERFIL** para restaur�-lo em outro navegador/dispositivo.
- ?? No modo Hardcore, cada jogo custa 10 moedas para ser desbloqueado; moedas s�o acumuladas automaticamente com o tempo.

## ?? Contribuindo

- Fa�a um fork ?? e abra um Pull Request com suas mudan�as.

## ?? Licen�a

Este projeto est� licenciado sob a licen�a MIT � veja o arquivo [LICENSE](LICENSE) para detalhes. 

---

Feito com muito amor e �dio por asafgamery ???.