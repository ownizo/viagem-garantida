/**
 * Modelo de domínio do seguro de viagem, independente do fornecedor.
 *
 * O site e o formulário só conhecem estes tipos. Cada fornecedor tem um adapter em
 * ./providers que traduz estes tipos de e para o formato da sua API (hoje: HelloSafe Atlas).
 */

export type TripPurpose = 'lazer' | 'anual' | 'estudos' | 'nomada' | 'cruzeiro' | 'expatriacao' | 'au-pair' | 'trabalho';

export interface Traveller {
    /** Idade na data de partida. */
    age: number;
}

export interface TravelQuoteRequest {
    /** País de residência, ISO 3166-1 alfa-2. */
    residence: string;
    /** Países de destino, ISO 3166-1 alfa-2 (1 a 20). */
    destinations: string[];
    departureDate: string; // yyyy-mm-dd
    returnDate: string; // yyyy-mm-dd
    purpose: TripPurpose;
    travellers: Traveller[];
    cancellation: boolean;
    /** Custo total da viagem para todo o grupo (EUR). Obrigatório com cancelamento. */
    tripPrice?: number;
    /** Data em que a viagem foi reservada (yyyy-mm-dd). */
    tripBookedDate?: string;
    extremeSports: boolean;
    source?: Record<string, string>;
}

export interface Money {
    amount: number;
    currency: string;
}

export type GuaranteeState =
    | 'value'
    | 'included'
    | 'actual_costs'
    | 'per_day'
    | 'return_ticket'
    | 'trip_price'
    | 'studies_amount'
    | 'unlimited'
    | 'number'
    | 'percentage'
    | 'many_reasons'
    | 'any_justified_reason'
    | 'see_conditions'
    | 'not_available'
    | (string & {});

export interface Guarantee {
    state: GuaranteeState;
    value?: number | null;
    franchise?: number;
    franchiseDetails?: string;
}

export interface QuoteOffer {
    provider: string;
    /** Identificador da oferta no fornecedor, necessário para avançar para a subscrição. */
    offerId: number;
    productName: string;
    plan?: string;
    insurer: string;
    imageUrl?: string | null;
    price: Money & { isStartingPrice: boolean };
    guaranteeCurrency: string;
    guarantees: Record<string, Guarantee>;
    highlights: { included: string[]; excluded: string[] };
    documents: { cgvUrl?: string | null; ipidUrl?: string | null };
    position: number;
}

export type QuoteResult =
    | {
          status: 'offers';
          reference: string;
          mode: 'sandbox' | 'live';
          offers: QuoteOffer[];
          expiresAt?: string;
          notice?: string;
      }
    | { status: 'received'; reference: string };

/** Dados guardados apenas no servidor para retomar a sessão do fornecedor. */
export interface ProviderSession {
    provider: string;
    sessionId: string;
    trip: unknown;
    language: string;
    mode: 'sandbox' | 'live';
}

export interface ProviderQuote {
    result: QuoteResult;
    session?: ProviderSession;
}

export interface CheckoutLink {
    url: string;
    orderRef?: string | null;
    mode: 'sandbox' | 'live';
}

export interface InsuranceProvider {
    readonly id: string;
    /** true quando as credenciais necessárias estão definidas e autorizadas neste ambiente. */
    isConfigured(): boolean;
    quote(request: TravelQuoteRequest, reference: string): Promise<ProviderQuote>;
    /** Cria o link de subscrição para a oferta escolhida. */
    checkout?(session: ProviderSession, offerId: number, clickRef?: string): Promise<CheckoutLink>;
}
