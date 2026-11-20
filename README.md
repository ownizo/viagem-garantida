# Viagem Garantida

Site de seguros de viagem — [viagemgarantida.com](https://viagemgarantida.com). Marca da Adler & Rochefort (Ownizo, Unipessoal Lda.), agente de seguros registado na ASF.

Astro 6 + Tailwind 4, publicado na Netlify. Páginas estáticas; o endpoint `/api/quote` corre como função serverless.

## Comandos

| Comando | Ação |
| --- | --- |
| `npm install` | Instalar dependências |
| `npm run dev` | Servidor local em `localhost:4321` |
| `npm run build` | Build para `./dist/` |

Para testar o Netlify Blobs localmente use `netlify dev`.

## Conteúdo

- Páginas: `src/pages/` (início, cotação, coberturas, cancelamento, quem somos, informação legal, privacidade)
- Guias/blog: ficheiros Markdown em `src/content/blog/` — para publicar um novo artigo basta criar um `.md` com o mesmo frontmatter dos existentes (`category`: familias, estudantes, destinos, coberturas ou cancelamento)
- Dados da marca e do mediador: `src/site.ts`

## Integração com seguradoras (fase 2)

Ver [`docs/integracao-api.md`](docs/integracao-api.md) e [`.env.example`](.env.example).
