import type { InsuranceProvider } from '../types';

/**
 * Fase 1: sem ligação a API. O pedido é registado (Blobs + email interno, tratados
 * em ../service.ts) e a proposta é preparada e enviada pelo mediador.
 */
export const leadCaptureProvider: InsuranceProvider = {
    id: 'lead-capture',
    isConfigured: () => true,
    async quote(_request, reference) {
        return { status: 'received', reference };
    }
};
