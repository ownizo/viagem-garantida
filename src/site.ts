// Dados centrais da marca e do mediador responsável.
// Alterar aqui propaga para cabeçalho, rodapé, páginas legais e dados estruturados.

export const SITE = {
    name: 'Viagem Garantida',
    url: 'https://viagemgarantida.com',
    tagline: 'Seguros de viagem escolhidos pela proteção, não pelo preço.',
    description:
        'Seguros de viagem para famílias, estudantes e viajantes exigentes: despesas médicas, repatriamento, cancelamento e assistência 24h, com aconselhamento de um mediador registado na ASF.',
    email: 'insurance@adlerrochefort.com',
    phone: '+351 928 226 570',
    phoneHref: 'tel:+351928226570'
} as const;

export const MEDIADOR = {
    brand: 'Adler & Rochefort',
    legalName: 'Ownizo, Unipessoal Lda.',
    category: 'Agente de seguros',
    asfRegistration: '425591790/3',
    asfUrl: 'https://www.asf.com.pt/web/site-asf/mediador?MediadorId=227408',
    address: 'Av. do Atlântico 16, Esc. 5.07, 1990-019 Lisboa',
    website: 'https://adlerrochefort.com'
} as const;

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
