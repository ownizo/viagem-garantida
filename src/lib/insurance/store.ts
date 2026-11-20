import { getStore } from '@netlify/blobs';
import type { ProviderSession, QuoteResult, TravelQuoteRequest } from './types';

const QUOTES = 'pedidos-cotacao';
const SALES = 'vendas';

export interface StoredQuote {
    reference: string;
    createdAt: string;
    provider: string;
    request: TravelQuoteRequest;
    /** Resumo do resultado (sem repetir as ofertas completas). */
    result: { status: QuoteResult['status']; offers?: number; mode?: string };
    /** Sessão do fornecedor: nunca enviada ao browser. */
    session?: ProviderSession;
    checkouts?: { offerId: number; orderRef?: string | null; at: string }[];
    error?: string;
}

function store(name: string) {
    return getStore({ name, consistency: 'strong' });
}

export async function saveQuote(record: StoredQuote): Promise<boolean> {
    try {
        await store(QUOTES).setJSON(record.reference, record, { metadata: { createdAt: record.createdAt } });
        return true;
    } catch (err) {
        // Fora do ambiente Netlify (ex.: dev sem `netlify dev`) o Blobs pode não estar disponível.
        console.warn('[quote] Netlify Blobs indisponível:', (err as Error).message);
        return false;
    }
}

export async function loadQuote(reference: string): Promise<StoredQuote | null> {
    try {
        return ((await store(QUOTES).get(reference, { type: 'json' })) as StoredQuote | null) ?? null;
    } catch (err) {
        console.warn('[quote] Falha ao ler do Blobs:', (err as Error).message);
        return null;
    }
}

export async function saveSaleEvent(id: string, event: unknown): Promise<void> {
    await store(SALES).setJSON(id, event);
}

export function newReference(): string {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VG-${date}-${rand}`;
}
