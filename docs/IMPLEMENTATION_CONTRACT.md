# Contrato de implementación — NOVA Prediction Market 2.0 v1.7

**Naturaleza:** proyecto conceptual de portfolio; frontend de demostración. Este contrato complementa el blueprint y tiene precedencia sobre ejemplos especulativos de capturas. La interfaz pública se escribe en inglés; documentación de diseño en español. Los hechos y datos del simulador son inventados y deben llevar etiqueta clara de demo.

## 1. Alcance cerrado y navegación

| Destino | Función de usuario | Bloques visibles al inicio | Profundidad oculta / contextual |
|---|---|---|---|
| Home `/` | Descubrir qué merece atención | Hero visual inmersivo, temáticas, Trending, Movers y contenido editorial reducido | Herramientas financieras, filtros avanzados, libro de órdenes |
| Explore `/explore` | Buscar/comparar predicciones | Hero más contenido, accesos a categorías, resultados agrupados por categorías, número resultados, botón Filters colapsado | Panel de filtros, vista densa, filtros financieros |
| Market Detail `/markets/:id` | Entender la propuesta y decidir | Título/pregunta, resultados, probabilidad, gráfico grande, resumen de reglas, ticket simple | Market data, noticias, reglas completas, advanced limit order |
| Portfolio `/portfolio` | Seguir y gestionar predicciones | Valor total marcado, saldo disponible, P&L; Active/Pending/History/Saved; lista de predicciones | Detalles de contratos, órdenes avanzadas, desglose financiero completo |
| Overlays globales | Atajos y continuidad | Search y Bell; avatar demo; Review, Receipt | Preferencias, contexto adicional |

**No existe un tab de Insights ni una página independiente de Trading en P0**. Notas editoriales `Insights` pueden aparecer como módulos en Home o en el detalle sin prometer una plataforma de noticias real. La cartera mantiene su diseño aprobado original sin un gráfico financiero protagonista. La barra de filtros Explore arranca cerrada (incluido al abrir sin query); preservar elección de usuario si alterna manualmente dentro de la visita, sin alterar el default de la primera entrada.

**Rutas compartibles:** Home `/`, Explore `?category=...&sort=...&q=...&status=...`, Market Detail `/markets/:id`, Portfolio `?tab=active|pending|history|saved`; rutas directas deben cargar tras recargar (configuración fallback SPA).

## 2. Reglas globales innegociables

- Todas las operaciones y datos monetarios son virtuales. No hay pagos, cobros, registro, perfil auténtico, APIs de precios/noticias, blockchain, brokers, chatbots ni datos enviados a terceros. En Home y cada ticket, una etiqueta visible aclara el concepto: `Interactive demo · Simulated markets`.
- El marcador de tiempo procede de `displayAsOf`, no de `Date.now()` salvo funciones de UI explícitas. Las narrativas no usan `Live` como sinónimo de cotización en tiempo real. `Live` solo describe un evento ficticio en progreso cuando el escenario lo indica.
- Arquitectura propuesta: domain puro (`math`, `quote`, `portfolio`, `resolution`), repositorio local de datos, store de usuario, selectors derivados, componentes UI, router. Los componentes **nunca** implementan fórmulas financieras por su cuenta.
- Todos los estados se mantienen durante navegación y reload de misma pestaña por `sessionStorage` con número de versión y validación; en nueva visita se intenta restaurar seed (no garantía estricta si browser restaura pestañas). Botones `Restore showcase` y `Start fresh` con confirmación de borrado.
- Botones deshabilitados explican por qué cuando el usuario intenta entrar: cierre, suspensión, saldo, falta de posición o falta de liquidez. No `toast` de éxito si no se confirmó una transacción.
- Copy `prediction-first`: la proposición exacta es visible en selección, review, receipt y portfolio; contratos/centavos como detalles accesibles sin dominar titulares.

## 3. Contrato de datos y semántica

