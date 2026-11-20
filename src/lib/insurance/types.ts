/**
 * Modelo de domínio do seguro de viagem, independente do fornecedor.
 *
 * O site e o formulário só conhecem estes tipos. Cada fornecedor (API de seguradora
 * ou agregador) tem um adapter em ./providers que traduz estes tipos de e para o
 * formato próprio da API. Assim, ligar ou trocar de fornecedor na fase 2 não obriga
 * a mexer nas páginas.
 */

export type TravelRegion = 'europa' | 'mundo-sem-eua' | 'mundo-com-eua';

export type TripPurpose = 'lazer' | 'estudos' | 'trabalho' | 'longa-duracao';

export interface Traveller {
    /** Idade na data de partida. Algumas APIs pedem data de nascimento: ver adapter. */
    age: number;
}

export interface TravelQuoteRequest {
    region: TravelRegion;
    destination: string;
    departureDate: string; // ISO yyyy-mm-dd
    returnDate: string; // ISO yyyy-mm-dd
    purpose: TripPurpose;
    travellers: Traveller[];
    /** Pretende cobertura de cancelamento? */
    cancellation: boolean;
    /** Custo total da viagem por pessoa (EUR), relevante para o capital de cancelamento. */
    tripCostPerPerson?: number;
    contact: {
        name: string;
        email: string;
        phone?: string;
    };
    notes?: string;
    consent: {
        privacy: true;
        acceptedAt: string; // ISO timestamp
    };
    /** Metadados de origem (página, UTM), úteis para atribuição. */
    source?: Record<string, string>;
}

export interface Money {
    amount: number;
    currency: 'EUR';
}

export interface CoverageLine {
    /** Código interno estável (ex.: 'medical', 'repatriation', 'cancellation'). */
    code: string;
    label: string;
    limit?: Money | 'ilimitado';
    excess?: Money;
}

export interface QuoteOffer {
    provider: string;
    /** Identificador da oferta no fornecedor, necessário para avançar para a compra. */
    offerId: string;
    productName: string;
    insurer: string;
    premium: Money;
    coverages: CoverageLine[];
    documents: { label: string; url: string }[]; // IPID, condições gerais, etc.
    expiresAt?: string;
}

export type QuoteResult =
    | { status: 'offers'; reference: string; offers: QuoteOffer[] }
    | { status: 'received'; reference: string };

/**
 * Contrato que qualquer fornecedor tem de cumprir.
 * Na fase 1 só existe captação de pedidos (lead-capture).
 */
export interface InsuranceProvider {
    readonly id: string;
    /** true quando as variáveis de ambiente necessárias estão definidas. */
    isConfigured(): boolean;
    quote(request: TravelQuoteRequest, reference: string): Promise<QuoteResult>;
    /**
     * Fase 2: emissão da apólice depois do pagamento.
     * Opcional para que fornecedores apenas de cotação também caibam no contrato.
     */
    bind?(input: BindRequest): Promise<BindResult>;
}

export interface BindRequest {
    reference: string;
    offerId: string;
    policyholder: {
        firstName: string;
        lastName: string;
        birthDate: string;
        email: string;
        phone: string;
        address: string;
        postalCode: string;
        city: string;
        country: string;
        nif?: string;
    };
    insured: { firstName: string; lastName: string; birthDate: string }[];
    paymentToken?: string;
}

export interface BindResult {
    policyNumber: string;
    documents: { label: string; url: string }[];
}
