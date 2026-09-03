# Declividade por Coordenadas — Estação Total

Aplicativo web (HTML/CSS/JS puro, sem dependências) para calcular a declividade
entre pontos levantados com estação total e gerar um relatório técnico
editável, com foto e logotipos, pronto para impressão em papel A4.

## Funcionalidades

- Cadastro de pontos (E, N, Z/cota e descrição).
- Cálculo de declividade (%), ângulo de inclinação, desnível (Δz), distância
  horizontal e distância horizontal inclinada entre qualquer par de pontos.
- Fila/relatório acumulativo: adicione quantas declividades quiser.
- Relatório com título centralizado, logotipos (esquerdo/direito), campo de
  observações e campo de foto (câmera ou arquivo, 9 × 6 cm) por item.
- Itens do relatório reordenáveis e editáveis diretamente na tela.
- Carimbo (título de prancha) com Obra/Local, Responsável e Data.
- Layout ajustado para impressão/exportação em PDF no formato A4.

## Como usar

Basta abrir o arquivo `index.html` em qualquer navegador — não precisa de
servidor, backend ou instalação. Tudo roda localmente no navegador; nenhum
dado é enviado para fora do dispositivo.

## Publicar no GitHub Pages (opcional)

1. Crie um repositório no GitHub e suba este arquivo (`index.html`) na raiz.
2. Vá em **Settings → Pages**.
3. Em **Source**, selecione a branch (ex.: `main`) e a pasta `/ (root)`.
4. Salve. O GitHub gera uma URL do tipo
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` para acessar o app
   de qualquer lugar, inclusive pelo celular.

## Subindo via linha de comando

```bash
git init
git add index.html README.md
git commit -m "Primeira versão do app de declividade"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
git push -u origin main
```

## Estrutura

```
.
├── index.html   # aplicativo completo (HTML + CSS + JS embutidos)
└── README.md
```

## Observações técnicas

- i = (Δz / distância horizontal) × 100
- Declividade positiva = subida; negativa = descida (sentido "De → Para").
- Fotos e logotipos ficam apenas na memória da página (não são salvos em
  disco automaticamente) — para preservar um relatório finalizado, use
  "Imprimir / salvar em PDF".
