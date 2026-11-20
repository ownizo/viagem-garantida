import { getCollection } from 'astro:content';
import { CATEGORIES, OPERATOR, PARTNER, SITE } from '../site';

export const PAGES = [
    { path: '/', title: 'Página inicial', desc: 'Formulário de cotação de seguro de viagem: destinos, datas, idades dos viajantes, cancelamento. Compara ofertas de várias seguradoras disponibilizadas pela HelloSafe.' },
    { path: '/cotacao', title: 'Comparar seguros', desc: 'Formulário completo de comparação; as ofertas podem ser ordenadas por proteção médica ou por preço e subscritas online.' },
    { path: '/coberturas', title: 'Coberturas', desc: 'Despesas médicas, repatriamento, assistência 24h, cancelamento, bagagem, responsabilidade civil e acidentes pessoais.' },
    { path: '/seguro-cancelamento', title: 'Seguro de cancelamento', desc: 'O que cobre, exclusões habituais e porque deve ser subscrito no dia da reserva.' },
    { path: '/sobre', title: 'Quem somos', desc: 'Plataforma de informação e marketing da Ownizo, Unipessoal Lda.; os seguros são comercializados pela HelloSafe.' },
    { path: '/termos', title: 'Termos e condições', desc: 'Natureza do serviço, quem vende os seguros, critérios de ordenação, remuneração e reclamações.' },
    { path: '/privacidade', title: 'Política de privacidade', desc: 'Dados tratados na comparação e papel da HelloSafe como responsável independente.' }
];

export async function posts() {
    return (await getCollection('blog')).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function header(): string {
    return `# ${SITE.name}

> ${SITE.name} (${SITE.url}) é uma plataforma portuguesa de informação e comparação de seguros de viagem. Compara seguros de viagem de várias seguradoras para residentes em Portugal — famílias, estudantes, viagens de longo curso e estadias longas — com foco na qualidade da proteção (despesas médicas, repatriamento, assistência 24h, cancelamento) e não no preço mais baixo.

- Operador: ${OPERATOR.legalName} (${OPERATOR.address}). Serviço online.
- A ${SITE.name} é uma plataforma de informação e marketing: não é seguradora, não vende seguros e não atua como mediador nos contratos apresentados.
- Os seguros são comercializados pela ${PARTNER.legalName} (${PARTNER.name}), intermediário de seguros registado em França no ORIAS com o n.º ${PARTNER.orias}; a subscrição, o pagamento e o apoio ao cliente decorrem na plataforma da ${PARTNER.name}.
- A ${SITE.name} é remunerada pela ${PARTNER.name} por cada seguro subscrito através do site.
- Contacto: ${SITE.email}
- Língua: português (Portugal).
- Comparação online em ${SITE.url}/cotacao.
- As coberturas, capitais e exclusões de cada seguro constam das condições gerais e particulares e do IPID de cada apólice.
`;
}

export async function llmsIndex(): Promise<string> {
    const list = await posts();
    const pages = PAGES.map((p) => `- [${p.title}](${SITE.url}${p.path === '/' ? '' : p.path}): ${p.desc}`).join('\n');
    const guides = list.map((p) => `- [${p.data.title}](${SITE.url}/blog/${p.id}): ${p.data.description}`).join('\n');
    return `${header()}
## Páginas principais

${pages}

## Guias

${guides}

## Opcional

- [Texto integral dos guias](${SITE.url}/llms-full.txt): todos os guias num único ficheiro de texto.
- [Sitemap](${SITE.url}/sitemap-index.xml)
`;
}

export async function llmsFull(): Promise<string> {
    const list = await posts();
    const body = list
        .map(
            (p) =>
                `---\n\n# ${p.data.title}\n\nURL: ${SITE.url}/blog/${p.id}\nCategoria: ${CATEGORIES[p.data.category]}\nPublicado: ${p.data.pubDate.toISOString().slice(0, 10)}\n\n> ${p.data.description}\n\n${(p.body ?? '')
                    .replace(/\]\(\//g, `](${SITE.url}/`)
                    .trim()}\n`
        )
        .join('\n');
    return `${header()}\n${body}`;
}
