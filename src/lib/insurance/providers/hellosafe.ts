import { env } from '../env';
import { atlasCredentials, atlasRequest, isSandboxKey } from '../atlas/client';
import type { CheckoutLink, InsuranceProvider, ProviderQuote, QuoteOffer, TravelQuoteRequest, TripPurpose } from '../types';

/**
 * Fornecedor HelloSafe Atlas.
 *
 * Variáveis de ambiente (Netlify → Project configuration → Environment variables):
 *   ATLAS_KEY_ID            ak_test_… (sandbox) ou ak_live_… (produção)
 *   ATLAS_SIGNING_SECRET    segredo de assinatura (mostrado uma única vez na criação da chave)
 *   ATLAS_ALLOW_SANDBOX     "true" para aceitar uma chave sandbox (usar só em Deploy Previews)
 *   ATLAS_WEBHOOK_SECRET    segredo dos webhooks de vendas (ver /api/webhooks/hellosafe)
 */

const LANGUAGE = 'pt';

const INTENT: Record<TripPurpose, string> = {
    lazer: 'forTourism',
    trabalho: 'forTourism',
    anual: 'annual',
    estudos: 'studyInternship',
    nomada: 'digitalNomad',
    cruzeiro: 'cruise',
    expatriacao: 'expat',
    'au-pair': 'auPair'
};

interface AtlasOffer {
    id: number;
    name: string;
    plan?: string;
    insurer?: { name?: string; logoUrl?: string | null };
    iconUrl?: string;
    price: { amount: number; currency: string; isStartingPrice?: boolean };
    guaranteeCurrency?: string;
    guarantees?: Record<string, { state: string; value?: number | null; franchise?: number; franchiseDetails?: string }>;
    highlights?: { included?: string[]; excluded?: string[] };
    documents?: { cgvUrl?: string | null; ipidUrl?: string | null };
    position?: number;
}

interface AtlasQuoteResponse {
    ok: boolean;
    mode: 'sandbox' | 'live';
    sessionId: string;
    offers: AtlasOffer[];
    trip: unknown;
    quote?: { expiresAt?: string };
    meta?: { notice?: string };
}

interface AtlasLinkResponse {
    ok: boolean;
    url: string;
    orderRef?: string | null;
    subscriptionId?: string;
}

export function toAtlasTrip(req: TravelQuoteRequest) {
    return {
        intent: INTENT[req.purpose] ?? 'forTourism',
        startDate: req.departureDate,
        endDate: req.returnDate,
        countryResidence: req.residence,
        arrivalCountries: req.destinations,
        travellers: req.travellers.map((t) => ({ age: t.age })),
        currency: 'EUR',
        ...(req.cancellation
            ? { shouldCoverCancellation: true, tripPrice: req.tripPrice, ...(req.tripBookedDate ? { tripBoughtDate: req.tripBookedDate } : {}) }
            : {}),
        ...(req.extremeSports ? { shouldCoverExtremeSports: true } : {})
    };
}

export function fromAtlasOffer(o: AtlasOffer): QuoteOffer {
    return {
        provider: 'hellosafe',
        offerId: o.id,
        productName: o.name,
        plan: o.plan,
        insurer: o.insurer?.name ?? '',
        // Desde a v2.0.0 logoUrl é o pictograma da oferta (ou o logótipo da seguradora na falta dele).
        imageUrl: o.insurer?.logoUrl ?? o.iconUrl ?? null,
        price: { amount: o.price.amount, currency: o.price.currency, isStartingPrice: Boolean(o.price.isStartingPrice) },
        guaranteeCurrency: o.guaranteeCurrency ?? 'EUR',
        guarantees: o.guarantees ?? {},
        highlights: { included: o.highlights?.included ?? [], excluded: o.highlights?.excluded ?? [] },
        documents: { cgvUrl: o.documents?.cgvUrl ?? null, ipidUrl: o.documents?.ipidUrl ?? null },
        position: o.position ?? 0
    };
}

export const hellosafeProvider: InsuranceProvider = {
    id: 'hellosafe',

    isConfigured() {
        const creds = atlasCredentials();
        if (!creds) return false;
        // Uma chave sandbox devolve preços fictícios e o link abre o funil real:
        // nunca a mostrar a viajantes reais. Só é usada se for explicitamente permitida.
        if (isSandboxKey(creds.keyId) && env('ATLAS_ALLOW_SANDBOX') !== 'true') return false;
        return true;
    },

    async quote(req, reference): Promise<ProviderQuote> {
        const creds = atlasCredentials()!;
        const trip = toAtlasTrip(req);
        const { data } = await atlasRequest<AtlasQuoteResponse>(creds, 'POST', '/api/v1/travel/quotes', { trip, language: LANGUAGE });

        const offers = (data.offers ?? []).map(fromAtlasOffer);
        if (offers.length === 0) return { result: { status: 'received', reference } };

        return {
            result: { status: 'offers', reference, mode: data.mode, offers, expiresAt: data.quote?.expiresAt, notice: data.meta?.notice },
            session: { provider: 'hellosafe', sessionId: data.sessionId, trip, language: LANGUAGE, mode: data.mode }
        };
    },

    async checkout(session, offerId, clickRef): Promise<CheckoutLink> {
        const creds = atlasCredentials()!;
        const body: Record<string, unknown> = { sessionId: session.sessionId, trip: session.trip, offerId, language: session.language };
        if (clickRef) body.clickRef = clickRef;
        const { data } = await atlasRequest<AtlasLinkResponse>(creds, 'POST', '/api/v1/travel/links', body);
        return { url: data.url, orderRef: data.orderRef ?? null, mode: session.mode };
    }
};
