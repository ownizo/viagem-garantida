// Dados centrais da marca, do operador da plataforma e do parceiro que vende os seguros.
// Alterar aqui propaga para cabeçalho, rodapé, páginas legais e dados estruturados.

export const SITE = {
    name: 'Viagem Garantida',
    url: 'https://viagemgarantida.com',
    tagline: 'Compare seguros de viagem pela proteção, não só pelo preço.',
    description:
        'Compare seguros de viagem para famílias, estudantes e viagens de longo curso: despesas médicas, repatriamento, cancelamento e assistência 24h. Guias práticos e comparação de ofertas.',
    email: 'geral@viagemgarantida.com',
    phone: '+351 928 226 570',
    phoneHref: 'tel:+351928226570'
} as const;

/** Entidade que explora a plataforma (marketing e informação; não vende seguros neste site). */
export const OPERATOR = {
    legalName: 'Ownizo, Unipessoal Lda.',
    address: 'Av. do Atlântico 16, Esc. 5.07, 1990-019 Lisboa, Portugal'
} as const;

/** Parceiro que comercializa os seguros (subscrição, pagamento e apoio pós-venda). */
export const PARTNER = {
    name: 'HelloSafe',
    legalName: 'HELLO SAFE SAS',
    registry: 'RCS de Rennes n.º 883 069 593',
    address: '5 allée de la Grande Treille, 35200 Rennes, França',
    orias: '21008038',
    oriasUrl: 'https://www.orias.fr',
    website: 'https://hellosafe.com'
} as const;

export const LEGAL_UPDATED = '20 de novembro de 2026';

export const NAV = [
    { href: '/coberturas', label: 'Coberturas' },
    { href: '/seguro-cancelamento', label: 'Cancelamento' },
    { href: '/blog', label: 'Guias' },
    { href: '/sobre', label: 'Quem somos' }
] as const;

export const CATEGORIES = {
    familias: 'Famílias',
    estudantes: 'Estudantes',
    destinos: 'Destinos',
    coberturas: 'Coberturas',
    cancelamento: 'Cancelamento'
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
