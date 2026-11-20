import { env } from './env';
import type { TravelQuoteRequest } from './types';

const REGION_LABEL: Record<string, string> = {
    europa: 'Europa',
    'mundo-sem-eua': 'Mundo (exceto EUA/Canadá)',
    'mundo-com-eua': 'Mundo (incluindo EUA/Canadá)'
};

function escape(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/**
 * Notificação interna por email (Resend) de cada novo pedido.
 * Só envia se RESEND_API_KEY, QUOTE_NOTIFY_FROM e QUOTE_NOTIFY_TO estiverem definidos.
 */
export async function notifyNewQuote(reference: string, req: TravelQuoteRequest): Promise<void> {
    const apiKey = env('RESEND_API_KEY');
    const from = env('QUOTE_NOTIFY_FROM');
    const to = env('QUOTE_NOTIFY_TO');
    if (!apiKey || !from || !to) return;

    const rows: [string, string][] = [
        ['Referência', reference],
        ['Nome', req.contact.name],
        ['Email', req.contact.email],
        ['Telefone', req.contact.phone ?? '—'],
        ['Região', REGION_LABEL[req.region] ?? req.region],
        ['Destino', req.destination],
        ['Datas', `${req.departureDate} → ${req.returnDate}`],
        ['Motivo', req.purpose],
        ['Viajantes (idades)', req.travellers.map((t) => t.age).join(', ')],
        ['Cancelamento', req.cancellation ? `Sim — ${req.tripCostPerPerson ?? '?'} € por pessoa` : 'Não'],
        ['Notas', req.notes ?? '—']
    ];
    const html = `<h2>Novo pedido de cotação — Viagem Garantida</h2><table cellpadding="6">${rows
        .map(([k, v]) => `<tr><td><strong>${escape(k)}</strong></td><td>${escape(v)}</td></tr>`)
        .join('')}</table>`;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from,
                to: to.split(',').map((s) => s.trim()),
                reply_to: req.contact.email,
                subject: `Pedido de cotação ${reference} — ${req.destination}`,
                html
            })
        });
        if (!res.ok) console.warn('[quote] Resend respondeu', res.status, await res.text());
    } catch (err) {
        console.warn('[quote] Falha ao notificar por email:', (err as Error).message);
    }
}
