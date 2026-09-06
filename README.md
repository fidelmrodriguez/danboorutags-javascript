# danboorutags-javascript

Aplicação web estática para explorar tags do Danbooru por ano de criação, categoria e contexto de posts. O projeto foi desenvolvido com JavaScript, HTML e CSS puros, sem framework, sem SPA, sem bundler e sem etapa de build.

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
* Nenhum dado é persistido: as consultas são feitas diretamente do navegador para a API pública do Danbooru.

## Stack

* JavaScript
* HTML5
* CSS3
* Fetch API
* Danbooru API
* Netlify para hospedagem estática

## Arquitetura

```txt
danboorutags-javascript/
├── public/
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── main.js
│   └── index.html
├── .editorconfig
├── .gitattributes
├── .gitignore
├── DEPLOY_NETLIFY.md
├── LICENSE
├── netlify.toml
└── README.md
```

O HTML concentra apenas a estrutura da página. A apresentação fica em `public/assets/css/styles.css` e toda a lógica de filtros, chamadas à API, paginação, ordenação e exportação fica em `public/assets/js/main.js`.

## Como funciona

A aplicação consulta os endpoints públicos do Danbooru diretamente pelo navegador.

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

Não existe instalação de dependências.

Clone o repositório:

```bash
git clone <url-do-repositorio>
cd danboorutags-javascript
```

Depois sirva a pasta `public` por HTTP. Com Python:

```bash
python -m http.server 8080 -d public
```

Acesse:

```txt
http://localhost:8080
```

Também é possível usar extensões como Live Server no VS Code.

> Evite depender de `file://` para testar a aplicação. Servir os arquivos por HTTP reproduz melhor o comportamento do deploy e evita diferenças de segurança entre navegadores.

## Deploy

O projeto já inclui `netlify.toml` e não precisa de etapa de build.

O passo a passo completo está em [`DEPLOY_NETLIFY.md`](./DEPLOY_NETLIFY.md).

## API e limitações

* O projeto depende da disponibilidade da API pública do Danbooru.
* Consultas muito amplas podem sofrer rate limit ou timeout no servidor do Danbooru.
* A paginação cronológica usa cursores/IDs para reduzir consultas caras com offsets altos.
* A busca contextual lê apenas a quantidade de posts definida em `Posts para analisar`; portanto, tags raras podem não aparecer quando o limite for baixo.
* A aplicação não armazena credenciais, cookies do Danbooru ou dados de usuário.

## Decisões técnicas

* JavaScript puro foi mantido de propósito: a interface não exige um framework ou uma SPA.
* CSS e JavaScript foram separados do HTML para facilitar manutenção e revisão de código.
* Não há dependências de produção ou pipeline de build, reduzindo superfície de manutenção e tornando o deploy totalmente estático.
* A aplicação trata a API do Danbooru como uma dependência externa e mantém a lógica de apresentação no navegador.

## Aviso

Este é um projeto não oficial e não possui afiliação com o Danbooru. Os dados exibidos pertencem às respectivas fontes e são consultados por meio da API pública disponibilizada pelo serviço.
