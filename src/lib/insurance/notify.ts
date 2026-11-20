import { env } from './env';

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
