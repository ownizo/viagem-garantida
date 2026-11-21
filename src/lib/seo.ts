import { SITE } from '../site';

/** BreadcrumbList (schema.org) a partir de pares [nome, caminho]. */
export function breadcrumbLd(items: [string, string][]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map(([name, path], i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name,
            item: new URL(path, SITE.url).toString().replace(/\/$/, path === '/' ? '/' : '')
        }))
    };
}

export function faqLd(faqs: { q: string; a: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    };
}
