# CLAUDE.md — NOVA Prediction Market 2.0 / Interactive Portfolio Demo

## Misión y prioridad

Construye una web app funcional, cuidada y coherente que demuestre un rediseño senior/lead de los prediction markets. El brief y el producto aprobados se encuentran en `docs/MASTER_BLUEPRINT_v1.7.md`; la especificación ejecutiva en `docs/IMPLEMENTATION_CONTRACT.md` y el plan de pruebas en `docs/QA_AND_SCENARIOS.md`.

**Orden de prioridad si existe conflicto:**
1. Seguridad de demo: todo ficticio, ninguna transferencia/operación real.
2. Correctitud de los cálculos/estados y continuidad semántica de la predicción.
3. Accesibilidad, jerarquía clara, UX con profundidad progresiva.
4. Referencias visuales aprobadas, fidelidad al nivel de calidad editorial premium.
5. Enriquecimientos ornamentales y P1.

## Prohibiciones (hard constraints)

- **NO** backend, base de datos, login, alta de cuenta, KYC, pagos, conexión a wallets reales, API financiera, trading real, push/email externo ni scraping de prensa real.
- **NO** simules autenticación: cuenta `Demo Explorer` abierta desde el primer frame. Todas las operaciones usan **dólares virtuales**; marca persistente `Interactive demo · Simulated markets` y `Demo snapshot · 10 Oct 2026`.
- **NO** copies importes, fechas, nombres de mercados, porcentajes, fuentes periodísticas o términos de las imágenes generadas como datos correctos. Las capturas son guía visual exclusivamente.
- **NO** muestres gráficos de rendimiento o contadores que no deriven de la única fuente de estado. **NO** inventes noticias atribuidas a medios reales.
- **NO** dobles pantallas de trading ni un modo Pro independiente. **NO** hagas que `Buy`, `Sell`, `Deposit`, `Manage`, `Search`, `Save`, `More filters` o cualquier CTA aparentemente funcional no haga nada.
- **NO** conviertas variación de una probabilidad `48% → 52%` en `+4%`: son **+4 pp**. P&L porcentual sí usa `+4%` si ese es el rendimiento relativo sobre el coste.
- **NO** ejecutes jamás una operación al primer clic en un CTA de trade: requiere `Review` y `Confirm` explícitos.
- **NO** cambies el comportamiento básico de la demo para acomodar P1; P1 solo tras pasar todos los tests P0.

## Producto / rutas

- `/` → Home: hero inmersivo, categorías, Trending, Biggest movers, Insights editorial dentro de Home, Key events solo si son funcionales. Sin saturación ni mini-charts por fila en Trending/Movers.
- `/explore` → catálogo general, categorías ilustradas y agrupación inicial por tema, botón `Filters` **colapsado por defecto**; al buscar/filtrar, lista única ordenada. Filtros se reflejan en URL.
- `/markets/:id` → Market Detail: pregunta y reglas claras, outcomes/Yes-No, gráfico protagonista, ticket sencillo visible; tabs Overview, News, Market data, Rules. Market data es profundidad bajo demanda.
- `/portfolio` → Your Predictions: tarjetas/filas en lenguaje natural, resumen reconciliado, tabs Active, Pending, History, Saved, detalle contextual de posición. **Usar la primera captura de Portfolio**, NO la alternativa con mega gráfico de performance/distribución de assets.
- Modales/popovers globales: Search (`Cmd/Ctrl+K` y clic), Bell, Account (`Demo Explorer`), Review/Receipt, Settings, Add demo funds, Reset. La imagen de Search+Bell juntos es una composición ilustrativa: **no abrir ambos overlays simultáneamente en el producto**.
- Navegación top: **Home · Explore · Portfolio**. `Insights` NO es ruta independiente. No incluir enlaces vacíos.

## Dirección visual aprobada

> **Actualización (identity v3, aprobada por el usuario):** la identidad es **Likely**, con la premisa "si Apple hiciera un prediction market": neutros calmados, SF/Inter, un único acento azul (Sí/acción) y naranja para el No, probabilidad en 100 puntos que se ilumina según el lado elegido, y modo claro por defecto con tema oscuro e híbrido. Ver `docs/IDENTITY.md`. Las capturas de referencia valen como guía de **estructura**, no de estética.

- Ref. Home: `references/a_sleek_dark_futuristic_web_app_dashboard_ui_des.png` — hero se funde con navbar; alto impacto editorial.
- Ref. Explore B: `references/a_clean_modern_dark_themed_ui_ux_screenshot_of_a.png`.
- Ref. Explore B mejorada, filtros colapsados (**default**): `references/a_sleek_dark_futuristic_ui_dashboard_website_moc.png`.
- Ref. Market Detail **SEGUNDA opción simplificada**: `references/a_dark_sleek_modern_ui_dashboard_in_a_neon_glow.png`.
- Ref. Trading **prediction-first** aprobada: `references/a_wide_clean_dark_blue_themed_ui_mockup_tutorial.png`.
- Ref. Portfolio **PRIMERA opción** aprobada: `references/a_clean_modern_dark_themed_web_app_dashboard_scre.png`.
- Ref. Global Search/Notifications: `references/wide_desktop_ui_screenshot_of_a_dark_themed_tradin.png`.
- Capturas = **referencias de composición**, no assets para incrustar como capturas planas o fondos ilegibles, ni referencias de dato real.
- Estilo oscuro editorial/cinemático, buena tipografía, detalles refinados, contraste, microanimaciones sobrias y motion reducido. Evitar claustrofobia visual y widgets de trader en primera vista.

