import { z } from 'astro/zod';
import type { TravelQuoteRequest } from './types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');

export const quoteRequestSchema = z
    .object({
        region: z.enum(['europa', 'mundo-sem-eua', 'mundo-com-eua']),
        destination: z.string().trim().min(2, 'Indique o destino').max(120),
        departureDate: isoDate,
        returnDate: isoDate,
        purpose: z.enum(['lazer', 'estudos', 'trabalho', 'longa-duracao']),
        travellers: z
            .array(z.object({ age: z.coerce.number().int().min(0).max(99) }))
            .min(1, 'Indique pelo menos um viajante')
            .max(10),
        cancellation: z.coerce.boolean(),
        tripCostPerPerson: z.coerce.number().min(0).max(100000).optional(),
        contact: z.object({
            name: z.string().trim().min(2, 'Indique o nome').max(120),
            email: z.string().trim().email('Email inválido').max(160),
            phone: z.string().trim().max(30).optional()
        }),
        notes: z.string().trim().max(2000).optional(),
        privacy: z.literal(true, { message: 'É necessário aceitar a política de privacidade' }),
        source: z.record(z.string(), z.string().max(200)).optional(),
        // Honeypot anti-spam: tem de chegar vazio
        website: z.string().max(0).optional()
    })
    .refine((d) => d.returnDate >= d.departureDate, {
        message: 'A data de regresso tem de ser igual ou posterior à de partida',
        path: ['returnDate']
    })
    .refine((d) => d.departureDate >= new Date().toISOString().slice(0, 10), {
        message: 'A data de partida já passou',
        path: ['departureDate']
    });

export type QuoteRequestInput = z.input<typeof quoteRequestSchema>;

export function toDomain(input: z.output<typeof quoteRequestSchema>): TravelQuoteRequest {
    return {
        region: input.region,
        destination: input.destination,
        departureDate: input.departureDate,
        returnDate: input.returnDate,
        purpose: input.purpose,
        travellers: input.travellers,
        cancellation: input.cancellation,
        tripCostPerPerson: input.cancellation ? input.tripCostPerPerson : undefined,
        contact: input.contact,
        notes: input.notes || undefined,
        consent: { privacy: true, acceptedAt: new Date().toISOString() },
        source: input.source
    };
}
