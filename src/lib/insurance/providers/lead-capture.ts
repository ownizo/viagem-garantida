import type { InsuranceProvider } from '../types';

/**
 * Sem API ativa: não há ofertas a mostrar. O site não prepara propostas manuais —
 * a venda de seguros é feita exclusivamente pela HelloSafe.
 */
export const leadCaptureProvider: InsuranceProvider = {
    id: 'lead-capture',
    isConfigured: () => true,
    async quote(_request, reference) {
        return { result: { status: 'received', reference } };
    }
};
