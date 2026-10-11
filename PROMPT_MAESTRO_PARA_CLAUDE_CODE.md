# PROMPT MAESTRO — COPIAR Y PEGAR EN CLAUDE CODE

> Instrucción para Claude Code: este archivo forma parte del paquete inicial del proyecto. Si estás trabajando en un directorio vacío, extrae primero todo el ZIP en el directorio y luego ejecuta este prompt. No te limites a resumir el plan: se espera que implementes la aplicación.

Actúa como un equipo autónomo de **Lead Product Designer, Senior Frontend Engineer, UX Writer y QA Engineer**. Vas a construir una demostración web interactiva de **Prediction Market 2.0**, destinada a un portfolio de Product Design senior/lead. Se trata de una aplicación conceptual **sin dinero real y sin infraestructura financiera**. La meta es construir una experiencia de alto impacto visual, muy intuitiva por defecto, con funcionalidades avanzadas disponibles bajo demanda y flujos que FUNCIONEN de verdad dentro de la simulación.

## 0. Lee y utiliza el material del directorio ANTES de escribir código

- `CLAUDE.md` — reglas obligatorias del proyecto, de diseño, técnica y UX.
- `docs/MASTER_BLUEPRINT_v1.7.md` — proceso de investigación, decisiones de producto, hallazgos y referencias; el historial contiene hipótesis antiguas que pueden haber sido reemplazadas. Respetar precedencia más reciente.
- `docs/IMPLEMENTATION_CONTRACT.md` — contrato canónico y matemáticas.
- `docs/QA_AND_SCENARIOS.md` — escenarios, expectativas y pruebas.
- `docs/DESIGN_REFERENCES.md` — las SIETE capturas visuales elegidas. Ábrelas y estúdialas; no adivines su aspecto por el nombre del archivo.
- `data/demo-fixtures.v1.7.json` — fuente del escenario ficticio, incluyendo mercados, probabilidades, reglas, quotes y estado de la cartera.
- `scripts/validate-fixtures.py` — validador independiente. Ejecutar antes de desarrollar.

### Precedencia entre documentos

Si el blueprint de investigación contiene una idea inicial incompatible con acuerdos posteriores o con el contrato de implementación, prevalece `CLAUDE.md` + `IMPLEMENTATION_CONTRACT.md` + este prompt y el capítulo 04B del blueprint. Si una referencia visual muestra precio, número, fecha o contenido distinto del fixture, **el fixture gana siempre en datos**, la imagen solo orienta la estética. Si las imágenes se contradicen visualmente, `DESIGN_REFERENCES.md` indica exactamente cuál ha sido aprobada.

## 1. Qué producto construir

Un prediction market generalista como evolución conceptual de Polymarket/Kalshi, tomando claridad de FanDuel/DraftKings, pero rediseñado con un lenguaje visual premium y un modelo mental basado en **predicciones en lenguaje natural**. No es una aplicación deportiva, no es un casino, ni una terminal Bloomberg. La complejidad existe cuando el usuario la solicita; nunca se presenta toda de golpe.

La persona entra con **cuenta Demo Explorer ya abierta**, sin registro ni login. Puede recorrer todos los mercados, buscar y filtrar, guardar favoritos, elegir YES/NO, invertir dólares virtuales, revisar y confirmar, consultar su cartera, vender parcial o totalmente, crear/cancelar una orden límite pendiente, recibir avisos simulados, recargar y conservar el estado dentro de la pestaña, restaurar el escenario original o empezar con una cartera vacía. Todo esto debe ser funcional, no una secuencia de screenshots.

El branding `NOVA` es provisional. No lo conviertas en un bloqueo. Contenido/UI en inglés, investigación/documentación en español o inglés claro. **Nunca** representes un mercado o un titular demo como noticia o cotización real.

## 2. Stack decidido; elige versiones compatibles según documentación actual

- React + TypeScript + Vite, SPA estática.
- React Router (rutas `/`, `/explore`, `/markets/:id`, `/portfolio`).
- Tailwind CSS + shadcn/ui + variables CSS/tokens; personalización considerable para lograr calidad premium, sin depender de un template genérico.
- Zustand para estado compartido y persistencia por `sessionStorage` versionado.
- Recharts para chart e intervalos; Motion y Lucide si ayudan.
- Zod para validar fixtures/estado persistido y errores de recuperación.
- Vitest/React Testing Library y Playwright para QA. ESLint y typecheck.
- 21st.dev opcional como **catálogo** de componentes, con revisión de dependencias/licencias; no instalar nada que requiera credenciales de terceros para funcionar ni acoplar el runtime a ese servicio.
- Portable por GitHub e importable en Replit; deploy estático en Vercel/Netlify con rewrites SPA y rutas profundas.

