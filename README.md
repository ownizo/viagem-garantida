# Viagem Garantida

Comparador de seguros de viagem — [viagemgarantida.com](https://viagemgarantida.com). Marca da Ownizo, Unipessoal Lda.: plataforma de informação e marketing; os seguros são comercializados pela HelloSafe.

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
- Guias/blog: ficheiros Markdown em `src/content/blog/` — para publicar um novo artigo basta criar um `.md` com o mesmo frontmatter dos existentes (`category`: familias, estudantes, destinos, coberturas, cancelamento ou tipos)
- Páginas por destino: ficheiros Markdown em `src/content/destinos/` → `/seguro-viagem/[slug]` (frontmatter com país, código ISO, checklist e FAQ)
- Dados da marca e do mediador: `src/site.ts`

## Integração com seguradoras

Integração com a API HelloSafe Atlas: ver [`docs/integracao-api.md`](docs/integracao-api.md) e [`.env.example`](.env.example).