Leer `data/demo-fixtures.v1.7.json`. Tiene 24 mercados, ocho categorías y cuatro posiciones iniciales más una orden LIMIT pendiente. Incluye reglas sintetizadas, series temporales deterministas y campos de liquidez demo. **Nunca** afirmar que los datos son reales, aunque algunos nombres de instituciones y empresas sí lo sean.

### Unidades

| Campo | Unidad | Reglas |
|---|---|---|
| `priceCents`, `bidCents`, `askCents`, `indicativeCents` | entero, centavos por contrato | Entre 0 y 100; bids/asks para compra/venta, mid para marcar y mostrar odds; libro demo separado |
| `probabilityCents` | entero 0..100 | Interpretar `48` como `48%` indicativo, no como 48 dólares |
| `quantity` | contratos enteros | No permitir compras fraccionarias o cantidad negativa en P0 |
| `amountCents`, `costBasisCents`, `cashCents`, `reservedCents` | entero, centavos USD | No usar floats ni operaciones `0.1 + 0.2` sobre dinero |
| `payoutPerWinningContractCents` | `100` | Contrato gana 1 USD si su proposición se cumple; si falla, paga cero |
| `feesCents` | `0` P0 | Mostrar `Demo fees $0`, eliminar tasas decorativas de mockups |
| `changePp` | diferencia aritmética entre dos probabilidades | `49%` → `58%` significa `+9 pp`, no `+9%` |

### Precios según acción

Para el outcome `o` y lado `s ∈ YES/NO`, usar `o.yesQuote`/`o.noQuote`:
- Hero, market card y chart: `indicativeCents` (probabilidad implícita orientativa).
- `Buy`: **ask**; en Review y Receipt mostrar el precio simulado que efectivamente paga.
- `Sell`: **bid**; Preview muestra dinero estimado a recibir y advierte que depende del escenario y liquidez.
- Valor marcado de la cartera: `indicativeCents × qty`; diferenciarlo de `qty × bid` al vender. `Current value` estimado != `Sell proceeds`.
- En multiresultado, `Buy No on Barcelona` significa «Barcelona no ganará», NO «Real Madrid ganará». Un contrato Yes/No se vincula siempre al `outcomeId` y al `side`.
- El gráfico de `NO` es `100 - YES` por cada punto y no se dibuja usando otro mercado. En un multioutcome, la curva de cada YES corresponde a ese outcome y la suma de probabilidades de alternativas excluyentes del fixture =100.

### Ejemplos matemáticos de aceptación

**Ejemplo 1 — compra completa sin fees:** 125 Yes contratos a 40¢ costarán exactamente `$50`. Payout máximo `$125`; ganancia neta máxima `$75`; pérdida máxima `$50`. Si la persona introduce **presupuesto** `$51`, se compran `floor(5100/40)=127` contratos por `$50.80`; **no ocultar** los `$0.20` no gastados ni decir que se invirtieron `$51`.

**Ejemplo 2 — venta parcial:** posición con 125 contratos, base 40¢/contrato. Vender 50 a bid 62¢ produce `$31` de ingreso, base asignada `$20`, P&L realizado `+$11`, quedan 75 contratos y base `$30`. No mostrar `$31` como beneficio.

**Ejemplo 3 — seed inicial exacto:** aporte virtual `$1,000.00`; posiciones costaron `$123.60`; cash total `$876.40`; reserva de orden limit `$4.40`; cash disponible `$872.00`; valor marcado posiciones `$128.40`; cartera `$1,004.80`; P&L no realizado `+$4.80`; realizado `$0`. Reserva no reduce valor total.

### Invariantes y transacciones

