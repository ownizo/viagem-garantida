import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        /** Título curto para o Google (máx. 60 caracteres); o H1 mantém `title`. */
        seoTitle: z.string().max(60).optional(),
        description: z.string().max(200),
        category: z.enum(['familias', 'estudantes', 'destinos', 'coberturas', 'cancelamento', 'tipos']),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        readingTime: z.number().int(),
        kicker: z.string().optional(),
        featured: z.boolean().default(false),
        faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([])
    })
});

// Páginas de seguro de viagem por destino: /seguro-viagem/[slug]
const destinos = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/destinos' }),
    schema: z.object({
        country: z.string(),
        code: z.string().length(2),
        region: z.enum(['europa', 'americas', 'asia', 'africa', 'caraibas', 'medio-oriente', 'oceania']),
        title: z.string(),
        seoTitle: z.string().max(60).optional(),
        description: z.string().max(200),
        mandatory: z.boolean().default(false),
        summary: z.string(),
        checklist: z.array(z.string()),
        faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
        related: z.array(z.string()).default([]),
        updatedDate: z.coerce.date(),
        order: z.number().int().default(100)
    })
});

export const collections = { blog, destinos };
