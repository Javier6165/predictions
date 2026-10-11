# Prediction Market 2.0 — paquete listo para Claude Code (v1.7)

## Qué contiene

- `PROMPT_MAESTRO_PARA_CLAUDE_CODE.md` — **un único prompt completo para pegar en Claude Code**.
- `CLAUDE.md` — reglas de proyecto que Claude Code puede leer al entrar en la carpeta.
- `docs/MASTER_BLUEPRINT_v1.7.md` — investigación y decisiones históricas más handoff de construcción.
- `docs/IMPLEMENTATION_CONTRACT.md` — especificación de rutas, trading, microcopy y datos.
- `docs/QA_AND_SCENARIOS.md` — pruebas unitarias/E2E y criterios GO/NO-GO.
- `docs/DESIGN_REFERENCES.md` — mapa de siete imágenes elegidas, para evitar confusiones con variantes descartadas.
- `docs/READINESS_AUDIT.md` — hallazgos corregidos y asuntos pendientes no bloqueantes.
- `data/demo-fixtures.v1.7.json` — 24 mercados y cartera simulada, reglas y gráficas ficticias.
- `scripts/validate-fixtures.py` — validación stdlib del dataset; no precisa instalar paquetes.
- `references/` — siete PNG seleccionados durante las iteraciones.

## Cómo usarlo con Claude Code

1. Descomprime todo el contenido del ZIP en **una carpeta nueva de proyecto** (no una carpeta que contenga solo el prompt). La estructura debe dejar `CLAUDE.md` en la raíz.
2. Abre una terminal en esa carpeta y ejecuta `python3 scripts/validate-fixtures.py`. Debe imprimir `PASS`.
3. Inicia Claude Code en esa misma carpeta (`claude`) o usa su UI apuntando a la carpeta, si tu configuración lo permite.
4. **Copia el contenido completo de `PROMPT_MAESTRO_PARA_CLAUDE_CODE.md` y pégalo como instrucción inicial**. El agente podrá leer `CLAUDE.md`, blueprint, JSON y las imágenes locales.
5. Déjale completar fases y tests. Revisa sus capturas y el README final; no des por buenas funciones sin probarlas.
6. Una vez exista un repo funcional, súbelo a GitHub. Puedes importarlo en Replit, o desplegar `dist/` en Vercel/Netlify con rewrites SPA. La app no requiere hosting de backend.

**En Replit:** es preferible importar el repositorio de código resultante, no este ZIP de documentación como si ya fuera una app. El ZIP actual especifica lo que Claude Code debe construir.

## Resumen de requisitos

Cuenta demo abierta automáticamente, sin onboarding, fondos virtuales y sesión por pestaña; Vite/React/TS/Tailwind/shadcn; 21st.dev opcional; sin backend ni cotizaciones reales; selección→revisión→confirmación; Portfolio funcional, mercado multirresultado, orden limitada pendiente y cancelable, Search/Bell, reset, siete referencias de diseño.

## Estado real de entrega

**LISTO PARA ENTREGAR A CLAUDE CODE / NO HAY APP GENERADA.** El validador independiente del fixture funciona. Las suites de React/Playwright aún deben crearse y ejecutarse como parte del desarrollo.
