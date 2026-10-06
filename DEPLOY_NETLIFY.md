# Deploy no GitHub + Netlify

Este projeto não usa framework, `npm install` nem etapa de compilação. O front-end fica em `public/` e uma Netlify Function em `netlify/functions/danbooru.js` faz o proxy das consultas ao Danbooru para evitar CORS.

## 1. Criar o repositório no GitHub

No GitHub, crie um repositório chamado:

```txt
danboorutags-javascript
```

Não marque a opção para gerar README, `.gitignore` ou licença, porque esses arquivos já existem no projeto.

## 2. Publicar o projeto no GitHub

Abra o terminal dentro da pasta do projeto e execute:

```bash
git init
git add -A
git commit -m "Initial release of danboorutags-javascript"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/danboorutags-javascript.git
git push -u origin main
```

Substitua `SEU_USUARIO` pelo seu usuário do GitHub.

## 3. Importar no Netlify

No Netlify:

1. Acesse **Add new project** / **Import an existing project**.
2. Escolha **GitHub**.
3. Autorize o acesso ao repositório, se solicitado.
4. Selecione `danboorutags-javascript`.
5. Confirme o deploy.

O arquivo `netlify.toml` já define:

```txt
Publish directory: public
Functions directory: netlify/functions
Build command: nenhum
```

Não é obrigatório configurar variáveis de ambiente para consultas públicas. Para autenticar o proxy no Danbooru, configure opcionalmente em **Site configuration → Environment variables**:

```txt
DANBOORU_LOGIN=seu_login
DANBOORU_API_KEY=sua_api_key
DANBOORU_USER_ID=seu_id_numerico
```

Esses valores ficam somente na Function e não aparecem no JavaScript entregue ao navegador.

## 4. Definir o endereço do site

Depois do primeiro deploy, abra **Site configuration** → **Change site name** e tente usar:

```txt
danboorutags-javascript
```

Se o nome estiver disponível, a URL será:

```txt
https://danboorutags-javascript.netlify.app/
```

Se já estiver em uso, escolha outro nome e use a URL informada pelo Netlify.

## 5. Adicionar o link no README

Depois que a URL estiver confirmada, você pode adicionar próximo ao início do `README.md`:

```md
## Netlify

https://danboorutags-javascript.netlify.app/
```

Use a URL real do seu deploy caso o subdomínio seja diferente.

## 6. Atualizações futuras

Depois que GitHub e Netlify estiverem conectados, novas versões exigem apenas:

```bash
git add -A
git commit -m "Atualiza danboorutags-javascript"
git push origin main
```

O Netlify publica automaticamente cada novo push na branch `main`.

## 7. Validar o deploy

Após publicar:

1. Abra a URL do Netlify.
2. Teste a Busca simples.
3. Teste a Busca avançada com dois anos.
4. Teste a ordenação pelos cabeçalhos da tabela.
5. Teste `Primeira`, `Anterior`, `Próxima` e `Última`.
6. Teste a exportação CSV.
7. Abra o DevTools e confirme que as consultas vão para `/api/danbooru/tags.json` ou `/api/danbooru/posts.json`, e não diretamente para `https://danbooru.donmai.us/...`.
8. Confirme que não há erros de CORS no console.

Se o Danbooru/Cloudflare responder 403 também para a Function, configure as variáveis opcionais de autenticação acima e faça um novo deploy.
