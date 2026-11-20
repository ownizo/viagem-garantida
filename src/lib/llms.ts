import { getCollection } from 'astro:content';
import { CATEGORIES, MEDIADOR, SITE } from '../site';

export const PAGES = [
    { path: '/', title: 'Página inicial', desc: 'Formulário de cotação de seguro de viagem: destinos, datas, idades dos viajantes, cancelamento. Compara ofertas de várias seguradoras.' },
    { path: '/cotacao', title: 'Pedir cotação', desc: 'Formulário completo de cotação; as ofertas podem ser ordenadas por proteção médica ou por preço e subscritas online.' },
    { path: '/coberturas', title: 'Coberturas', desc: 'Despesas médicas, repatriamento, assistência 24h, cancelamento, bagagem, responsabilidade civil e acidentes pessoais.' },
    { path: '/seguro-cancelamento', title: 'Seguro de cancelamento', desc: 'O que cobre, exclusões habituais e porque deve ser subscrito no dia da reserva.' },
    { path: '/sobre', title: 'Quem somos', desc: 'Marca da Ownizo, Unipessoal Lda., agente de seguros registado na ASF, sem exclusividade com seguradoras.' },
    { path: '/informacao-legal', title: 'Informação legal', desc: 'Identificação do mediador, registo na ASF, remuneração e meios de reclamação.' }
];

export async function posts() {
    return (await getCollection('blog')).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function header(): string {
    return `# ${SITE.name}

> ${SITE.name} (${SITE.url}) é um site português de seguros de viagem. Compara seguros de viagem de várias seguradoras para residentes em Portugal — famílias, estudantes, viagens de longo curso e estadias longas — com foco na qualidade da proteção (despesas médicas, repatriamento, assistência 24h, cancelamento) e não no preço mais baixo.

- Operador: ${MEDIADOR.legalName}, ${MEDIADOR.category.toLowerCase()} registado na Autoridade de Supervisão de Seguros e Fundos de Pensões (ASF) com o n.º ${MEDIADOR.asfRegistration} (${MEDIADOR.asfUrl}).
- Sem contrato de exclusividade com nenhuma seguradora.
- Sede: ${MEDIADOR.address} (sem atendimento ao público). Serviço online.
- Contacto: ${SITE.email}
- Língua: português (Portugal).
- Cotação online em ${SITE.url}/cotacao; a subscrição e o pagamento são concluídos na plataforma da HelloSafe, parceira de distribuição.
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
