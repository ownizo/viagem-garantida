# Integração com o fornecedor de seguros (fase 2)

## Estado atual (fase 1)

O site está pronto a receber pedidos de cotação, mas ainda não está ligado a nenhuma API de seguradora.

```
Formulário (/cotacao)  ──POST JSON──▶  /api/quote  ──▶  service.requestQuote()
                                         │                 ├─ provider.quote()   → lead-capture: { status: 'received' }
                                         │                 ├─ saveQuote()        → Netlify Blobs, store "pedidos-cotacao"
                                         │                 └─ notifyNewQuote()   → email interno via Resend (se configurado)
                                         └─ validação Zod (schema.ts) + honeypot anti-spam
```

Cada pedido recebe uma referência `VG-AAMMDD-XXXX`, devolvida ao cliente e usada como chave no Blobs e como `externalReference` na API do fornecedor.

## Estrutura

| Ficheiro | Função |
| --- | --- |
| `src/lib/insurance/types.ts` | Modelo de domínio (pedido, oferta, coberturas, emissão) e contrato `InsuranceProvider` |
| `src/lib/insurance/schema.ts` | Validação do pedido que chega do browser |
| `src/lib/insurance/service.ts` | Orquestração: escolhe o fornecedor, regista, notifica, nunca perde um pedido |
| `src/lib/insurance/providers/lead-capture.ts` | Fornecedor da fase 1 (sem API) |
| `src/lib/insurance/providers/partner-api.ts` | Esqueleto do adapter da fase 2 |
| `src/lib/insurance/store.ts` | Registo em Netlify Blobs |
| `src/lib/insurance/notify.ts` | Email interno (Resend) |
| `src/pages/api/quote.ts` | Endpoint serverless `POST /api/quote` |
| `src/components/QuoteForm.astro` | Formulário; já preparado para mostrar ofertas |

## Passos para ligar a API

1. **Obter do fornecedor:** documentação técnica, credenciais de sandbox, identificador de parceiro/intermediário (para comissionamento) e lista de produtos/zonas.
2. **Mapear o pedido** em `toPartnerPayload()` (`partner-api.ts`): zonas geográficas, tipos de viagem, idades vs. datas de nascimento, país de residência, capitais de cancelamento.
3. **Mapear a resposta** em `fromPartnerResponse()` para `QuoteOffer[]`: prémio, coberturas com capitais, documentos pré-contratuais (IPID, condições gerais) — estes documentos têm de ser apresentados ao cliente antes da compra.
4. **Configurar variáveis** em Netlify: `INSURANCE_PROVIDER=partner-api`, `PARTNER_API_BASE_URL`, `PARTNER_API_KEY`, `PARTNER_ID`. Começar com o contexto *Deploy Previews* apontado para a sandbox.
5. **Mostrar ofertas** em `QuoteForm.astro` quando `result.status === 'offers'` (ponto marcado com `Fase 2`).
6. **Compra:** implementar `bind()` e um endpoint `POST /api/purchase` com os dados do tomador e das pessoas seguras. Se o fornecedor tiver checkout/pagamento próprio (redirect ou widget), usar esse fluxo em vez de tratar pagamentos no site.
7. **Webhooks** (se existirem): endpoint `POST /api/webhooks/partner` para confirmação de emissão e envio de apólice, com verificação de assinatura.

## Salvaguardas já incluídas

- Se a API falhar ou estiver em baixo, o pedido é guardado e passa a tratamento manual — o cliente recebe sempre a confirmação.
- Se `INSURANCE_PROVIDER` apontar para um fornecedor sem credenciais, o sistema volta automaticamente a `lead-capture`.
- Pedido e resposta ficam registados no Blobs (auditoria e reconciliação de comissões).
- Nenhuma credencial é exposta ao browser: toda a comunicação com a API acontece no servidor.

## Consultar pedidos guardados

```bash
netlify blobs:list pedidos-cotacao
netlify blobs:get pedidos-cotacao VG-261120-AB12
```
