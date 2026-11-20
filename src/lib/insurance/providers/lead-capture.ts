import type { InsuranceProvider } from '../types';

/**
 * Sem API ativa (ou em caso de falha): o pedido é registado (Blobs + email interno,
 * tratados em ../service.ts) e a proposta é preparada e enviada pelo mediador.
 */
export const leadCaptureProvider: InsuranceProvider = {
    id: 'lead-capture',
    isConfigured: () => true,
    async quote(_request, reference) {
        return { result: { status: 'received', reference } };
    }
};
