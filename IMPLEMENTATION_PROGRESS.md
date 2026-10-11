# IMPLEMENTATION_PROGRESS — NOVA P0

Estado a 11/10/2026. Rama de trabajo: `feat/p0-demo-app`.

## Checklist por fases

- [x] **Fase 0** — Lectura del paquete, validador del fixture (PASS), análisis de las 7 referencias, versiones fijadas con lockfile.
- [x] **Fase 1** — Vite 7 + React 19 + TS 5.9 + Tailwind 4 + primitivas Radix estilo shadcn + React Router 7 + Zustand; scripts lint/typecheck/build/test/test:e2e; rewrites SPA (`vercel.json`, `public/_redirects`); 404.
- [x] **Fase 2** — Motor de dominio puro en céntimos enteros (compra por presupuesto, venta parcial/total con asignación de coste determinista, limit buy + cancel con reserva, liquidación única, fondos demo, re-cotización, idempotencia por `intentId`). Zod para fixture y sesión. Tests FIN-01..22.
- [x] **Fase 3** — Home, Explore (agrupado / lista filtrada, filtros en URL, panel colapsado), Search ⌘K, Saved sincronizado.
- [x] **Fase 4** — Market Detail (outcomes, gráfico, Overview/News/Market data/Rules), ticket prediction-first, Review → Confirm → Receipt, venta, orden límite, bottom sheet móvil.
- [x] **Fase 5** — Portfolio (resumen reconciliado, Active/Pending/History/Saved, panel de posición), notificaciones deterministas, menú de cuenta, Add demo funds, Reset (showcase/fresh), Settings (reduce motion + escenarios demo).
- [x] **Fase 6** — 45 tests Vitest, 26 E2E Playwright (desktop + 390px), capturas en `docs/qa/`, README.
- [x] **QA ronda 2** — rastreo de todas las rutas y mercados a 1440/768/390px + axe WCAG 2.1 AA en páginas y overlays; casos límite. Ahora 40 E2E.

- [x] **Mejoras de producto** — notas ancladas al gráfico (“What moved it”), explicador probabilidad vs precio, momento de liquidación (pantalla de resultado, resumen en Active, filtros de History con Won/Lost), ejecución explícita de órdenes límite (botón en Pending + escenario repetible).
- [x] **Capa de motion** — `src/components/motion/` (AnimatedNumber, BlurReveal, Spotlight, BorderBeam, AnimatedCheck, indicadores con `layoutId`), respetando reduced motion. Revisados React Bits y Magic UI/21st.dev: reimplementados en ligero; descartados fondos WebGL y confeti (ver README).
- [x] **Microinteracciones** — pills deslizantes, gráfico que se dibuja, barras que crecen, cifras que ruedan y destellan, Save con pop, campana que suena con aviso nuevo, elevación en hover, entrada escalonada, parallax y cielo vivo en el hero. Detectado y corregido: el brillo del CTA (overflow hidden) podía colapsar botones a 0px en paneles con scroll.
- [x] **CI** (GitHub Actions) y `netlify.toml` preparado (sin desplegar). `vercel.json` eliminado: hosting elegido = Netlify.

## Pendiente fuera de alcance actual (decidido en la conversación de seguimiento)

- Imágenes definitivas y branding: trabajo aparte, cuando el producto esté cerrado.
- Deploy en Netlify: más adelante.

## QA ronda 2 — hallazgos corregidos

| Hallazgo | Corrección |
|---|---|
| Navbar desbordaba 143px en tablet (768px) | Buscador como icono por debajo de `lg` |
| Resumen de Portfolio desbordaba en tablet | Rejilla 2 columnas en `md`, 3 en `xl` |
| Contraste insuficiente: botones azules (3.7:1), verdes/rojos con texto blanco, texto “subtle” (4.1:1) | Token `--color-cta` #2563eb (5.2:1), `--color-danger` #e11d48, verde con texto oscuro, subtle #7d89a3 |
| Recharts dejaba un elemento enfocable dentro de `aria-hidden` | `accessibilityLayer={false}`; el resumen accesible va en `figcaption` |
| Tabla de cotizaciones: overflow móvil (el `sr-only` escapaba del scroll) y región no enfocable | `relative` en el contenedor y en `PpDelta`; región con `tabIndex` y etiqueta |
| Doble clic en Confirm: el 2.º clic cerraba el recibo (sin duplicar la operación) | Recibo protegido 500 ms frente a clics de rebote |
| Preguntas cortadas a 2 líneas en filas móviles de Explore | Sin miniatura en móvil, hasta 3 líneas |
| Cohete del hero detrás del titular en tablet | Solo visible en desktop |
| Contraste “per contract” sobre opción seleccionada | `text-muted` |

## Decisiones tomadas por precedencia (sin preguntar)

| Tema | Decisión | Motivo |
|---|---|---|
| Persona real en el fixture | `harris-election-2028` → `marlowe-election-2028`, candidata ficticia Elena Marlowe | Pedido por la usuaria: todo ficticio. Cifras financieras intactas (validador PASS). |
| Noticias | `demoUpdates` reescritos (48 notas `NOVA DEMO`, `isSimulated`) | Las originales eran texto de relleno; las cifras mencionadas cuadran con `chartPoints`. |
| Imágenes | Arte SVG generado por código por categoría | Sin créditos de Higgsfield por ahora (pedido de la usuaria); sin fotos/logos/personas. |
| Escenarios | Panel *Settings › Demo scenarios* + escenario extra de liquidación (Champions → Real Madrid) | El fixture definía escenarios sin disparador y ninguno liquidaba una posición en cartera. |
| Orden límite | Precio límite debe ser < ask actual | Un límite ≥ ask sería una compra inmediata; P0 no simula fills. |
| Validación de compra | Saldo insuficiente se comunica antes que el límite de liquidez | Es el mensaje accionable cuando se exceden ambos. |
| *Upcoming key events* | Sustituido por *Closing soon* | "Set reminder" habría sido un CTA falso. |
| Fechas | Formateadas en UTC y relativas al reloj demo | Todos los visitantes ven el mismo snapshot. |
| vitest | Fijado a 4.0.18 | npm 10 falla (`Cannot read properties of null (reading 'edgesOut')`) al instalar vitest 4.1.x; npm 11 sí funciona. Aviso de `npm audit` solo afecta al runner de tests en desarrollo. |

## Pendiente real / P1

- Imágenes finales con licencia (o generadas) para hero, categorías y mercados.
- Auditoría axe automatizada y pase manual con lector de pantalla; pruebas en Safari/Firefox y dispositivos reales.
- P1 del blueprint: order book simulado, fills parciales, sell limit, notas anotadas en el gráfico, filtros avanzados.
- Branding definitivo (NOVA es provisional).