**No** backend, Supabase, Firebase, Prisma, cuentas reales, API key, newsletter, pagos, Stripe, KYC, brokers, WebSocket o datos de mercados en directo. No Next.js salvo impedimento técnico real documentado: está definido Vite por simplicidad.

## 3. Implementa estas páginas y sistemas

**Home:** alta calidad visual con hero panorámico inmersivo hasta top bar; categorías ilustradas, Trending y Biggest Movers compactos (sin micrográficas por fila), módulos editoriales pertinentes y enlaces funcionales a cada mercado/Explore. Referencia exacta indicada en `DESIGN_REFERENCES.md`.

**Explore:** prioridad a la **opción B elegida**: hero, categorías ilustradas, resultados agrupados. Botón Filters cerrado por defecto. Al filtrar, buscar u ordenar, usar lista unificada, adecuada para tareas de comparación, con conservación de filtros en URL. Market cards claras, probabilidades indicativas, bookmarks que realmente se sincronizan.

**Market Detail:** segunda variante visual simplificada elegida. Mostrar pregunta específica, outcomes, probabilidad correcta, gráfico interactivo y contextualizado, `Why this resolves YES/NO` o resumen de reglas, trade slip simple, y pestañas `Overview / News / Market data / Rules`. Lo avanzado nunca reemplaza ni oculta el ticket. No mezclar candidaturas de ejemplos visuales con markets del dataset.

**Trading:** `Choose → Review → Confirm → Receipt`. Posibilidad de Buy YES/NO, importe en dólares demo, contratos enteros calculados desde precio ASK de la proposición elegida, payout si acierta, beneficio neto y pérdida máxima. Review muestra texto completo en lenguaje natural, y detalle técnico secundario. Vender parcial/total con precio BID y P&L realizado, su propia Review. `Limit buy` bajo opciones avanzadas: reservar saldo, mostrar OPEN y Cancel real. No ordens ficticias ni comisión inventada. Ningún CTA realiza trade sin revisión.

**Portfolio / Your Predictions:** la PRIMERA captura de Portfolio fue elegida. Resumen valor de cartera + saldo disponible + P&L; Active, Pending, History, Saved. Predicciones, no tickers, en las filas. Panel contextual con posición seleccionada y `Sell / Buy more`. Sin gran gráfica financiera, allocation extra o KPI-wall. Las cifras deben reconciliar a centavo con store. Saved no equivale a trade.

**Global UI:** top navigation **Home · Explore · Portfolio**; buscador command dialog (`Cmd/Ctrl+K`) y Bell popover independientes con resultados reales del mismo catálogo, notificaciones por eventos deterministas, avatar demo con Add funds, Reset, Settings, About. Insights editorial vive en Home/Detail; no cuarta página. Reemplazar Deposit por `Demo funds`.

## 4. Matrices de cálculo y coherencia: implementación obligatoria

- Dinero y cotizaciones siempre en centavos enteros; qty contratos enteros, payout correcto de $1 al acertar.
- La probabilidad indicativa (MARK) **no es** precio ASK al comprar ni precio BID al vender.
- `Buy`: coste `qty*ask`; si entrada como presupuesto, `qty = floor(budget/ask)` y se explica el resto no utilizado. `No` usa `noQuote`; no es automáticamente «gana otro candidato».
- `Sell`: ingreso `qty*bid`, realized P&L ingreso menos coste asignado; ventas parciales de forma determinista.
- `Portfolio = cash total + positions marked`; saldo disponible = cash total - reservas de órdenes limit; depósitos virtuales NO son ganancias.
- Venta anticipada es distinta al payout si gana el mercado. Antes de Confirm, Review tiene coste/ingreso y resultado económico sin ambigüedad.
- `sessionStorage` retiene la sesión al recargar; tiene Reset y opciones Showcase/Fresh; reloj demo fijo y sin cotizaciones aleatorias.
- Mercado no OPEN no negocia; recotización entre Review y Confirm exige nueva revisión; confirmar dos veces no duplica la transacción.
- Los montos visibles del mockup anterior SON INCORRECTOS: usa el dataset + funciones TS puras + tests, nunca JSX hardcoded.
- Historial/avisos coherentes: derivan de operaciones y escenarios, no de números independientes.

## 5. Orden obligatorio de trabajo; no termines después de hacer scaffolding

