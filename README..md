# Declividade por Coordenadas — Estação Total

Aplicativo web único (HTML/CSS/JS puro, sem dependências) que reúne, em três
abas, o levantamento de declividade, o projeto de execução (declividade ou
talude desejados) e a pasta de relatórios salvos — tudo em uma só página,
rodando localmente no navegador, sem servidor.

## Estrutura do projeto

```
.
├── index.html        # aplicativo único (as três abas)
├── css/
│   └── style.css      # todo o estilo visual
├── js/
│   ├── common.js       # armazenamento (localStorage) e fórmulas compartilhadas
│   └── app.js           # toda a lógica das três abas
└── README.md
```

## Abas do aplicativo

No topo da página há um menu com três abas — o conteúdo troca instantaneamente,
sem recarregar a página:

### 1. Levantamento
- Cadastro de pontos (E, N, Z/cota e descrição).
- Cálculo de declividade (%), proporção do talude (1:N), ângulo de
  inclinação, desnível (Δz), distância horizontal e **distância inclinada**
  entre qualquer par de pontos.
- Relatório acumulativo, reordenável e editável, com logotipos, foto (9×6 cm)
  e carimbo (Obra/Local, Responsável, Data).
- Botão **"Salvar relatório na pasta"** grava o relatório atual na aba
  Relatórios Salvos.

### 2. Projeto de Execução
- Usa os mesmos pontos já cadastrados na aba Levantamento (é a mesma lista,
  não precisa recadastrar nada).
- Você escolhe o ponto de referência (topo do talude) e o ponto atual (base),
  e informa a **declividade desejada (%)** ou a **proporção do talude**
  (ex.: 1:2,0 — uma casa decimal).
- O app calcula:
  - a distância horizontal necessária para atingir essa declividade, mantendo
    o desnível (Δz) já levantado;
  - a diferença — quanto **aumentar** ou **reduzir** a distância horizontal
    atual;
  - as coordenadas projetadas do ponto de base, mantendo o mesmo azimute do
    levantamento original.
- Gera seu próprio relatório de projeto (com foto, logos, carimbo, impressão
  e "Salvar relatório na pasta"), separado do relatório de levantamento real.

### 3. Relatórios Salvos
- Lista, em ordem de criação, todos os relatórios salvos (tanto de
  Levantamento quanto de Projeto de Execução), com obra, responsável, data e
  quantidade de itens.
- Botão **Visualizar** reabre o relatório completo na tela, pronto para
  impressão/PDF individual.
- Botão **Excluir** remove o relatório da pasta.

Os **dados da obra** (Responsável, Obra/Local, Data) e os **logotipos**
preenchidos no topo valem para os dois relatórios (Levantamento e Projeto).

> Como o site é estático (sem backend), a "pasta" de relatórios é mantida no
> armazenamento local do navegador (localStorage) — funciona normalmente
> entre sessões no mesmo dispositivo/navegador, mas não sincroniza entre
> aparelhos diferentes. Para levar um relatório para outro lugar, use
> "Imprimir / salvar em PDF".

## Como usar

Abra `index.html` em qualquer navegador — não precisa de servidor, backend
ou instalação. Mantenha as pastas `css/` e `js/` junto do `index.html`, pois
ele referencia `css/style.css`, `js/common.js` e `js/app.js`.

## Publicar no GitHub Pages (opcional)

1. Crie um repositório no GitHub e suba `index.html`, a pasta `css/` e a
   pasta `js/`, mantendo essa mesma estrutura.
2. Vá em **Settings → Pages**.
3. Em **Source**, selecione a branch (ex.: `main`) e a pasta `/ (root)`.
4. Salve. O GitHub gera uma URL do tipo
   `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` para acessar o app
   de qualquer lugar, inclusive pelo celular.

## Subindo via linha de comando

```bash
git init
git add index.html css/style.css js/common.js js/app.js README.md
git commit -m "App único de declividade (levantamento, projeto e relatórios)"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
git push -u origin main
```

## Observações técnicas

- Declividade: i (%) = (Δz / distância horizontal) × 100
- Distância inclinada: √(distância horizontal² + Δz²)
- Proporção do talude: 1 : (100 / i), com uma casa decimal
- Distância horizontal necessária (projeto): |Δz| ÷ (declividade desejada / 100)
- Declividade positiva = subida; negativa = descida (sentido "De → Para").
- Fotos, logotipos, pontos e relatórios salvos ficam apenas no navegador do
  dispositivo (localStorage) — nenhum dado é enviado para fora do
  dispositivo.
