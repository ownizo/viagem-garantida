import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string().max(200),
        category: z.enum(['familias', 'estudantes', 'destinos', 'coberturas', 'cancelamento']),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        readingTime: z.number().int(),
        kicker: z.string().optional(),
        featured: z.boolean().default(false)
    })
});

export const collections = { blog };
