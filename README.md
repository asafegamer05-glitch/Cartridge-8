# Cartridge-8 — Console Fictício (v1.0)

![Cartridge-8](https://img.shields.io/badge/Cartridge--8-v1.0-blue)

Cartridge-8 é um console fictício retrô com UI, estante 3D de cartuchos, sintetizador e um demo jogável (com multiplayer P2P via WebRTC).

- Demo principal: `games/demo` (STAR BLASTER)
- Engine: `main.js`
- Jogos adicionais: pasta `games/`

## Demo online (GitHub Pages)
Visite a página do projeto hospedada no GitHub Pages:

https://asafegamer05-glitch.github.io/Cartridge-8/

Se preferir outro domínio ou usuário, substitua o link acima pelo endereço desejado.

## Recursos
- Interface estilo console com estante 3D
- Sintetizador WebAudio e Pixel Studio
- Multiplayer P2P via WebRTC (troca manual de códigos)
- Suporte a gamepad para navegação e jogos

## Como rodar localmente
Recomendado: servir via HTTP (GitHub Pages exige HTTPS/localhost para recursos WebRTC)

Com Python 3:

```bash
python -m http.server 8000
# ou
python -m http.server --directory . 8000
```

Com Node (serve):

```bash
npx serve .
```

Abra `http://localhost:8000/games/demo/index.html` para testar o demo.

### Deploy rápido para GitHub Pages
1. Inicialize git no projeto (se ainda não):

```bash
git init
git add .
git commit -m "Initial commit: Cartridge-8 v1.0"
```

2. Adicione o remote do seu repositório e envie (SSH recomendado):

SSH (recomendado):
```bash
git remote add origin git@github.com:asafegamer05-glitch/Cartridge-8.git
git branch -M main
git push -u origin main
```

HTTPS (exige autenticação via token):
```bash
git remote add origin https://github.com/asafegamer05-glitch/Cartridge-8.git
git branch -M main
git push -u origin main
```

3. Habilite GitHub Pages nas configurações do repositório (Settings → Pages) apontando para a branch `main` e root `/`.

Se quiser, eu posso gerar automaticamente um arquivo `CNAME` ou um `LICENSE` (MIT) e comitar aqui — quer que eu adicione a licença MIT também?

## Notas sobre WebRTC
- Multiplayer usa RTCPeerConnection + DataChannel e STUN públicos.
- A sinalização é manual (copiar/colar códigos). Para uso em NAT restrito, considere adicionar um servidor TURN.
- Deve ser servido por HTTPS ou `localhost`.

## Contribuindo
1. Faça um fork
2. Crie uma branch: `git checkout -b feat/minha-funcao`
3. Commit suas mudanças: `git commit -am 'Adiciona X'`
4. Push: `git push origin feat/minha-funcao`
5. Abra um Pull Request

## Licença
Coloque aqui a licença escolhida (ex: MIT). Caso queira, posso adicionar automaticamente um arquivo `LICENSE`.

---

Se quiser, eu atualizo o link do GitHub Pages no `README.md` quando você me passar `USERNAME/REPO`, e também posso adicionar um `LICENSE` e badges mais detalhados.