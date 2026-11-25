import { z } from 'astro/zod';
import { COUNTRY_CODES } from '../countries';
import { TRIP_PURPOSES, type TravelQuoteRequest, type TripPurpose } from './types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');
const country = z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => COUNTRY_CODES.has(c), 'País inválido');

export const quoteRequestSchema = z
    .object({
        residence: z.string().trim().min(1, 'Indique o país de residência').toUpperCase().refine((c) => !c || COUNTRY_CODES.has(c), 'País de residência inválido'),
        destinations: z.array(country).min(1, 'Indique pelo menos um país de destino').max(20, 'Máximo de 20 países de destino'),
        departureDate: isoDate,
        returnDate: isoDate,
        purpose: z.enum(TRIP_PURPOSES.map((p) => p.value) as [TripPurpose, ...TripPurpose[]]),
        travellers: z
            .array(z.object({ age: z.coerce.number().int().min(0).max(120) }))
            .min(1, 'Indique pelo menos um viajante')
            .max(50),
        cancellation: z.coerce.boolean().default(false),
        tripPrice: z.coerce.number().min(0).max(1000000).optional(),
        tripBookedDate: isoDate.optional(),
        extremeSports: z.coerce.boolean().default(false),
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
    .refine((d) => !(d.cancellation || d.purpose === 'cancelamento') || (d.tripPrice ?? 0) > 0, {
        message: 'Indique o custo total da viagem para a cobertura de cancelamento',
        path: ['tripPrice']
    });

export function toDomain(input: z.output<typeof quoteRequestSchema>): TravelQuoteRequest {
    // "Só cancelamento" é sempre um seguro de cancelamento: precisa do custo da viagem.
    const cancellation = input.cancellation || input.purpose === 'cancelamento';
    return {
        residence: input.residence,
        destinations: [...new Set(input.destinations)],
        departureDate: input.departureDate,
        returnDate: input.returnDate,
        purpose: input.purpose,
        travellers: input.travellers,
        cancellation,
        tripPrice: cancellation ? input.tripPrice : undefined,
        tripBookedDate: cancellation ? input.tripBookedDate : undefined,
        extremeSports: input.extremeSports,
        source: input.source
    };
}

export const checkoutSchema = z.object({
    reference: z.string().regex(/^VG-\d{6}-[A-Z0-9]{4}$/),
    offerId: z.coerce.number().int().positive()
});