- `Portfolio value = cash total (incluye efectivo reservado) + Σ posición marcada`. `Available cash = cash total - reserved`. Nunca descontar las reservas dos veces.
- Compras ejecutadas: cash total disminuye exactamente `qty*ask + fee`; posición quantity aumenta; cost basis aumenta en importe; nuevo average se deriva de `costBasis / qty`, conservar centavos de base exactos si media no es entero.
- Ventas: cash total aumenta en `qty*bid - fee`; position quantity disminuye; asignación del coste proporcional por precio de compra/lotes (definir estrategia de redondeo de centavos de forma determinista, sin perder céntimos); `realizedPnL += netProceeds - allocatedBasis`.
- Órdenes limit BUY: reservar `qty*limitPrice` de saldo disponible, sin restarlo otra vez de `cash total`; no crear posición hasta fill. Cancelar libera `reserved`, no crea pérdidas ni fees. Reservar de forma transaccional. Un preset con capacidad parcial solo en P1.
- Receipts, cash, historial y portfolio deben surgir del **mismo evento**; doble clic/reintento con `orderIntentId` no puede ejecutar dos veces.
- Si quote cambia entre Review y Confirm (preset determinista), presentar nueva revisión y requerir consentimiento al nuevo precio, no ejecutar al precio antiguo sin avisar.
- Las posiciones en mercados CLOSED/PENDING_RESOLUTION/RESOLVED/VOIDED no son negociables. Si un escenario de resolución se activa, actualizar posiciones y saldo una sola vez y cancelar órdenes pendientes. `winningOutcomeId` debe identificar una alternativa válida, la proposición YES/NO o contrato elegido según el mercado. No crear precio ejecutable en mercados sin trading.
- Noticias, probabilidades, activos visuales y copies del fixture jamás se sustituyen por fetch externo ni números hardcoded en componentes.

## 4. Flujos P0 en detalle

### Compra

`Detail → escoger outcome específico → YES/NO → introducir presupuesto virtual → Quote estimado + contratos enteros + presupuesto sin usar si aplica → Review → Confirm → Receipt → Portfolio`

- Antes de Review debe estar claro el significado del contrato; Review enseña proposición completa, cantidad, ask, coste final, fees, max payout, **beneficio neto (si acierta)**, **pérdida máxima (si falla)** y enlace a regla de resolución.
- `Confirm` es el único punto de mutación. Receipt informa del fill real y acceso a `View position`; navegación conserva el outcome seleccionado. Botón `Buy more` si procede.
- Un presupuesto inferior a ask, saldo insuficiente o quote ausente produce error específico, sin posición ni gasto.

### Venta

`Portfolio/Detail → Manage position → Sell all/part (contratos) → Estimate bid and net proceeds → Review sale → Confirm → Receipt/Portfolio`.

- La venta parte de posición existente, nunca de la probabilidad genérica de la card.
- Si el usuario vende 50% de contratos y es impar, redondear cantidad y mostrar resultado; no vender más de lo poseído. Mostrar importe que recibirá y P&L **realizado**, no payout máximo.
- La inversión original y el valor restante son visibles al expandir posición. La venta no significa que la persona «cambió de opinión».

### Pending / limit order

- Exponer orden **BUY LIMIT** desde el apartado avanzado cuando el mercado es OPEN. Precio límite y qty enteros; Review y Confirm; orden se crea `OPEN`, cash reservado, Portfolio → Pending la muestra y permite Cancel. No inventar fill automático; si se simula fill, debe ser una acción reproducible y sujeta a precio.
- Sell LIMIT, fills parciales, time-in-force complejo y libro de órdenes dinámico están fuera de P0, salvo que se implementen íntegramente tras aprobar QA.

### Portfolio

- El usuario ve propuestas en lenguaje natural, no 4 filas de activos sin contexto. Resumen arriba, tabs Active/Pending/History/Saved. Seleccionar card presenta panel contextual; Manage abre mismo flujo Sell/Buy de Detail.
- Favoritos se guardan por marketId; no crean posiciones. Historial muestra compras, ventas, cancelaciones y liquidaciones si presentes. Predicción resuelta debe mostrar estado final e historial, no quedarse eternamente en Active.
- Portfolio vacío (`Start fresh`) muestra contenido guía útil con CTA real hacia Explore, sin métricas de trading falsas.

