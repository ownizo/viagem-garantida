import type { APIRoute } from 'astro';
import { verifyAtlasWebhook } from '../../../lib/insurance/atlas/client';
import { env } from '../../../lib/insurance/env';
import { sendInternalEmail } from '../../../lib/insurance/notify';
import { saveSaleEvent } from '../../../lib/insurance/store';

export const prerender = false;

/**
 * Webhook de vendas HelloSafe Atlas (sale.confirmed / sale.cancelled).
 * Configurar no painel HelloSafe → Técnico → Webhooks com o URL
 * https://viagemgarantida.com/api/webhooks/hellosafe e guardar o segredo em ATLAS_WEBHOOK_SECRET.
 * Responder 2xx em menos de 10 s; entregas repetidas são deduplicadas pelo id do evento.
 */
export const POST: APIRoute = async ({ request }) => {
    const secret = env('ATLAS_WEBHOOK_SECRET');
    if (!secret) return new Response('Webhook não configurado', { status: 503 });

    const raw = await request.text(); // corpo em bruto: é sobre estes bytes que a assinatura é calculada
    const ok = verifyAtlasWebhook(raw, request.headers.get('x-atlas-timestamp'), request.headers.get('x-atlas-signature'), secret);
    if (!ok) return new Response('Assinatura inválida', { status: 401 });

    let event: any;
    try {
        event = JSON.parse(raw);
    } catch {
        return new Response('JSON inválido', { status: 400 });
    }

    const id = String(event?.id ?? request.headers.get('x-atlas-event-id') ?? '');
    if (!id) return new Response('Evento sem id', { status: 400 });

    await saveSaleEvent(id, { receivedAt: new Date().toISOString(), ...event });

    const d = event.data ?? {};
    const fmt = (m?: { amount?: number; currency?: string }) => (m ? `${m.amount} ${m.currency}` : '—');
    await sendInternalEmail(`HelloSafe: ${event.type}${event.liveMode === false ? ' (teste)' : ''}`, [
        ['Evento', `${event.type} · ${id}`],
        ['Encomenda', String(d.orderId ?? '—')],
        ['Referência da cotação', String(d.clickRef ?? '—')],
        ['Seguradora', String(d.insurer ?? '—')],
        ['Prémio', fmt(d.premium)],
        ['Pago pelo cliente', fmt(d.paid)],
        ['Comissão', fmt(d.commission)],
        ['Estado', `${d.status ?? '—'}${d.reason ? ` (${d.reason})` : ''}`],
        ['Data', String(d.occurredAt ?? event.createdAt ?? '—')]
    ]);

    return new Response('ok', { status: 200 });
};
