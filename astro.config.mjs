import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';

// Data de publicação/atualização de cada guia, lida do frontmatter, para o <lastmod> do sitemap.
const blogDates = Object.fromEntries(
    readdirSync('./src/content/blog')
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
            const fm = readFileSync(`./src/content/blog/${f}`, 'utf8');
            const date = fm.match(/^updatedDate:\s*(\S+)/m)?.[1] ?? fm.match(/^pubDate:\s*(\S+)/m)?.[1];
            return [f.replace(/\.md$/, ''), date];
        })
);
// Idem para as páginas de destino (/seguro-viagem/[slug]).
const destDates = Object.fromEntries(
    readdirSync('./src/content/destinos')
        .filter((f) => f.endsWith('.md'))
        .map((f) => [f.replace(/\.md$/, ''), readFileSync(`./src/content/destinos/${f}`, 'utf8').match(/^updatedDate:\s*(\S+)/m)?.[1]])
);
const buildDate = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
    site: 'https://viagemgarantida.com',
    trailingSlash: 'never',
    build: { format: 'file' },
    vite: {
        plugins: [tailwindcss()]
    },
    integrations: [
        react(),
        sitemap({
            filter: (page) => !page.includes('/404'),
            serialize(item) {
                const slug = item.url.match(/\/blog\/([^/]+)$/)?.[1];
                const dest = item.url.match(/\/seguro-viagem\/([^/]+)$/)?.[1];
                const raw = (slug && blogDates[slug]) || (dest && destDates[dest]);
                const date = raw ? new Date(raw).toISOString() : buildDate;
                const isHome = item.url === 'https://viagemgarantida.com/' || item.url === 'https://viagemgarantida.com';
                return {
                    ...item,
                    lastmod: date,
                    changefreq: slug ? 'monthly' : 'weekly',
                    priority: isHome ? 1.0 : item.url.includes('/cotacao') ? 0.9 : /\/seguro-viagem(\/|$)/.test(item.url) ? 0.8 : slug ? 0.7 : item.url.includes('/categoria/') ? 0.4 : 0.6
                };
            }
        })
    ],
    adapter: netlify({
        devFeatures: {
            environmentVariables: true
        }
    })
});