**Fase 0 — analizar y preparar**
Lee archivos, ejecuta validación de fixture, analiza las 7 imágenes y crea un plan corto `IMPLEMENTATION_PROGRESS.md` con estado/checklist. Si detectas contradicción, resuélvela por precedencia y anota el criterio sin preguntar por microdetalles. Fija versiones npm compatibles y lockfile.

**Fase 1 — base de aplicación**
Scaffold Vite/React/TS + Tailwind + shadcn + router + Zustand + styles tokens, 404, scripts lint/typecheck/build/test/test:e2e. Preparar SPA rewrites para deploy. Montar estructura modular.

**Fase 2 — motor financiero antes del diseño avanzado**
Crear domain puro con modelado de markets/outcomes/positions/orders/fills, quote, buy, sell, limit buy+cancel, wallet, mark, P&L, eventos, restricciones, deduplicación de confirmaciones, reset. Validar fixtures con Zod. Tests unitarios del contrato y vectores de `docs/QA_AND_SCENARIOS.md`. **No avanzar a un ticket bonito si los números no cuadran.**

**Fase 3 — navegación y descubrimiento**
Home + Explore (grupos vs filtrado) + Search overlay + bookmarks + routing, todos usando catálogo compartido. Comparación visual con referencias, adaptando desktop y mobile.

**Fase 4 — detalle y trading**
Gráfico derivado del fixture, vistas Overview/News/Market data/Rules, multi outcome Yes/No, ticket integrado, Review, Confirm, Receipt, venta y límite. Asegura continuidad semántica del contrato seleccionado.

**Fase 5 — Portfolio, alertas y demo**
Active/Pending/History/Saved, view/manage, ventas parcial y total, estado persistido por sesión, reinicio, saldo virtual y notificaciones. Comprobar los estados de los escenarios y mercado resuelto.

**Fase 6 — QA/iteración de diseño real**
Ejecuta tests y visualiza páginas en navegador real si el entorno lo permite. Haz screenshots desktop y mobile y **compara visualmente** con la referencia correcta. Mejora jerarquía, contraste, legibilidad, densidad, imágenes, microcopy, foco, resize y motion. Repite ciclo `inspeccionar → corregir → testear` sin sacrificar rutas ni exactitud. No pares simplemente porque el build compile. Resolver errores reales de runtime, no ocultarlos.

## 6. Definition of Done vinculante

La app está lista solo cuando:

1. `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` funcionan; Playwright e2e pasan **si el entorno dispone de navegador**, indicando los no ejecutados.
2. Home/Explore/Detail/Portfolio y overlays globales navegan en desktop y mobile con enlaces directos.
3. `Buy YES → Review → Confirm → Portfolio → Sell partial → Review → Confirm → Portfolio` reconcilia cartera al centavo y mantiene el texto de la predicción.
4. `Buy NO` multiresultado muestra exactamente la proposición negada, no una conclusión sobre otro candidato.
5. Un `Limit buy` queda pendiente, bloquea saldo disponible y puede cancelarse (relibera reserva); sin fill inventado.
6. Toggle Saved y Search/Bell interactúan con estado compartido.
7. Recargar la misma pestaña conserva operaciones; `Start fresh` y `Restore showcase` funcionan; `Add demo funds` no incrementa P&L.
8. Ningún dato aparece como real ni hay CTA vacío. Las fechas son relativas al reloj demo, no a fecha actual del visitante.
9. Es visualmente convincente y cercano en jerarquía a las 7 referencias elegidas, evitando saturación.
10. `README.md` final documenta ejecutar, deploy, Replit import, funcionalidades, testing realizado, escenas reproducibles, limitaciones y referencias; sin claims de validación con usuarios ni dinero real.

## 7. Modo de trabajo: autonomía con rigor

No me preguntes decisiones menores de implementación que el paquete ya permite resolver; elige de forma profesional y documéntalo. Puedes reestructurar código y enriquecer contenido de simulación si mantienes invariantes, legibilidad y aprobación visual. Si alguna dependencia falla, cambia de estrategia sin bloquear la entrega. **No afirmes que has hecho tests o QA visual que no has ejecutado.** Si no llegas a P1, entrégame un P0 pulido y funcionando, no P1 ficticio. Haz un resumen final en español con rutas, QA, diferencias justificadas y pendientes reales.

**Empieza ahora por inspeccionar los archivos, verificar la validación de fixtures y planificar la implementación; continúa automáticamente hasta obtener la app funcional.**
