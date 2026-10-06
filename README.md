# danboorutags-javascript

Aplicação web para explorar tags do Danbooru por ano de criação, categoria e contexto de posts. A interface usa JavaScript, HTML e CSS puros, sem framework, SPA, bundler ou etapa de build; uma Netlify Function faz o proxy seguro das consultas à API.

## Netlify

https://danboorutags-javascript.netlify.app/

## Recursos

* Busca simples por ano, ordenação, categoria e quantidade mínima de posts da tag.
* Busca avançada com múltiplos anos na mesma consulta.
* Filtro contextual por personagem e por anime, franquia ou mangá.
* Definição da quantidade máxima de posts usados na análise contextual.
* Filtro de tags ativas ou deprecated.
* Ordenação interativa pelos cabeçalhos da tabela na busca avançada.
* Paginação por cursor/ID para evitar consultas com offsets muito altos.
* Navegação para primeira, anterior, próxima e última página quando suportado pela estratégia da busca.
* Exportação dos resultados em CSV.
* Links diretos para a tag, wiki e posts correspondentes no Danbooru.
* Layout responsivo para desktop e telas menores.
* Nenhum dado é persistido: o navegador consulta uma Netlify Function no próprio domínio, e essa função encaminha somente requisições de leitura para `tags.json` e `posts.json` do Danbooru. Isso evita o bloqueio de CORS no navegador e permite enviar um `User-Agent` adequado ao upstream.

## Stack

* JavaScript
* HTML5
* CSS3
* Fetch API
* Netlify Functions
* Danbooru API
* Netlify para hospedagem estática

## Arquitetura

```txt
danboorutags-javascript/
├── netlify/
│   └── functions/
│       └── danbooru.js
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── main.js
│   └── index.html
├── DEPLOY_NETLIFY.md
├── LICENSE
├── netlify.toml
└── README.md
```

O HTML concentra a estrutura da página. A apresentação fica em `public/assets/css/styles.css`; filtros, paginação, ordenação e exportação ficam em `public/assets/js/main.js`. O acesso externo ao Danbooru é isolado em `netlify/functions/danbooru.js`.

## Como funciona

O navegador consulta rotas locais `/api/danbooru/tags.json` e `/api/danbooru/posts.json`. O `netlify.toml` reescreve essas rotas para a Netlify Function, que então consulta os endpoints públicos do Danbooru no servidor.

### Busca simples

Permite selecionar:

* ano;
* ordenação;
* categoria da tag;
* quantidade mínima de posts.

### Busca avançada

Além dos filtros principais, permite combinar vários anos e analisar posts relacionados a um personagem ou a uma franquia.

Quando `Personagem` ou `Anime / franquia / mangá` é preenchido, esses valores definem quais posts serão analisados. A categoria escolhida define quais tipos de tags serão extraídos desses posts, e os anos selecionados determinam quais tags encontradas entram no resultado final.

Exemplo:

```txt
Anos: 2024 + 2025
Personagem: hatsune_miku
Franquia: vocaloid
Categoria: General
Posts para analisar: 1000
```

Nesse cenário, a aplicação analisa até 1.000 posts contendo as tags informadas, coleta as tags `General` desses posts e mantém no resultado apenas as tags criadas em 2024 ou 2025.

## Executar localmente

O projeto não possui dependências npm próprias. Para testar o fluxo completo (interface + Function), use o Netlify Dev:

```bash
git clone <url-do-repositorio>
cd danboorutags-javascript
npx netlify dev
```

Abra a URL local mostrada pelo Netlify CLI. Um servidor estático simples, como `python -m http.server`, serve a interface, mas não executa `/api/danbooru/*` e portanto não permite testar as consultas.

## Deploy

O projeto já inclui `netlify.toml` e não precisa de etapa de build. O Netlify publica `public/` e também disponibiliza a função `netlify/functions/danbooru.js`.

O passo a passo completo está em [`DEPLOY_NETLIFY.md`](./DEPLOY_NETLIFY.md).

## API e limitações

* O projeto depende da disponibilidade da API pública do Danbooru.
* As chamadas do navegador usam `/api/danbooru/*`, uma rota same-origin atendida por uma Netlify Function, evitando CORS entre o site e o Danbooru.
* A Function envia um `User-Agent` identificável. Opcionalmente, podem ser definidas no Netlify as variáveis `DANBOORU_LOGIN`, `DANBOORU_API_KEY` e `DANBOORU_USER_ID`; as credenciais ficam somente no servidor e nunca são enviadas ao navegador.
* Consultas muito amplas podem sofrer rate limit ou timeout no servidor do Danbooru.
* A paginação cronológica usa cursores/IDs para reduzir consultas caras com offsets altos.
* A busca contextual lê apenas a quantidade de posts definida em `Posts para analisar`; portanto, tags raras podem não aparecer quando o limite for baixo.
* A aplicação não armazena credenciais, cookies do Danbooru ou dados de usuário.

## Decisões técnicas

* JavaScript puro foi mantido de propósito: a interface não exige um framework ou uma SPA.
* CSS e JavaScript foram separados do HTML para facilitar manutenção e revisão de código.
* Não há dependências npm de produção nem pipeline de build; o único componente de servidor é uma Netlify Function pequena e sem pacotes externos.
* A aplicação mantém a lógica de apresentação no navegador e isola o acesso ao Danbooru no proxy server-side para evitar CORS e não expor credenciais opcionais.

## Aviso

Este é um projeto não oficial e não possui afiliação com o Danbooru. Os dados exibidos pertencem às respectivas fontes e são consultados por meio da API pública disponibilizada pelo serviço.
