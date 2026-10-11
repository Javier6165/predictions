# QA funcional, escenarios deterministas y criterios de aceptación — v1.7

## 0. Objetivo

Que la web sea más que una colección de imágenes: probar de forma repetible que la misma persona puede descubrir, comprar, mantener, vender y volver a explorar una predicción sin inconsistencias. **Objetivos de QA, no métricas de usuarios reales.** Los resultados reales de test solo pueden afirmarse si se ejecutan.

## 1. Invariantes automáticos de dominio — unit tests obligatorios

| ID | Test | Esperado |
|---|---|---|
| FIN-01 | Seed v1.7 y sumas | Depósito 100000¢, cashTotal 87640¢, reserved 440¢, available 87200¢, positions marked 12840¢, portfolio 100480¢, unrealised +480¢ |
| FIN-02 | 125 YES @ ask 40¢ | Cash -5000¢, qty +125, máximo payout 12500¢, beneficio +7500¢, loss máximo 5000¢ |
| FIN-03 | Presupuesto 5100¢ @ ask 40¢ | `floor(5100/40)=127` qty, coste 5080¢, no invertidos 20¢ |
| FIN-04 | 125 contratos @ base 40¢, vender 50 @ bid 62¢ | Ingreso +3100¢, realised P&L +1100¢, remaining qty 75 y base 3000¢ |
| FIN-05 | Seed Buy NO de Bitcoin | Outcome `bitcoin-150k-2027`, side NO; mark 46¢; no inferir «otro cripto subirá» |
| FIN-06 | Multioutcome No Real Madrid | Proposición es «Real Madrid NO ganará», nunca «Barcelona ganará» |
| FIN-07 | Reserva LIMIT 20 @ 22¢ | Available cash -440¢; cashTotal idéntico; qty posiciones idéntica |
| FIN-08 | Cancel LIMIT | Reserva +440¢ liberada; cashTotal no cambia, no fee, no fill |
| FIN-09 | Buy sin cash disponible | Bloqueado, store sin cambios, mensaje específico |
| FIN-10 | Buy con liquidez inferior a qty | En P0 rechazar íntegro; sin cargo ni fill fantasma |
| FIN-11 | Sell qty superior a posición | Rechazar, sin cambio de store |
| FIN-12 | Quote cambia en Review | Volver a Review actualizada; no ejecutar sin nuevo consentimiento |
| FIN-13 | Confirm repetido/doble click | Solo una operación/recibo/ledger entry; idempotencia |
| FIN-14 | Closed/Suspended/Pending/Resolved | No permite crear Buy/Sell; explicación estado |
| FIN-15 | Settlement YES/NO | Payout qty*100¢ si gana, cero si pierde, una vez, cancelación reservas, cierre posición |
| FIN-16 | Reset / Fresh | Showcase exacto o cuenta vacía con fondos; sin notificaciones/posiciones residuales |
| FIN-17 | Add demo funds | aumenta cash/portfolio/deposits pero **no P&L** |
| FIN-18 | Mark vs liquidation | `Current value = qty*mark`; `sell preview = qty*bid`; mostrar valores distintos si spread |
| FIN-19 | Dinero siempre enteros | no floats monetarios en store, cálculo o snapshots |
| FIN-20 | Chart determinista | últimos puntos = probabilidades, No inverso, tiempo <= cierre, multi excluyentes suman 100 |
| FIN-21 | Reconciliación tras secuencia | Cash total + Σ posiciones marcadas == portfolio; reserves sin doble conteo |
| FIN-22 | Session persisted | reload misma pestaña mantiene transacciones sin reejecutarlas |

## 2. Tests de UI y navegación (Vitest/RTL)

- Active/History/Pending/Saved navegan sin confundir posiciones, órdenes y mercados guardados.
- Contenido `prediction-first` para binarios, umbrales, outcomes de candidato y `No` multiresultado; frases conservan la pregunta original hasta Receipt.
- Cifras de Preview y Receipt se derivan de quote/intent, no hardcodeadas en JSX.
- `Trade → Review` no muta saldo; `Confirm` sí; Back conserva el formulario.
- `Search` abre por botón y keyboard, filtra por pregunta/tags, muestra zero results, conserva q en Explore, cierra con Escape y restaura foco.
- `Bell` abre y se cierra al abrir Search, marca leído, navega, respeta contador.
- `Filters` inicia colapsado, abre/cierra, aplicar filtros produce lista y actualiza URL, Back restaura filtro y scroll donde sea técnicamente seguro.
- `Saved` al pulsar en Home, Explore o Detail refleja exactamente la misma selección en Portfolio.
- Cambiar side YES/NO actualiza frase, quote, contratos y beneficio. Cambiar outcome no resetea mercado por accidente.
- Cargar un mercado sin cotización (RESOLVED/PENDING) muestra estado sin pedir comprar.
- Mobile: formularios/overlays accesibles, sin CTA fuera de viewport, menú de navegación operativo.

## 3. E2E Playwright críticos

