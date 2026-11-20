import { env } from '../env';
import type { InsuranceProvider, QuoteOffer, TravelQuoteRequest } from '../types';

/**
 * Fase 2: adapter para a API do fornecedor de seguros de viagem.
 *
 * Esqueleto pronto a completar quando houver a documentação técnica e as credenciais
 * do fornecedor. Os nomes de endpoints e campos abaixo são PROVISÓRIOS — têm de ser
 * substituídos pelos da especificação oficial. Ver docs/integracao-api.md.
 *
 * Variáveis de ambiente (Netlify → Project configuration → Environment variables):
 *   PARTNER_API_BASE_URL   URL base da API (sandbox primeiro, produção depois)
 *   PARTNER_API_KEY        chave/segredo de autenticação
 *   PARTNER_ID             identificador de parceiro/intermediário (comissionamento)
 */
export const partnerApiProvider: InsuranceProvider = {
    id: 'partner-api',

    isConfigured() {
        return Boolean(env('PARTNER_API_BASE_URL') && env('PARTNER_API_KEY') && env('PARTNER_ID'));
    },

    async quote(request, reference) {
        const baseUrl = env('PARTNER_API_BASE_URL')!;
        const res = await fetch(new URL('/quotes', baseUrl), {
            // TODO(fase 2): confirmar endpoint, método e esquema de autenticação.
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env('PARTNER_API_KEY')}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify(toPartnerPayload(request, reference)),
            signal: AbortSignal.timeout(15000)
        });

        if (!res.ok) {
            throw new Error(`API do fornecedor respondeu ${res.status}: ${(await res.text()).slice(0, 300)}`);
        }

        const offers = fromPartnerResponse(await res.json());
        return offers.length > 0 ? { status: 'offers', reference, offers } : { status: 'received', reference };
    }

    // TODO(fase 2): implementar bind() — emissão da apólice após pagamento.
};

/** Traduz o pedido interno para o formato da API. TODO(fase 2): alinhar com a especificação. */
function toPartnerPayload(req: TravelQuoteRequest, reference: string) {
    return {
        partnerId: env('PARTNER_ID'),
        externalReference: reference,
        zone: req.region,
        destination: req.destination,
        startDate: req.departureDate,
        endDate: req.returnDate,
        tripType: req.purpose,
        travellers: req.travellers.map((t) => ({ age: t.age })),
        cancellation: req.cancellation ? { tripCost: req.tripCostPerPerson } : null,
        residenceCountry: 'PT',
        language: 'pt'
    };
}

/** Traduz a resposta da API para ofertas internas. TODO(fase 2): alinhar com a especificação. */
function fromPartnerResponse(body: unknown): QuoteOffer[] {
    const items = (body as { offers?: unknown[] })?.offers;
    if (!Array.isArray(items)) return [];
    return items.map((raw) => {
        const o = raw as Record<string, any>;
        return {
            provider: 'partner-api',
            offerId: String(o.id),
            productName: String(o.productName ?? o.name ?? 'Seguro de viagem'),
            insurer: String(o.insurer ?? ''),
            premium: { amount: Number(o.price ?? o.premium ?? 0), currency: 'EUR' },
            coverages: Array.isArray(o.coverages)
                ? o.coverages.map((c: any) => ({ code: String(c.code), label: String(c.label), limit: c.limit != null ? { amount: Number(c.limit), currency: 'EUR' } : undefined }))
                : [],
            documents: Array.isArray(o.documents) ? o.documents.map((d: any) => ({ label: String(d.label), url: String(d.url) })) : [],
            expiresAt: o.expiresAt
        } satisfies QuoteOffer;
    });
}
