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