| ID | Flow | Verificaciones |
|---|---|---|
| E2E-01 | Cold entry → Home | Hero visual, badge Demo y navbar de 3 destinos |
| E2E-02 | Home category → Explore | Categoría ya aplicada, resultados correctos |
| E2E-03 | Explore initial | Hero + categorías + grupos, Filters colapsado |
| E2E-04 | Explore Filter → Detail → Back | Query, filtros y selección preservados |
| E2E-05 | Ctrl/Cmd+K search → Enter result | Detalle exacto, foco y cierre |
| E2E-06 | Search → See all | Explore con q mantenida |
| E2E-07 | Detail → Buy YES → Review | Pregunta intacta, moneda, max loss, fee cero |
| E2E-08 | Cancel Review | Cash no cambia, outcome/amount persisten |
| E2E-09 | Confirm Buy → Receipt → Portfolio | Cash, qty, P&L reconciliados |
| E2E-10 | Detail → Buy NO | Mensaje NO exacto, no «rival gana» |
| E2E-11 | Multi-outcome → option → Buy NO | Texto inequívoco, solo outcome seleccionado |
| E2E-12 | Portfolio → Sell parcial → Review | bid, ingreso/P&L realizado y contratos restantes |
| E2E-13 | Portfolio → Sell todo | posición cerrada, historial correcto |
| E2E-14 | Limit Buy → Pending → Cancel | reserva/cancel reales sin crear posición |
| E2E-15 | Saved toggle → Portfolio Saved | mismo marketId en ambas páginas |
| E2E-16 | Bell notification click | abre market/portfolio real y actualiza read state |
| E2E-17 | Add demo funds | wallet crece, P&L NO |
| E2E-18 | Reload same tab | posición persiste y no doble orden |
| E2E-19 | Restore showcase | baseline exacto tras confirmar |
| E2E-20 | Start fresh → Portfolio empty | cartera vacía útil, saldo demo, CTA Explore |
| E2E-21 | Resolved market direct link | reglas/resultado visibles; trading no habilitado |
| E2E-22 | Invalid market ID | 404 útil, enlace Home/Explore |
| E2E-23 | Keyboard-only flow | Search, tabs, side, review, confirm y close navegables |
| E2E-24 | Mobile 390px | recorrido Explore→Detail→Buy→Receipt→Portfolio completo |
| E2E-25 | Price-change preset | force reconfirm en vez de precio viejo |
| E2E-26 | Focus + modal | focus trap, Escape, focus restoration y labels accesibles |
| E2E-27 | No real-money surface | no login, checkout, datos bancarios ni APIs ajenas |

## 4. Estados especiales a probar

- Empty states y error state de búsqueda sin resultados; filtros que dan cero coincidencias con `Clear filters`.
- Mercado con spread, liquidez limitada, cerrado y resuelto; propuesta binaria y multirresultado; cambios en fecha de corte por reloj demo.
- Notificación única tras una operación, no reemitida por reload.
- Multiple clicks y navegación atrás durante Review; no stock negative, cash negative, no double settlement.
- Preferencias de motion reducido y contraste; salida de overlays desde teclado.
- Responsive 390px (móvil), ~768px (tablet), ~1440px (desktop).

## 5. Visual QA y accesibilidad

1. Screenshots locales (si el entorno permite browser automation) de Home, Explore primera entrada/filtros abiertos, Detail, Trade/Review/Receipt, Portfolio y Global overlays en desktop y móvil.
2. Comparar con `docs/DESIGN_REFERENCES.md`: hero navbar integrado Home; Explore B agrupado + filtros cerrados default; Detail **segunda** variante simplificada; Portfolio **primera**, Trading prediction-first.
3. Comprobar legibilidad: headings, probabilidades, variación en pp, contraste texto, foco, iconos accesibles, no scroll horizontal accidental.
4. `prefers-reduced-motion`, transiciones sin grandes saltos de layout, sin autoplay intrusivo, indicadores de estado no solo por color.
5. Las cards de mercado tienen alt adecuado o ilustración decorativa marcada; gráficas llevan texto/resumen numérico accesible.
6. Para experiencia de portfolio, verificar estética premium con datos densos legibles; no ocultar funciones importantes detrás de interacciones no descubribles.

## 6. Comandos de validación finales

```bash
python3 scripts/validate-fixtures.py
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Si el entorno no permite Playwright/browser, registrar `NOT RUN` con motivo y no decir que E2E pasó. Las pruebas no deterministas por tiempos artificiales están prohibidas; preferir `displayAsOf` y fixtures con escenarios explícitos.

## 7. Condición de aceptación (go/no-go)

**GO** solo si: cero errores de conciliación en cents, recorridos E2E-01..E2E-22 críticos operativos, ninguna operación ejecuta sin Review, rutas sin botones huérfanos, demo explícita, misma fuente de estado en Home/Detail/Portfolio, mobile viable, build compilable y documentación de límites clara.

**NO-GO** si hay UI espectacular pero precio/beneficio incoherentes, datos de 2024 presentados como actuales, fake CTA, compra sin Review, posiciones inventadas en Portfolio o flujos clave que solo son capturas.
