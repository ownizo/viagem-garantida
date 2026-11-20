import { getStore } from '@netlify/blobs';
import type { QuoteResult, TravelQuoteRequest } from './types';

const STORE_NAME = 'pedidos-cotacao';

export interface StoredQuote {
    reference: string;
    createdAt: string;
    provider: string;
    request: TravelQuoteRequest;
    result?: QuoteResult;
    error?: string;
}

/**
 * Guarda cada pedido de cotação no Netlify Blobs. Serve de registo na fase 1
 * e de trilho de auditoria na fase 2 (pedido + resposta do fornecedor).
 */
export async function saveQuote(record: StoredQuote): Promise<boolean> {
    try {
        const store = getStore(STORE_NAME);
        await store.setJSON(record.reference, record, { metadata: { createdAt: record.createdAt } });
        return true;
    } catch (err) {
        // Fora do ambiente Netlify (ex.: dev sem `netlify dev`) o Blobs não está disponível.
        console.warn('[quote] Netlify Blobs indisponível:', (err as Error).message);
        return false;
    }
}

export function newReference(): string {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VG-${date}-${rand}`;
}
