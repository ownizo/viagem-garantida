import { env } from './env';
import { notifyNewQuote } from './notify';
import { hellosafeProvider } from './providers/hellosafe';
import { leadCaptureProvider } from './providers/lead-capture';
import { loadQuote, newReference, saveQuote } from './store';
import type { CheckoutLink, InsuranceProvider, ProviderSession, QuoteResult, TravelQuoteRequest } from './types';

const PROVIDERS: Record<string, InsuranceProvider> = {
    [leadCaptureProvider.id]: leadCaptureProvider,
    [hellosafeProvider.id]: hellosafeProvider
};

/**
 * Fornecedor ativo: INSURANCE_PROVIDER (por omissão "hellosafe").
 * Sem credenciais válidas para o ambiente, cai sempre para a captação de pedidos.
 */
export function activeProvider(): InsuranceProvider {
    const wanted = env('INSURANCE_PROVIDER') ?? 'hellosafe';
    const provider = PROVIDERS[wanted];
    return provider && provider.isConfigured() ? provider : leadCaptureProvider;
}

export async function requestQuote(request: TravelQuoteRequest): Promise<QuoteResult> {
    const reference = newReference();
    const createdAt = new Date().toISOString();
    const provider = activeProvider();

    let result: QuoteResult = { status: 'received', reference };
    let session: ProviderSession | undefined;
    let error: string | undefined;
    try {
        const quote = await provider.quote(request, reference);
        result = quote.result;
        session = quote.session;
    } catch (err) {
        // Falha da API: o pedido não se perde, passa a tratamento manual.
        error = (err as Error).message;
        console.error(`[quote] ${provider.id} falhou:`, error);
    }

    await saveQuote({
        reference,
        createdAt,
        provider: provider.id,
        request,
        result: { status: result.status, ...(result.status === 'offers' ? { offers: result.offers.length, mode: result.mode } : {}) },
        session,
        error
    });
    await notifyNewQuote(reference, request, result);
    return result;
}

export class CheckoutError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
    }
}

export async function startCheckout(reference: string, offerId: number): Promise<CheckoutLink> {
    const record = await loadQuote(reference);
    if (!record?.session) throw new CheckoutError(404, 'Cotação não encontrada ou expirada. Peça uma nova cotação.');

    const provider = PROVIDERS[record.session.provider];
    if (!provider?.checkout || !provider.isConfigured()) throw new CheckoutError(503, 'Subscrição online temporariamente indisponível.');

    const link = await provider.checkout(record.session, offerId, reference);
    record.checkouts = [...(record.checkouts ?? []), { offerId, orderRef: link.orderRef, at: new Date().toISOString() }];
    await saveQuote(record);
    return link;
}