### Search / Bell / Profile

- `Cmd/Ctrl+K` abre Search; resultados recientes con preguntas y contexto; Enter abre Detail; `See all results` lleva a Explore con `q`. Escape cierra, foco retorna al disparador. No filtrar en `Portfolio` como si fuera mercado; search es global.
- Bell abre popover, separa `Unread`, marca leído y navega al destino exacto, sin recrear alertas por reload. Nunca superponer Bell encima de Search (cerrar overlay anterior).
- Perfil `Demo Explorer`: `Add demo funds` (no profit); `Settings` (reduced motion, notificaciones básicas si útiles); `Restore showcase` y `Start fresh` (requieren confirmar si hay transacciones); `About this demo`.

## 5. Estados y escenarios

- Market: OPEN, UPCOMING, SUSPENDED, CLOSED, PENDING_RESOLUTION, RESOLVED, VOIDED. Un estado `LIVE` visual puede acompañar a OPEN, pero no sustituye a su disponibilidad.
- Buy/Sell: `idle → configuring → reviewing → confirming → receipt / error`. Back desde Review no borra amount ni outcome.
- Limit: `draft → open → cancelled | filled` (partial solo P1).
- Search: closed/open-empty/open-results/open-no-results; keyboard ready.
- Saved: empty/populated; toggle idempotente.
- Portfolio: seeded/showcase/fresh; position gains and losses; pending; history; notifications unread/read.
- Mobile: navbar condensada con búsqueda a un gesto, ticket en bottom sheet/Drawer, tabs horizontales con scroll accesible y botones visibles en pantallas pequeñas.

## 6. Visual: mantener dirección sin reproducir bugs

Referencias exactas en `docs/DESIGN_REFERENCES.md`. Diseño desktop de gran impacto (capas oscuras, hero editorial, ritmo modular, colores de estado no exclusivos). En Portfolio **no** imponer pantalla de gráficos bursátiles; los porcentajes individuales son rentabilidad de posición, las flechas `pp` son movimientos de probabilidad. En Home/Explore, priorizar contenido y preguntas, no un gran número de tarjetas. Composición elegida ≠ copiar textos fake del mockup. Crear assets de forma legal (gradientes/CSS, arte propio o licenciado). Documentar cualquier licencia de imágenes/terceros.

## 7. Elecciones técnicas, portabilidad y despliegue

- React/TS/Vite + React Router + Tailwind/shadcn/ui + Zustand + Recharts + Zod + Vitest/RTL/Playwright. Paquete npm y lockfile; sin dependencia obligatoria de 21st.dev ni Replit. shadcn/ui aporta primitives adaptables; 21st.dev es fuente opcional de componentes **revisados**.
- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`. Toda función y botón P0 con test o inspección explícita.
- Enlaces de ruta `/markets/:id` sobreviven reload en deploy con SPA rewrite a `index.html`; rutas inválidas/markets missing muestran 404 útil.
- No utilizar cookies de identidad ni guardar datos personales. Los escenarios no necesitan backend ni API keys.

## 8. Orden de implementación y gate de salida

**Fase A:** repo y fixture validation. **Fase B:** dominio con test vectors: comprar Yes/No, valor marcado, reservar/cancelar LIMIT, vender 25/100%, baseline seed, top-up y reset, idempotencia y error de cambio de precio. **Fase C:** shell, Home/Explore/Search/Saved, routing. **Fase D:** Detail/Trade/Review/Confirm/Receipt/Rules/Chart. **Fase E:** Portfolio/notifications/account & seed. **Fase F:** visual QA screenshots, mobile, a11y, performance, build y README.

No se da por terminado con una captura bonita: los comandos de QA deben pasar, los flows deben probarse y el README debe explicar cómo navegar con saldo precargado, reiniciar, añadir fondos y probar orden pendiente. Si un P0 no se completa, declararlo explícitamente y no simularlo con un botón falso.