## Stack y reglas de implementación

React + TypeScript + Vite, Tailwind, shadcn/ui, React Router, Zustand, Recharts (charts), Motion opcional, Lucide, Zod, Vitest + React Testing Library, Playwright. **21st.dev es inspiración/catálogo de componentes opcional**, no dependencia crítica ni hosting; inspeccionar código, permisos/licencias y dependencias antes de reutilizar. No SSR ni API.

- Usar **centavos enteros** para dinero y precios; **contratos enteros**; payout de contrato ganador `100¢` y perdedor `0¢`; fee **demo = 0¢**.
- El JSON `data/demo-fixtures.v1.7.json` es fuente del mercado y del escenario inicial. Valida su forma (Zod en runtime, prueba de esquema en tests). Validación preliminar: `python3 scripts/validate-fixtures.py`.
- `sessionStorage` versionado para estado de usuario (cash, posiciones, órdenes, historial, guardados, notificaciones y preferencias), por pestaña y sobreviviendo a recarga; nunca `localStorage` para operaciones.
- Reloj demo congelado `2026-10-10T12:00:00+02:00`. Sin auto-tick, API live ni notificaciones no deterministas. Replays deterministas bajo controles explícitos si se implementan.
- Para operaciones, calcular **ask** de compra, **bid** de venta, **probabilidad indicativa** para visualización, y **mark** para valor estimado. Nunca confundir.
- En P0 una orden inmediata se completa íntegramente a quote del snapshot o se rechaza claramente; orden limitada queda en `OPEN` hasta cancelación o evento de escenario explícito; no fills aleatorios. Liquidez P0 declarada en `demoLiquidity`.
- Persistir eventos/ledger y derivar balances, P&L e historial sin dobles cargos. Confirm es transacción atómica e idempotente; cotización revisada de nuevo antes de ejecutar.
- Incluir acciones `Restore showcase` / `Start fresh`, ambas con confirmación si hay cambios. `Add demo funds` es virtual y **no** cuenta como ganancia.
- Responsive completo para tareas P0; modales con foco accesible, teclado/escape/tab, lector de pantalla y `prefers-reduced-motion`.

## Lenguaje que diferencia el producto

Toda la experiencia conserva la **proposición elegida**. Ejemplo:

- `I believe Elena Marlowe will win the 2028 US presidential election.` (Elena Marlowe es una candidata ficticia; sustituye al ejemplo histórico con Kamala Harris del blueprint.)
- `You're investing $50 in this prediction.`
- `If you're right, you'll receive $125 total (profit $75); if not, you could lose $50.`
- `Trade details: 125 Yes contracts × 40¢ · Demo fees $0` en segundo plano.

**No** convertir `No` de un candidato multi-resultado en `Sí` de su principal rival. Utiliza generadores semánticos tipados por mercado/outcome/side; no IA textual improvisada. En Portfolio mantener el contrato en lenguaje natural y el dato financiero explicado.

## Estado de trabajo y salida exigida

Lee antes de construir: `PROMPT_MAESTRO_PARA_CLAUDE_CODE.md`, `docs/IMPLEMENTATION_CONTRACT.md`, `docs/QA_AND_SCENARIOS.md`, `docs/DESIGN_REFERENCES.md`, `docs/MASTER_BLUEPRINT_v1.7.md` y dataset.

Trabaja por fases con checkpoints verificables:
1. Validación de fixtures, scaffold/stack, rutas, tokens y herramientas QA.
2. Motor de dominio con tests matemáticos antes de conectar el trading UI.
3. Home + Explore + Global search + saved.
4. Market Detail + Trading/Review/Confirm/Receipt.
5. Portfolio + limit orders/cancel + notificaciones y demo controls.
6. QA desktop/mobile y comparación con capturas elegidas.

Por cada fase: implementar → correr typecheck/lint/tests → corregir → commit o guardar checkpoint. Final: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e`, comprobación de teclado y capturas. Documentar cualquier test no ejecutado. No reclamar resultados no verificados. Si una biblioteca impide la ejecución, sustituirla por la alternativa compatible con la arquitectura, documentando el motivo. Si se requiere decidir entre estética y funcionamiento, conservar funcionamiento y luego pulir estética.

**Entrega final:** app ejecutable, README con setup/escenarios/reset/limitaciones, instrucciones Replit y deploy SPA, lista de funcionalidades completadas frente a P0, estado real de los tests, screenshots de QA si el entorno permite y decisiones que cambiaron motivadamente.
