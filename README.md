
# Cartridge-8 — Console Fictício (v1.0)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Cartridge-8 é um projeto de console retrô fictício com interface de "console", estante 3D de cartuchos, sintetizador WebAudio e um demo jogável.

- Demo principal: `games/demo` (STAR BLASTER)
- Engine: `main.js`
- Jogos adicionais: pasta `games/`

## Demo online
Demo hospedado (GitHub Pages): https://asafegamer05-glitch.github.io/Cartridge-8/

## Recursos
- Interface estilo console com estante 3D
- Sintetizador WebAudio e Pixel Studio
- Multiplayer P2P via WebRTC (sinalização manual)
- Suporte a gamepad para navegação

## Como rodar localmente
Sirva os arquivos por HTTP (recomendado para funcionamento consistente do demo e WebRTC).

Com Python 3:

```bash
python -m http.server 8000
```

Com Node (serve):

```bash
npx serve .
```

Abra `http://localhost:8000/games/demo/index.html` para testar o demo.

## Notas rápidas sobre WebRTC
- A comunicação multiplayer usa RTCPeerConnection + DataChannel.
- A sinalização é manual (copiar/colar SDP). Para travessia de NAT mais confiável, considere um servidor TURN.
- Deve ser servido via HTTPS ou `localhost`.

## Contribuindo
- Faça um fork e abra um Pull Request com suas mudanças.

## Licença
Este projeto está licenciado sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

