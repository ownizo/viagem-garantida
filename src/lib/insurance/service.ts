import { env } from './env';
import { notifyNewQuote } from './notify';
import { leadCaptureProvider } from './providers/lead-capture';
import { partnerApiProvider } from './providers/partner-api';
import { newReference, saveQuote } from './store';
import type { InsuranceProvider, QuoteResult, TravelQuoteRequest } from './types';

const PROVIDERS: Record<string, InsuranceProvider> = {
    [leadCaptureProvider.id]: leadCaptureProvider,
    [partnerApiProvider.id]: partnerApiProvider
};

/**
 * Escolhe o fornecedor ativo pela variável INSURANCE_PROVIDER.
 * Se não estiver configurado, cai sempre para a captação de pedidos — o site nunca fica sem resposta.
 */
export function activeProvider(): InsuranceProvider {
    const wanted = env('INSURANCE_PROVIDER') ?? 'lead-capture';
    const provider = PROVIDERS[wanted];
    return provider && provider.isConfigured() ? provider : leadCaptureProvider;
}

export async function requestQuote(request: TravelQuoteRequest): Promise<QuoteResult> {
    const reference = newReference();
    const createdAt = new Date().toISOString();
    const provider = activeProvider();

    let result: QuoteResult;
    let error: string | undefined;
    try {
        result = await provider.quote(request, reference);
    } catch (err) {
        // Falha da API: o pedido não se perde, passa a tratamento manual.
        error = (err as Error).message;
        console.error(`[quote] ${provider.id} falhou:`, error);
        result = { status: 'received', reference };
    }

    await saveQuote({ reference, createdAt, provider: provider.id, request, result, error });
    await notifyNewQuote(reference, request);
    return result;
}
