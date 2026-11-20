import { env } from './env';
import type { QuoteResult, TravelQuoteRequest } from './types';

const PURPOSE: Record<string, string> = {
    lazer: 'Férias e lazer',
    anual: 'Anual multiviagem',
    estudos: 'Estudos / estágio',
    nomada: 'Nómada digital',
    cruzeiro: 'Cruzeiro',
    expatriacao: 'Expatriação',
    'au-pair': 'Au pair',
    trabalho: 'Trabalho / negócios'
};

function escape(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Envia um email interno via Resend, se RESEND_API_KEY, QUOTE_NOTIFY_FROM e QUOTE_NOTIFY_TO estiverem definidos. */
export async function sendInternalEmail(subject: string, rows: [string, string][], replyTo?: string): Promise<void> {
    const apiKey = env('RESEND_API_KEY');
    const from = env('QUOTE_NOTIFY_FROM');
    const to = env('QUOTE_NOTIFY_TO');
    if (!apiKey || !from || !to) return;

    const html = `<h2>${escape(subject)}</h2><table cellpadding="6">${rows
        .map(([k, v]) => `<tr><td><strong>${escape(k)}</strong></td><td>${escape(v)}</td></tr>`)
        .join('')}</table>`;
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: to.split(',').map((s) => s.trim()), ...(replyTo ? { reply_to: replyTo } : {}), subject, html })
        });
        if (!res.ok) console.warn('[notify] Resend respondeu', res.status, await res.text());
    } catch (err) {
        console.warn('[notify] Falha ao enviar email:', (err as Error).message);
    }
}

export async function notifyNewQuote(reference: string, req: TravelQuoteRequest, result: QuoteResult): Promise<void> {
    const outcome =
        result.status === 'offers'
            ? `${result.offers.length} ofertas apresentadas online${result.mode === 'sandbox' ? ' (SANDBOX)' : ''}`
            : 'Sem ofertas online — preparar proposta manualmente';
    await sendInternalEmail(
        `Pedido de cotação ${reference} — ${req.destinations.join(', ')}`,
        [
            ['Referência', reference],
            ['Resultado', outcome],
            ['Nome', req.contact.name],
            ['Email', req.contact.email],
            ['Telefone', req.contact.phone ?? '—'],
            ['Residência', req.residence],
            ['Destinos', req.destinations.join(', ')],
            ['Datas', `${req.departureDate} → ${req.returnDate}`],
            ['Motivo', PURPOSE[req.purpose] ?? req.purpose],
            ['Viajantes (idades)', req.travellers.map((t) => t.age).join(', ')],
            ['Cancelamento', req.cancellation ? `Sim — ${req.tripPrice ?? '?'} € (total)` : 'Não'],
            ['Desportos radicais', req.extremeSports ? 'Sim' : 'Não'],
            ['Notas', req.notes ?? '—']
        ],
        req.contact.email
    );
}
