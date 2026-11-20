import type { APIRoute } from 'astro';
import { quoteRequestSchema, toDomain } from '../../lib/insurance/schema';
import { requestQuote } from '../../lib/insurance/service';

export const prerender = false;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
    if (!request.headers.get('content-type')?.includes('application/json')) {
        return json({ ok: false, error: 'Content-Type inválido' }, 415);
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false, error: 'Pedido inválido' }, 400);
    }

    const parsed = quoteRequestSchema.safeParse(body);
    if (!parsed.success) {
        const fieldErrors = parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
        return json({ ok: false, error: 'Verifique os dados do formulário', fieldErrors }, 422);
    }

    // Honeypot preenchido: responde como sucesso sem processar.
    if (parsed.data.website) return json({ ok: true, result: { status: 'received', reference: 'VG-OK' } });

    const result = await requestQuote(toDomain(parsed.data));
    return json({ ok: true, result });
};

export const ALL: APIRoute = () => json({ ok: false, error: 'Método não permitido' }, 405);
