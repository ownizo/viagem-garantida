# Integração HelloSafe Atlas

API de seguros de viagem da HelloSafe (`https://atlas.hellosafe.com`, v1). Servidor a servidor: o segredo nunca chega ao browser.

## Fluxo

```
/cotacao ──POST /api/quote──▶ validação (schema.ts)
                               └▶ HelloSafe POST /api/v1/travel/quotes  → ofertas + sessionId
                                  ├─ ofertas devolvidas ao browser (sem sessionId)
                                  ├─ pedido + sessionId + trip guardados no Netlify Blobs ("pedidos-cotacao")
                                  └─ email interno (Resend)
viajante escolhe oferta ──POST /api/checkout {reference, offerId}──▶
                               └▶ HelloSafe POST /api/v1/travel/links (sessionId, trip, offerId, clickRef = referência VG)
                                  └─ devolve o URL → redirect para o funil HelloSafe (subscrição e pagamento)
HelloSafe ──POST /api/webhooks/hellosafe──▶ sale.confirmed / sale.cancelled
                               └▶ assinatura verificada, evento guardado em Blobs ("vendas") + email interno
```

Sem credenciais, com chave sandbox não autorizada, sem ofertas ou com erro da API, o pedido passa a tratamento manual (o cliente vê "Pedido recebido").

## Ficheiros

| Ficheiro | Função |
| --- | --- |
| `src/lib/insurance/atlas/client.ts` | Assinatura v2 (`${ts}.${METHOD}.${pathname}.${rawBody}`), pedidos, erros, verificação de webhooks (v1) |
| `src/lib/insurance/providers/hellosafe.ts` | Mapeamento pedido → `trip` Atlas e oferta Atlas → `QuoteOffer`; `/quotes` e `/links` |
| `src/lib/insurance/service.ts` | Escolha do fornecedor, registo, checkout |
| `src/pages/api/quote.ts`, `checkout.ts`, `webhooks/hellosafe.ts` | Endpoints serverless |
| `src/components/QuoteForm.astro` | Formulário, lista de ofertas (ordenação por proteção médica ou preço), escolha |

Mapeamento do tipo de viagem → `intent`: lazer/trabalho → `forTourism`, anual → `annual`, estudos → `studyInternship`, nómada → `digitalNomad`, cruzeiro → `cruise`, expatriação → `expat`, au pair → `auPair`. Língua do funil: `pt`. Moeda: `EUR`. `tripPrice` é o custo total da viagem para todo o grupo.

## Ativar

1. **Netlify → Environment variables**, contexto *Deploy Previews*: `ATLAS_KEY_ID` (ak_test_…), `ATLAS_SIGNING_SECRET`, `ATLAS_ALLOW_SANDBOX=true`. Testar num deploy preview — aparece a faixa "MODO DE TESTE".
   ⚠️ O link sandbox abre o funil real da HelloSafe: qualquer pagamento é real.
2. Para pedir a chave de produção, a HelloSafe exige 10 preços e 1 link feitos em sandbox e a conta de parceiro aprovada.
3. Com a chave `ak_live_…`: definir `ATLAS_KEY_ID` e `ATLAS_SIGNING_SECRET` no contexto *Production* (sem `ATLAS_ALLOW_SANDBOX`).
4. **Webhooks** (painel HelloSafe → Técnico → Webhooks): URL `https://viagemgarantida.com/api/webhooks/hellosafe`; guardar o segredo em `ATLAS_WEBHOOK_SECRET`.

## Regras da HelloSafe a respeitar

- Não guardar preços em cache por muito tempo; nome da seguradora e documentos (IPID, condições) sempre junto da oferta mostrada.
- Nunca mostrar preços ou links sandbox a viajantes reais.
- Quotas sandbox: 200 preços e 50 links por dia, 60 pedidos por minuto.

## Consultar registos

```bash
netlify blobs:list pedidos-cotacao
netlify blobs:get pedidos-cotacao VG-261120-AB12
netlify blobs:list vendas
```
