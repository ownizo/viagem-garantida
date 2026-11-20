import { z } from 'astro/zod';
import { COUNTRY_CODES } from '../countries';
import type { TravelQuoteRequest } from './types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');
const country = z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => COUNTRY_CODES.has(c), 'País inválido');

export const quoteRequestSchema = z
    .object({
        residence: country.default('PT'),
        destinations: z.array(country).min(1, 'Indique pelo menos um país de destino').max(20, 'Máximo de 20 países de destino'),
        departureDate: isoDate,
        returnDate: isoDate,
        purpose: z.enum(['lazer', 'anual', 'estudos', 'nomada', 'cruzeiro', 'expatriacao', 'au-pair', 'trabalho']),
        travellers: z
            .array(z.object({ age: z.coerce.number().int().min(0).max(120) }))
            .min(1, 'Indique pelo menos um viajante')
            .max(50),
        cancellation: z.coerce.boolean().default(false),
        tripPrice: z.coerce.number().min(0).max(1000000).optional(),
        tripBookedDate: isoDate.optional(),
        extremeSports: z.coerce.boolean().default(false),
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
    })
    .refine((d) => !d.cancellation || (d.tripPrice ?? 0) > 0, {
        message: 'Indique o custo total da viagem para a cobertura de cancelamento',
        path: ['tripPrice']
    });

export function toDomain(input: z.output<typeof quoteRequestSchema>): TravelQuoteRequest {
    return {
        residence: input.residence,
        destinations: [...new Set(input.destinations)],
        departureDate: input.departureDate,
        returnDate: input.returnDate,
        purpose: input.purpose,
        travellers: input.travellers,
        cancellation: input.cancellation,
        tripPrice: input.cancellation ? input.tripPrice : undefined,
        tripBookedDate: input.cancellation ? input.tripBookedDate : undefined,
        extremeSports: input.extremeSports,
        contact: input.contact,
        notes: input.notes || undefined,
        consent: { privacy: true, acceptedAt: new Date().toISOString() },
        source: input.source
    };
}

export const checkoutSchema = z.object({
    reference: z.string().regex(/^VG-\d{6}-[A-Z0-9]{4}$/),
    offerId: z.coerce.number().int().positive()
});
