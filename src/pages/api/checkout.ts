import type { APIRoute } from 'astro';
import { checkoutSchema } from '../../lib/insurance/schema';
import { CheckoutError, startCheckout } from '../../lib/insurance/service';
import { AtlasError } from '../../lib/insurance/atlas/client';

export const prerender = false;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

/** O viajante escolheu uma oferta: cria o link de subscrição atribuído ao parceiro e devolve-o. */
export const POST: APIRoute = async ({ request }) => {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, error: 'Pedido inválido' }, 400);
    }
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return json({ ok: false, error: 'Pedido inválido' }, 422);

    try {
        const link = await startCheckout(parsed.data.reference, parsed.data.offerId);
        return json({ ok: true, url: link.url, mode: link.mode });
    } catch (err) {
        if (err instanceof CheckoutError) return json({ ok: false, error: err.message }, err.status);
        if (err instanceof AtlasError) {
            console.error('[checkout] Atlas', err.status, err.code, err.detail);
            const msg =
                err.code === 'BAD_OFFER_ID'
                    ? 'Esta oferta já não está disponível. Atualize a cotação.'
                    : 'Não foi possível abrir a subscrição. Tente novamente dentro de instantes.';
            return json({ ok: false, error: msg }, 502);
        }
        console.error('[checkout]', err);
        return json({ ok: false, error: 'Ocorreu um erro inesperado.' }, 500);
    }
};

export const ALL: APIRoute = () => json({ ok: false, error: 'Método não permitido' }, 405);
