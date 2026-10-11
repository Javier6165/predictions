# Auditoría de readiness — 10 octubre 2026 — v1.7

## Veredicto

**GO para entregar a Claude Code.** El paquete es suficiente para construir un P0 coherente sin hacer nuevas preguntas sobre alcance, rutas, tecnología, mecánica financiera, persistencia o referencias de diseño. **NO** significa que la app esté implementada: este paquete es especificación + fixtures + validator; Claude Code tendrá que escribir el código y ejecutar QA.

## Qué revisé y qué corregí frente al v1.6

| Área | Hallazgo en v1.6 | Acción v1.7 | Estado |
|---|---|---|---|
| Dirección visual | Estaban dispersas en blueprint y ZIP; varias versiones exploratorias no elegidas podían confundirse | Manifest de **7 referencias aprobadas** con nombres exactos y decisiones precedentes | **Cerrado** |
| Resolución de mercados | Muchas descripciones tipo «resuelve según fuente» eran vagas | Reglas explícitas de Sí/No, fuentes **ficticias**, cutoff, void policy por 24 mercados | **Cerrado como ficción demo** |
| Gráficos | `pricePathKey` existía, pero no series; el agente debía inventarlas | `chartPoints` deterministas de 13 puntos por mercado, finales alineados con la probabilidad del fixture | **Cerrado** |
| Compra/venta | Quotes estaban definidos; faltaba una regla clara de liquidez P0 | Capacidad demo por mercado/outcome en `demoLiquidity`, full fill or reject, nada de fills aleatorios | **Cerrado** |
| Variabilidad de demo | `scenarioPresets` era una lista de nombres sin comportamiento operativo | `scenarioDefinitions` declara escenario, tipo, cambios y evento explícito | **Cerrado** |
| Periodos y mockups | Capturas con datos históricos obsoletos o incompatibles | Todos los mercados se anclan a snapshot 10/10/2026 y los mockups solo sirven como imagen | **Cerrado** |
| Conciliación | Valores seed correctos, pero no había una comprobación independiente en el paquete para el agente | Validador stdlib `scripts/validate-fixtures.py` y casos FIN-01..FIN-22 | **Validación del seed PASADA** |
| React/UI | Stack definido pero fácil desviarse hacia Next, backend o boilerplate | `CLAUDE.md` con constraints, fases, calidad e integración shadcn/21st/Vite | **Cerrado** |
| Prompt | Blueprint largo sin una instrucción única de ejecución | `PROMPT_MAESTRO_PARA_CLAUDE_CODE.md` listo para pegar en Claude Code | **Cerrado** |
| QA | Auditoría previa contiene recorridos, pero faltaba plan accionable compacto | `docs/QA_AND_SCENARIOS.md` con 22 tests unitarios y 27 recorridos E2E y go/no-go | **Definido, NO ejecutado sobre app** |

## Datos conciliados efectivamente validados

- 24 mercados en 8 categorías; 4 posiciones iniciales y 1 orden pendiente.
- `Deposited 100000¢` / `cashTotal 87640¢` / `reserved 440¢` / `available 87200¢` / `positions marked 12840¢` / `portfolio 100480¢` / `unrealizedPnL 480¢`.
- Dado un outcome, las cotizaciones ASK/BID/INDICATIVE y sus complementos YES/NO son compatibles; último punto de curva coincide con probability; multi-outcome suma 100 cuando el fixture es mutuamente excluyente.
- El validador pasó en el entorno de preparación el 10/10/2026. Esto **no demuestra** que Claude Code haya implementado el simulador todavía.

## ¿Hace falta añadir algo antes de construir?

**No hay bloqueadores P0.** Aspectos opcionales que se pueden decidir más adelante sin comprometer arquitectura:

1. **Naming/branding final** (NOVA provisional): tipografía, logo, refinamientos de tokens, copy editorial. No impedir implementación.
2. **Producción legal de imágenes finales** (mockups actuales contienen retratos y marcas): reemplazarlas por recursos propios o con licencia, evitar usar capturas de UI como fondos de la app. Importante para la publicación final, pero el agente puede comenzar con CSS/abstract art o assets permitidos.
3. **Hosting exacto** (Vercel/Netlify/otro) y dominio: no afecta el código si se construye como SPA portable. Replit puede servir de entorno importado por GitHub, no se necesita para compilar.
4. **P1 avanzado** (libro de órdenes, fills parciales, módulos IA, gráficos de análisis): solo después del MVP correcto; no bloquear MVP.

## Riesgos durante implementación (controlados por reglas, no eliminados mágicamente)

- AI agent puede introducir cálculos con floats/hardcodes si no sigue `CLAUDE.md`; tests FIN revisan.
- Imagen espectacular pero poco fiel al flujo aprobado; QA visual usa una referencia exacta por pantalla.
- Falso rigor financiero: mark vs bid, aportaciones vs P&L, NO sobre candidato, liquidación y reservas; `IMPLEMENTATION_CONTRACT.md` manda.
- Sesiones recuperadas por navegador: `sessionStorage` no garantiza reset tras todos los cierres y restauraciones; `Reset demo` es explícito.
- Publicación final debe sustituir texto atribuido a medios/ilustraciones cuyo uso no esté permitido por contenidos genuinamente propios. Todo sigue señalado como demo.

## Lo que el paquete deliberadamente NO garantiza

- No hay código funcional de app ni pruebas Playwright ejecutadas; solo **especificación lista para implementación**.
- No se han realizado entrevistas, tests de usabilidad con personas ni una validación cuantitativa del diseño. El case study debe hablar de **hipótesis, comparativa, decisiones y prototipo**, no presentar hallazgos de estudio que no existieron.
- No garantiza que Replit/21st.dev esté conectado o disponible en la cuenta. El stack es independiente de esas herramientas.

## Condición para afirmar que el proyecto está «hecho»

El P0 se considera implementado solo tras código compilable, rutas y flujos reales, cálculos validados y test suite ejecutada, con comparación visual en desktop/móvil, documentando cualquier fallo no resuelto. **Ahora mismo está listo para PASAR A CLAUDE CODE, no para PUBLICAR como app terminada.**
