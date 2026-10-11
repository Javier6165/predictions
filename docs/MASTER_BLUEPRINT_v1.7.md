# Prediction Market 2.0 — Master Blueprint

**Versión:** 1.6 — Auditoría aplicada + arquitectura técnica + contrato integral de demo (10 octubre 2026)  
**Estado:** Documento vivo de investigación y definición. **Leer primero los capítulos 04A y 04B**: el 04B fija la política actual de demo e implementación y prevalece cuando modifique propuestas anteriores. No confundir las imágenes con datos de producción.  
**Destino:** Base acumulativa para un prompt maestro de Claude Code orientado a un prototipo web funcional con operaciones y datos simulados.  
**Idioma de trabajo:** español; nombres técnicos de interfaces en inglés cuando ayuden.

> **Principio editorial:** separar hechos observados, señales cualitativas, hipótesis de diseño y decisiones aprobadas. No convertir una propuesta en requisito definitivo sin validación en la conversación.

## 00. Índice de progreso

| Módulo | Estado | Próximo hito |
|---|---|---|
| Dirección del producto | **Confirmada por la usuaria** | Concretar valor diferencial sin cambiar de categoría |
| Benchmark competitivo general | Primera ronda completa | Profundizar al definir cada pantalla |
| 01 · Home | **Home ≠ Explore y principio visual aprobados; módulos v1 propuestos** | Validar 4 bloques y comportamiento de cards |
| 02 · Category / Explore | **Referencia visual opción B aprobada; especificación funcional v1 aún revisable** | Ajustar blueprint funcional a la composición visual aprobada |
| 03 · Market Detail | **Segunda referencia visual aprobada; investigación funcional registrada** | Revisar reglas, precio ejecutable y adaptación a multi-outcome |
| 04 · Trading | **Flujo y referencia visual prediction-first aprobados**; datos finales por validar | Implementar invariantes y precios/coherencia de contratos |
| 05 · Portfolio | **Primera referencia visual seleccionada + dirección Your Predictions aprobada** | Precisar interacciones y coherencia de cifras en implementación |
| 06 · Global Experience | **Referencia Search + Notifications conservada; Account/Settings/Demo propuestos** | Validar menú y decidir si Insights es destino principal |
| IA / feature diferencial | Exploratoria | Solo si aporta valor inequívoco |
| Sistema de simulación | **Política de demo definida por encargo de la usuaria (04B)** | Implementar fixtures de referencia y validar el motor |
| Auditoría end-to-end | **v1.6: recomendaciones aplicadas como defaults técnicos (04B)** | Verificación al implementar |
| Master Prompt Claude Code | Siguiente entregable | Traducir este documento y fixtures a un prompt ejecutable con milestones y QA |

## 01. Brief del producto y decisiones confirmadas

### 1.1 Objetivo

Conceptualizar y construir **un prediction market generalista de nueva generación**, inspirándose en lo que funciona de Polymarket, Kalshi, DraftKings Predictions y FanDuel Predicts. No es una aplicación exclusivamente de apuestas deportivas ni un cambio de categoría de producto: debe seguir siendo un **prediction market completo**, con la profundidad de los grandes competidores y un recorrido muchísimo más intuitivo, minimalista, accesible y visual.

### 1.2 Decisiones de la usuaria — confirmadas

- **Generalista:** caben política, deporte, economía, tecnología, cultura, cripto, acontecimientos globales y otras categorías relevantes.
- **Rediseño de categoría existente**, no invención de una tipología ajena: «Polymarket/Kalshi 2.0» con lo mejor de cada competidor.
- **Minimalismo funcional:** complejidad real accesible, pero no puesta toda a la vez frente al usuario.
- **Visual-first y muy cuidada:** objetivo explícito de una experiencia visualmente memorable, refinada y minimalista (referencia aspiracional: la claridad y cuidado de Apple), sin ser aburrida ni densa. El diseño visual final vendrá más adelante, pero se diseñarán desde el principio los espacios funcionales que permitan imágenes, gráficos, vídeo y motion pertinentes.
- **Demo conceptual:** la aplicación debe *parecer* producto real y mantener coherencia interna, pero no debe mover dinero real ni conectarse a un exchange.
- **Primero funcionalidad:** ahora especificar Home, categorías, filtros, market detail, compra/venta, portfolio y experiencia global; branding/estética posteriormente.
- **Implementación con Claude Code**, una vez consensuado un documento maestro; alta autonomía y pruebas de flujos para reducir supervisión.
- **Respuestas breves en la conversación**, reservando los detalles del benchmark para este documento.
- **Home y Explore separados:** Home es una portada editorial curada y de descubrimiento; Explore aloja la búsqueda, filtros y catálogo exhaustivo. Aprobado el 9/10/2026.

### 1.3 No decidido

Nombre e identidad de marca definitivos, refinamiento responsive visual, eventual feature de IA y mejoras P1/P2. La arquitectura de demo, el stack y los defaults de alcance se concretan en 04B por encargo explícito de la usuaria; no constituyen desarrollo implementado ni pruebas con usuarios reales.

### 1.4 Principios de producto y experiencia (dirección confirmada; su aplicación específica se validará por pantalla)

1. **Simple by default, powerful when needed.**
2. **Visual explanation over raw numerical density.**
3. **One primary action per context.**
4. **Show why a number matters, not only the number.**
5. **Seamless continuity from discovery to detail to position.**
6. **Transparent market mechanics and decision consequences.**
7. **A visual demo can be ambitious without pretending financial execution is real.**

## 02. Benchmark: evidencias verificadas

**Método:** análisis de páginas oficiales abiertas el 9/10/2026, documentación funcional, descripciones públicas en App Store y algunos comentarios públicos de usuarios. **No se han realizado entrevistas, pruebas comparativas ni una auditoría integral de cada aplicación autenticada.** Las cifras, etiquetas y módulos de portada pueden cambiar con la localización y el momento. Las opiniones de Reddit/App Store se tratan como señales cualitativas, NO como hallazgos representativos.

### 2.1 Polymarket — fuerte en amplitud y descubrimiento

**Comprobado en portada oficial:**

- Menú temático horizontal: Trending, Combos, Perps, Breaking, New, Politics, Sports, Crypto, Esports, Finance, Geopolitics, Tech, Culture, Economy, Weather, Elections y otros.
- Sección de **Featured markets** con preguntas destacadas, etiquetas temáticas, probabilidades y en determinados casos noticias o comentarios vinculados.
- Zona **All markets** con búsqueda, navegación por temas, controles de volumen/actividad y filtros rápidos para ocultar ciertas clases de mercado.
- Las tarjetas cambian según tipo de pregunta: respuesta binaria Yes/No, varios candidatos/resultados, acontecimientos deportivos y mercados de cripto de corta duración.
- Muestra métricas como volumen y, según el formato, fin del mercado, estado Live y probabilidades.

**Fortaleza para nuestro concepto:** amplitud de contenidos, múltiples puertas de entrada (tema, popularidad, noticia, pregunta), escaneabilidad de probabilidades y posibilidad de llegar rápido al contrato.

**Tensión / oportunidad:** en una misma pantalla conviven muchas categorías, capas de contenido y variantes de mercado. Hipótesis: conviene conservar variedad, pero dar prioridad editorial y reducir competencia visual entre componentes.

**Señal de usuario:** comentario de septiembre 2026 en Reddit critica claridad del historial de órdenes y opciones (no es específicamente sobre la Home). No extrapolar a una conclusión global de usabilidad.

Fuentes:
- Portada oficial: https://polymarket.com/
- Ejemplo de taxonomía/filtros: https://polymarket.com/predictions/news
- Comentario de experiencia: https://www.reddit.com/r/Kalshi/comments/1wt3jbm/polymarket_ui/

### 2.2 Kalshi (clásico) — fuerte en organización por actividad

**Comprobado en portada oficial:**

- Sección **Top events** y grandes hubs temáticos; posible bloque de elección de modalidad **Prediction Trader** / vista alternativa según contexto.
- Secciones **Trending**, **Top movers**, **New**, **Highest volume** y **Upcoming**.
- Tarjetas con nombre del acontecimiento, una o varias opciones, probabilidad, variación, volumen y entrada a operar.
- Señales de noticias en acontecimientos destacados y variedad de formatos por categoría.

**Fortaleza:** las distintas secciones ayudan a responder intenciones diferentes: qué es popular, qué acaba de moverse, qué apareció y qué está por terminar/venir. La propia plataforma ha explorado separar vistas/experiencias.

**Tensión / oportunidad:** demasiadas secciones paralelas también pueden competir; hace falta priorizar cuáles ayudan a un visitante nuevo y cuáles son para quien sigue precios de forma activa.

**Señal de usuario con cierta recurrencia:** hilos de agosto 2026 expresan insatisfacción por cambios de navegación frecuentes, controles reubicados, dificultad para revisar gráfico histórico y posiciones, según algunos participantes. Esto NO prueba que todos los usuarios tengan esas dificultades, pero constituye un riesgo a evitar: reorganizaciones que sacrifican predictibilidad y acceso a controles importantes.

Fuentes:
- Home oficial: https://kalshi.com/
- Comentarios agosto: https://www.reddit.com/r/Kalshi/comments/1vcrdoc/feel_like_they_keep_making_the_app_look_more/
- Comentarios sobre cambios: https://www.reddit.com/r/Kalshi/comments/1vtw8gj/stop_with_the_ui_update/
- Más ejemplos: https://www.reddit.com/r/Kalshi/comments/1vkdmhf/cant_believe_this_terrible_ui_comes_back/

### 2.3 Kalshi Pro — profundidad avanzada que no debemos perder

**Comprobado en la documentación oficial:**

- Una experiencia más densa y rápida para personas que supervisan numerosos mercados.
- **Markets** como tabla viva y ordenable, **Canvas** multiventana con hasta 12 mercados, **Portfolio**, gestión de órdenes y posiciones.
- Personalización de vistas, columnas y libro de órdenes; widgets con gráfico, libro y ticket.
- Pantallas avanzadas con precios, volumen, profundidad y spread.

**Aprendizaje:** en vez de eliminar funciones avanzadas, podemos incorporarlas como capas secundarias y flujos específicos. **No** hay que decidir aún si copiar literalmente un modo Pro: una doble experiencia podría romper la consistencia y multiplicar el alcance.

Fuentes:
- https://kalshi.com/pro
- https://alpha.kalshi.com/pro/help/get-started
- https://pro.kalshi.com/pro/help/canvas-workspace
- https://kalshi.com/pro/help/canvas-views-and-starter

### 2.4 DraftKings Predictions — fuerte en taxonomía familiar

**Comprobado en la web oficial:**

- Navegación principal: **Sports**, **Predictions**, **My Trades**, **Rewards** y otros accesos.
- Etiquetas de **Popular**: ligas deportivas y activos como Bitcoin/Ethereum, entre otros.
- Taxonomía amplia con deportes y competiciones por un lado, categorías generales (Crypto, Politics, Financials, Economics, Culture, Climate) por otro.
- Facilita explorar desde una entidad conocida como NFL o una liga concreta.

**Fortaleza:** categorías y subcategorías específicas, especialmente muy accesibles para quien busca un equipo, competición o tema.

**Límite de observación:** el HTML público consultado devuelve la navegación y las categorías, pero no permite reconstruir con suficiente fiabilidad cada módulo interior de la Home ni todas las interacciones personalizadas; no afirmarlo como evidencia.

**Señal de usuario:** reseña de App Store del 13 de enero critica la diferencia entre cuotas publicitadas y cuota efectiva tras comisiones. Aunque se refiere al trade y no a Home, refuerza la necesidad de que las etiquetas de los mercados no creen expectativas económicas engañosas.

Fuentes:
- https://predictions.draftkings.com/en/
- https://www.draftkings.com/draftkings-debuts-predictions-app-entering-prediction-markets
- https://apps.apple.com/us/app/draftkings-predictions/id6747457568?platform=iphone&see-all=reviews

### 2.5 FanDuel Predicts — claridad de operación, evidencia parcial de la Home

**Comprobado en web oficial y fichas de app:**

- Plataforma con mercados de deportes, cultura, financieros y cripto.
- Secuencia de explicación al usuario: elegir Yes/No, establecer importe, mantener o vender anticipadamente (si es posible), liquidar.
- Página pública destaca funcionalidades deportivas como resultados en directo y combos; contiene recursos de ayuda.

**Informes secundarios (no auditados directamente in-app):** análisis externos describen una experiencia móvil simple con cambio de formato de precios (céntimos, porcentaje y cuotas) y categorías accesibles; deben tomarse como referencias, no como constatación exacta del UI al 9/10/26.

**Limitación importante:** https://www.fanduel.com/predicts es una **landing comercial**, no la Home completa del producto en la aplicación. No es correcto sacar conclusiones de layout in-app a partir de esa landing.

**Señal de usuario:** reseñas en Google Play mencionan restricciones de combos y retrasos de liquidación; no extrapolar al sistema de navegación.

Fuentes:
- https://www.fanduel.com/predicts
- https://apps.apple.com/us/app/fanduel-predicts/id6747883721?platform=ipad
- https://www.gambling.com/us/prediction-markets/reviews/fanduel-predicts
- https://play.google.com/store/apps/details?id=com.fanduel.flywheelnativecontainer.futures

### 2.6 Síntesis comparativa

| Plataforma | Tomar | Evitar / mejorar | Confianza de evidencia |
|---|---|---|---|
| Polymarket | Oferta diversa; featured y categorías; cards adaptadas a mercados | Competiciones simultáneas de atención en el mismo nivel | Alta sobre estructura pública, interpretación UX = hipótesis |
| Kalshi | Trending / movers / new / upcoming; señales de cambio | Navegación cambiante y pérdida de continuidad informativa | Alta oficial; quejas cualitativas anecdóticas |
| Kalshi Pro | Herramientas y vistas avanzadas reales | Poner un terminal financiero frente a cualquier usuario desde entrada | Alta (docs oficiales) |
| DraftKings Predictions | Taxonomía comprensible y accesos directos a subcategorías | Dependencia excesiva del modelo sportsbook; claridad de costes | Alta en categorías; menor en interiores de Home |
| FanDuel Predicts | Onboarding lógico y lenguaje claro de operación | Menor profundidad observada en material público; no inferir UI sin verla | Alta en flow oficial, media/baja en Home app |

## 03. HOME — Product specification v1 (9/10/2026)

**Estado de decisión**: [APROBADO] Home separada de Explore. [APROBADO] Aspira a un producto tan cuidado y sencillo como una consumer app premium, sin eliminar profundidad. [PROPUESTA A VALIDAR] Composición de cuatro bloques, reglas concretas y selección editorial recogidas a continuación.

### 3.1 Jobs-to-be-done y criterios de experiencia

La Home debe responder en segundos: «¿Qué merece mi atención?», «¿Qué puedo predecir?», «¿Dónde exploro un tema que conozco?». Evitar convertirla en un terminal financiero o un catálogo ilimitado. Esta decisión NO debe limitar categorías, mercados ni herramientas profundas: están en Explore/Market Detail/Portfolio. Mantener los accesos profundos a uno o dos gestos razonables.

**Prioridad 1:** claridad y jerarquía. **Prioridad 2:** carácter visual/editorial sobresaliente. **Prioridad 3:** diversidad temática. **Prioridad 4:** eficiencia para usuarios recurrentes. El impacto visual se obtiene mediante una composición editorial, contenido visual significativo y transiciones cuidadas, NO multiplicando tarjetas y animaciones.

### 3.2 Navegación global relacionada con Home

- Cabecera mínima con marca provisional, `Discover`/Home, `Explore`, `Portfolio`, acceso claro a `Search`, `Saved`/watchlist y cuenta de demo. En móvil, adaptar sin perder la búsqueda ni la navegación a cartera.
- Categorías como accesos en un bloque compacto de Home; listado y filtros exhaustivos residen en Explore. **No** duplicar dos o tres menús de categorías horizontales encima de la portada.
- Estado `DEMO · simulated` discreto pero inequívoco. No mezclar contenido real de noticias con mercados ficticios sin diferenciarlo.
- No usar un toggle `Simple / Pro` por defecto en Home. Acceso a profundidad mediante Market Detail, Explore y Portfolio; la opción de un modo avanzado se reexaminará al definir esas pantallas.

### 3.3 Estructura exacta propuesta — cuatro bloques y salida a Explore

**Bloque 1. FEATURED (un acontecimiento protagonista)**

- Un único acontecimiento destacado, elegido por relevancia editorial y potencial de explicación visual. Evitar rotación automática; cambiar voluntariamente con controles accesibles si más adelante se admiten varios destacados.
- Visible: pregunta titular inequívoca, categoría/contexto, resultado líder o dos resultados principales, probabilidad de mercado indicativa claramente asociada al resultado, cambio temporal solo si añade valor y CTA **Explore market**.
- Visual: espacio para imagen, vídeo breve sin audio autoplay, visualización o gráfico del mercado. Cada formato depende del contenido; NO forzar la misma miniatura en todos los tipos de mercado. El contenido no sustituye a la pregunta y al dato principal.
- El CTA conduce a Market Detail. **No ejecuta operaciones**. El contenido audiovisual nunca es requisito para entender ni usar el bloque. Prever reduced-motion y alternativa estática.
- Tipos de escenario de prueba: mercado binario (Yes/No), multiresultado (liderazgo de opciones), deportivo (event status). No imponer UI de fútbol en un mercado económico.

**Bloque 2. EXPLORE TOPICS (acceso inmediato a categorías)**

- Fila compacta con ~6 entradas temáticas de alto nivel y `All topics`.
- Conjunto **provisional**: Politics, Sports, Finance, Crypto, Technology, Culture. El resto se ofrecerá desde Explore; la taxonomía definitiva se cierra allí.
- Un clic abre Explore con la categoría ya aplicada, sin volver a preguntar por el filtro. Conservar en URL (enrutamiento compartible) si resulta razonable para la demo.
- No usar categorías + subcategorías + chips de tendencia simultáneamente. Un acceso claro por intención.

**Bloque 3. TRENDING NOW (selección transversal de mercados)**

- Cuatro cards como máximo en la composición inicial, con diversidad de formatos y temas. No se convierte en `All markets` al hacer scroll.
- Card compacta: pregunta, categoría, resultado/precio-probabilidad principal, estado importante (`Live`, `Closing soon`) solo cuando aplique. Metadatos secundarios como volumen, spread y reglas se consultan en Market Detail.
- Variantes de card: binary, multi-outcome y evento deportivo. El esqueleto informativo es consistente, pero no obligar a cada mercado a enseñar un gráfico si no aporta nada.
- Acción principal: abrir Market Detail. Acción secundaria: `Save`/watchlist con estado persistente, no comprar directamente desde una card.
- `View trending` abre Explore con ordenación/filtro correspondiente. `Trending` requiere un criterio simulado documentado (p.ej., actividad reciente con cierto umbral mínimo), NO atribuirlo a personas reales.

**Bloque 4. MARKET MOVERS (movimientos relevantes de probabilidad)**

- Tres a cinco items como máximo, deliberadamente distintos a la cuadrícula de Trending: probabilidad principal + variación en puntos porcentuales + periodo explícito (ej. +12 pp · 24h). **Sin sparklines por fila en Home**: cambio aprobado tras las iteraciones de imagen; los gráficos completos se consultan en Market Detail.
- Cada item tiene pregunta, resultado afectado, precio/probabilidad anterior y actual si hay sitio, y acceso al detalle. Una variación por sí sola NO prueba la causa del cambio.
- Ordenación por valor absoluto del movimiento del resultado principal y con un umbral de actividad simulada para evitar movimientos espurios en mercados minúsculos; el criterio concreto se fijará con los fixtures.
- Al abrir Market Detail, preferentemente mostrar el gráfico en el mismo intervalo (24h) para preservar el contexto del clic.
- `View all movements` abre Explore con ordenación Biggest Moves 24h.

**Salida al catálogo**: un acceso final discreto pero inequívoco **Explore all markets**. La Home no tendrá bloque `All Markets` infinito.

### 3.4 Elementos que DECIDIMOS NO poner en la Home v1 (PROPUESTA)

- No: feed completo `All Markets`, decenas de carruseles, listas paralelas `Breaking`/`New`/`Ending Soon`/`Highest Volume`/`Upcoming`, filtros densos, heatmaps complejos, libro de órdenes, tickets de operaciones en cada card, leaderboard, news ticker persistente, panel de IA flotante y contadores o animaciones urgentes sin valor informativo.
- Estos criterios de descubrimiento NO desaparecen: `Breaking`, `New`, `Ending Soon`, `Highest Volume` y filtros avanzados vivirán dentro de Explore, cuando el usuario solicite más precisión.
- Sin personalización algorítmica ficticia en P0. Para el usuario con guardados/posiciones, se podrá mostrar después un acceso contextual no invasivo («Continue following») si pruebas de uso lo justifican.
- El catálogo deberá seguir siendo accesible de inmediato desde búsqueda y Explore; minimalismo ≠ esconder tareas frecuentes.

### 3.5 Reglas de diseño de las cards y datos

**Jerarquía mínima universal:** (1) pregunta inequívoca; (2) resultado al que corresponde la cifra; (3) cifra principal; (4) una etiqueta contextual si hace falta. **Secundario bajo demanda:** volumen/actividad, liquidez, spread, fecha de cierre, reglas y fuentes según su utilidad; en Market Detail estos datos serán accesibles y claramente expuestos antes de comprar.

- `Chance` / porcentaje implica expectativa de mercado aproximada, no probabilidad garantizada; mostrar el outcome asociado.
- `▲ +12 pp (24h)` para cambios entre 38 % y 50 %; no `+12 %` si son puntos porcentuales. Prever formato negativo o sin cambio.
- En multiresultado no sumar porcentajes redondeados para prometer un total perfecto. Contratos excluyentes se deben modelar coherentemente; redondeo visual puede variar.
- El precio de compra real (simulado), comisiones (si las hubiera) y retorno **no se deducen de una card**. Es información del Trade Slip en Market Detail.
- `Live`, `Closing soon`, `Suspended`, `Resolved` solo como estados semánticos reales de los fixtures. No insinuar que un mercado inoperable admite compra.
- Cards con `save` accesible por teclado, foco visible, estado persistente y semántica separada de `open detail`. Touch targets móviles adecuados.
- Contenido visual puede incluir ilustraciones/vídeo/gráficos, pero el texto/dato esencial es accesible sin depender de movimiento o colores.
- Evitar convertir los porcentajes en sensacionalismo/urgencia. Cualquier movimiento brusco debe tener período y contexto.

### 3.6 Comportamiento y navegación: mini-flow de Home

```text
Home / Discover
  ├─ Featured ────────────> Market Detail (main view)
  ├─ Topic Politics ──────> Explore (?category=politics)
  ├─ Trending card ──────> Market Detail
  ├─ Save card ───────────> Saved/Watchlist (persisted)
  ├─ Market Mover ───────> Market Detail (24h chart selected)
  ├─ Search ─────────────> Search results / Explore (query persisted)
  ├─ Explore all ────────> Explore (unfiltered catalogue)
  └─ Portfolio ──────────> Portfolio (open positions)
```

**Estados mínimos**: initial/loading no saltos grandes de layout; sección sin resultados relevante (no se fingen cards); búsqueda 0 resultados; market suspended/resolved; card guardada/no guardada; mobile/desktop; usuario que no ha operado vs con cartera. Para una demo totalmente predefinida, los datos locales pueden cargar instantáneamente, pero no introducir spinners ficticios prolongados.

### 3.7 Datos necesarios (no son cifras de negocio real)

- Cada mercado cuenta con `id`, `question`, `category`, `type`, `outcomes`, `marketStatus`, `closeAt`, `resolveAt`, `featuredWeight/curationSlot` opcional, `volume24h`, `priceHistory`, `isSaved`, `mediaAsset` opcional y `updatedAt`.
- Dataset único para Home, Explore, Detail y Portfolio. 15–24 mercados ficticios bien resueltos pueden ser suficientes; no es una cifra cerrada ni un KPI.
- Un editor/fixture de Home selecciona exactamente 1 featured, hasta 4 trending (excluyendo featured) y hasta 3 movers (intentando evitar duplicación en la misma sesión).
- Si no hay 3 movers válidos, mostrar menos en vez de inventar variaciones. Las probabilidades y variaciones se calculan desde los mismos datos que usa Market Detail.
- En política/actualidad, los escenarios inventados se identificarán como ficticios; no fabricar titulares atribuidos a medios reales ni datos históricos supuestamente verificados.

### 3.8 Acceptance criteria de Home para Claude Code

1. Tras cargar Home, aparece **1 featured**, una ruta visible a Explore por categoría, **hasta 4 trending** y **hasta 3 movers**, además de navegación global a Portfolio y búsqueda.
2. Seleccionar una card abre **el mercado correcto** y muestra **los mismos porcentajes y estados** que en Home.
3. Hacer clic en una categoría conduce a Explore con filtro aplicado y resultados coherentes; `Explore all` muestra todo el catálogo elegible.
4. `Trending` y `Movers` responden a reglas de ordenación comprobables a partir de datos simulados; `+/- pp / periodo` se corresponde con la historia.
5. Guardar/desguardar actualiza el estado y persiste tras recargar; no dispara navegación a detalle accidentalmente.
6. Una card de mercado suspendido/cerrado se puede consultar, pero no anuncia comprar directamente.
7. Home funciona en mobile y desktop con contenido visible y sin scroll horizontal accidental ni navegación inaccesible.
8. Si se activa animación/vídeo, el contenido principal sigue legible, los controles son accesibles y se respeta reduced-motion.
9. No hay CTA que ejecute transacciones desde Home: el usuario accede a Market Detail y puede revisar su operación.
10. No aparecen precios, historias o titulares contradictorios entre Home y Market Detail.

### 3.9 Justificación y evidencia (benchmark verificado, propuesta no probada)

- Polymarket Home pública muestra `Featured markets`, una categoría horizontal extensa y `All markets` con numerosas tarjetas. Útil para descubrimiento amplio, pero **no implica** que un catálogo exhaustivo en Home sea nuestra mejor elección: https://polymarket.com/.
- Kalshi muestra `Top events`, `Trending`, `Top movers`, `New`, `Highest volume` y `Upcoming`. Tomamos **dos intenciones distintas** (`Trending` + `Movers`) y trasladamos el resto a Explore: https://kalshi.com/.
- DraftKings ofrece taxonomía reconocible de temas/ligas, pero el HTML público no permite verificar en detalle la composición de la Home app; extrapolar solo navegación: https://predictions.draftkings.com/en/.
- FanDuel documenta un flujo simplificado de predicción/importe/venta/pago, pero su web es una landing, NO prueba de la Home de su aplicación: https://www.fanduel.com/predicts.
- NN/g sobre progressive disclosure respalda separar opciones primarias y avanzadas con una ruta clara: https://www.nngroup.com/articles/progressive-disclosure/. No constituye prueba específica de que nuestra composición en cuatro bloques sea óptima.
- Señales cualitativas (no representativas): usuario de Kalshi critica cambios, densidad y controles reubicados: https://www.reddit.com/r/Kalshi/comments/1vcrdoc/feel_like_they_keep_making_the_app_look_more/; otro usuario de Polymarket valora mejor orden/alertas de Kalshi: https://www.reddit.com/r/polymarket_bets/comments/1rl72r7/does_anyone_else_feel_like_the_polymarket_webpage/.

### 3.10 Preguntas pendientes — solo las que cambian producto

- [PROPUESTA] ¿Confirmamos la composición de cuatro bloques como Home v1? La usuaria aprobó claramente **la separación Home/Explore**, no aún cada módulo.
- ¿Qué categoría final ocupa los 6 accesos directos? Se resolverá junto con Explore (siguiente módulo).
- ¿Merece la pena que el Featured contenga **un mercado** o una **colección editorial de varios mercados relacionados**? Recomendación provisional: un solo mercado para evitar ambigüedad; aceptar colección en una futura iteración.
- ¿En qué momento entra la búsqueda predictiva y su UI? Se decidirá en Explore/Global Experience, no inventar ahora.

### 3.11 Checklist del trabajo de diseño visual POSTERIOR (fuera de alcance actual)

- Asegurar imagen/vídeo/visualización contextual para Featured y capacidades de chart para Movers.
- Explorar tipografía, layout, escala, espacios, contraste, motion expresivo y transiciones entre Home → Detail, sin definir branding todavía.
- La aspiración `Apple-like` significa edición rigurosa de contenidos, jerarquía y pulido, **NO replicar Apple ni crear una interfaz plana/genérica**.

## 03.bis Referencia visual aprobada para Home

**Estado:** referencia de diseño aprobada por la usuaria para orientar la dirección visual de la Home; **no** constituye un diseño final ni un sistema visual cerrado.

### Imagen de referencia seleccionada
- **Archivo:** `a_sleek_dark_futuristic_web_app_dashboard_ui_des.png` (junto al Markdown en la carpeta de trabajo).

![Referencia visual Home aprobada](a_sleek_dark_futuristic_web_app_dashboard_ui_des.png)
- **Origen:** exploración visual generada durante la conversación el 9/10/2026.

### Qué se aprueba de esta referencia
- **Hero inmersivo** que se integra con la top bar y extiende el impacto visual hasta la cabecera.
- **Composición editorial clara:** hero protagonista arriba; debajo, bloques modulares de categorías, trending, movers, insights y upcoming events.
- **Equilibrio entre impacto e inteligibilidad:** visualmente potente, pero más comprensible que las primeras iteraciones recargadas.
- **Minimalismo progresivo:** las listas de `Trending now` y `Biggest movers` funcionan mejor **sin sparklines por fila**, mostrando solo el porcentaje principal y la variación (`▲/▼`) para reducir intimidación visual.
- **Jerarquía correcta de profundidad:** el hero puede enseñar gráfico y acciones de mercado; las listas inferiores priorizan escaneabilidad y dejan el detalle avanzado para Market Detail.
- **Tema oscuro inmersivo en la referencia:** buena base para una futura dirección tipo “consumer premium fintech / Apple-like clarity”, sin fijar todavía branding final. El dark mode del mockup no fuerza automáticamente todo el producto a ser oscuro.
- **Atención:** los datos, nombres, fechas, títulos y botones de compra de la imagen son *placeholder visual*: no validar su veracidad ni deducir de ellos flujos aprobados.

### Implicaciones funcionales derivadas
- Mantener el hero como principal zona de riqueza visual y de densidad controlada.
- Reducir ruido en módulos secundarios: evitar micrográficas innecesarias en listados Home cuando no aporten comprensión inmediata.
- Preservar la idea de que `Home` inspira y descubre, mientras `Explore` y `Market Detail` concentran la profundidad.

### Recordatorio
La imagen es una **referencia de dirección**, no un entregable definitivo. En fases posteriores habrá que redibujarla con copy, datos, estructura final y sistema visual coherentes con el blueprint.


---

## 03C. EXPLORE / CATEGORIES — Product specification v1 (9/10/2026)

**Estado:** [APROBADO] Existe como espacio independiente de Home y contiene el catálogo completo. [PROPUESTA EN REVISIÓN] Arquitectura exacta, categorías, filtros, vista de resultados, estados y criterios de aceptación de esta sección. **No asumir que se ha aprobado toda la especificación por el mero hecho de redactarla.**

### 3C.1 Objetivo y jobs-to-be-done

La Home contesta «¿qué merece mi atención?». Explore contesta «¿cómo encuentro el mercado o conjunto de mercados que me interesa?». Debe soportar cuatro tareas sin parecer un terminal financiero: (1) búsqueda por nombre/acontecimiento, (2) exploración temática, (3) refinamiento por filtros/sort, (4) comparación rápida antes de abrir un mercado.

Principio: **powerful discovery without visual density**. No repetir un segundo hero, banners de noticias o grandes tarjetas de categorías dentro de Explore. Heredar el sistema visual de Home, pero dedicar mayor proporción del espacio a encontrar y comparar.

### 3C.2 Lo que muestran las fuentes (separación evidencia/interpretación)

| Producto | Evidencia observada en fuentes | Qué tomaríamos | Qué NO copiaríamos literalmente |
|---|---|---|---|
| Polymarket | La web pública ofrece navegación por multitud de temas y filtros `Trending`, `Liquidity`, `Volume`, `Newest`, `Ending Soon`, `Competitive`, además de estados `Active/Resolved/All`. Algunos mercados representan preguntas agrupadas con varias opciones. | Abundancia funcional, varias formas de ordenar y un modelo de mercados agrupados. | Categorías y filtros de igual peso mezclados en varios niveles desde el primer vistazo. |
| Kalshi clásico | Documentación oficial de «Finding Markets» confirma exploración por tabs de tema y filtro `Trending`. | Categorías como entrada simple y ordenación por tendencia. | No hay evidencia suficiente para copiar todos los controles internos de la versión autenticada. |
| Kalshi Pro | Documentación de julio 2026 confirma tabla sortable y controles por categorías múltiples, precios, tamaño, mínimo volumen, profundidad, sesgo comprador, vencimiento y `Live-only`. También búsqueda por título/evento/ticker. | La **profundidad funcional** como segunda capa para usuarios avanzados, sin renunciar a filtros útiles. | Spread, tamaños bid/ask, book depth o sesgo comprador en la superficie de entrada para cualquier visitante. |
| DraftKings Predictions | Web pública estructura subcategorías comprensibles (ligas deportivas, criptomonedas, economía/Fed/inflación, cultura/premios, etc.). | Taxonomía reconocible, predecible y fácil de recorrer. | Su navegación amplia, muy orientada a inventario deportivo, como jerarquía principal de un producto generalista. |
| FanDuel Predicts | Landing oficial confirma categorías (deporte, cultura, finanzas, cripto) y simplificación Yes/No; no permite verificar por completo cómo se comporta Explore dentro de la app. | Lenguaje claro, continuidad hacia un flujo de compra/venta. | Inventar o atribuirle filtros y una UI de Explore que la landing no muestra. |

**Señales de usuarios (solo anecdóticas):** en Reddit agosto 2026 aparecen comentarios sobre resultados de búsqueda no encontrados en Polymarket app, y en septiembre 2026 un usuario de Kalshi no encuentra mercados *nuevos* dentro de su categoría; otro usuario critica que Kalshi Pro requiere coincidencias de texto exactas. No podemos convertirlos en métricas generales: son pistas para **buscar por entidades/alias y mantener los filtros explícitos y reversibles**.

**Enlaces primarios:**
- Polymarket browse: https://polymarket.com/predictions/news
- Polymarket Home / All Markets: https://polymarket.com/
- Kalshi Help — Finding Markets: https://help.kalshi.com/en/articles/13823842-finding-markets
- Kalshi Pro — Markets Scanning, Filtering and Searching: https://kalshi.com/pro/help/markets-scanning-filtering-searching
- DraftKings Predictions: https://predictions.draftkings.com/en/
- FanDuel Predicts: https://www.fanduel.com/predicts

**Opiniones de referencia (no representativas):**
- https://www.reddit.com/r/Polymarket/comments/1ve4muo/searching_on_the_app_doesnt_work_properly/
- https://www.reddit.com/r/Kalshi/comments/1wr1o9n/is_there_a_page_that_shows_you_the_newest_markets/
- https://www.reddit.com/r/Kalshi/comments/1uwa6eb/average_joe_first_impression_of_kalshi_pro/

### 3C.3 Arquitectura: una pantalla reutilizada para el catálogo y las categorías

**No crear nueve landings distintas**. Explore tiene plantilla única y estado de navegación parametrizado:

```text
Global navigation > Explore
  ├─ Search (global, incluye mercados/eventos/temas)
  ├─ Topic selector: All / Politics / Sports / Crypto / Tech & AI / Economy & Finance / Entertainment / World / Science & Climate
  │    └─ Selected topic > contextual subtopics, solo cuando corresponda
  ├─ Results toolbar: Result count | Status | Sort | More filters
  ├─ Results collection (event-level items)
  │    ├─ Binary question preview
  │    ├─ Multi-outcome question preview
  │    └─ Event with several related markets
  └─ Open result -> Event/Market Detail; Save -> Watchlist
```

**Layout desktop:** buscador consistente con el de cabecera; título `Explore`; navegación textual por categorías (no repetir la galería de imágenes de Home); chips de subcategorías cuando aplique; barra de resultados con filtros/sort; colección de resultados escaneables en 1–2 columnas según espacio, sin barras financieras.

**Layout móvil:** navegación por temas desplazable horizontalmente con `All topics` / menú para el resto, sin ocultar el elemento activo; resultados en una columna; barra compacta con `Sort` y `Filters` que abre un drawer; sin sidebar de filtros que robe ancho.

**Transiciones:** desde una categoría de Home, abrir Explore con categoría ya activa; desde Trending/Movers de Home, abrir Explore con sort correspondiente; desde resultados de Search abrir el destino preservando búsqueda y contexto. Estado reflejado en URL navegable (`?topic=...&sort=...&status=...&q=...`) y sincronizado con la UI.

### 3C.4 Taxonomía inicial — 8 categorías visibles [PROPUESTA]

| Nivel 1 | Subtemas ejemplo | Regla de clasificación |
|---|---|---|
| Politics | Elections, Leaders, Policy | Gobiernos, elecciones y legislación. |
| Sports | Football, Basketball, Tennis, Esports | Partidos, torneos, clubes, atletas. |
| Crypto | Bitcoin, Ethereum, Tokens | Criptoactivos y acontecimientos cripto. |
| Tech & AI | Artificial Intelligence, Big Tech, Product Launches | Tecnología, productos, empresas tech. |
| Economy & Finance | Central Banks, Inflation, Markets, Commodities | Economía, finanzas y activos tradicionales. |
| Entertainment | Music, Film & TV, Awards | Cultura popular, premios y entretenimiento. |
| World | Geopolitics, Diplomacy, International Events | Acontecimientos internacionales no mejor clasificados como Politics. |
| Science & Climate | Space, Research, Weather & Climate | Exploración espacial, ciencia y clima. |

**Reglas:** cada `event`/`market` tiene **una categoría primaria** para navegación consistente y **varios tags secundarios** para búsqueda transversal; un tema cruzado (SpaceX y tecnología, por ejemplo) sigue teniendo un destino canónico y se encuentra por tags sin duplicar la misma pregunta muchas veces en resultados. La clasificación es editorial y se documenta en fixtures.

La imagen de Home aprobada usaba `Global Events` y `Science`; aquí se propone `World` y `Science & Climate` por claridad. **Etiquetas no cerradas**; validar coherencia exacta de nombres Home–Explore antes del prompt a Claude.

### 3C.5 Filtros y sort: qué es visible y qué está oculto

**En la superficie, sin abrir «More filters»:**
1. `Topic` — selección por barra de categorías, con subtags contextuales.
2. `Status` — default `Open` (mercados que admiten operaciones); `All` y `Resolved` como alternativas accesibles. Un evento que todavía no ha empezado puede tener un mercado **Open**: no confundir estado del evento con estado de operación.
3. `Sort` — default `Trending`; opciones `Biggest Moves`, `Highest Volume`, `Newest`, `Ending Soon`. Cuando se elige `Biggest Moves`, aparece `Timeframe` (24h por defecto; 1h/7d opcionales).

**More filters (drawer/panel secundario):**
- `Market structure`: Binary (Yes/No), Multiple outcomes, Range/Threshold (en las fixtures); **Sports no es estructura**, es categoría.
- `Closing window`: Today / 7 days / 30 days / Any.
- `Minimum activity`: bajo/medio/alto según volumen simulado, con umbrales documentados y números de apoyo al desplegar.
- `Liquidity`: filtro avanzado *solo* si la demo modela un valor de liquidez coherente; de lo contrario no mostrarlo como control falso.
- `Saved only`: ver mercados guardados (si existe Watchlist global) — atajo opcional.
- `Event in progress`: filtro contextual para deporte u otros eventos con estado Live, distinto de un mercado operable/abierto.

**No incluir en P0:** order book depth, buy-side skew, spread filters ni rangos de precio granulares; se reservan para una eventual vista avanzada. **No añadir filtros decorativos sin fixtures que los sustenten.**

**Criterios de ordenación documentados en la demo:** `Newest = createdAt DESC`; `Ending Soon = closeAt ASC`; `Highest Volume = volume24h DESC` (etiquetar ventana); `Biggest Moves = abs(probabilityNow - probabilityAtTimeframeStart) DESC`, diferencia en **puntos porcentuales**; `Trending = score editorial/simulado determinista` (no afirmar que procede de actividad real). En empates utilizar id estable. Si `All/Resolved` incluye mercados sin cotización activa, mostrar datos históricos y estado, no comprar.

### 3C.6 Búsqueda: global y contextual

Un único buscador global disponible desde la cabecera que en Explore actúa como consulta actual. Debe admitir título, acontecimiento, tema, nombres de personas/equipos/empresas, tags y alias conocidos de fixtures, sin exigir coincidencia textual exacta. Match por tokenización básica, case/diacritic insensitive y sinónimos guardados; no hace falta API ni LLM.

**Interacción:** foco revela búsquedas recientes de la sesión y sugerencias populares ficticias claramente marcadas como de la demo; al escribir, propuestas de mercado, tema y entidad con categoría; Enter abre resultados de Explore filtrados. Evitar rutas separadas que generan dos motores de búsqueda incompatibles. `Escape` cierra sugerencias; `Clear` restaura la consulta vacía conservando los demás filtros; `Reset all` restaura el Explore original.

**Estado 0 resultados:** decir «No markets match these filters»; mostrar chips activos y `Clear filters`; nunca fingir un error ni rellenar con mercados irrelevantes. Si solo existen coincidencias **Resolved** con `Status: Open`, explicar brevemente que hay coincidencias en mercados resueltos y permitir verlas explícitamente, sin cambiar el estado a espaldas del usuario.

### 3C.7 Unidad de listado y formatos de resultados

**Decisión de arquitectura propuesta:** una fila/card de Explore representa una **pregunta o evento canónico**; no multiplicar por cada `outcome` ni duplicar el mismo acontecimiento 10 veces. Modelo lógico: `Topic > Event > Market(s) > Outcome/Contract(s)`. En algunos casos `event` incluye una sola pregunta; en otros agrupa varias (ej. un evento macroeconómico con cinco umbrales).

**Diseño por defecto:** lista de filas editoriales compactas, con imagen miniatura pertinente (o icono), espacio generoso para la pregunta, **probabilidad + etiqueta del outcome** y un metadato útil según contexto (fecha de resolución o nº de mercados relacionados). Las preguntas ocupan más espacio que las cifras.

**Tres adaptaciones del mismo patrón (NO tres sistemas de UI):**

1. **Binary:** `Will X happen?` → `Yes · 68%`; en Detail están las dos caras y el precio de ejecución. Nunca mostrar 68% sin indicar que corresponde a `Yes`.
2. **Multiple outcomes:** `Who will win X?` → `Candidate A · 42%` y `+ 4 outcomes`; solo si mejora la lectura mostrar también el segundo resultado. No asegurar sumas exactas a 100% por redondeos o diseños con outcomes no exhaustivos.
3. **Event bundle / threshold:** `Fed decision in November` → `Most likely: No change · 54%` y `3 related markets`; si sus contratos se solapan (umbrales), NO sumar probabilidades como si fueran resultados excluyentes.

**Datos obligatorios:** `title`, `topic`, `primaryOutcomeLabel`, `primaryProbability`, `tradeStatus`, `detailRoute`. **Datos condicionales:** imagen, variación pp/periodo (cuando el sort es Movers), fecha cierre, número de mercados, estado Live, favoritos. Metadatos como volumen y liquidez solo en vista avanzada o sort pertinente; no forzar todos en cada fila.

**Acciones:** pulsar la fila → Detail; icono guardar → alterna saved sin navegación ni disparo doble. **Sin compra directa** desde Explore en P0: no competir con la fase de comprensión. Puede estudiarse Quick Trade cuando ya esté probado Market Detail.

**Vista alternativa:** en P0 solo lista clara y responsive; no introducir `Grid/List` toggle por costumbre. **P1** posible modo `Compact` para usuarios que monitorizan muchos mercados, con más filas por pantalla y volumen/expiración como columnas; conservar misma ordenación/URL/datos.

### 3C.8 Estados y comportamiento

- Carga inicial con datos locales instantáneos o placeholder breve sin layout shift; no spinners largos simulados.
- Con resultados y sin filtros; con uno o varios filtros; resultados vacíos; una categoría sin subcategorías; búsqueda con caracteres especiales.
- Mercado `Open`, `Suspended`, `Closed`, `Pending resolution`, `Resolved`, `Voided`: representación explícita cuando relevante; `Live` significa evento en curso, no necesariamente mercado tradable.
- Filtro/ordenación manteniendo resultado correcto y URL; `Back` devuelve el punto de exploración; al regresar del Detail restaurar scroll/contexto del listado si es razonable.
- Saved/persistido visible instantáneamente; indicar feedback ligero sin modal.
- Accesibilidad: navegación por teclado, foco visible, labels para iconos, resultados con nombres claros, no depender del color para subida/bajada, táctiles suficientemente grandes.
- No atribuir ni a los datos ni al número de mercados de la demo una escala real; los indicadores son simulados.

### 3C.9 Flujos principales

```text
Home > Category Tile > Explore(topic) > Subtopic > Result > Market Detail
Home > Biggest Movers > Explore(sort=move, window=24h) > Result > Market Detail
Top search > Query "Mars" > Explore(q=mars) > Save > Saved / Portfolio later
Explore > Topic Sports > Status Open > Event in progress > Result > Market Detail
Explore > Sort Newest > Topic Entertainment > Result > Market Detail
Explore > Search + filters -> 0 results -> Clear filters -> Results restored
Explore > Resolved -> Completed market -> Detail (read-only/history)
```

### 3C.10 Datos necesarios para Claude Code

`Category` (id, slug, name, order, icon/asset), `Subtopic` (id, categoryId, name), `Event` (id, title, summary, primaryCategoryId, tags[], searchAliases[], startsAt?, endsAt?, status, image?, marketIds[]), `Market` (id, eventId, question, marketStructure, tradeStatus, createdAt, closeAt, resolvedAt?, volume24h, liquidity?, outcomes[]), `Outcome` (id, label, currentPrice, priceHistory[]), `SavedItem` (marketId/eventId, createdAt). Distinción formal `event.status` vs `market.tradeStatus`.

Fixtures iniciales **propuestos**, no verificados como decisión de producto: 8 categorías, 2–4 subtemas por categoría, 24–36 eventos demo (para que búsqueda/filtros funcionen), 3 tipos de market structure, históricos de 24h/7d para subconjuntos con Movers, al menos 6 resueltos y 2 suspendidos. Los eventos de Home serán subconjunto del mismo catálogo (no datos paralelos). Datos falsos explícitos: evitar reutilizar titulares históricamente resueltos con fechas de 2024/2025 como si fueran mercados actuales de 2026; preferir escenarios ficticios fechados en el futuro para la demo.

### 3C.11 Acceptance criteria de Explore (para implementar y comprobar)

- [ ] Home > `Explore all` abre catálogo sin filtros; Home > categoría aplica filtro exacto.
- [ ] Home > `View trending` / `View all movers` preserva el criterio en Explore.
- [ ] Búsqueda devuelve resultados por título y alias, no solo exact match; Enter, Esc y Clear funcionan.
- [ ] Tema y subtema componen filtros sin inconsistencias; categoría primaria única.
- [ ] `Sort` tiene efecto visible real y orden determinista; `Biggest Moves` muestra timeframe en UI.
- [ ] `More filters` aplica combinaciones y presenta opción de reset + número de filtros activos.
- [ ] Status distingue `Open` y `Resolved`; mercados suspendidos no parecen disponibles para compra.
- [ ] Cards binarias, multi-outcome y bundles muestran preguntas, outcomes y probabilidades correctamente etiquetados.
- [ ] Guardar/quitar guardado persiste tras recarga.
- [ ] Back desde Detail preserva consulta/filtros; recarga conserva estado vía URL.
- [ ] Estados vacíos y mobile están diseñados y probados, sin scroll horizontal accidental.
- [ ] No hay botones visibles sin acción implementada.

### 3C.12 Hipótesis, riesgos y decisiones que sí necesitan validación

1. **Lista vs cuadrícula:** propuesta `list` por mayor escaneabilidad; una cuadrícula con miniaturas grandes podría ser más vistosa pero compite con Home y reduce comparabilidad. Dejar como decisión visual/UX sujeta a prueba posterior.
2. **8 categorías:** no confundir número ideal en desktop con ancho real en móvil. Probar truncamiento y el acceso al resto.
3. **Advanced filters:** si el dataset no incluye liquidez o volumen realistas, ocultar esas opciones hasta que exista soporte coherente, no inventar acciones.
4. **Status:** distinguir claramente «evento en directo» de «mercado abierto para operar».
5. **Search aliases:** suficientemente inteligente sin una feature de IA artificial; los sinónimos están definidos en datos demo.
6. **Listado por evento:** abre Detail y se define a continuación si hay encabezado de evento + múltiples mercados o se resuelve como una sola página de mercado según la complejidad.

**Recomendación de cierre:** avanzar a Market Detail con Explore v1 propuesta como referencia, y volver a afinar únicamente si el detalle de mercado exige cambios en la estructura de resultados.

## 03D. EXPLORE — referencia visual elegida (opción B)

**Estado: [APROBADA COMO REFERENCIA VISUAL, NO COMO ESPECIFICACIÓN FUNCIONAL FINAL]**. Tras comparar variantes de Explore, la usuaria eligió expresamente la **opción B**. La primera iteración de mejora se desvió de esa elección; la última imagen recupera su composición y fue aceptada el 9/10/2026. **No sustituirla por la variante de filas sin agrupación.**

**Imagen aprobada:** `a_clean_modern_dark_themed_ui_ux_screenshot_of_a.png` (junto a este documento).

![Explore — opción B aprobada](a_clean_modern_dark_themed_ui_ux_screenshot_of_a.png)

**Patrones visuales que conservar:** cabecera/hero panorámico integrado en el ambiente de Home; categorías ilustradas como accesos claros; filtros laterales en desktop; resultados agrupados por tema (Politics, Sports, Crypto, Tech & AI) con miniaturas y porcentajes escaneables; ritmo de secciones, aire y contraste. Los valores y nombres de mercados del mockup son **placeholders**, varios con fechas antiguas, no fixtures ni requisitos definitivos.

### Variante adicional de Explore: filtros colapsados por defecto (9/10/2026)

**[PREFERENCIA DE USABILIDAD CONFIRMADA]** La usuaria considera que el panel lateral de filtros debe estar **colapsado al entrar**, para reducir intimidación y dejar protagonismo a las categorías y los resultados. Esta variante **se conserva junto a la opción B anterior**, no la sustituye ni elimina el estado expandido. La imagen nueva ilustra el estado inicial.

**Referencia de filtros colapsados:** `a_sleek_dark_futuristic_ui_dashboard_website_moc.png`.

![Explore — filtros colapsados por defecto](a_sleek_dark_futuristic_ui_dashboard_website_moc.png)

**Comportamiento propuesto:** botón visible `Filters` con chevron; expandir abre el mismo panel completo de la referencia B, cerrar recupera el listado ancho sin perder filtros activos; mostrar contador solo de filtros aplicados de verdad; `Reset` accesible al expandir; estado accesible por teclado y mobile como drawer/bottom sheet. En la imagen aparece un contador `2` sin filtros evidentes: **no copiarlo literalmente**; el contador debe derivarse de estado real. Al cambiar categoría, los resultados se filtran de verdad; evitar datos caducados del mockup.

**Ajustes pendientes del spec 03C:** la referencia elegida SÍ tiene hero y categorías ilustradas, a diferencia de la recomendación inicial de 03C. Por tanto, para futuras exploraciones visuales prevalece la opción B. Debemos resolver si el hero y las agrupaciones por tema se muestran solo en `All markets` (estado editorial inicial), y si al filtrar por una categoría o buscar se pasa a un listado único más eficiente. **Propuesta:** sí; así mantenemos el carácter visual sin penalizar tareas de búsqueda. No presentar esta decisión como aprobada todavía. Los filtros visibles exactos y el selector de vista también siguen abiertos.

---

## 03E. MARKET DETAIL — investigación y propuesta funcional v1 (9/10/2026)

**Estado:** [PROPUESTA A VALIDAR]. No confundir este esquema con una decisión de diseño cerrada. Es la siguiente pantalla crítica del producto: debe ofrecer una primera lectura muy clara sin eliminar la profundidad de un mercado real.

### 3E.1 Evidencias del benchmark

| Producto | Comportamiento confirmado | Qué aprovechar | Límite / oportunidad |
|---|---|---|---|
| Polymarket | La probabilidad visible puede ser un punto medio bid/ask y no el precio al que se ejecuta; contratos Yes/No, órdenes límite, order book y reglas de resolución publicadas. | Precio/probabilidad protagonista, profundidad de órdenes y resolución verificable. | Diferenciar siempre **probabilidad indicada** de **precio de compra/venta**. |
| Kalshi | Reglas y fuente de resolución, gráfico de precio y forecast, order book, Quick Order y Limit Order; Kalshi Pro reúne chart, book y panel de operación. | Complejidad bajo demanda; reglas accesibles; orden rápida y límite. | No trasladar una mesa de trading completa a la vista inicial. |
| DraftKings Predictions | Flujo Find market → Make prediction → Manage position; Trade Slip contextual, probabilidad y potencial de pago. | Trade Slip accesible, flujo comprensible y selección por evento/mercado. | Evitar que el usuario confunda contratos con apuestas a cuotas fijas. |
| FanDuel Predicts | Flujo Yes/No → importe → Hold/Sell → resultado, con payout visible; documentación pública limitada para detalle visual interno. | Explicación breve de cada paso y salida anticipada clara. | No atribuir componentes internos no comprobados. |

**Fuentes oficiales:**
- Polymarket, precio vs bid/ask: https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated
- Polymarket, reglas: https://help.polymarket.com/en/articles/13364548-how-are-markets-clarified
- Polymarket, órdenes límite: https://help.polymarket.com/en/articles/13364444-limit-orders
- Kalshi, reglas: https://help.kalshi.com/en/articles/13823822-market-rules
- Kalshi, resumen de reglas: https://help.kalshi.com/en/articles/13823823-rules-summary
- Kalshi, order book: https://help.kalshi.com/en/articles/13823828-the-orderbook
- Kalshi, quick orders: https://help.kalshi.com/en/articles/13823810-quick-orders
- Kalshi, limit orders: https://help.kalshi.com/en/articles/13823811-limit-orders
- Kalshi Pro, charts: https://alpha.kalshi.com/pro/help/charts
- Kalshi Pro, order panel: https://prod-like.kalshi.com/pro/help/the-order-panel
- DraftKings, cómo operar: https://predictions.draftkings.com/en/how-to-trade-predictions-availability
- DraftKings, página pública y Trade Slip: https://predictions.draftkings.com/
- FanDuel, funcionamiento: https://www.fanduel.com/predicts

**Señales cualitativas, NO representativas:**
- Un usuario de Polymarket menciona dificultad para encontrar order book (julio 2026): https://www.reddit.com/r/Polymarket/comments/1v0xa2x/how_come_i_cant_access_the_orderbook/
- Otros mencionan problemas de gestión/visibilidad de órdenes (septiembre 2026): https://www.reddit.com/r/Kalshi/comments/1wt3jbm/polymarket_ui/
- Kalshi recibe críticas sobre actualizaciones que dificultan órdenes/posiciones (agosto 2026): https://www.reddit.com/r/Kalshi/comments/1vhy124/new_update_is_absolutely_horrendous_to_use/
- Estudio cualitativo sobre dificultades para interpretar probabilidad, liquidez y visualizaciones: https://arxiv.org/abs/2608.16814

### 3E.2 Principio: una pantalla, dos profundidades

**No duplicar la página con dos modos incompatibles.** Propuesta: `Overview` como estado por defecto y `Market data / Advanced` como panel expandible o pestaña secundaria; el Trade Slip sigue accesible desde ambos. El usuario no pierde selección, importe ni contexto al profundizar.

**Primera lectura (5–10 segundos):**
1. Pregunta exacta y categoría; estado y fecha de cierre.
2. Resultados elegibles con **probabilidad indicativa** por resultado (en binarios, Yes/No; en multiresultado, lista de opciones).
3. **Gráfico grande, interactivo y legible** del resultado seleccionado con intervalos `1D / 1W / 1M / ALL` (propuesta).
4. CTA contextual `Buy Yes` / `Buy No` o `Trade` según resultado, que abre/actualiza Trade Slip, **sin ejecutar directamente**.
5. Resumen breve y visible de «Qué tiene que pasar para que gane» + enlace `Full rules`.
6. Contexto editorial breve (noticia/evento relevante) cuando exista y esté respaldado en fixtures.

**Segunda profundidad (sin abandonar la pantalla):**
- Order book bid/ask, spread, liquidez y volumen; trades recientes.
- Historial detallado / gráficos más precisos, comparación de resultados y, cuando proceda, datos subyacentes (p. ej., indicador macroeconómico frente al umbral del contrato).
- Reglas completas: fuente, deadline, zona horaria, excepciones, resolución, controversias y anulación.
- Órdenes límite y estado de órdenes pendientes.
- Noticias y contexto, con fuentes y fechas; `Why moved?` solo como hipótesis de módulo visual contextual, nunca como causalidad afirmada sin evidencia.
- Posición propia y órdenes activas, si existen, sin esconderlas al navegar.

### 3E.3 Esquema de layout propuesto

**Desktop:** cabecera con pregunta/estado; contenido principal con resultado + chart; Trade Slip fijo o sticky en columna lateral; debajo, `Overview / Market data / Rules / Activity` como áreas secundarias. El orden book NO compite inicialmente con el chart. En mobile, pregunta + resultados + chart primero; CTA de operación persistente abre bottom sheet de revisión; detalles avanzados en acordeones o tabs accesibles.

**Jerarquía de información** (NO decisiones de color): pregunta → outcome → probabilidad → evolución → reglas resumidas → operación. La información de ejecución real (ask/bid, fees, importe, max loss, payout) debe estar inequívoca en el Trade Slip antes de confirmar, aunque la probabilidad mostrada en el gráfico sea un precio indicativo distinto.

### 3E.4 Tipos de mercado y variantes

- **Binary Yes/No:** una pregunta y dos lados. Gráfico de probabilidad de Yes; selector de lado para operar.
- **Multi-outcome:** varias opciones (p. ej. ganador de premio o elección). Ordenar por probabilidad, permitir expandir `Show all`, seleccionar outcome y consultar su chart; no asumir que cada opción es una cuota tradicional.
- **Threshold / range:** p. ej. «BTC above $X by date»; mostrar umbral, fecha exacta y valor subyacente contextual si existe. La liquidación depende de reglas específicas, no del gráfico.
- **Sports:** puede tener resultado y estado en directo, pero sin convertir la plantilla generalista en un sportsbook.

### 3E.5 Estados obligatorios y continuidad

- Open, Live, Suspended, Closed, Pending resolution, Resolved, Voided, con CTA y reglas adaptados.
- Con/sin posición, guardado/no guardado, con/sin noticias, mercado ilíquido, variación brusca de precio, resultado multi-outcome largo.
- En suspensión y resolución no debe poderse comprar; al reabrir se actualizan precios.
- Si cambia el precio entre selección y confirmación, recalcular y pedir confirmación explícita.
- En compras rápidas simuladas: precio ejecutable y liquidez simplificada consistentes. Si simulamos orden límite, permitir pendiente, cancelación y fill reproducible; no fingir ejecución inmediata garantizada.
- No inventar un “porcentaje objetivo” como certeza: probabilidad implícita ≠ verdad estadística.

### 3E.6 Features: qué priorizar

**P0 propuesto:** pregunta/estado, outcomes, chart, resumen de reglas, Trade Slip conectado, compra/venta simulada, posición del usuario, bookmark, estados y responsive.

**P1 propuesto:** Market data avanzada (bid/ask, book, volumen, liquidez), noticias con fecha/fuente, anotaciones de eventos sobre chart, límite de precio, historial y reglas completas.

**P2 / por explorar:** IA `Explain this move` con evidencias visibles y lenguaje probabilístico, vídeo contextual, overlays de datos, comparador de escenarios, comentarios. **No introducir un chatbot flotante por defecto.**

### 3E.7 Decisiones que debe revisar la usuaria

1. ¿Market Detail con **Overview + Advanced integrado** (recomendación) o pestañas `Overview / Trading / Analysis`?
2. ¿Chart grande como protagonista visual, con resultados encima y ticket al lado (recomendación), o lista de outcomes como bloque principal?
3. ¿Noticias/contexto debajo del gráfico o un bloque contextual de lectura rápida cerca del titular?
4. ¿Trading básico en la misma pantalla (recomendación), con order book y órdenes límite ocultos hasta solicitar profundidad?

### 3E.8 Acceptance criteria iniciales

- Desde Home y Explore, abrir el mercado correcto y preservar outcome o intervalo cuando proceda.
- Cambiar resultado modifica coherentemente precio, gráfico y Trade Slip.
- Abrir Advanced no resetea el estado ni desplaza el CTA fuera de alcance.
- Reglas resumidas accesibles antes de confirmar, completas con un gesto adicional.
- Probabilidad indicativa y precio de ejecución diferenciados en lenguaje y cálculos.
- Compra, venta y portfolio muestran cantidades y resultados coherentes con un estado compartido.
- Suspensión/resolución bloquean órdenes nuevas; mobile completa los mismos flujos.

---

## 04. Mapa de flujos (borrador de planificación, NO cerrado)

1. **Home / Discover** — encontrar oportunidades, temas, tendencias.
2. **Category / Explore** — refinar mercados mediante búsqueda, filtros y ordenación.
3. **Market Detail** — resumen comprensible, gráficos, noticias/reglas/datos, vistas avanzadas.
4. **Trading** — Yes/No y multiresultado, comprar/vender, revisar y confirmar.
5. **Portfolio** — posiciones, valor actual, P&L, órdenes, historial y resolución.
6. **Global Experience** — navegación persistente, búsqueda, watchlist, preferencias, notificaciones, estado de demo.

Las subsecciones corresponden a responsabilidades y **no implican una página independiente cada una**. Se decidirá cuando especificamos el flujo.

## 05. Conceptos diferenciales — aparcados para análisis posterior

- **Market Intelligence / Why moved:** contextualización de variaciones mediante una timeline de movimientos y fuentes; la IA solo si resuelve una necesidad que las fichas de contexto no cubren. La plataforma debe distinguir correlación de causalidad.
- **Visual-first advanced insights:** gráficos con eventos, comparaciones, data overlays y microinteracciones; primero interacción base funcional, luego estética/motion.
- **Modes vs progressive disclosure:** evaluar si conviene una vista general + panel avanzado integrado frente a dos interfaces completamente separadas; observar arquitectura de Kalshi Pro sin copiarla automáticamente.

No convertir estos conceptos en requisitos P0 todavía.

## 06. Reglas iniciales de la demo (confirmadas en intención, pendientes de detalle)

- No se requiere capital real, KYC, fiat/crypto wallets ni integración operativa con exchanges.
- Operaciones y estados *dentro del prototipo* sí serán funcionales: saldo virtual, selección de contrato, compra/venta, actualización de posiciones, historial, liquidación y persistencia.
- Precios/resultados ficticios pero reproducibles, desde fuente única de datos.
- El usuario puede recorrer flujos completos mediante escenarios de demo sin esperar eventos reales.
- Toda la experiencia debe identificar datos y saldo como **simulados**.
- Tecnologías candidatas: React/Next.js + TypeScript + shadcn/ui + Tailwind + state store + pruebas automáticas, pero stack final al concluir el documento.

## 07. Registro de decisiones

| ID | Fecha | Estado | Decisión |
|---|---|---|---|
| D-001 | 2026-10-09 | **Aprobada** | Prediction market **generalista**; no limitar a deportes/iGaming sportsbook |
| D-002 | 2026-10-09 | **Aprobada** | Benchmark e inspiración selectiva de Polymarket, Kalshi, DraftKings Predictions y FanDuel Predicts |
| D-003 | 2026-10-09 | **Aprobada** | Minimalismo e intuitividad con profundidad funcional progresivamente accesible |
| D-004 | 2026-10-09 | **Aprobada** | Ambición visual muy alta; branding/identidad se decidirán después |
| D-005 | 2026-10-09 | **Aprobada** | Demo funcional simulada con Claude Code; primero blueprint, después implementación |
| D-006 | 2026-10-09 | **Aprobada** | **Home editorial curada y Explore separado con catálogo, búsqueda y filtros avanzados** |
| D-007 | 2026-10-09 | **Aprobada** | Producto aspiracional `Apple of prediction markets`: cuidado, visualmente impactante y no abrumador, sin perder potencia |
| H-001 | 2026-10-09 | **Propuesta v1** | Home con Featured + Explore Topics + Trending Now + Market Movers + salida a Explore |
| H-002 | 2026-10-09 | **Propuesta v1** | Featured único sin rotación automática ni trade directo |
| H-003 | 2026-10-09 | **Propuesta v1** | Cards Home llevan a Detail; guardado es acción secundaria |
| H-004 | 2026-10-09 | **Propuesta v1** | All Markets, Breaking, New, Ending Soon, Highest Volume en Explore, no bloques permanentes de Home |
| H-005 | 2026-10-09 | **Propuesta v1** | Card minimal muestra pregunta + outcome + probabilidad; datos avanzados accesibles al profundizar |
| H-006 | 2026-10-09 | **Parcialmente superada** | Featured puede usar vídeo/animación; en Movers se suprimen sparklines para disminuir ruido visual |
| D-008 | 2026-10-09 | **Aprobada** | Home usa la última imagen oscura e inmersiva como referencia visual; el hero llega a la navegación superior |
| D-009 | 2026-10-09 | **Aprobada** | Listados de Trending/Biggest Movers en Home sin sparklines por fila: porcentaje y variación escaneables |
| D-010 | 2026-10-09 | **Aprobada** | Explore usa como referencia visual la **opción B recuperada**, `a_clean_modern_dark_themed_ui_ux_screenshot_of_a.png`; las variantes de lista plana NO son la elección |
| E-005 | 2026-10-09 | **Pendiente** | Resolver si el hero y los grupos por categoría de Explore se muestran solo en `All markets` y desaparecen con filtros/búsqueda |
| M-001 | 2026-10-09 | **Propuesta v1** | Market Detail: Overview visual con chart protagonista, Trade Slip contextual y Advanced accesible bajo demanda |
| E-001 | 2026-10-09 | **Propuesta v1** | Explore plantilla única para catálogo y categorías; selección y subtemas contextuales |
| E-002 | 2026-10-09 | **Propuesta v1** | Tres controles primarios: Topic, Status, Sort; More Filters revela estructura/fecha/actividad |
| E-003 | 2026-10-09 | **Propuesta v1** | Lista de resultados por evento/pregunta sin trade rápido; profundidad al entrar en Detail |
| E-004 | 2026-10-09 | **Propuesta v1** | Búsqueda global con aliases/tags, filtros en URL, vacíos y guardado persistente |

## 08. Fuentes y fiabilidad de la investigación Home (9/10/2026)

**Primarias — estructura/funciones:**

1. Polymarket — https://polymarket.com/ (portada pública, actualidad dinámica).
2. Polymarket categorías — https://polymarket.com/predictions/news.
3. Kalshi — https://kalshi.com/ (portada pública, actualidad dinámica).
4. Kalshi Pro — https://kalshi.com/pro.
5. Kalshi Pro docs — https://alpha.kalshi.com/pro/help/get-started.
6. Kalshi Pro Canvas — https://pro.kalshi.com/pro/help/canvas-workspace.
7. DraftKings Predictions — https://predictions.draftkings.com/en/.
8. FanDuel Predicts — https://www.fanduel.com/predicts (landing promocional, NO home in-app).
9. Apple App Store DraftKings Predictions — https://apps.apple.com/us/app/draftkings-predictions/id6747457568?platform=iphone&see-all=reviews.
10. Apple App Store FanDuel — https://apps.apple.com/us/app/fanduel-predicts/id6747883721?platform=ipad.

**Secundarias / opiniones (usar como señales, no hechos generales):**

11. Kalshi, debates sobre UI — https://www.reddit.com/r/Kalshi/comments/1vcrdoc/feel_like_they_keep_making_the_app_look_more/.
12. Kalshi, cambios de navegación — https://www.reddit.com/r/Kalshi/comments/1vtw8gj/stop_with_the_ui_update/.
13. Kalshi, detalle de posición — https://www.reddit.com/r/Kalshi/comments/1vkdmhf/cant_believe_this_terrible_ui_comes_back/.
14. Polymarket, comentario sobre órdenes — https://www.reddit.com/r/Kalshi/comments/1wt3jbm/polymarket_ui/.
15. FanDuel reviews Google Play — https://play.google.com/store/apps/details?id=com.fanduel.flywheelnativecontainer.futures.
16. FanDuel review comparativa — https://www.gambling.com/us/prediction-markets/reviews/fanduel-predicts.
17. Beginner opinions — https://www.reddit.com/r/PredictionMarkets/comments/1v75zjg/whats_the_best_platform_for_a_beginner/.

**Nota de fiabilidad:** La investigación de web y descripciones de producto sirve para crear hipótesis robustas, pero la especificación detallada de interacciones visuales requerirá revisar capturas o interfaces accesibles, y validar por separado las funciones más sensibles.

## 09. Próxima iteración del documento

- Revisar la **propuesta funcional Explore/Categories v1** (véase capítulo 03C): taxonomía, 3 filtros visibles y diseño de filas de resultados.
- Después abordar **Market Detail** en profundidad (vista principal + información avanzada + relaciones evento/mercado/contrato).
- Mantener Home como referencia visual aprobada, sin confundir el contenido decorativo de la imagen con una especificación funcional ya cerrada.
- Mantener este archivo y ampliar versión/fecha. **Lo aprobado prevalece sobre hipótesis** si se entrega a Claude Code.

---

**Changelog**
- **v0.6 — 2026-10-09**: se conserva Explore opción B y se añade una segunda captura de Explore con filtros colapsados por defecto, preferencia expresada por la usuaria. Se documenta la interacción de expansión y persistencia.
- **v0.4 — 2026-10-09**: benchmark específico de Explore/Categories + spec v1 detallada (taxonomía, navegación, filtros, ranking, search, resultados, estados, modelo de datos y criterios de aceptación). Se consolidan Home hero integrado con top bar y listas sin sparklines. Imagen visual embebida como referencia en el Markdown.
- **v0.2 — 2026-10-09**: La usuaria confirma Home y Explore separados y el posicionamiento visual aspiracional, «Apple de los prediction markets». Home v1 ahora especifica 4 bloques, jerarquía, reglas de cards, estados, navegación, dataset, criterios de aceptación y referencias; las propuestas no confirmadas siguen etiquetadas.
- **v0.1 — 2026-10-09**: brief ratificado desde la conversación, benchmark competitivo enfocado a Home, evidencia/restricciones de observación, propuesta Home, backlog de decisiones, mapa de flujos y fuentes.


## 03F. MARKET DETAIL — segunda comprobación del benchmark y correcciones (9/10/2026)

**Estado**: investigación reforzada con fuentes oficiales verificadas, NO validación integral de la UI autenticada ni estudio con usuarios. **La primera imagen de Market Detail generada este día es solo boceto exploratorio, NO diseño aprobado**.

### Evidencia concreta recuperada

1. **Polymarket — probabilidad ≠ precio ejecutable.** El porcentaje mostrado puede ser el punto medio entre mejor compra y mejor venta; si el spread es superior a 10 céntimos, se muestra el último precio negociado. Ejemplo oficial: `37%` para bid 34¢ / ask 40¢. Fuente: https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated
2. **Polymarket — reglas y operativa.** Resolución de contratos con reglas predefinidas y Oracle UMA; las posiciones ganadoras cobran $1 por participación, las perdedoras $0. Vender antes es posible si hay contraparte; las órdenes límite pueden quedar pendientes y ejecutarse parcialmente. Fuentes: https://help.polymarket.com/en/articles/13364518-how-are-prediction-markets-resolved ; https://help.polymarket.com/en/articles/13364247-can-i-sell-early ; https://help.polymarket.com/en/articles/13364444-limit-orders
3. **Kalshi — resumen de reglas y fuente de verificación.** En cada mercado se muestran criterios de resolución, variable/fecha y fuente, con acceso a la regla completa. Fuente: https://help.kalshi.com/en/articles/13823822-market-rules ; https://help.kalshi.com/en/articles/13823823-rules-summary
4. **Kalshi — order book y coste de ejecución.** El libro muestra bids/asks y volumen por nivel de precio; una Quick Order se intenta ejecutar al mejor precio disponible, pero una orden grande puede tomar varios niveles. Las comisiones difieren por mercado. Fuentes: https://help.kalshi.com/en/articles/13823828-the-orderbook ; https://help.kalshi.com/en/articles/13823812-quick-order-purchase ; https://help.kalshi.com/en/articles/13823805-fees
5. **Kalshi Pro — profundidad real.** Charts, order book, tickets, órdenes/posiciones persistentes, orden sobre el gráfico; experiencia especializada más densa, no deseable como estado por defecto. Fuente: https://alpha.kalshi.com/pro/help ; https://kalshi.com/pro/help/canvas-workspace
6. **DraftKings Predictions — flujo y trade slip.** Descubrir mercado, elegir Yes/No, gestionar la posición. Páginas públicas verificables de mercados muestran `Trade Slip` contextual con lado elegido, importe, `You're Buying` y `Payout`. **La mayoría de estas páginas no exponen gráficas detalladas ni vistas privadas completas; no extrapolar.** Fuentes: https://predictions.draftkings.com/en/how-to-trade-predictions-availability ; https://predictions.draftkings.com/en/featured/ufc-328/market-groups/DKP3-SPUFCFLMLXALWAZRRAFF/markets/DKP3-SPUFCFLMLXALWAZRRAFF-WXALWB0FIQ/trade
7. **FanDuel Predicts — flujo explícito.** Yes/No, monto/riesgo con payout, hold o sell early si es posible, liquidación. **Sin evidencia suficiente de la pantalla de mercado autenticada**. Fuente: https://www.fanduel.com/predicts
8. **Investigación cualitativa 2026:** análisis temático de posts de r/Kalshi observa dificultades de interpretación de probabilidades, incertidumbre, gráficos, credibilidad y liquidez. No es un experimento de usabilidad del concepto ni una medida poblacional. Fuente: https://arxiv.org/abs/2608.16814

### Auditoría crítica del mockup inicial (NO aprobado)
- **Error grave temporal:** un mercado de elección presidencial de EE. UU. de 2024 aparece `LIVE` aunque hoy es 9/10/2026. No reutilizar ese fixture como mercado abierto ni usar fechas incoherentes.
- **Sobrecarga:** ticker de métricas, chart de dos líneas, noticias, book, recent trades, reglas y stats aparecen simultáneamente; rompe principio `simple by default`.
- **Trading no completamente transparente:** cifra de 56% y compra de Yes a 56¢ mostradas idénticas sin spreads ni fees; falta distinguir indicador de precio ejecutable, pérdida máxima, beneficio neto, payout total y confirmación.
- **Causa aparente pero no probada:** titulares de noticias al lado del gráfico no demuestran que explican la evolución. Contexto debe citar fecha/fuente y usar lenguaje hipotético cuando sea necesario.
- **Señales visuales confusas:** duplicidad de controles `Price / Probability`; evitar representar dos métricas casi equivalentes sin explicación exacta.
- **No es un PRD ni una revisión de todas las interfaces autenticadas:** no presentarlo como conclusión visual definitiva.

### Recomendación refinada: arquitectura propuesta pendiente de aprobación

**Above the fold (desktop):** breadcrumb, pregunta exacta, estado + cierre/resolución, outcomes y probabilidad indicativa; chart protagonista; **ticket contextual** lateral con Buy Yes/No, importe, precio estimado real, fees, payout total, beneficio neto si gana, pérdida máxima y botón `Review trade`. Con estado de posición se habilita `Sell / Manage position` sin eclipsar Buy.

**Contexto imprescindible visible:** pequeña tarjeta `What determines the outcome?` con criterio y fuente; acceso a Full rules. Los traders no deben tener que rebuscar la regla de resolución.

**Debajo / on demand:** `About & Rules`, `News & Context`, `Market data` (liquidez, volumen, spread, order book, recientes y limit orders), `Your activity`. No presentar todos los módulos abiertos. Los movimientos del gráfico pueden enlazar noticias **sin afirmar causalidad no contrastada**. La separación exacta de tabs y acordeones por resolver.

**Flujo de compra, sin fingir ejecución:** Select outcome → select side → enter amount/contracts → Review (ask, fees, payout, net upside, max loss, slippage risk) → Confirm demo → filled/partial/unfilled → Portfolio. Solo habilitar órdenes en mercados `Open`. Una limit order puede quedar `Pending` y debe poder cancelarse. Sell Early significa cerrar a bid disponible, no cobrar payout de resolución.

**Modelo**: fixtures de fechas actuales/futuras (a octubre 2026) para operaciones; mantener eventos históricos únicamente en estado Resolved y fuera de las recomendaciones Live. La información de precios, payout y contrato debe ser matemáticamente consistente; los fixtures, noticias y gráficos simulados identificados como simulación.

**Decisiones abiertas**: (a) pantalla Overview+Advanced o tabs; (b) si chart muestra una serie Yes por defecto, permitiendo alternar, en lugar de 2 series sobrepuestas; (c) ubicación exacta de regla/resolución antes de operar; (d) compra básica y limit orders; (e) cómo se explica brevemente la liquidez sin asustar.


## 03G. MARKET DETAIL — referencia visual aprobada y conclusiones

**Estado:** [APROBADO COMO REFERENCIA VISUAL] el **segundo** mockup de la ronda de simplificación de Market Detail, elegido expresamente el 9/10/2026. No confundirlo con el primer mockup más técnico de esa ronda, ni con la primera imagen de detalle.

**Archivo de referencia:** `a_dark_sleek_modern_ui_dashboard_in_a_neon_glow.png`

![Market Detail — segunda versión simplificada aprobada](a_dark_sleek_modern_ui_dashboard_in_a_neon_glow.png)

### Qué conservar

- Hero editorial integrado con el lenguaje visual oscuro y cinematográfico de Home y Explore.
- Jerarquía: **pregunta → dos outcomes con probabilidades → gráfico grande → ticket simple**.
- Overview por defecto y navegación secundaria `News / Market data / Rules`, en lugar de desplegar todo el terminal financiero a la vez.
- Trading lateral simple, legible, con Buy Yes / Buy No, importe y CTA dominante; información de contexto en módulos secundarios de menor peso.
- Pocas métricas en primer plano y visualización comprensible sin formación en mercados financieros.
- La profundidad existe, pero se revela al entrar en pestañas o en el flujo de operación.

### Correcciones antes de implementación

- **No fijar como datos reales** los candidatos, porcentajes, titulares, volumen ni fuentes de la captura: son elementos de un mockup conceptual. La pregunta y reglas del mercado deben ser precisas; un mercado multi-candidato no debe simplificarse engañosamente a dos personas si hay más opciones.
- El CTA `Buy Yes` necesita **resultado exacto seleccionado**; el trade slip debe indicar precio de compra ejecutable, fee, payout, beneficio neto y pérdida máxima antes de confirmar.
- La probabilidad del outcome no se debe confundir con el precio al que realmente se puede operar.
- El mercado 2028 es un ejemplo temporalmente plausible, pero no asumir candidaturas ni datos reales de 2028.
- Evitar un indicador de `market sentiment` que simplemente replique la probabilidad: añade ruido y puede inducir a error.
- Evitar titulares simulados atribuidos a medios reales sin etiquetado claro.
- **Conclusión visual:** la segunda versión simplificada es mejor referencia que la primera técnica; mantener el enfoque de descubrimiento visual y disclosure progresivo.

---

## 03H. TRADING — benchmark y especificación funcional propuesta v1

**Estado:** [INVESTIGACIÓN + PROPUESTA, NO APROBADA TODAVÍA]. El usuario pidió avanzar a Trading tras aprobar Market Detail. No generar imagen antes de validar flujo y jerarquía.

### Qué hacen los competidores (fuentes oficiales ya contrastadas)

| Producto | Mecánica observada/documentada | Aprendizaje para el concepto |
|---|---|---|
| Polymarket | Contratos Yes/No, compra y venta anticipada con contraparte, bid/ask y órdenes límite que pueden quedar abiertas o parcialmente ejecutadas. | No presentar el precio indicativo como precio ejecutable ni prometer venta inmediata. |
| Kalshi | Quick Order y Limit Order; profundidad de libro, posibles ejecuciones a distintos niveles, comisiones según mercado y gestión de órdenes. | Una operación sencilla por defecto, detalle de ejecución y control avanzado opcional. |
| DraftKings Predictions | Trade Slip contextual con selección, importe y posible payout, junto a gestión posterior de la posición. | Explicar las consecuencias monetarias con lenguaje directo. |
| FanDuel Predicts | Elegir Yes/No, cantidad, mantener o vender anticipadamente, y cobrar tras la resolución según reglas. | La decisión principal se puede presentar sin jerga, pero la salida anticipada debe ser visible. |

Fuentes oficiales:
- https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated
- https://help.polymarket.com/en/articles/13364247-can-i-sell-early
- https://help.polymarket.com/en/articles/13364444-limit-orders
- https://help.kalshi.com/en/articles/13823812-quick-order-purchase
- https://help.kalshi.com/en/articles/13823811-limit-orders
- https://help.kalshi.com/en/articles/13823805-fees
- https://predictions.draftkings.com/en/how-to-trade-predictions-availability
- https://www.fanduel.com/predicts

**Límite metodológico:** la evidencia pública confirma las mecánicas, no una auditoría completa de todas las interfaces autenticadas. No atribuir flujos internos precisos de FanDuel/DraftKings sin evidencia.

### Propuesta de experiencia — compra

**Entrada:** Market Detail → outcome seleccionado (p. ej., candidato X) → lado `Yes`/`No` → `Buy` → cantidad en moneda virtual.

**Ticket compacto visible:** nombre del outcome, `Buy Yes` o `Buy No`, probabilidad indicativa, **precio estimado por contrato** (ask), cantidad a invertir, número estimado de contratos y un resumen muy breve: `Cost`, `Max payout`, `Net profit if correct`, `Max loss`, `Estimated fees`. Explicar en tooltip el significado de `Yes` y de los contratos. Si la demo no implementa comisiones, usar 0 de forma explícita, no inventar una tarifa arbitraria.

**CTA:** `Review trade`, no compra instantánea. En la revisión se confirma outcome, lado, cantidad, precio estimado, fees, posible beneficio neto, pérdida máxima y qué determina el resultado. La acción final `Confirm demo trade` cambia wallet y portfolio solo tras confirmación.

**Resultado:** success con precio real simulado, participaciones adquiridas y acceso `View position`; si no hay liquidez suficiente, comunicar parcial/pending o bloquear de forma explicable. Simular escenarios reproducibles, no cambios de precio aleatorios en cada clic.

### Propuesta de experiencia — venta anticipada

**Entrada:** Market Detail o Portfolio → `Your position` → `Sell`.

**Ticket:** contratos que posee, precio estimado de venta **bid**, cantidad a vender (todo o parte), efectivo que recibiría, fees y **P&L realizado estimado** frente al coste de adquisición. No confundir este importe con payout final si gana. `Review sale` → `Confirm sale` → actualizar posición, wallet e historial.

**Restricciones:** no vender más contratos de los que se poseen; un mercado suspendido puede impedir operar; el precio bid puede ser distinto del ask; liquidez insuficiente puede impedir cerrar toda la posición.

### Profundidad avanzada (solo bajo demanda)

- `Advanced order` / `Limit`: precio límite, número de contratos, estimación de coste y estado `Open / Partially filled / Filled / Cancelled`.
- Ver libro de órdenes y spread; cancelar órdenes pendientes.
- No añadir stop loss, leverage, margen, apuestas combinadas ni productos derivados en v1 sin evidencia de valor y alcance.
- Una única experiencia coherente; no un modo `Pro` totalmente independiente.

### Cálculo y simulación (ejemplo simple SIN comisiones)

Contrato binario: paga **$1** si acierta y **$0** si falla. Si la compra se ejecuta a 40¢ por contrato y el usuario adquiere 100 contratos:
- Coste = $40; payout máximo al resolver = $100; beneficio neto máximo = $60; pérdida máxima = $40.
- Si el bid de venta anticipada es 48¢, vender 100 contratos devuelve $48 y realiza **+$8**, independientemente de que el mercado luego gane o pierda.
- Con fees, descontarlas donde corresponda y explicar la base de cálculo.
- No usar `probabilidad × cantidad` como si fuese el retorno garantizado; no llamar `profit` al payout bruto.

**Reglas de precisión:** si se introduce importe en dólares, calcular contratos comprables con el precio real simulado; si se introduce contratos, calcular coste. Escoger UNA modalidad primaria de entrada y mantener consistencia en el ticket. Si la cantidad no es entera, decidir explícitamente si la demo soporta fracciones o redondea hacia abajo. No presentar una cifra exacta de contratos antes de fijar esa política.

### Estados y errores imprescindibles

Saldo insuficiente; mercado cerrado/suspendido; cambio de precio antes de confirmar; liquidez insuficiente; orden parcialmente ejecutada; orden pendiente; orden cancelada; venta sin posición; pérdida/beneficio realizado; confirmación y vuelta a portfolio. Todos con mensajes comprensibles, sin jerga innecesaria.

### Arquitectura de interacción propuesta

```text
Market Detail
 └─ Trade panel (simple)
      ├─ Choose outcome + Yes/No
      ├─ Buy / Sell (Sell solo con posición)
      ├─ Amount (saldo virtual)
      ├─ Estimated cost, max payout, max profit/loss, fee
      └─ Review trade
           ├─ Confirm → execution receipt → Portfolio
           └─ Back → mantiene selección e importe
      └─ Advanced order (expand)
           ├─ Limit price / contracts
           └─ Pending / partial / filled / cancel
```

### Decisiones que conviene cerrar antes de hacer mockup de Trading

1. **Recomendación:** el ticket simple integrado en Market Detail y una pantalla/modal de `Review`, en vez de llevar a otra página para empezar a comprar.
2. **Recomendación:** `Buy` por defecto y `Sell` visible si hay posición; `Limit order` en `Advanced`.
3. **Recomendación:** entrada por **importe** por defecto; cálculo de participaciones y resultado monetario debajo.
4. **Recomendación:** lenguaje de consumidor `If you're right, you could earn…`, pero siempre acompañado de coste, payout, fees y pérdida máxima, sin promesas.
5. **Pendiente:** decidir si usar un `drawer` lateral o un `modal` centrado para Review; en móvil, bottom sheet accesible.

### Criterios de aceptación Trading v1

- Cambiar outcome/Yes-No recalcula precio, contratos, payout y riesgo.
- `Review` no altera saldo; solo `Confirm` modifica cartera.
- Una venta parcial actualiza contratos restantes y P&L realizado.
- Precio visible en resultado coincide con ejecución simulada, y si varía se solicita reconfirmación.
- Órdenes límite pueden permanecer abiertas y cancelarse sin inventar un fill.
- La demo mantiene consistencia de wallet, órdenes, historial y Portfolio al navegar o recargar.
- Los estados de mercado bloquean correctamente operaciones no permitidas.



## 03I. TRADING — acuerdo confirmado y estados de interfaz (9/10/2026)

**Decisión [APROBADA] T-001:** El usuario aprueba explícitamente el flujo **Elegir → Revisar → Confirmar**, porque evita mostrar toda la información de golpe. Se mantiene el panel compacto dentro de `Market Detail`, y los detalles/cálculos completos aparecen en el segundo paso, antes de cualquier ejecución. Las funciones profesionales quedan bajo demanda. Esto confirma el enfoque progresivo descrito en 03H; no implica aprobación de cada detalle pendiente.

### Estados visibles y carga informativa

| Paso | Información que debe estar visible | Acción | No mostrar todavía |
|---|---|---|---|
| 1 · Elegir / Buy | Outcome identificado; Yes o No; precio estimado por contrato; importe editable; resumen rápido del potencial (payout o ganancias explicadas); CTA `Review trade` | Elegir lado e importe | Libro de órdenes, gráficos extra, volumen, cálculos extensos |
| 2 · Revisar compra | Resultado + Yes/No; número de contratos; precio ejecutable estimado; coste; comisión; retorno **máximo bruto** si acierta; beneficio **neto** potencial; pérdida máxima; resumen de condición de resolución; saldo tras operación | `Confirm demo trade` y `Edit` | Mercado completo detrás del modal |
| 3 · Confirmación | Estado `Trade placed`; cantidad ejecutada; precio final; total debitado; CTA `View position` y `Done` | Ir a Portfolio / volver al mercado | Upselling y campos complejos |
| 1b · Elegir / Sell | Posición existente, contratos poseídos, lado; contratos a vender; bid estimado; efectivo estimado a recibir; CTA `Review sale` | Elegir volumen de venta | Order book abierto por defecto |
| 2b · Revisar venta | Contratos vendidos / restantes; bid disponible; efectivo de venta; fees; P&L realizado estimado vs coste de esos contratos | `Confirm sale` y `Edit` | Beneficio como porcentaje sin desglose |
| 3b · Venta completada | Confirmación; efectivo abonado; P&L realizado; posición restante o cerrada | `View portfolio` / volver | Animación exuberante ante pérdidas |

### Reglas de comportamiento acordes al objetivo de sencillez

- **Una única decisión principal por paso.** El primer panel nunca dispara compra automáticamente: solo abre `Review`.
- En caso de cancelación de Review, mantener lado, cantidad y resultado seleccionado.
- Si el usuario no posee posición, `Sell` no debe fingir disponibilidad; mostrarlo deshabilitado con explicación o no mostrar la acción, según patrón posterior.
- Exponer detalles bajo `How is this calculated?` o `Price details`, pero nunca ocultar comisiones, pérdida máxima o condiciones del contrato en Review.
- Si el precio ejecutable cambia, suspender la confirmación y solicitar aceptación del nuevo coste.
- Estados deshabilitados claros: saldo insuficiente, mercado suspendido, mercado cerrado, sin liquidez, cantidad inválida.
- Por defecto, **orden inmediata simulada**, con `Limit order` y order book escondidos en `Advanced`, no otro modo profesional.
- En móvil, propuesta de bottom sheet para Review; en desktop, propuesta de modal centrado o drawer contextual. **No aprobado aún el contenedor exacto.**

### Guion visual de la referencia Trading

Crear un tríptico conceptual consistente con la **segunda imagen aprobada de Market Detail** (`a_dark_sleek_modern_ui_dashboard_in_a_neon_glow.png`): panel pequeño de elección, modal de revisión y estado de venta. Las imágenes generadas son referencias, no un contrato matemático: cualquier precio, beneficio o dato de ejemplo debe validarse en fixtures antes de implementarse.

### Pendiente de cerrar antes del MVP

- Dinero virtual inicial y política de fracciones de contratos.
- Regla de fees: 0 o una fórmula explicable y consistente.
- Buy/No y Sell/No con igual cobertura que Buy/Yes y Sell/Yes.
- Modal vs drawer de revisión en desktop, y presentación de cambios de precio.
- Escenario determinista de compra, venta parcial, orden límite y liquidación.

**Actualización de decisiones:** `[T-001, 9/10/2026, APROBADA] Trading en tres pasos con disclosure progresivo`.


### Storyboard Trading — primera exploración (NO aprobado visualmente)

**Referencia generada:** `a_wide_ui_design_mockup_composite_in_a_dark_moder.png`

![Trading — seleccionar, revisar, confirmar, vender, revisar venta y advanced](a_wide_ui_design_mockup_composite_in_a_dark_moder.png)

El storyboard recoge seis estados: (1) elegir/Buy; (2) revisar compra; (3) confirmación; (4) elegir/Sell; (5) revisar venta; (6) Advanced bajo demanda. **Es una primera exploración, no una imagen aprobada ni un requisito final.** Se basa en la dirección visual aprobada de Market Detail, con tres pasos de compra más estados de venta.

**Aviso de consistencia:** las cifras, acciones, etiquetas y balances de la imagen han sido generados visualmente y pueden presentar errores aritméticos o semánticos (especialmente shares/cost/fees y el copy de las revisiones). Claude Code deberá implementar cálculos a partir de contratos y precios reales de la simulación, siguiendo reglas de 03H y 03I, y no copiar números de la imagen. El botón `Confirm sell` no implica una venta inmediata si el mercado está ilíquido.


## 03J. TRADING — "Prediction-first": continuidad semántica de pregunta a posición (9/10/2026)

**Origen:** observación de producto de la usuaria tras ver el storyboard Trading. El usuario comienza respondiendo una pregunta natural y acaba leyendo `shares`, `contracts`, `order placed` y `position` sin conexión visible con aquello que predijo. El storyboard gusta visualmente, pero esta discontinuidad es un defecto UX que conviene resolver.

**Estado:** [INSIGHT CONFIRMADO POR LA USUARIA; SOLUCIÓN ESPECÍFICA PROPUESTA, AÚN NO APROBADA]. El storyboard se conserva como **referencia visual favorable con correcciones pendientes de copy**; no se descarta ni se reinterpreta como aprobado sin cambios.

### 3J.1 Investigación externa y límites

- **FanDuel Predicts**, landing oficial: secuencia `Make a prediction → Set your amount → Stay in or Cash out → Get paid`; habla de elegir Yes/No y cuánto arriesgar antes que de acciones; confirma que el framing coloquial es compatible con mecánica de contratos. Fuente: https://www.fanduel.com/predicts
- **DraftKings Predictions**, web oficial: `Find a market → Make a prediction → Manage your positions`. Usa lenguaje de predicción en presentación y de posiciones en gestión. Fuente: https://predictions.draftkings.com/en/how-to-trade-predictions-availability
- **Kalshi**, ayuda oficial `Quick Order Purchase`: la ejecución real requiere lado Yes/No, cantidad y contratos; permite expresar cantidad en dólares o número de contratos. No debemos ocultar esa información cuando afecta a ejecución. Fuente: https://help.kalshi.com/en/articles/13823812-quick-order-purchase
- **Polymarket**, ayuda oficial `What is Polymarket`: cada share ganador se liquida por $1 en contratos binarios estándar, y puede venderse antes de la resolución; esto justifica que el desglose técnico exista aunque no sea el titular. Fuente: https://help.polymarket.com/en/articles/13364060-what-is-polymarket
- **Robinhood Learn**, `What Are Event Contracts?` (20/03/2026): comprar No expresa que la condición precisa del contrato **NO** se cumpla, no necesariamente que gane un rival; advierte sobre escenarios alternativos y reglas de resolución. Fuente: https://robinhood.com/us/en/learn/articles/what-are-event-contracts/
- **Robinhood Learn**, `Profit vs. Payout` (20/03/2026): confusión entre payout bruto y beneficio; hay que dar ambas cifras y el coste base. Fuente: https://robinhood.com/us/en/learn/articles/profit-vs-payout-event-contracts/
- **NN/g**, `Match Between the System and the Real World`: priorizar lenguaje de usuario y orden mental natural, evitando jerga interna como primer contacto. Fuente: https://www.nngroup.com/articles/match-system-real-world/

**Conclusión de benchmark:** en materiales públicos se utiliza lenguaje natural para entrar, pero siguen visibles los términos técnicos al operar. Eso NO prueba mediante test comparativo que ningún competidor haya resuelto la continuidad perfectamente: la oportunidad es una **hipótesis de UX razonada, no una innovación validada con usuarios**. Tampoco es correcto decir que "comprar una predicción" elimina que se negocien contratos reales.

### 3J.2 Principio y patrón propuesto

**Prediction-first / Trading-second:** mantener durante TODO el journey una afirmación breve en lenguaje natural que represente exactamente el lado y outcome adquiridos; situar debajo un **resumen monetario inequívoco** y un disclosure `Trade details` para contratos, precio unitario y tipo de orden. No crear modos `Simple/Pro`, no impedir ver información decisiva y no afirmar que un resultado es inevitable.

Arquitectura común en Buy, Review, Success, Portfolio, Sell y Sell confirmation:

1. **Mi predicción**: frase en primera persona o declarativa, estable y específica; ej. `Creo que Kamala Harris ganará las elecciones estadounidenses de 2028`.
2. **Mi dinero / resultado posible**: `Arriesgas $40`, `Si ocurre, cobras $100 en total`, `Beneficio potencial +$60`, `Si no ocurre, puedes perder $40`, fees visibles antes de confirmar.
3. **Detalles de contrato**: `Buy Yes · 100 contracts × $0.40 · $0 fees` (ejemplo ilustrativo, NO precio de mercado), precio ejecutable vs probabilidad indicativa y resolución exacta disponible con un toque. Datos suficientes siempre accesibles y navegación por teclado.

El paso `Review` debe hacer la **traducción reversible**: persona entiende lo que afirma y puede comprobar la mecánica real. La pantalla `Success` debe confirmar la predicción/posición antes que el número de shares; incluir precio final y contratos en `View transaction details` sin esconder el gasto total.

### 3J.3 Biblioteca de copy (inglés para la demo, castellano para análisis)

**Mercado ejemplo — condición exacta:** `Will Kamala Harris win the 2028 U.S. presidential election?` (mercado conceptual; no presumir candidatura confirmada; resolución definida en reglas).

| Contexto | Copy principal recomendado (EN) | Detalles secundarios | Evitar |
|---|---|---|---|
| Seleccionar YES | `Your prediction: Kamala Harris will win the 2028 U.S. election.` | `Buy Yes` como etiqueta secundaria; precio de entrada | `Buy Kamala Harris shares` como titular |
| Seleccionar NO | `Your prediction: Kamala Harris will NOT win the 2028 U.S. election.` | `Buy No` y resolución | `Donald Trump will win` (no equivalente) |
| Ticket | `How much would you like to put behind this prediction?` | `Amount $40`; `Max loss $40`; `Current buy price 40¢` | `How many shares?` como primera pregunta |
| Review | `You're putting $40 behind: Kamala Harris will win.` | `If it happens: $100 total payout`; `Potential net profit: $60`; `Max loss: $40`; `Fees: $0`; `100 contracts × $0.40` en details | `Potential return $100` sin decir si bruto o neto |
| CTA review | `Confirm prediction` o, más preciso si orden no garantiza fill, `Place buy order` | Confirma operación virtual tras detallar fill | `Place bet`, lenguaje equívoco si se simula un exchange |
| Compra ejecutada | `Your prediction is active: Kamala Harris will win.` | `You paid $40`; `100 Yes contracts at $0.40`; `View position` | `Order placed — 100 Harris shares` como único contenido |
| Orden pendiente | `Your order to back this prediction is waiting for a match.` | Precio límite y número de contratos, estado abierto | `Your prediction is active` antes del fill |
| Portfolio | `You're backing: Kamala Harris to win.` | `Amount invested: $40`, `Current value: $48`, `P&L: +$8`, `100 Yes contracts` expandible | `Prediction won +$8` si aún no se ha resuelto |
| Sell | `You're cashing out part of your prediction that Harris will win.` | Número/cantidad a vender, precio bid, efectivo recibido y P&L realizado | `You changed your mind` (vender ≠ cambiar opinión) |
| Sell success | `You sold part of your position backing Harris to win.` | Contratos vendidos/restantes y beneficio/pérdida realizados | `Your prediction was correct` sin resolución |

### 3J.4 Otras preguntas: generador semántico, no texto libre de IA

**NO traducir mediante un LLM en tiempo de operación.** Emplear plantillas de lenguaje con datos estructurados y copy revisado por tipo de contrato. Un mismo mercado tiene `question`, `resolution_condition`, `outcomes`, `claim_yes`, `claim_no`, `subject`, `settlement_deadline`; para traducción fidedigna de No deben existir siempre copys aprobados o una plantilla expresamente verificada, evitando dobles negaciones.

- Binario: `Will SpaceX land a human on Mars before 2030?` → YES: `SpaceX will land a human on Mars before 2030`; NO: `SpaceX will not land a human on Mars before 2030` **solo si estas frases recogen exactamente la condición de las reglas**.
- Umbral: `Will BTC close above $100,000 on Dec 31, 2028?` → YES: `Bitcoin's specified closing price will be above $100,000 on Dec 31, 2028`; NO: `... will not be above ...` (NO sustituir por `will fall below`, porque empate al umbral queda mal interpretado).
- Multiresultado `Who will win?` con contrato YES sobre X: `I predict X will win`; contrato NO sobre X: `I predict X will not win`, NO inferir otro vencedor específico. Si es un mercado multi-outcome de ganador único, lo que se compra es el contrato definido para esa opción; verificar que los outcomes sean exhaustivos y excluyentes antes de mostrar deducciones.
- Deportes/umbrales con `draw`, prórrogas, anulaciones, withdrawal, empate, resolución por fuentes y ventanas horarias: frase natural debe incluir/ligar `What counts as a win?` en Review. Cuando no haya traducción exacta corta, mostrar el nombre oficial de la condición + `See full rules` en primer plano; jamás «arreglar» semánticamente mediante inferencia.

### 3J.5 Corrección del storyboard y criterios de aceptación

- Conservar **composición visual** y 3 pasos aprobados del storyboard `a_wide_ui_design_mockup_composite_in_a_dark_moder.png`.
- En review/confirmación/portfolio, sustituir el **titular técnico** por la frase de predicción estable. `Shares/contracts` siguen en `Trade details` y recibo.
- `Trade details` se puede expandir, pero gasto total, payout **total**, beneficio **neto** potencial, pérdida máxima y fees se ven antes de confirmar. El cambio de precio ejecutable exige nueva revisión.
- Si la operación es una **venta**, hablar de cerrar una posición (total/parcial); no afirmar que la predicción se ha cumplido ni que su probabilidad ha cambiado por la venta.
- Para una compra Yes/No con resultado fijo se genera el mismo contexto semántico en Market Detail → Review → Success → Portfolio → Sell. Las plantillas `No` deben someterse a pruebas con rivales múltiples, empates, umbrales y negaciones.
- Escenarios de test: `Yes election candidate`, `No election candidate`, `Yes above threshold`, `No at threshold`, `multi-outcome without implying rival`, `selling half`, `limit order pending`, `resolved loss`, `market suspended`.
- Los datos de ejemplo tienen que cuadrar: **100 contratos × $0.40 = $40 de coste; payout total al acertar = $100; beneficio neto sin fees = $60; pérdida máxima = $40**. Para `Sell` a bid de $0.48: recupera $48 y P&L realizado +$8, antes de fees. No copiar cifras incongruentes de imágenes generadas.

**Registro de decisiones:**
- `[T-002, 2026-10-09, APROBADO COMO PROBLEMA]` La terminología `shares` rompe la continuidad desde la pregunta en lenguaje natural.
- `[T-003, 2026-10-09, APROBADO]` Frase de predicción persistente + resumen económico claro + detalles de contratos bajo disclosure, en todos los estados de Trading y Portfolio.
- `[T-004, 2026-10-09, RECOMENDACIÓN TÉCNICA PENDIENTE]` Copys deterministas por tipo de contrato; no LLM para interpretación contractual.


## 03K. TRADING — referencia prediction-first y decisiones aprobadas (9/10/2026)

**Estado: [APROBADO].** La usuaria ha aprobado explícitamente tanto el enfoque `Prediction-first Trading` como la **última imagen de storyboard** (distinta de la primera versión técnica) el 9 de octubre de 2026. Es el material de referencia visual **preferente** para los seis estados de compra y venta, sin eliminar la referencia previa como antecedente.

**Imagen aprobada:** `a_wide_clean_dark_blue_themed_ui_mockup_tutorial.png`.

![Trading — storyboard prediction-first aprobado: elegir, revisar, confirmar, vender, revisar venta, venta confirmada](a_wide_clean_dark_blue_themed_ui_mockup_tutorial.png)

### Decisiones exactas que conservamos

- El usuario **primero entiende la afirmación que está respaldando**, después cuánto dinero compromete y solo finalmente los detalles financieros del contrato.
- Se conserva **una frase natural que expresa la predicción exacta** desde Market Detail → Ticket → Review → Confirmation → Portfolio → Sell / Sell confirmation.
- Título principal legible: `Your prediction: Kamala Harris will win the 2028 U.S. election` (solo ejemplo hipotético, **NO** afirmar que sea candidata real confirmada).
- Acciones: `Review prediction` y, tras review obligatorio, `Confirm prediction` cuando haya ejecución inmediata. En una orden límite sin ejecución, diferenciar `Order placed` de `Prediction active`.
- Montos económicos clave siempre visibles antes de confirmar: **inversión total con comisiones, devolución bruta si acierta, beneficio neto potencial, pérdida máxima**. `Trade details` conserva contratos, precio por contrato, side, bid/ask y reglas; no se ocultan los riesgos.
- Para Sell, comunicar `You’re selling your position backing [afirmación]` sin sugerir que la predicción se ha resuelto ni que se está cambiando de opinión.
- Storyboard validado como **dirección de UX y composición**, no como especificación numérica exacta. No ampliar automáticamente la complejidad del primer paso.

### Errores numéricos visibles en la referencia: NO copiar a código

El storyboard generado contiene inconsistencias previsibles de generación de imagen. Con `125 contratos × $0.40 = $50 de valor de compra` y `fee de compra $0.50`, el **cargo total sería $50.50**, el payout al ganar sería $125 y el beneficio **neto** al ganar sería **$74.50**, no $75. Para venta de `125 × $0.62 = $77.50` con `fee de venta $0.50`, efectivo neto recibido sería **$77.00**. Si el coste total original fue $50.50, el beneficio realizado neto sería **$26.50**, no $27. Además, una visualización de `current value $78` puede ser redondeada pero debe identificar la base de valoración. En los fixtures finales fijar redondeo, estructura de fee y cantidad de contratos, y derivar todas las cifras de un motor compartido de transacciones.

**Decisiones registradas:** `[T-003: APROBADA]` Prediction-first con lenguaje natural persistente; `[T-005: APROBADA]` última captura de Trading como referencia visual prioritaria; `[T-006: APROBADO EN PRINCIPIO]` contratos y jerga se muestran como segunda capa, no desaparecen; `[T-007: REQUISITO DE CALIDAD]` fórmulas consistentes, no copiar cifras sintéticas de la imagen.

---

## 03L. PORTFOLIO — investigación competitiva y propuesta de arquitectura v1

**Estado:** [INVESTIGADO / PROPUESTA PENDIENTE DE VALIDACIÓN]. Próximo apartado después de Trading. Mantener el principio aprobado: decisiones financieras correctas presentadas en lenguaje natural y con complejidad progresiva. **No generar diseño de Portfolio hasta acordar su arquitectura**.

### 03L.1 Qué sabemos de los competidores (fuentes primarias, consulta 9/10/2026)

| Referencia | Hecho verificado | Implicación para Portfolio NOVA |
|---|---|---|
| **Kalshi** (Portfolio clásico) | Portfolio muestra cash, valor de posiciones y órdenes; diferencia el valor mostrado de la **cantidad realmente vendible**; distingue Open, Pending y Closed; contrato, precio y payout en detalle. | Separar claramente saldo disponible, valoración estimada y resultado realmente cobrable; no llamar cash-out garantizado al valor teórico. |
| **Kalshi Pro** | Barra de cash balance, positions value, unrealized P&L, número de posiciones; vistas de open orders, open positions, fills y closed positions. | La potencia y el historial son necesarios, pero pueden estar en navegación secundaria. |
| **Robinhood Event Contracts** | Posiciones accesibles en Prediction Markets; vender/cerrar total o parcialmente; historial de P&L realizado; los contratos pendientes no son posiciones adquiridas. | La continuidad de Buy/Sell y el historial de resultados debe ser exacta; pendientes separados de activas. |
| **DraftKings Predictions** | `My Trades` ofrece al menos pestañas `Open` y `Settled` en superficie pública. No se puede auditar desde web el interior de la cuenta autenticada. | Modelo de estados sencillo, sin atribuirle componentes que no vemos. |
| **FanDuel Predicts** | Documenta Cash Out de posiciones con valor dependiente del mercado; fee y liquidez condicionan el importe/posibilidad de salida. | Un posible `Cash out` debe abrir Review y aclarar liquidez y comisiones. |
| **Polymarket** | Compra/venta de participaciones sobre resultados y acceso a Portfolio para retirar fondos; información pública de sus mecanismos. | Continuidad conceptual para posiciones; sin afirmar layouts no comprobados del Portfolio privado. |

**Fuentes verificables:**
- Kalshi, Portfolio: https://help.kalshi.com/en/articles/13823844-portfolio-balances-and-positions
- Kalshi Pro, gestión de posiciones: https://kalshi.com/pro/help/managing-orders-and-positions
- Robinhood, operaciones y cierre: https://robinhood.com/us/en/support/articles/trading-event-contracts/
- Robinhood, historial P&L: https://robinhood.com/us/en/support/articles/event-contracts-taxes-statements/
- Robinhood, estados de órdenes: https://robinhood.com/us/en/support/articles/event-contracts-order-fills/
- DraftKings, My Trades (vista pública logged out): https://predictions.draftkings.com/en/my-trades/open
- FanDuel Predicts, Cash Out: https://support.fanduel.com/s/article/How-does-cash-out-work-with-FanDuel-Predicts
- Polymarket, market mechanics: https://help.polymarket.com/en/articles/13364272-what-is-a-prediction-market

**Grado de certidumbre:** alto en mecánica Kalshi/Kalshi Pro/Robinhood por documentación directa; limitado en layouts autenticados de DraftKings/FanDuel/Polymarket. Se evita inventar evidencia de tests de usuario.

### 03L.2 Jobs-to-be-done de Portfolio

1. `¿Dónde está mi dinero?` → saldo virtual disponible vs valor estimado de posiciones vs total de cartera.
2. `¿Qué estoy prediciendo?` → afirmaciones en lenguaje natural, outcomes activos, fechas.
3. `¿Voy ganando o perdiendo?` → rentabilidad **no realizada** de posiciones y P&L **realizado** de cerradas; explicar base de cálculo.
4. `¿Puedo salir?` → CTA `Sell / Cash out` al lado de cada predicción activa y estimación realista en Review; no asegurar liquidez.
5. `¿Qué pasó con mis operaciones?` → historial, órdenes pendientes y mercados resueltos consultables.
6. `¿Qué quiero seguir?` → watchlist de mercados guardados, con independencia de haber invertido o no.

### 03L.3 Propuesta de pantalla desktop — estructura simple (NO aprobada)

**Cabecera editorial sobria**: `Your predictions` + microcopy de seguimiento, sin repetir el gigantesco hero de Home y Explore. Puede existir un gesto visual distintivo, pero el protagonista son la cartera y su interpretación. Menor exuberancia no significa aspecto plano.

**Resumen financiero compacto — 3 cifras, no un panel de trading**:
- `Portfolio value`: cash disponible + valor **estimado** de posiciones, NO suma de payout máximo.
- `Available balance`: dinero virtual libre (menos fondos reservados por órdenes pendientes, si aplican).
- `Overall P&L`: recomendar mostrar P&L total con etiqueta exacta de si incluye realizado/no realizado y fees; posible alternativa más comprensible: destacar `Open position change (unrealized)` y ofrecer `Realized P&L` en historia. *Decidir jerarquía y fórmula antes del diseño.*
- Evitar gráfico de rentabilidad por defecto si no mejora la lectura; el gráfico del mercado ya está en Market Detail. Un historial de equity se puede revelar en `Performance` o bajo demanda.

**Tabs propuestas**: `Active` (predicciones abiertas, default), `Pending orders`, `History` y `Saved` (watchlist). Al elegir una pestaña no cambia arbitrariamente el valor financiero superior.

**Lista `Active`** — cada fila/card debe permitir responder rápidamente a 4 cuestiones:
- Afirmación natural: `You're backing: [X will happen]` / `You're backing: [X will NOT happen]`, con opción/side exactos; nunca simplemente `125 Harris shares`.
- `You invested $...` (coste total atribuible a contratos aún mantenidos, incluyendo fees según política) + `Current estimated value $...` con definición documentada de mark vs bid.
- `Unrealized P&L ±$...` y variación porcentual con etiqueta, positivo/negativo no depender solo del color; fecha o estado `Closes …` / `Awaiting resolution`.
- Acción primaria contextual **`View prediction` o `Manage`**; `Sell` aparece claramente en detalle expandido de la posición, evitando una fila llena de botones. Se puede decidir `Sell` directo en vista ampliada si útil.

**Detalle expandido de posición (sin salir de Portfolio):** evolución de precio desde compra (opcional), contratos, coste unitario medio, precio actual bid orientativo, liquidez/fee, payout si acierta, P&L, `Sell some / Sell all` y enlace a Market Detail. `Sell` siempre reutiliza Review y Confirm del módulo Trading. Una posición tiene posible múltiples fills a precios distintos; mostrar precio medio ponderado y lotes bajo `Transaction details`.

**`Pending orders`**: predicción natural, estado `Waiting to fill` o `Partially filled`, cantidad ordenada/ejecutada/restante, límite de precio, reserva de cash y botón `Cancel` con confirmación pertinente. Una orden sin fill no debe inflar el número de posiciones activas ni rentabilidad.

**`History`**: filtros sencillos `All / Bought / Sold / Resolved` + secuencia cronológica con fecha, statement, importe e impacto en saldo; operaciones agrupadas por mercado y expandibles para ver recibos. Distinción `Closed` y `Resolved` (se puede vender antes de acertar o fallar).

**`Saved`**: mercados guardados, probabilidad actual, cambio temporal claro y CTA `View market`; no confundir guardar con respaldar una predicción mediante dinero. Las tarjetas guardadas sin posición no muestran P&L ni saldo invertido.

### 03L.4 Copys y semántica económica — imprescindibles

- Una predicción **abierta no está `won` o `lost`** aunque P&L no realizado sea positivo/negativo. Usar `Currently up/down` y fecha de resolución.
- `Current value` no es necesariamente `Cash you would receive if sold today`; el segundo requiere bid, profundidad y fees, y puede ser imposible para todas las unidades.
- `Portfolio value` = `cash + current position valuation`, con un único criterio de valoración reproducible. **No sumar el principal original dos veces**.
- `Invested` = coste original de los contratos aún poseídos, ajustado tras venta parcial y con fórmula de fees consistente. `Profit/Loss` realizado = net sale proceeds - attributable cost basis (o settlement received - cost basis); no confundir con variación de probabilidad en pp.
- `Potential payout if correct` no es profit; mostrarlo solo en detalle ampliado con fecha/condición y diferencia neta.
- `Sell` no equivale a retirar dinero de cuenta. Saldo virtual aumenta tras ejecución; al ordenar una venta pendiente todavía no se abonó efectivo.
- Al seleccionar `NO` o un outcome de multiresultado se conserva exactamente la frase contractual de la pregunta; no se implica que gane otro candidato.
- Usar currency display consistente y redondeo determinista; colores para señalizar variación sin sustituir palabras y signos.

### 03L.5 Escenarios demo obligatorios / estados

- **Empty state**: usuario sin operaciones → explicación pequeña de qué aparecerá, CTA `Explore markets` y cero P&L, no fingir registros.
- 3–5 posiciones activas variadas: Yes, No, distintas categorías, plus/minus y un escenario multi-outcome.
- Una posición con ganancia no realizada; otra con pérdida no realizada; una en espera de resolución; una parcialmente vendida.
- Una orden límite pendiente + otra parcialmente ejecutada; cancelación actualiza available cash.
- Un mercado resuelto correcto (payout $1/contrato) y uno incorrecto ($0), con impacto en saldo e histórico; distinguir reembolso/void.
- Guardados sin posiciones; guardados que también tienen posiciones; eliminar guardado no elimina posición.
- Buy → Review → Confirm → Portfolio debe actualizar saldo, coste de posición y cartera sin refresh; Sell partial → Review → Confirm muestra cuantía restante y P&L realizado; recarga conserva estado local.
- Variación determinista de precios y bids con fixtures; `Portfolio` no debe cambiar valores aleatoriamente por render.
- Mobile: resumen claro, tabs desplazables si necesarios, tarjetas legibles, `Sell` mediante bottom sheet de revisión.

### 03L.6 Navegación propuesta e interrogantes a cerrar

- ¿La pantalla se titula `Portfolio` o `My Predictions`? **Recomendación:** navegación `Portfolio` por familiaridad; titular **`Your predictions`** para coherencia con Trading.
- ¿3 KPIs y **Active/Pending/History/Saved** o tabs `Predictions / Orders / Activity / Saved`? **Recomendación:** primera, por lenguaje directo.
- ¿Gráfico global? **Recomendación:** no en primera vista; opción `Performance` avanzada cuando haya suficientes datos históricos.
- ¿Acción `Sell` en cada card o en detalle expandido? **Recomendación:** `Manage` en la fila, `Sell` en detalle; evita decisiones accidentales y saturación.
- ¿Favored markets o watchlist dentro de Portfolio o en espacio global? **Recomendación provisional:** `Saved` como tab de Portfolio y atajo `bookmark` global en navegación; evitar dos bases de datos o dos zonas desconectadas.

### 03L.7 Criterios de aceptación MVP

1. Abrir una posición desde recibo de Trading reproduce la **misma frase natural** y montos consistentes.
2. Total de cartera, cash y posiciones se reconcilian exactamente con el ledger/engine simulado.
3. Rentabilidad no realizada, realizada y payout están claramente etiquetados y son matemáticamente correctos, incluidas fees.
4. Cerrar parcial o totalmente una posición es posible desde Portfolio con el mismo Review de Trading.
5. Órdenes no ejecutadas no aparecen como predicciones activas; fills parciales muestran ambos estados sin duplicar contratos.
6. Guardar/desguardar es reversible y no afecta a dinero, órdenes ni holdings.
7. Todos los importes y estados persisten tras navegación/recarga y son accesibles en responsive.

**Decisión pendiente más relevante:** ¿queremos que Portfolio sea ante todo **`My Predictions`** (una experiencia humana que cuenta qué crees y cómo evoluciona) o un **dashboard financiero** con gráfico total, KPIs y posiciones dominantes? La recomendación de diseño es **My Predictions** con finanzas claras pero secundarias. Validar con la usuaria antes de imagen.


## 03M. PORTFOLIO — referencia visual elegida y decisiones confirmadas (10/10/2026)

**Decisión [APROBADA]:** la usuaria prefiere la **primera captura** de Portfolio, titulada `Your predictions`; la versión posterior con gran gráfico de rendimiento, asset allocation y mayor densidad **queda descartada como referencia primaria**. No confundirse al generar nuevas iteraciones.

**Referencia visual primaria:** `a_clean_modern_dark_themed_web_app_dashboard_scre.png`.

![Portfolio — primera versión elegida](a_clean_modern_dark_themed_web_app_dashboard_scre.png)

**Versión descartada para esta pantalla:** `wide_high_resolution_dark_ui_dashboard_screenshot.png`; no reemplazar la anterior por esa composición.

### Composición y comportamientos aprobados en dirección (no pixels cerrados)
- Título humano **Your predictions**, dejando `Portfolio` en navegación global.
- **Tres métricas clave** sobre fondo sobrio: Portfolio value, Cash available, Profit/Loss. Mantener diferencias entre realizadas y no realizadas bajo detalle; el sumatorio global debe tener política exacta de cálculo.
- `Active predictions`, `Pending orders`, `History`, `Saved markets`. `Active` por defecto, con contadores coherentes.
- Predicciones abiertas en lenguaje natural, miniaturas evocadoras y valores `Invested / Current estimated value / Unrealized P&L` como información escaneable.
- **Detalle contextual en rail lateral** al seleccionar una predicción, con cantidades de contratos, precio medio y opciones `Sell position` / `Buy more`; en móvil abrir panel accesible. La información financiera es secundaria respecto a la predicción.
- `Manage` y `View prediction` conectan con el mismo producto y el proceso de compra/venta ya aprobado. No duplicar motor de órdenes.
- `Pending orders` y `Recent activity` muestran una vista previa, no el catálogo financiero completo.
- Chip permanente `Demo · simulated funds`; nunca confundir wallet virtual con depósitos reales. El botón `Deposit` de los mockups no puede activar pagos: adaptar a `Add demo funds` o `Reset demo balance` de manera explícita.

### Correcciones críticas del material generativo (NO son errores de la especificación)
- La captura mezcla contratos de 2025 con una fecha actual posterior; **no reproducir mercados vencidos como activos**. Sustituir los placeholders por fixtures con fechas relativas plausibles o escenarios atemporales y consistentes.
- Cifras de `Current value`, `Invested`, P&L, balances y actividades del mockup no cierran matemáticamente en todas sus filas. El prototipo debe generar todos los importes desde un **ledger único**, con pruebas de reconciliación; jamás copiar números de la captura sin validarlos.
- No incluir flechas gráficas en cada posición solo por decorar: sirven únicamente si muestran una evolución relevante y no compiten con cifras.
- `Sell anytime` sería demasiado categórico; la liquidez y los estados del mercado condicionan si realmente se puede ejecutar una venta.
- Si hay orden límite parcialmente ejecutada, separar cantidad ya abierta como posición del remanente pendiente sin contarlas dos veces.

### Estado de aprobación
**Aprobada** la primera captura como dirección visual y el enfoque `Your Predictions`; sigue **propuesta** el detalle fino del cálculo de rentabilidad global, UX responsive y estados de la demo, que deben cerrarse al implementar.

---

## 03N. EXPERIENCIA GLOBAL — benchmark y especificación funcional v1 (10/10/2026)

**Estado:** [INVESTIGACIÓN + PROPUESTA A VALIDAR]. Abarca cabecera, rutas, Search global, Saved/watchlist, centro de notificaciones, cuenta/preferencias y el lugar de Insights en el producto. No es una única pantalla de contenido: es el sistema que mantiene unido Home, Explore, Market Detail, Trading y Portfolio.

### 03N.1 Benchmark verificable (evidencia vs recomendación)

| Competidor | Evidencia oficial consultada | Aprendizaje propuesto |
|---|---|---|
| Kalshi clásico | Encontrar mercados por pestañas de temas y Trending; preferencias de notificaciones separadas por actividad de trading, resolución, cambios de precio y marketing; canales Email, Push e In-app independientes. | Navegación de descubrimiento coherente, alertas útiles, preferencias granulares sin ruido por defecto. |
| Kalshi Pro | Search por ticker/evento/título y fallback a catálogo; la Watchlist alimenta una vista de seguimiento; vistas de cartera y órdenes conectadas con el mismo usuario. | Un buscador global indexado, watchlist que nunca implique compra, persistencia del contexto entre superficies. Evitar llevar la densidad Pro al usuario casual. |
| Polymarket | Catálogo público y búsqueda orientada a preguntas/temas; reglas de precios dependen del mercado. | Buscar lenguaje natural, no solo tickers; resultados con outcome + probabilidad y no precio ejecutable ficticio. |
| DraftKings Predictions | Descubrir mercado, operar y gestionar posiciones forman un mismo recorrido documentado; notificaciones de producto general de DraftKings, **no verificadas como interfaz idéntica de Predictions**. | Búsqueda y continuidad `discover → trade → follow`; no afirmar que sus preferencias de notificación sean idénticas entre productos. |
| FanDuel Predicts | Flujo de elegir Yes/No, importe, mantener o vender; la web pública no expone con detalle verificable la arquitectura de notificaciones o search autenticados. | Lenguaje comprensible y vuelta a posición; no copiar estructuras internas sin haberlas visto. |

**Fuentes oficiales:**
- https://help.kalshi.com/en/articles/13823842-finding-markets
- https://help.kalshi.com/en/articles/17297679-manage-your-kalshi-email-notifications
- https://kalshi.com/pro/help/markets-scanning-filtering-searching
- https://kalshi.com/pro/help/canvas-views-and-starter
- https://kalshi.com/pro/help/get-started
- https://polymarket.com/
- https://predictions.draftkings.com/en/how-to-trade-predictions-availability
- https://www.fanduel.com/predicts
- https://support.draftkings.com/dk/en-us/how-do-i-manage-my-notification-preferences?id=kb_article_view&sysparm_article=KB0011352 (producto DraftKings general; no inferir UI específica Predictions)

### 03N.2 Navegación global y jerarquía de destinos

**Propuesta de top bar desktop (como referencia visual existente):** `Home | Explore | Portfolio | Insights?` a la izquierda/centro; búsqueda persistente muy visible; a la derecha iconos discretos `Notifications`, `Saved` (opcional) y menú de perfil/wallet virtual. `Explore` es catálogo; `Home` es portada; `Portfolio` es cuenta/posiciones.

**Tensión importante:** `Insights` aparece en capturas anteriores y la Home incluye bloque editorial, pero **NO está aprobada aún una pantalla Insights independiente**. Dos alternativas: a) nav de cuatro items y un módulo editorial acotado como `Insights`, si deseamos contar una historia de análisis contextual; b) nav más minimalista con tres items y `Insights` accesible desde Home y Market Detail. **Recomendación inicial:** opción (b) para no crear un mini-periódico y priorizar la interacción central; mantener como abierta, pues cambia visuales aprobados.

Breadcrumbs en Market Detail: `Explore > Category > Market`, regreso preservando el query, scroll y filtros previos de Explore. Desde Search → Market Detail → back restaurar búsqueda. Portfolio y Market Detail comparten selección de outcome y contrato, no recrear estado incoherente.

**Mobile:** barra inferior `Home / Explore / Portfolio`, búsqueda visible en encabezado o acción persistente; `Insights` dentro de menú contextual si se mantiene; Saved accesible desde Portfolio. Evitar meter 6 tabs en navegación móvil.

### 03N.3 Search global — command palette ligera, no página de resultados duplicada

- Click en buscador (o `/`, `Cmd/Ctrl+K` como mejoras accesibles, sin interferir con campos de texto) abre un **overlay de búsqueda** en desktop o pantalla completa en móvil.
- Query en lenguaje natural por pregunta, persona, categoría, outcome, evento, términos relacionados y sinónimos (`SpaceX / Mars / Starship`, siglas y aliases). No depender de keywords exactas.
- Estado inicial sin query: `Recent searches` locales (si existen), `Trending` (máximo 3–5) y `Browse categories`. Sin grabar búsquedas para una falsa personalización de servidor.
- Resultados agrupados por **Markets** y **Topics**; cada fila con pregunta, outcome relevante, probabilidad indicativa, categoría, estado; nada de botones Buy instantáneos.
- Hacer Enter abre el primer resultado **solo si la selección está clara**; clic en `See all results` envía a Explore con `?q=`. Un clic abre Market Detail y conserva origen.
- `No results`: corregir query, quitar filtros, categorías sugeridas; no inventar coincidencias.
- `Closed/Resolved` se distinguen y no se ofrecen como mercados operables.
- Top resultados ordenados por relevancia semántica, después actividad cuando exista; búsqueda determinista del fixture y estado local persistente de recientes. Evitar recomendaciones falsamente personalizadas.
- Accesibilidad: tab / arrow navigation / Escape / focus return y label de botón; al pulsar en suggestion nunca ejecutar trade.

### 03N.4 Saved/watchlist — una sola fuente de verdad

- `Save` visible como acción secundaria en tarjetas y en Market Detail; toggle reversible sin necesitar inversión.
- Estado `Saved` en Portfolio concentra el catálogo guardado; en navbar, icono de atajo **solo si añade valor** y no duplica funcionalidad. Recomendación: un icono `bookmark` pequeño al lado de Search/Notifications o simplemente entrar por Portfolio > Saved.
- Saved market conserva el **market_id** y, cuando sea necesario, **outcome_id** específico. Si un evento incluye varios contratos no confundir guardar todo el evento con guardar un outcome.
- Cards Saved enseñan pregunta, outcome/estado, probabilidad, variación con periodo y CTA View; **sin** `Invested / P&L` si no hay posición.
- Al resolverse, una entrada guardada sigue visible como Resolved; quitar guardado no borra posición ni historial.
- Watchlist y listas de resultados deben reflejar el mismo estado, sin `favorite` inconsistente al navegar.

### 03N.5 Notifications — centro de avisos centrado en acciones

**Propuesta: un icono de campana con contador discreto de no leídos**, popover y enlace `View all` solo si hace falta; nada de pantalla extensa obligatoria para MVP.

**Eventos P0 relevantes:** orden ejecutada/parcial, orden límite cancelada/caducada, mercado suspendido/reabierto si el usuario tiene posición/guardado, mercado resuelto, saldo/posición actualizada, evento que cierra pronto (si es relevante para watchlist/holding). Las notificaciones de price moves son **opt-in** o umbral configurable; no emitir alerta por cada pequeño cambio.

Cada ítem contiene `qué ha pasado + con cuál de tus predicciones + cuándo + acción`. Ej.: `Your prediction about SpaceX has moved +8 pp in the past 24h` o `Your order for [predicción] filled`. Los eventos relativos a BUY/NO preservan el texto contractual. Al hacer clic abre el mercado o posición correcta y marca leído. `Mark all read` y vacíos bien definidos.

**Preferencias compactas:** `Important activity` siempre in-app y `Market updates` opcionales; opciones avanzadas para price movement y cierre. Demo: sin solicitar permisos de push ni simular mails reales; generar eventos coherentes con cambios de fixture, fills y settlement. Ajustes persistentes. Nunca crear la falsa impresión de comunicaciones reales.

### 03N.6 Menú de perfil, demo y seguridad de la simulación

- Avatar abre menú pequeño: `Demo balance / Add demo funds`, `Settings`, `About this demo`, `Reset scenario` con confirmación. `Log out` solo si se simula sesión; no fingir infraestructura real de registro o pagos.
- No usar CTA **Deposit** sin una acción real: renombrar a `Add demo funds`, mostrar claramente créditos virtuales. Definir topes o un valor inicial fijo (ej. $1,000 virtuales; cifra propuesta, no validada).
- Menú Settings P0: formato de odds (porcentaje como default; ¢ en detalle), tema si útil (no imprescindible), notificaciones, preferencias de visualización y accesibilidad (reduced motion, contrast). No crear formulario de identidad, KYC ni cuentas bancarias ficticias.
- Estados persistentes localmente: wallet, positions, orders, saved, recent searches, preferences y alert inbox, desde un state store compartido y fixtures deterministas.

### 03N.7 Insight / Why moved? — alcance por decidir

**Problema:** una sección editorial generalista `Insights` puede ser visualmente atractiva para el portfolio, pero dispara el alcance, necesita contenido y puede duplicar noticias de Market Detail. Recomendación por ahora: `Insights` como **contexto embebido** sobre el gráfico y Home, quizá una microvista curada opcional, **no un nuevo producto editorial**.

Si se mantiene el cuarto ítem en top nav (por coherencia visual con capturas), construir un espacio de 3–5 explicadores relevantes con fecha y trazabilidad a mercados, no un feed de noticias inventadas. No afirmar causalidad de un movimiento sin evidencias. Las noticias simuladas deben llevar etiqueta DEMO; si se usan fuentes reales, mostrar fuente y fecha auténticas.

### 03N.8 Reglas cross-product, estados y aceptación

1. La navegación global es consistente en Home, Explore, Detail y Portfolio; la página activa se marca claramente; búsqueda y portfolio accesibles en todos los breakpoints.
2. Search → Market → Buy → Receipt → Portfolio → Back debe preservar mercado, outcome, orden y saldo, sin resetear resultados de búsqueda.
3. Las rutas profundas comparten `market_id`, `outcome_id`, query params de categoría/filtros y origen para retorno; refrescar/reabrir la URL funciona.
4. Saved desde Home/Explore/Detail se sincroniza con Saved en Portfolio. No se pierden selecciones al cambiar pestaña.
5. Notificaciones relevantes aparecen únicamente por eventos del motor simulado y navegan a contenido existente; no hay badges arbitrarios sin mensajes.
6. Un market resolved/suspended bloquea Buy/Sell y notifica coherentemente. Las notificaciones `Mark as read` mantienen estado tras recargar.
7. Reset demo pide confirmación; reinicia wallet y posiciones con un conjunto conocido, sin hacerse pasar por operaciones financieras reales.
8. Accesibilidad WCAG objetivo AA (a verificar): búsqueda teclado, Escape, foco visible, labels, anuncios de eventos y contraste, reduced-motion.
9. No atajos de Quick Buy desde global search o notificaciones: siempre Market Detail/Trade → Review → Confirm.
10. Priorizar una implementación navegable, coherente y testeada frente a una constelación de pantallas decorativas.

### 03N.9 Decisiones pendientes para revisión

- **G-001:** Top nav `Home / Explore / Portfolio` y Insights contextual, o mantener `Insights` como cuarto destino real. Recomendación: tres destinos principales.
- **G-002:** Search overlay tipo command palette vs página Search independiente. Recomendación: overlay + `See all results` hacia Explore.
- **G-003:** Un solo Saved en `Portfolio > Saved` con acceso discreto global, sin duplicación de bases de datos. Recomendación: sí.
- **G-004:** Notification popover vs inbox completa. Recomendación MVP: popover con filtros `All / Unread`, suficiente.
- **G-005:** El CTA actual `Deposit` en capturas debe redirigir solo a `Add demo funds`, con marca Simulated; no hay pagos reales. Recomendación obligatoria para demo.

**Nota de alcance:** toda esta especificación es una recomendación para validación de producto, **no una colección de decisiones ya aprobadas** por la usuaria.

---

## Actualización de changelog — 10 octubre 2026

- **v1.2**: primera captura de Portfolio elegida como referencia visual; segunda variante densa descartada. Documentadas reglas de cartera, advertencias de datos sintéticos; benchmark de Global Experience y propuesta para navegación, Search, Saved, Notifications, ajustes, demo e Insights. Se registran hipótesis pendientes de aprobación.


## 03O. GLOBAL EXPERIENCE — Search + Notifications, arquitectura detallada v2 (10/10/2026)

**Estado de decisión:** La usuaria ha aceptado seguir la recomendación de **resolver primero Search y Notifications**, para luego revisar una referencia visual y conectar los flujos completos. Se mantiene como **propuesta detallada para validar** su composición exacta, contenidos y copy; no se debe etiquetar un mockup nuevo como aprobado hasta recibir reacción explícita.

### 3O.1 Auditoría competitiva: qué se verifica

- **Kalshi Pro**, documentación `Markets: scanning, filtering, and searching`, actualizada 17/07/2026: búsqueda por ticker, evento y título; si la tabla actual no encuentra coincidencias, búsqueda ampliada en catálogo. **Conclusión:** una búsqueda global real debe salir del contexto de la sección y dar entrada clara a Market Detail. Fuente oficial: https://kalshi.com/pro/help/markets-scanning-filtering-searching
- **Kalshi**, ayuda de preferencias de notificación: diferencia actividad de cuenta (confirmación de operación, settlement, autocancelación, movimientos) y marketing, con controles Email/Push/In-app separados. **Conclusión:** alertas útiles y segmentables, sin mezclar promociones con actividad. Fuente oficial: https://help.kalshi.com/en/articles/17297679-manage-your-kalshi-email-notifications
- **Kalshi Pro**, documentación `Canvas views and search`, actualizada 02/10/2026: existe vista Watchlist sincronizada con mercados favoritos, incluso cuando está vacía; la búsqueda puede abrirse desde un workspace. **Conclusión:** mantener una única fuente de guardados independiente de comprar. Fuente oficial: https://kalshi.com/pro/help/canvas-views-and-starter
- **Robinhood**, ayuda sobre contratos/eventos: describe eventos contractuales y que la notificación push de estos puede desactivarse por separado; no da base suficiente para atribuir un modal de búsqueda específico. Fuentes: https://robinhood.com/us/en/support/articles/opting-out-of-event-contracts/ y https://robinhood.com/us/en/support/articles/trading-event-contracts/
- **Polymarket**, portal público y ayuda de contratos: refuerza la navegación por preguntas y resultados; la evidencia consultada **no justifica reproducir una inbox concreta**. https://polymarket.com/

No son pruebas con usuarios, métricas de usabilidad ni auditoría de interfaces autenticadas. La propuesta de producto a continuación es nuestra y no una función afirmada de todos los competidores.

### 3O.2 Global Search: entrada, overlay, resultados

**Entrada**: clic en caja Search global de la navbar, icono de búsqueda en móvil y atajo `Cmd/Ctrl + K` como mejora. Overlay modal centrado en desktop de anchura aprox. 640–760 px y máximo 65–75vh; en móvil, pantalla completa. Fondo oscurecido discreto sin perder el contexto. Foco al campo de texto, `Escape` cierra y devuelve foco al launcher.

**Empty query**: historial reciente local (máximo 3, con opción Clear) y 3 mercados `Popular now` curados; categorías debajo solo si la altura lo permite. Prohibidos rankings como `most searched` sin datos o etiquetas `for you` sin personalización.

**Con query**:
1. Buscar por título/pregunta en lenguaje natural, outcomes/personas, temas, palabras asociadas y aliases verificados en fixtures (ej. `Mars`, `SpaceX`, `Starship`).
2. Dos grupos de resultados: `Markets` y `Topics`. `Markets` máximo 5, `Topics` máximo 3, sin scroll infinito.
3. Cada fila Market: thumbnail pequeña, pregunta sin cortar lo esencial, categoría, outcome relevante y probabilidad indicativa, estado si `Live/Closed/Resolved`. Una acción primaria: **abrir detalle**, no Buy/Trade.
4. `See all results for “query”` abre Explore con `q=` y filtros restaurables. Hacer clic en una categoría abre Explore con el parámetro `category=` correspondiente.
5. Ordenación determinista: coincidencia de título/pregunta y alias por encima de actividad reciente. No inventar relevancia basada en un modelo IA no implementado.

**Estados**: inicial vacío; escribiendo; resultados mixtos; sin resultados; coincidencias solo en temas; offline/demo local; sin recientes; mercado ya resuelto; input muy largo; navegación con ↑ ↓ Enter Tab Escape; soporte lector de pantalla con `role=dialog`, `aria-label` y anuncios del número de resultados.

**Principio:** El buscador no reemplaza a Explore ni bloquea el flujo de un usuario con filtros; abre una vía rápida a un mercado y conduce al catálogo para comparaciones más complejas.

### 3O.3 Notifications: popover, lenguaje natural y prioridades

**Entrada**: campana global; contador de no leídas **solo si existen mensajes reales en fixtures**. Popover anclado a icono, max-width ~360–420 px, fondo premium como overlays existentes; en móvil, pantalla completa o bottom sheet suficientemente grande. Headline `Notifications` con `Mark all as read`; vistas `All / Unread` si hay volumen.

**Jerarquía, por prioridad:**
- **Importante e in-app por defecto**: orden ejecutada (total o parcial), orden cancelada, mercado resuelto y pago aplicado; posición con mercado suspendido.
- **Seguimiento opcional**: cambio de probabilidad por encima de umbral configurable (por defecto desactivado, sugerir 10 puntos porcentuales en 24 h como punto de partida), cierre de mercado próximo cuando haya posición/guardado.
- **Excluido en P0**: marketing, recomendaciones sin relación con guardados, titulares genéricos, gamificación de actividad, alarmas ficticias de urgencia.

**Estructura de cada notificación**: icono de clase + primera línea orientada a qué cambió + contexto exacto de predicción (frase lenguaje natural/Yes-No) + fecha/hora + estado no leído. Ejemplo: `Your limit order filled` / `You're predicting SpaceX will land on Mars before 2030` / `10 min ago`. Hacer clic navega a Portfolio > position/order o Market Detail, preservando outcome y marcando leído; sin ejecución instantánea de un trade.

**Movimientos**: mostrar `+8 pp in 24h`, nunca `+8%` si era cambio de puntos. No mandar automáticamente alertas de price movement a todos. En mercado resuelto, notificar si acertó o no y payout real del fixture, sin lenguaje despectivo ni falsa causalidad.

**Estados**: sin mensajes (vacío elegante), todo leído, no leídos, larga lista con `View all` discreto (solo si el volumen lo justifica), click a mercado ya resuelto, evento duplicado (deduplicar), cambios de preferencia y `Mark all as read`. Persistir leídos en estado local y restaurar al recargar.

**Settings**: `Important activity` (in-app) y `Market updates` (configurables: price change / closing soon); notificaciones push/email fuera del MVP de demo si no existe integración real. Distinguir claramente toggle de ajustes y contador de mensajes.

### 3O.4 Navegación que no se rompe al abrir overlays

- Search y notificaciones se abren en cualquier sección sin navegación automática ni pérdida de scroll.
- Overlay vs popover **mutuamente excluyentes**; si se abre Search se cierra Notifications y viceversa.
- Al ir a Market Detail desde Search, preservación de query para Back; al ir a Portfolio desde alerta, selección exacta de `position_id` o `order_id`.
- `Save` y Saved usan el mismo `market_id` y `outcome_id`; una alerta sobre Saved no presupone posición comprada.
- En demo, generar notificaciones solo mediante motor de eventos fixture: `ORDER_FILLED`, `ORDER_PARTIALLY_FILLED`, `MARKET_RESOLVED`, `MARKET_SUSPENDED`, `PRICE_ALERT_THRESHOLD`, `MARKET_CLOSING_SOON`. Omitir timestamps falsamente 'now' si no casan con escenario simulado; usar reloj de simulación/tiempo relativo coherente.

### 3O.5 Datos y testing para Claude Code

Tipos mínimos: `SearchIndexEntry{marketId,eventId,title,outcomes[],aliases[],category,status,activityScore}`, `SearchQueryState{query,focusIndex,recentQueries[]}` y `Notification{id,type,marketId,outcomeId?,positionId?,orderId?,createdAt,readAt?,payload}`. Las preferencias tienen `priceAlertsEnabled`, `priceAlertThresholdPP`, `closingSoonEnabled` e `importantActivityEnabled`.

**Fixtures de demostración sugeridos**: pregunta SpaceX+Mars con sinónimos, contrato Bitcoin con orden límite ejecutada, mercado electoral con posición y update, y notificación de resolución sobre otro mercado. Todos con fechas **relativas al reloj de escenario**, no un US Election 2024 presentado como live.

**Pruebas de aceptación:**
1. Search por alias → resultado preciso → Detail correcta → Back restaura query y scroll.
2. Search sin resultados ofrece `Explore all markets` sin inventar coincidencias.
3. Buscar un mercado cerrado devuelve estado `Resolved` y NO botón Buy.
4. Seleccionar notificación ORDER_FILLED → Portfolio/Open Position; ORDER_PARTIALLY_FILLED → Pending; MARKET_RESOLVED → History y receipt.
5. Marcar leído persiste tras recarga; badge coincide exactamente con unread.count.
6. Alertas de precio no aparecen hasta activarlas en Settings; cambios inferiores al umbral no generan avisos.
7. Apertura de un overlay cierra el otro; Escape, retorno de foco y navegación teclado funcionan.
8. Es posible terminar Buy → Review → Confirm → Portfolio sin interacción forzada con el buscador/notificaciones.

### 3O.6 Referencia visual: conservada como referencia de diseño

**Estado: [SELECCIONADA COMO REFERENCIA POR LA USUARIA, 10/10/2026].** La última captura de búsqueda + notificaciones se guarda como referencia visual del lenguaje de componentes (overlays oscuros, jerarquía compacta, resultados con imagen/pregunta/probabilidad y avisos contextualizados).

**Archivo:** `wide_desktop_ui_screenshot_of_a_dark_themed_tradin.png`

![Global Experience — búsqueda y notificaciones como referencia visual](wide_desktop_ui_screenshot_of_a_dark_themed_tradin.png)

**Advertencias de implementación:** la captura muestra las ventanas de búsqueda y notificaciones abiertas simultáneamente para comparar ambas; **en la app real son excluyentes** (abrir una cierra la otra). Que una notificación aparezca sobre Portfolio no autoriza a tapar controles importantes; diseñar anclaje, tamaño responsive y cierre por Escape/fuera de panel. El copy y las métricas no son hechos ni fixtures; revisar estados de las elecciones, referencias temporales y valores económicos. La miniatura de búsqueda puede enlazar a mercado, **nunca ejecutar compra directa**.


**Decisión pendiente no resuelta**: cuarta pestaña `Insights` — mantenerla solo si definimos una experiencia editorial funcional; por ahora en capturas puede seguir por consistencia con referencias anteriores, pero no constituye aprobación de nueva página.

**Registro de decisiones**:
- G-006 [CONFIRMADA 2026-10-10] Investigación y diseño de Search + Notifications como siguientes dos flujos para completar Global Experience.
- G-007 [PROPUESTA] Search overlay modal + `See all results` a Explore.
- G-008 [PROPUESTA] Notification popover con alertas relevantes por defecto y actualizaciones de mercado opt-in.
- G-009 [PENDIENTE] Mockup de Global Experience por evaluar; cerrar navegación / Insights después.

**Changelog v1.3 — 10/10/2026:** contraste específico con fuentes oficiales de búsqueda Kalshi Pro, watchlist Kalshi, alertas Kalshi y Robinhood. Especificados Search y Notification panel: microcopy, comportamiento, estados, navegación, datos y pruebas. Referencia visual nueva por validar.


## 03P. ACCOUNT · SETTINGS · DEMO MODE — investigación y propuesta funcional (10/10/2026)

**Estado:** [INVESTIGACIÓN COMPLETADA; ESPECIFICACIÓN PROPUESTA A VALIDAR]. Continuación de Global Experience tras la captura de Search + Notifications. Enfocar todo en una **demo portfolio creíble y funcional**, no construir un sistema financiero o de identidad ficticio.

### 3P.1 Evidencias y criterios externos

1. **Kalshi ofrece un entorno demo oficial con fondos ficticios, separado del entorno real.** Ello demuestra que la práctica con saldo no real es una modalidad existente, pero NO obliga a copiar sus flows de registro, financiación mediante sandbox bancario o credenciales. Fuente: https://help.kalshi.com/en/articles/13823775-creating-and-using-a-demo-account
2. **Kalshi distingue preferencias de actividad transaccional y marketing, además de canales Email/Push/In-app**. En nuestro prototipo solo tendremos notificaciones locales/in-app mientras no haya infraestructura real. Fuente: https://help.kalshi.com/en/articles/17297679-manage-your-kalshi-email-notifications
3. **Nielsen Norman Group recomienda progressive disclosure**: ajustes avanzados bajo demanda y acciones principales claras por defecto. Es criterio de diseño general, no evidencia de una preferencia medida entre nuestros usuarios. Fuente: https://www.nngroup.com/articles/progressive-disclosure/
4. **Confirmaciones destructivas** deben expresar consecuencias y evitar defaults engañosos. Esto importa al reiniciar una demo con posiciones guardadas. Fuente: https://www.nngroup.com/articles/confirmation-dialog/

### 3P.2 Objetivo de la pantalla/menú

Permitir comprobar de inmediato que **el saldo es virtual**, consultar y ajustar preferencias y restaurar escenarios para que la persona que evalúe el portfolio pueda recorrer nuevamente operaciones y notificaciones. La cuenta NO debe sentirse como otro producto ni ocupar una tab de navegación principal.

### 3P.3 Menú desde avatar (default): compacto, sin página obligatoria

- Encabezado `Demo account` y distintivo inequívoco `Simulated funds · No real money`.
- `Available demo balance` muestra exactamente el valor del wallet, sincronizado con Portfolio.
- **Add demo funds** en lugar de `Deposit`/`Add funds`, para eliminar la apariencia de ingreso real. Abre diálogo con cuantías sugeridas de crédito ficticio y revisión/confirmación; todas las operaciones quedan en el ledger demo como ajuste `DEMO_TOP_UP`, separadas del P&L de trading.
- `Settings` abre una vista o modal simple; `About this concept` explica que es prototipo y datos simulados.
- **Reset demo** es acción secundaria y destructiva con confirmación. No colocar botón junto a CTA principal.
- No pedir información bancaria, datos personales reales, contraseña, KYC ni cuentas externas. No mostrar `Log out` si no existe login.

### 3P.4 Settings — pocas opciones con impacto real

**Visibles:**

1. **Notifications:** `Important activity` in-app activas por defecto; `Market movements` off por defecto; si se activa, umbral de cambio de probabilidad expresado en **puntos porcentuales** (p.ej., `10 pp / 24h`, valor inicial propuesto); `Closing soon` toggle configurable.
2. **Display:** formato de cambio `pp` (por defecto), accesibilidad `Reduce motion` o preferencia de sistema; tema oscuro inicial consistente con el proyecto. Cualquier toggle disponible debe cambiar UI real.
3. **Demo controls:** `Add demo funds`, `Reset demo`, `See scenario guide` (opcional) para reproducir storylines prediseñadas.

**Ocultos/descartados MVP:** preferencias de anuncios, emails, push reales, estrategia de inversión automatizada, KYC, confirmación de identidad, perfiles sociales, cupones, lealtad y opciones que carezcan de comportamiento.

### 3P.5 Motor de simulación y trazabilidad

- **Fuente de verdad compartida** entre Market Detail, Trading, Portfolio y Notifications: `wallet.cash`, `positions[]`, `orders[]`, `trades[]`, `saved[]`, `notifications[]`, `preferences`, `scenario.clock`.
- **Ledger de movimientos** con `transactionId`, `eventType`, `amount`, `timestamp`, `relatedOrderId`; balance derivado o validado consistentemente. Top-ups demo nunca se computan como rendimiento ni P&L.
- **Fixtures deterministas** por escenarios: 1) mercado con posición ganadora aún abierta; 2) posición en pérdidas; 3) orden límite parcialmente ejecutada; 4) mercado resuelto y cobrado; 5) cambio de probabilidad que activa alerta solo si opt-in; 6) mercado suspendido.
- **Reloj de escenario definido** para evitar contradicciones de fechas. No utilizar a la vez una fecha 2025, `live` y un evento ya terminado; los nombres, resultados y artículos mostrados deben ser explícitamente demo cuando no sean verificados.
- Cambios persistentes a través de recargas (almacenamiento local de prototipo), con un control deliberado para resetear. La demo no representa capacidades de una plataforma de trading real.
- **Reset scenario** debe avisar `This will restore your virtual balance, positions, orders, saved markets, searches and notifications to the demo starting state`, con opción `Cancel` y `Reset demo`. **Decisión pendiente:** si guardados y búsquedas recientes se conservan al resetear; recomendación: reiniciar todo para reproducibilidad.
- `Demo walkthrough` opcional NO debe bloquear navegación y puede abrirse desde `About this concept` en lugar de añadir otro item nav.

### 3P.6 Experiencia transversal y escenarios a testear

| Escenario | Recorrido verificable | Resultado esperado |
|---|---|---|
| Descubrir | Home → Search → Market Detail → guardar | Saved refleja mismo market y estado sin necesidad de compra |
| Comprar | Explore → Detail → Buy → Review → Confirm → Portfolio | Wallet, P&L, holdings, receipt y actividad concuerdan |
| Vender | Portfolio → Manage → Sell parcial → Review → Confirm | Wallet, posición restante, P&L realizado e historial concuerdan |
| Orden límite | Advanced → Place limit → Pending → Cancel/fill | Sin posición fantasma si orden sigue abierta; saldo reservado explicado |
| Resolver | Scenario advance → Resolved → History + Notifications | Payout según reglas, CTA Buy bloqueado, alerta contextual |
| Configurar | Avatar → Settings → price alert on → scenario move | Aviso solo tras cumplir umbral, se marca leído y persiste |
| Reset | Avatar → Reset → Confirm | Estado inicial reproducible y consistente; confirmación no se ejecuta por accidente |

### 3P.7 Recomendaciones que requieren aprobación

- **G-010 [PROPUESTA]** Avatar abre **menú pequeño**, no una página `Account` completa; Settings se muestra solo al entrar.
- **G-011 [PROPUESTA]** Reemplazar `Deposit` por `Add demo funds` en todas las capturas finales y la implementación; sello demo visible.
- **G-012 [PROPUESTA]** Notificaciones importantes in-app; alertas de precio opt-in; no permitir push/email ficticios.
- **G-013 [PROPUESTA]** `Reset demo` con confirmación y fixtures reproducibles; saldo y P&L siempre coherentes.
- **G-014 [PENDIENTE]** Resolver si `Insights` merece una pestaña real. Recomendación: **no** en MVP; contenido editorial embebido en Home y Market Detail para evitar duplicidad. La existencia del tab en mockups **no equivale a decisión aprobada**.
- **G-015 [PENDIENTE]** Validar visualmente el menú y Settings tras revisar estas reglas; no hace falta una pantalla adicional para cada preferencia.

### 3P.8 Próxima fase de especificación

Tras validar Global Experience, ejecutar **auditoría de coherencia end-to-end** y congelar las decisiones funcionales en un PRD: mapa de rutas, roles, estados, lenguaje natural Yes/No, cálculos financieros y origen de datos de cada widget. Solo después generar el prompt maestro para Claude Code. La producción visual de Settings es opcional; aquí **más pantallas no significa mejor portfolio**.

**Changelog v1.4 — 10/10/2026:** imagen de Search + Notifications registrada como referencia de diseño; anotada su licencia compositiva de dos overlays simultáneos y las advertencias de datos; investigado modo demo (Kalshi), preferencias (Kalshi) y progressive disclosure/confirmaciones (NN/g); descritos menú, ajustes, modelo de estado y flujos de aceptación. Ninguna propuesta de Account/Settings/Insights se considera aprobada hasta validación de la usuaria.

---

# 04A. AUDITORÍA DE COHERENCIA END-TO-END — v1.5 (10 octubre 2026)

**Estado de esta sección: INVESTIGACIÓN + AUDITORÍA + RECOMENDACIONES.** Esta auditoría NO convierte automáticamente sus nuevas recomendaciones en decisiones aprobadas. Las elecciones visuales ya aprobadas prevalecen. Se revisa el recorrido completo y las reglas de producto, no solo la composición de cada pantalla.

## 04A.1 Veredicto ejecutivo

**Resultado:** dirección de experiencia sólida para un concepto de portfolio; **no está listo aún para un prompt de implementación sin un contrato de datos y decisiones de simulación**. El principal riesgo NO es que falten pantallas: es la inconsistencia entre representación editorial, lógica contractual, transacciones, cartera y fechas.

**Fortalezas aprobadas:** Home editorial y hero inmersivo; Explore opción B con filtros colapsados; Market Detail versión visual sencilla; Trading prediction-first y Review obligatorio; Portfolio primera versión `Your predictions`; búsqueda global y notificaciones como overlays ligeros de referencia. **No sustituir estas imágenes por las versiones descartadas.**

**Principio transversal recomendado:** un solo significado por dato y una sola fuente de verdad para cualquier estado compartido. Todo lo que el usuario ve en Home, Search, Explore, Market Detail, Review y Portfolio debe derivarse de `market`, `contract`, `quote`, `wallet`, `order`, `fill` y `position`, no de constantes independientes por pantalla.

### Hallazgos priorizados

| ID | Severidad | Problema transversal detectado | Corrección recomendada | Estado |
|---|---|---|---|---|
| A-01 | **BLOQUEANTE** | Cifras imposibles o contradictorias entre tarjetas, recibos, saldo y posiciones en mockups | Motor de cálculo y ledger únicos; fixtures validados por tests matemáticos | Propuesta técnica |
| A-02 | **BLOQUEANTE** | Fechas 2024/2025 aparecen como Live/Upcoming en capturas de 2026 | Reloj del escenario + estados de mercado derivados, datos editoriales demo | Propuesta técnica |
| A-03 | **BLOQUEANTE** | `Probability` se puede confundir con `Buy price`; `Current value` con `Cash out` | Modelo separado para probabilidad, quote de compra/venta y mark de valoración | Propuesta técnica |
| A-04 | **BLOQUEANTE** | Frase natural `Yes/No` puede cambiar inadvertidamente el significado de un contrato multiresultado | Objeto `proposition` y plantillas semánticas tipadas; nunca traducción improvisada por IA | Continúa decisión Trading aprobada |
| A-05 | Alta | En Market Detail se propone un mercado de ganador multi-candidato pero el ticket simplificado puede tratarse como dos candidatos binarios excluyentes | Elegir un contrato concreto por outcome; si es multiresultado no reducir el evento a dos opciones exhaustivas sin reglas que lo permitan | Propuesta |
| A-06 | Alta | `Buy`, `Review`, `Confirm`, `Success`, Portfolio y `Sell` pueden recalcular con datos distintos | Una sola intención de orden y snapshot de quote revisado; revalidar antes de confirmar | Propuesta |
| A-07 | Alta | Órdenes límite abiertas/parciales pueden inflar posiciones o falsear saldo libre | Contabilidad de cash total, cash reservado, disponible, fills y remanente de orden por separado | Propuesta |
| A-08 | Alta | Clic en card/saved/search podría saltar a outcome incorrecto o perder contexto | IDs estables y rutas compartibles, `returnTo`/query de origen restaurable | Propuesta |
| A-09 | Alta | `Saved` frente a `Active` no tienen la misma granularidad en todos los casos | Guardado por `marketId` y `outcomeId?`; posición por `contractId` y `side` | Propuesta |
| A-10 | Alta | `Insights` aparece como cuarta tab en todas las capturas, pero no tiene producto funcional definido | Resolver si se implementa destino real o se integra en Home/Detail. No dejar tab sin funcionar | **Pendiente** |
| A-11 | Alta | `Deposit` y otros textos simulan dinero real en una demo sin pagos | Cambiar a `Add demo funds`, etiqueta demo persistente; prohibido payment flow ficticio | **Propuesta previa pendiente** |
| A-12 | Media | Home y Explore tienen módulos temáticos potencialmente redundantes | Home curada; Explore catálogo. Agrupación temática solo en entrada `All`, lista enfocada al buscar/filtrar | **Propuesta previa pendiente** |
| A-13 | Media | Hero y micrográficos compiten en vistas densas | Respetar jerarquía visual aprobada: sin sparklines por fila en Home, filtros colapsados en Explore, sin gráfico global destacado en Portfolio | Consistente con decisiones visuales aprobadas |
| A-14 | Media | `Live`, `Open`, `Upcoming`, `Closed`, `Resolved`, `Suspended` se usan con semánticas divergentes | Máquina de estados con trading habilitado derivado de reglas, no solo badges | Propuesta |
| A-15 | Media | Notificaciones y búsqueda se muestran abiertas a la vez por composición de referencia | Paneles mutuamente exclusivos; keyboard/Escape/focus; no tapar acciones esenciales | Documentado en v1.4 |
| A-16 | Media | Los mockups atribuyen noticias y resultados hipotéticos a fuentes reales | Fijar dataset de titulares ficticios identificados como demo o referencias fechadas y comprobadas | Propuesta |
| A-17 | Media | Vistas avanzadas pueden crecer hasta duplicar un terminal financiero | Mostrar profundidad secundaria real, pero solo cuando se invoca; alcance P0 vs P1 claro | Dirección aprobada, alcance por cerrar |
| A-18 | Media | El rendimiento mostrado en % puede mezclar variación de probabilidad en pp y P&L porcentual | Unidades y etiquetas semánticas: `+8 pp / 24h`, `+12.0% return`, `$` de beneficio | Propuesta |
| A-19 | Media | CTA `Sell anytime` sin comprobar liquidez | `Review sale` con bid, fees, unidades disponibles y posible venta parcial/no ejecutable | Ya documentado, debe testearse |
| A-20 | Media | Demasiadas funcionalidades sin estados vacíos o mobile | Estado vacío, error, carga, falta de saldo, no liquidity, teclado y mobile por flujo | Propuesta de QA |

## 04A.2 Arquitectura canónica — inventario y rutas

**Rutas de contenido propuestas:**

| Ruta / superficie | Tarea de usuario | Estado de entrada / salida | Dato principal |
|---|---|---|---|
| `/` o `/home` | Descubrir algo relevante | `featured`, `trending`, `movers` → Market Detail o Explore | Mercado y probabilidad indicativa |
| `/explore?category=&q=&sort=&status=` | Buscar, filtrar y comparar | URL refleja filtros; `All markets` agrupa temas, query enfoca resultados | Search index único + market selector |
| `/markets/:marketId?outcome=:id&range=1M` | Entender pregunta, explorar resultados, comenzar operación | Market/outcome seleccionado; chart y ticket sincronizados | Contract + rules + quote |
| `/portfolio?tab=active|pending|history|saved` | Seguir predicciones e intervenir | Abre `Manage` por `positionId`; historial por `fillId`/`settlementId` | Positions + orders + ledger |
| `Global Search` overlay | Encontrar rápido y saltar a destino | Abre sobre ruta actual; `See all` pasa `q` a Explore | Mismo índice que Explore |
| `Notifications` popover | Entender qué cambió y llegar a ello | `notification.target` resuelve Market Detail, posición u orden | Eventos del motor de simulación |
| `Trade Slip` (en Market Detail) | Configurar Yes/No, buy/sell, importe | Mantiene selección, revisa sin ejecutar | DraftIntent, quote, balance |
| `Review → Receipt` modal/sheet | Comprender riesgo y confirmar | En Confirm se produce fill u orden pending; Receipt enlaza a Portfolio | Order + Fill + Ledger |
| `Avatar / Settings / Demo` menú | Saldo virtual y preferencias | Top-up y reset confirmados, sin salir del contexto | Wallet + preferences + scenario |

**Interacciones críticas:** `Home Featured → Detail` preserva mercado exacto; `Explore filtered → Detail → Back` restaura URL, scroll y filtros; `Search → Detail → Portfolio` mantiene outcome y posición; `Saved` alterna desde todas las superficies; un `Manage` de Portfolio abre el mismo `Sell Review` que Market Detail. Sin páginas duplicadas de `Trade` o de `Saved` en P0.

**Regla de overlays:** solo uno entre Search, Notifications, Account y modal Review en primer plano; no modales apilados sin necesidad. En mobile, Search pantalla completa y Review bottom sheet/pantalla accesible. Se conserva el mismo flujo económico.

## 04A.3 Modelo conceptual necesario (antes de diseño de clases definitivo)

```text
Event (acontecimiento) -> Market (pregunta y reglas) -> Outcome -> Contract (YES/NO, si aplica)
Market: id, question, propositionTemplate, category, closeAt, resolveAt,
        status, resolutionSource, resolutionRule, tags, artwork, news[]
Outcome: id, marketId, label, affirmativeStatement, negativeStatement
Quote: contractId, time, indicativeProbability, buyAsk, sellBid,
       availableBuyQuantity, availableSellQuantity, referenceMark
Order: id, contractId, side, action(BUY|SELL), type(MARKET|LIMIT),
       limitPrice?, requestedQuantity, filledQuantity, status,
       reservedCash, placedAt, updatedAt
Fill: id, orderId, contractId, action, quantity, executionPrice, fee, time
Position: contractId, quantityOwned, remainingCostBasis, accruedBuyFees,
          realizedPnl, latestMark, settlementStatus
Wallet: cashTotal, cashReserved, cashAvailable (derived), ledgerEntries[]
Notification: id, kind, eventId?, marketId?, positionId?, orderId?, readAt?
SavedItem: marketId, outcomeId?; SearchHistory: query, timestamp
Scenario: id, displayAsOf, seed, pricePath, fixtures, deterministicTriggers
```

**No asumir que cada `Event` corresponde exactamente a un solo contrato.** Una elección puede tener varios outcomes, mercados de nominación distintos y contratos Yes/No sobre cada resultado. La misma entidad de mercado alimenta previews en todas las pantallas; los contratos son la fuente para compras, ventas y posiciones.

## 04A.4 Contrato financiero: invariantes que evitan inconsistencias

**Modelo recomendado para P0:** contratos binarios con liquidación de `$1` si se cumple la proposición y `$0` si no; compras por **importe en dólares virtuales**, cantidades **enteras** en P0; sin apalancamiento, sin short/margen y sin comisiones en P0 **solo si se comunica claramente `Demo fees $0`**. Si se decide introducir fee, el importe total y los tests deben usar la misma función `feeFor(order, fill)`, sin porcentajes decorativos. Precio entero en centavos P0. Estos son **defaults técnicos propuestos**, no reglas ya aprobadas por la usuaria.

**Fuente de cada cifra:**

| Valor UI | Derivación correcta |
|---|---|
| Probabilidad | `quote.indicativeProbability` (expectativa implícita, no garantía) |
| Precio para comprar | `quote.buyAsk` + fee relevante; cotización sujeta a liquidez |
| Precio para vender | `quote.sellBid` - fee relevante; no confundir con mark |
| Contratos que recibirías | `floor((budget - estimatedFees)/buyAsk)` P0, calculado con comprobación de coste |
| Coste de compra | `filledQty × executionPrice + buyFees`, debita wallet solo cuando se ejecuta |
| Máximo payout bruto | `qtyOwned × $1` si todos los contratos correctos liquidan a $1 |
| Beneficio máximo neto | `maxPayout - originalCostBasis - futureRelevantFees`, condicionado a acierto |
| Pérdida máxima | coste comprometido incluido fee pagado (sin leverage), condicionado a fallo |
| Valor estimado de posición | `qtyOwned × latestMark`, etiqueta **valor estimado**, no garantía de liquidez |
| Efectivo estimado de venta | sumatorio de bids efectivamente disponibles por nivel menos fees; si insuficiente, advertir cantidad no cubierta |
| P&L no realizado | `currentMarkedValue - remainingCostBasis`, usando fees con política consistente |
| P&L realizado por venta | `netSaleProceeds - costBasisAllocatedToSoldQty` |
| Cash disponible | `cashTotal - reservedCash`; la reserva no implica gasto hasta un fill |
| Portfolio value mostrado | `cashTotal + Σ markedPositionValue` (el cash reservado está dentro del cash total, no sumarlo dos veces) |
| P&L global de trading | `realizedPnl + unrealizedPnl`; recargas demo y otros ajustes NO son ganancia |

**Ejemplo exacto de reconciliación, SIN fees:** saldo inicial `$1,000.00`; comprar `100` contratos Yes a `$0.40` → cash `$960.00`, coste de posición `$40.00`. Subir el mark a `$0.48` → valoración `$48.00`, P&L no realizado `+$8.00`, cartera `$1,008.00`. Vender `40` contratos al bid `$0.46` → ingreso `$18.40`, cash `$978.40`; coste atribuido a los 40 vendidos `$16.00`, P&L realizado `+$2.40`; quedan `60` contratos con coste `$24.00` y valoración `60 × $0.48 = $28.80`, P&L no realizado `+$4.80`; cartera `$1,007.20`, beneficio total `+$7.20`. **Igualdad de control:** `$2.40 + $4.80 = $1,007.20 - $1,000.00`.

**Órdenes pendientes:** para una orden limit de compra, el cash se reserva hasta cancelar o ejecutar; al fill se debita cash y reduce la reserva. Si parcialmente ejecutada, la parte llena aparece en posición y solo lo restante sigue en Pending; no contarla dos veces. Una orden de venta pending bloquea únicamente contratos reservados para vender, no añade proceeds hasta fill. Los top-ups demo aumentan aportaciones y cash, pero NO rentabilidad ni P&L.

**Ejecución inmediata simulada:** debe modelar un `marketable buy` contra ask y un `sell` contra bid. Revalidar quote en `Confirm`; si cambian precio/fee/cantidad relevante, regresar a Review mostrando diferencia y pedir confirmación explícita; no ejecutar silenciosamente en nuevas condiciones. Al no haber liquidez, deshabilitar o informar; un botón no promete fill. En P0 se admite **fill completo o rechazo legible** para reducir complejidad, dejando fills parciales avanzados en un escenario P1.

**Fuentes contrastadas:** Polymarket explica la diferencia entre precio mostrado (basado en mid/last) y bid/ask; Kalshi diferencia portfolio value, positions, cash, payout y precio real de cash-out; Robinhood explica cerrar posiciones antes de settlement, revisar órdenes y tipos IOC/limit. Ver:
- https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated
- https://help.kalshi.com/en/articles/13823844-portfolio-balances-and-positions
- https://robinhood.com/us/en/support/articles/trading-event-contracts/

## 04A.5 Continuidad semántica: propuesta legible en todas las pantallas

**Nunca construir el texto principal a partir de “compré 125 shares de X”**. Cada outcome lleva textos `affirmativeStatement` y `negativeStatement` verificados contra reglas, por idioma y market type. Ejemplo:

```text
Question: "Will a crewed mission land on Mars by Dec 31, 2035?"
YES: "I think a crewed mission will land on Mars by December 31, 2035."
NO:  "I think no crewed mission will land on Mars by December 31, 2035."

Home card:       "Crewed mission to Mars by 2035?" — Yes 42%
Market Detail:   exact question + condition for resolution + Yes/No
Trade:           "Your prediction: A crewed mission will land on Mars by 2035"
Review:          "You're investing $40 in this prediction" + risk/payout
Receipt:         "Your prediction is active" + actual fill and fees
Portfolio:       same affirmative statement + estimated value + unrealized P&L
Sell:            "You're selling 40 of your 100 contracts backing this prediction"
Resolved:        "This prediction settled as Yes" + source and payout
```

En mercados de candidato, la frase negativa solo niega a esa persona; no afirma automáticamente la victoria de otra. En mercados de 3+ outcomes, el usuario selecciona el outcome exacto; cantidades del gráfico de una opción no se atribuyen a las demás. `Resolved` no equivale a `sold` ni a `won` sin la regla de contrato.

**Reglas visibles en lenguaje claro antes de operar:** `What needs to happen for this to be correct?`, fecha y hora con zona, fuente, excepciones, regla completa enlazada; diferenciación clara entre `Market closes` y `Resolves`. Noticias simuladas etiquetadas `Demo storyline` sin adscripción engañosa a medios reales.

## 04A.6 Máquinas de estado mínimas

**Mercado:** `UPCOMING → OPEN → SUSPENDED? → OPEN? → CLOSED → PENDING_RESOLUTION → RESOLVED(YES|NO)|VOIDED`. `UPCOMING` sin trading en P0; `OPEN` lo permite; `SUSPENDED`, `CLOSED`, `PENDING_RESOLUTION`, `RESOLVED` y `VOIDED` lo bloquean. `Live` es **indicador del evento**, no permiso para operar por sí solo. El cierre y la resolución son hitos diferentes.

**Orden:** `DRAFT → REVIEWED → SUBMITTED → FILLED | OPEN | PARTIALLY_FILLED | REJECTED | CANCELLED | EXPIRED`. Al confirmar puede generar `OPEN` (limit) o fill (marketable). No mostrar `Prediction active` hasta al menos un fill; `Order placed` si sigue abierta. Cancelar solo remanente sin deshacer fills previos.

**Posición:** `NONE → OPEN → PARTIALLY_SOLD → CLOSED_SOLD | SETTLED_WON | SETTLED_LOST | VOIDED`. Todo estado conserva recibo de compra y, si aplica, venta y settlement. Una posición ganando en P&L no está resuelta. Si se resuelve, no permitir venta posterior.

**Alertas:** disparadas por eventos del simulador, no por render. `Order filled`, `Partially filled`, `Resolved`, `Price moved ≥ threshold in pp/period`, `Closing soon`. Preferencias y leído/no leído persistentes; no notificaciones duplicadas al recargar.

## 04A.7 Revisión por pantalla y condiciones de integración

| Superficie | Qué conserva de referencia aprobada | Interacción P0 que debe funcionar | Qué NO copiar del mockup |
|---|---|---|---|
| **Home** | Hero a top bar, impacto editorial, categorías, Trending/Movers legibles | Featured/Category/Market opens; Bookmark; Search/Portfolio | Porcentajes, volumen o `LIVE` incompatibles; sparkline por fila |
| **Explore** | Opción B, categorías ilustradas y filtros colapsados por defecto | Expandir filtros, query en URL, orden, back restaurado, abrir mercado | Filtros expandidos por defecto; 2025 con mercados abiertos |
| **Market Detail** | Segunda versión simple, outcomes grandes, chart protagonista y ticket | Outcome changes chart+ticket; rules; tabs; bookmark; Review | Sentiment decorativo; gráfico cuyo dato difiere de la tarjeta; ticket con `shares` como lenguaje primario |
| **Trading** | Storyboard prediction-first 3 pasos y review | Buy Yes/No, re-price review, confirm, receipt, manage/sell | Cifras imposibles o fees no deducidas; orden `placed` fingida como ejecutada |
| **Portfolio** | Primera versión Your Predictions, 3 KPIs, 4 tabs, detalle lateral | Open Manage, Sell partial/full, Pending cancel, Saved, Activity | Gráfico de rendimiento gigante, allocation panel, métricas financieras dominantes |
| **Global** | Search overlay y Notifications panel | Query/keyboard, `See all`, avisos contextualizados y marcados como leídos | Dos overlays simultáneos como estado normal; noticias falsas presentadas como reales |
| **Account/Demo** | Menú compacto propuesto sin nueva página nav | Settings, add virtual funds, reset confirmado, persistencia | Depósito real, KYC, perfil ficticio autenticado |

**Resumen IA / Insights:** todavía no hay evidencia de que un producto de `Insights` independiente mejore los objetivos de esta demo. Si existe tab, debe tener contenido funcional real. Para un MVP con foco y calidad, **recomendación de la auditoría: nav de 3 destinos** (`Home`, `Explore`, `Portfolio`) + editoriales integradas. `Insights` en las capturas antiguas se considera decoración sujeta a cambiar, NO una tab aprobada. Solicitar aprobación antes de cerrar nav en Claude Code.

## 04A.8 Escenarios deterministas recomendados y cobertura de la demo

**Dataset mínimo propuesto:** entre `16–24` mercados con balance de categorías y tipos; `4–6` muy detallados capaces de sostener trading e historias visuales, resto para descubrimiento. Incluir: un binario Yes/No, uno multiresultado (mín. tres alternativas), un umbral numérico, uno deportivo, uno próximo a cierre, uno suspendido, uno ya resuelto y uno guardado sin posición. Todo con `displayAsOf` fijo inicial dentro de 2026 y cierre posterior para mercados abiertos.

**Estado inicial sugerido para portfolio demostrativo:** 3–4 posiciones vivas de distintos estados de P&L, una orden límite abierta, otra parcialmente llena para ruta de ejemplo, 2+ saved y un historial resuelto. También incorporar un modo `Clean slate` mediante `Reset scenario / Start fresh` si queremos demostrar onboarding desde cero. El saldo y los contratos deben ser generados con matemática coherente, NO transcritos de las capturas.

**Casos de aceptación prioritarios que deberá ejecutar la futura implementación:**

1. Desde Home pulsar Hero y abrir exactamente ese `marketId`; Bookmark se sincroniza con Saved.
2. En Explore filtrar Politics + sort Most recent; abrir mercado; Back conserva filtros y scroll.
3. `Ctrl/Cmd+K`, escribir alias, abrir resultado correcto; `See all` conserva query.
4. Market Detail cambia outcome A → B y modifica gráficos, quote, statement, reglas relevantes y ticket.
5. `Buy Yes` con saldo suficiente → Review muestra precio **ask**, fees, max gain/loss → Confirm → receipt → Portfolio; no side effects antes de confirmación.
6. Modificar precio antes de Confirm obliga a revisar nueva cotización; Cancel no altera wallet.
7. `Buy No` conserva negación semánticamente correcta sin inferir ganador alternativo.
8. Una venta parcial en Portfolio → Review usando **bid** → Confirm → cash, coste restante y realized P&L reconciliados.
9. Orden limit abierta reserva saldo y aparece en Pending; cancelarla lo libera; fill parcial mueve solo unidades llenas a Active.
10. Fixture de suspensión bloquea Buy/Sell y muestra estado comprensible; `Resolved` cambia a History y genera liquidación única.
11. Notificación de fill navega a posición específica; de resolución a historial; `Mark all read` persiste.
12. Price alert opt-in solo salta al alcanzar umbral en **pp**; no se duplica al recargar.
13. `Add demo funds` aumenta cash y aportaciones, pero no P&L; reset restaura exactamente estado inicial.
14. Fecha y estado de todos los fixtures consistentes con `displayAsOf`; no market expired como Live.
15. Mobile: navegar, buscar, revisar buy/sell, abrir reglas, ver portfolio y reset con teclado/screen reader; reduced-motion efectivo.
16. Auditoría de accesibilidad: contraste, foco, estados no solo por color, denominación de probabilidad, targets táctiles razonables y soporte teclado.

**Requisitos técnicos propuestos para entrega futura:** estado serializable/persistente local, selectores derivados puros, utilidades financieras con tests unitarios, fixture schema validado, e2e tests con estados precargados y timestamps deterministas. No requieren backend real, broker, cartera cripto, transacciones monetarias, proveedores pagos ni cotizaciones en vivo.

## 04A.9 Alcance y prioridades para Claude Code

**P0 funcional imprescindible:** Home, Explore, Market Detail (binary + multi-outcome), Trading Buy/Review/Confirm/Sell, Portfolio Active/Pending/History/Saved, Search, Notifications básicas, demo balance, top-up/reset, acceso a reglas y estados de mercado, persistencia, responsive y accesibilidad. Implementar al menos un escenario comprobable de limit order pending/cancel (sin libro completo).

**P1 de enriquecimiento controlado:** order book realista pero simulado, fills parciales, news/event overlays en chart con fechas, filtros financieros avanzados, gráficos más ricos, notas/contexto del usuario, preferencias de notificaciones más detalladas. Incluir solo después de pasar todos los flujos P0.

**P2 opcional / fuera del primer alcance:** insights IA causales sin fuentes, chatbot, comunidad, perfiles sociales, app móvil nativa, gamificación, apuestas combinadas, arbitrage, terminal Pro separada, KYC, depósitos reales, infraestructura de exchange, push/email real, actualizaciones en vivo. Una feature AI contextual podría explorarse luego con evidencias simuladas transparentes.

**Tensión P0/P1 a resolver:** el storyboard aprobado muestra `advanced order`; podemos mantener la acción visible **solo si funciona** como limit order real de demo. El order book puede residir en Market Data P1; no crear botones huecos para impresionar.

## 04A.10 Las decisiones verdaderamente pendientes (no sobrecargar a la usuaria)

| Prioridad | Pregunta | Default recomendado por auditoría | Estado |
|---|---|---|---|
| 1 | ¿Dejamos `Insights` en navegación como página real? | No en P0; análisis embebido en Home/Detail | **A validar** |
| 2 | ¿Explore pasa a lista enfocada tras buscar/filtrar? | Sí: agrupaciones temáticas solo para `All markets` | **A validar** |
| 3 | ¿Qué política demo usamos para contratos y fees? | Contratos enteros, precio en ¢, `Demo fees $0` P0 y matemáticas auditables | **A validar** |
| 4 | ¿Cuál es el reloj y narrativa inicial? | Fecha fija de escenario 2026; markets ficticios con fechas futuras coherentes, dataset reproducible | **A validar** |
| 5 | ¿Settings de avatar y top-up/reset? | Menú pequeño + `Add demo funds` + `Reset demo` con confirmación | **Propuesta previa, no aprobada explícitamente** |

### Gate de salida hacia el prompt maestro

1. Aceptación explícita o elección provisional documentada para las decisiones 1–5.
2. Fixture definido con IDs, `asOf`, estados, resultados y quotes coherentes, más fuente editorial demo.
3. Fórmulas financieras traducidas a tests de referencia (ejemplo de §04A.4 incluido).
4. Revisión de cada imagen elegida con marca `visual only` y errores conocidos.
5. Prompt maestro con instrucciones de iteración y pruebas, sin afirmar validación con usuarios ni datos de impacto inventados.

**Conclusión:** el siguiente paso recomendable no es otra pantalla ni una nueva variación estética; es **cerrar estas decisiones pendientes** y preparar fixtures de ejemplo y contrato de datos. Después, el prompt maestro de Claude Code tendrá suficiente información para desarrollar un prototipo coherente y auto-verificable.

**Changelog v1.5 — 2026-10-10:** auditoría completa de rutas, estado compartido, lenguaje natural, quotes, órdenes, wallet, rentabilidad, notificaciones, fechas, estado de mercados, demo/Settings, P0/P1/P2 y pruebas end-to-end. No se han cambiado referencias visuales aprobadas. Nuevas políticas financieras, de navegación y simulación se anotan como recomendaciones pendientes, nunca como aprobaciones implícitas.


---

# 04B. SPEC FINAL DE LA DEMO + STACK TECNOLÓGICO + CORRECCIONES APLICADAS (10/10/2026)

**Precedencia:** Este capítulo reemplaza las recomendaciones abiertas de 04A cuando son incompatibles. La usuaria pidió explícitamente que se corrigiese la auditoría y que se definiera la tecnología, el alcance, la ficción, la persistencia y el acceso directo. Las elecciones de este capítulo son **decisiones de especificación tomadas por el asistente por delegación de la usuaria**, no «la usuaria aprobó cada detalle». Quedan revisables durante la implementación, pero Claude Code debe tratarlas como defaults de partida. No se ha construido todavía la app ni se ha realizado testing real de usuario.

## 04B.1 Decisiones cerradas para diseñar y construir la demo

| ID | Decisión de trabajo | Motivo / implementación |
|---|---|---|
| IM-01 | **Sin registro, sin login, sin onboarding obligatorio.** Visitante entra en cuenta `Demo Explorer` ya preparada. | Un portfolio debe poder probarse en segundos. La cara/avatar visible no implica autenticación ni identidad real. |
| IM-02 | **Todo ficticio y explícito.** No dinero real, no brokerage, órdenes externas, blockchain, cotizaciones en vivo, email/push real ni artículos inventados atribuidos a medios reales. | Reducir riesgo, coste y dependencias; demostrar flujo íntegro en un entorno controlado. Etiqueta visible `Interactive demo · simulated markets` y ayuda al entrar en trading. |
| IM-03 | **Una visita = una sesión demo.** Estado compartido en la pestaña y supervivencia a reload; no se necesita retenerlo al regresar otro día. | Usar `sessionStorage` versionado. No base de datos ni `localStorage` para transacciones. Al cerrar pestaña normalmente se pierde; navegadores pueden restaurar sesiones y algunas pestañas clonadas pueden heredar una copia, así que NO venderlo como una garantía técnica absoluta de borrado al cierre. `Reset demo` fuerza restauración. |
| IM-04 | **Perfil inicial precargado**, con 4 posiciones, una orden pendiente, historial de compras y favoritos. | Portfolio impresiona desde el primer minuto. `Start fresh` da cuenta con saldo inicial y cartera vacía; `Restore showcase` restituye fixtures. Ambos requieren confirmación si borran acciones realizadas. |
| IM-05 | **Navegación principal de 3 destinos:** Home, Explore, Portfolio. `Insights` editorial integrado en Home/Market Detail; nada de tab vacía. | Menos opciones y sin ruta fantasma. Eliminar `Insights` de las capturas al implementar; no cambiar la imagen de referencia aprobada. |
| IM-06 | **Explore agrupado por categorías solo en el estado de descubrimiento general.** Al buscar/filtrar pasa a resultados únicos ordenados, conservando filtros y scroll al volver. | Conservar hero y categorías visuales de opción B, sin resultados duplicados ni grupos vacíos tras un filtro. Sidebar de filtros cerrada por defecto. |
| IM-07 | **Market Detail sencillo de entrada**; avanzado bajo `Market data`/`Rules` cuando se solicita. El ticket simple acompaña al chart. | Conserva la segunda referencia visual de Market Detail. `Sell` aparece si existe posición; `Review` siempre precede `Confirm`. |
| IM-08 | **Contratos enteros**, cotizaciones en centavos y liquidación de 0/100¢. **Comisión demo: $0** durante P0 y explicitada como `Demo fees: $0`. | Matemáticas verificables, menor complejidad. Prohibido mostrar 0,5 % o 2 % «decorativo» como en imágenes generadas. |
| IM-09 | **Mercados, noticias, gráficos, precios y eventos con reloj simulado fijo** `2026-10-10T12:00:00+02:00` inicialmente. | Visual predecible durante la visita en 2026 o años posteriores, pero con etiqueta `Demo snapshot · 10 Oct 2026`. No afirmar que este escenario está ocurriendo en tiempo real. |
| IM-10 | **Probabilidad indicativa ≠ ask/bid ≠ marcado de cartera.** P&L, cash y volumen calculados desde estado tipado compartido. | Corrige cifras contradictorias de los mockups. Alertas solo generadas por acciones/eventos del simulador. |
| IM-11 | **No crear una experiencia Pro completa, simulación de exchange ni AI generativa live.** | Cada elemento que parezca interactivo debe ser real en la demo; los módulos decorativos se simplifican o se eliminan. |
| IM-12 | **Prioridad: experiencia desktop excelente + mobile completo para tareas críticas.** | Es un portfolio visual, pero teclado, lector de pantalla, motion reducido, focus y contraste deben funcionar. |

**Aclaración importante del flujo inicial:** abrir la URL lleva directamente a Home con balance y cartera demo ya disponibles; NO hay una pantalla simulada de login ni un botón inútil `Sign in`. `Add demo funds` no solicita tarjeta ni datos personales y nunca convierte el concepto en una fintech real.

## 04B.2 Stack recomendado y alternativas evaluadas

**Recomendación elegida: `React + TypeScript + Vite + Tailwind CSS + shadcn/ui`.**

| Capa | Elección | Motivo y limitación |
|---|---|---|
| Runtime y bundler | React + TypeScript + **Vite** | Cliente SPA sin SSR ni API server para el MVP. Menos configuración que Next.js para un proyecto completamente ficticio; compilación estática `dist` portable. |
| Rutas | **React Router** modo declarativo | URL compartible `/`, `/explore`, `/markets/:id`, `/portfolio`; URLSearchParams para filtros. Evitar introducir Framework/SSR sin necesidad. |
| Estilos | **Tailwind CSS** + variables CSS de diseño | Flexibilidad editorial y sistema de tokens centralizado. No componer visuales premium solo con componentes genéricos. |
| UI accesible | **shadcn/ui** como base de componentes con código propio | Dialog, Sheet, Popover, Command, Select, Tabs, Tooltip, Button; adaptar por diseño y auditar accesibilidad/teclado. `SharpCN` de la consulta se entiende como shadcn/ui. |
| Componentes extra | **21st.dev** (catálogo) selectivo y opcional | Muy compatible con registries estilo shadcn, útil para ideas de hero, motion y secciones premium. **21st.dev NO es hosting ni framework**; componentes pueden ser de terceros con licencias/dependencias o límites de cuenta. Revisar fuente y no mezclar tres sistemas visuales. |
| Estado | **Zustand** con selectors puros y persistencia `sessionStorage` versionada | Una fuente central para cash, posiciones, órdenes, bookmarks, notificaciones, búsqueda y escenarios; sin backend. Estado derivado no persistido. |
| Gráficos | **Recharts**, inicialmente mediante charts shadcn/ui | Gráfico protagonista preciso, anotaciones/tooltip y periodos. Verificar versión compatible con `chart` actual; si hace falta un gráfico muy especializado, implementar componente aislado, no cambiar toda la librería. |
| Motion | **Motion** (`motion/react`) opcional + CSS transitions | Solo animaciones semánticas; respeto a `prefers-reduced-motion`, no movimiento permanente distractor. |
| Iconos | **Lucide** | Cobertura amplia, consistente con el stack. |
| Fixtures | JSON/TypeScript local + **Zod** de validación | Fuente única para todos los mercados y estados, datos de prueba tipados. No API keys. |
| Financieras | Funciones TS puras, dinero en **centavos enteros** | Evitar deriva por floating point y duplicar fórmulas en componentes. |
| Pruebas | **Vitest + React Testing Library + Playwright** | Unit tests contables, interacciones críticas, e2e y QA de navegación responsive. |
| Publicación | **GitHub** → Vercel/Netlify o despliegue estático compatible; **Replit** opcional | Exportar a `dist` y configurar fallback de rutas SPA. Repo reutilizable, sin depender de Replit para abrir la URL final. |

**Por qué no Next.js en P0:** no hay SEO dependiente de SSR en el contenido dinámico, endpoints reales, autenticación ni base de datos. Introducir server components, middleware y SSR añade complejidad sin aportar valor demostrable. Es viable migrar si el proyecto deja de ser una demo; **no lo necesitaremos para lucir funcionalidades reales de frontend**.

**21st.dev vs Replit:** 21st es un catálogo/herramienta para encontrar e instalar componentes React/shadcn; Replit es un IDE/plataforma donde importar y ejecutar el proyecto, normalmente desde GitHub. Son complementarios, no alternativas. Las instalaciones de 21st pueden requerir cuenta, créditos o limitarse; Claude Code **no dependerá** de una API privada de 21st para compilar. Preferir copiar código revisado al repo con licencias y dependencias documentadas. Compatibilidad CSS tokens y primitivas es requisito antes de fusionar cada componente.

**Fuentes técnicas oficiales comprobadas (2026-10-10):**
- shadcn/ui + Vite: https://ui.shadcn.com/docs/installation/vite
- shadcn/ui charts (Recharts, con nota de compatibilidad): https://ui.shadcn.com/docs/components/radix/chart
- 21st.dev y registries compatibles con shadcn: https://21st.dev/blog/shadcn-compatible-component-libraries
- 21st CLI/agent: https://docs.21st.dev/mcp
- React Router simple (Vite): https://reactrouter.com/start/declarative/installation
- Vite build `dist` y deployment: https://vite.dev/guide/static-deploy.html
- Replit import desde GitHub o ZIP: https://docs.replit.com/build/import-from-providers

## 04B.3 Navegación y UX de invitado ya «autenticado»

```text
Open portfolio project URL
  → Immediate Home; virtual demo account already available
    ├─ Explore → Search / category / filters / sort → Market Detail
    ├─ Market Detail → Choose outcome/side → Enter amount → Review → Confirm
    │                                                        → Receipt → Portfolio
    ├─ Portfolio → Active / Pending / History / Saved → Manage → Review sale
    ├─ Search (Cmd/Ctrl+K) → Market Detail or all results in Explore
    ├─ Bell → actionable notifications (simulated; same shared state)
    └─ Avatar `Demo Explorer` → Add virtual funds / Reset / Settings / About
```

**Account menu**: no email, no password, no password reset, no payment methods; avatar/alias de demo explícitos. Balance y reset son funcionalidades. `Add demo funds` permite cantidades predefinidas (p. ej. $250/$500), actualiza aportaciones sin considerarse beneficio. `Reset` ofrece dos presets `Restore showcase` / `Start fresh`, con un breve aviso que se perderán los cambios de la sesión. `About` explica que es un concepto experimental y no contiene precios en tiempo real.

**User journeys principales**: primera visita → descubrir → seleccionar y apoyar predicción → revisar reglas y posibles pérdidas → confirmar → ver posición → vender parte; visita alternativa → ver holdings precargados → revisar/gestionar → filtrar órdenes pendientes → cancelar; visitante investigador → explorar mercado con outcomes múltiples/contratos; visitante técnico → abrir Market Data y probar un limit order funcional.

## 04B.4 Política exacta de continuidad de sesión

- **No accounts**: estado personal del visitante solo en el navegador. Sin login, OAuth, cookies de identidad, analítica identificable, backend, REST de órdenes, DB ni mensajería externa en P0.
- **Estado serializable** (wallet, posiciones, órdenes, fills, favoritos, preferencias, notificaciones) en **`sessionStorage` por pestaña**. Opcionalmente guardar búsqueda reciente mientras dure la visita. `localStorage` prohibido para órdenes y portfolio por política del concepto.
- **Se preserva durante la navegación SPA y reload de la misma pestaña**, al pulsar Back/Forward y al abrir Market Detail desde una notificación. Se borra con `Reset`; tras cerrar la pestaña y comenzar una nueva visita suele restaurarse el seed. **Advertencia:** algunos navegadores pueden restaurar sessionStorage al recuperar una sesión o al duplicar una pestaña; evitar prometer un borrado universal al cerrar.
- El estado inicial incluye `sessionSchemaVersion`; si cambia la forma de los fixtures o el usuario acumula un estado incompatible tras desplegar nueva versión, se migra con validación o **se restablece explícitamente** con un mensaje amable (no pantalla rota).
- **Cada visita es independiente**. Sin sincronización cross-device, cross-tab ni identidad persistente; no compartir posiciones privadas por URL. Sí compartir **rutas públicas de mercados y filtros**. La URL `?scenario=...` se puede usar internamente para reproducir pruebas, y debe estar claramente etiquetada como escenario de demo.
- **No actualizaciones automáticas impredecibles**: el precio de mercado se mantiene estable salvo acciones reproducibles del escenario. Un posible `Advance demo` en Settings permite simular un cambio de cotización o resolución con botón explícito (P1 o modo showcase controlado), y registra notificaciones una única vez por evento.

## 04B.5 Dataset de referencia empaquetado y fuente de la verdad

**Archivo companion:** `Prediction_Market_2_0_Demo_Fixtures_v1.6.json`. Incluye **24 mercados** ficticios y diversos en **8 categorías**, tipos binarios, de umbral, deportivos y multiresultado, escenarios OPEN, PENDING_RESOLUTION y RESOLVED, precios `indicative / ask / bid`, reglas demo y un perfil con posiciones/saldo/órdenes consistentes.

- Reloj inmutable por defecto: `2026-10-10T12:00:00+02:00`. Mostrar discretamente `Demo snapshot — October 10, 2026`. Eventos de la historia ficticia, NO actualidad, NO testimonios reales; no convertir los valores en afirmaciones actuales.
- El seed contiene 4 posiciones abiertas, una orden limitada pendiente, historial de fills de apertura y 3 guardados. Incluye un evento resolviéndose y uno resuelto sin inventar cash-out del usuario.
- **Punto de reconciliación comprobable en el fixture** (sin comisiones): aportación $1,000.00; coste agregado de posiciones $123.60; efectivo total $876.40; $4.40 reservado en orden pendiente; **cash disponible $872.00**; valor marcado de posiciones $128.40; **valor de cartera $1,004.80** y **P&L de trading +$4.80**. Reservar cash no cambia el valor total. Estos datos son del fixture, no de capturas.
- **Payout y beneficio no son lo mismo.** Si el usuario compra 100 contratos a 40¢, el coste es $40 y su pago bruto máximo es $100; beneficio máximo sin fees $60; pérdida máxima $40. El modal explica costo, resultado positivo, resultado negativo y detalles de contratos.
- **Contrato positivo y negativo**: outcome afirmativo `Yes` y `No` explícitos; No nunca implica automáticamente la victoria de una opción diferente. El tipo multiresultado mantiene outcomes individuales, no fuerza suma a 100 si los contratos/eventos no son mutuamente excluyentes; cuando sí son mutuamente excluyentes, redondeo controlado.
- **Importante**: el JSON es un seed de referencia, NO el modelo TypeScript final de la app. Claude Code podrá normalizar entidades, añadir descripciones y reglas completas, completar assets y generar curvas de precio derivadas de las probabilidades, pero no alterar los invariantes financieros ni la lógica de estado sin justificarlo.

### Motor de trading y límites del entorno ficticio

**Lo que SÍ funcionará realmente en frontend:** search, filters, bookmarks, navegación contextual, cambio de outcome, chart/tooltip/rangos, read rules, seleccionar Yes/No, importe, revisar, compra inmediata simulada con ask y comprobación de saldo/liquidez, recibo, portfolio, venta total/parcial con bid, ganancias/perdidas, historial, orden límite pendiente/cancelación, alertas simuladas, depósito ficticio, reset y empty states. Las operaciones mutan realmente el estado cliente de la pestaña.

**Lo que NO hará:** ver órdenes reales, matching multiusuario, dinero real, gestión de pagos, banca, KYC, onchain, noticia live, estimación de probabilidad por LLM, integración broker/mercado, streaming real, identidad de usuario, base de datos cloud. El concepto será **interactivo, no financiero**.

**Liquidación de contratos:** si el escenario avanza a resolución con ganancia, transferir `qty*100¢` una sola vez a cash y cerrar posición; si pierde, transferir 0 y cerrar, registrando coste histórico y P&L realizado; si voided, devolver coste según regla fixture. Órdenes abiertas del mercado se cancelan y liberan reservas. No permitir vender o comprar contratos resueltos. Toda transición es reversible solo vía Reset, nunca reescribiendo el ledger silenciosamente.

**Política de liquidez**: para órdenes inmediatas P0 ofrecer fill completo simulado si el escenario tiene suficiente cantidad en ask/bid; en caso contrario aviso «Not enough liquidity at this price» y opción de reducir el monto o cambiar a limit order. Las limit orders siguen pendientes a menos que un evento determinista simulado las ejecute; no crear fills automáticos por pulsar el botón. Un partial fill controlado es P1, con tests de conservación de cash y quantity si se añade.

## 04B.6 Diseño del contenido: referencia de imagen vs fixture

- **Las siete imágenes elegidas NO son wireframes pixel-perfect** y contienen errores numéricos, fechas antiguas, candidatos hipotéticos, prensa falsa, copies «Deposit» y acciones que aún no tienen motor. Son **referencias visuales de jerarquía**, no requisito de replicar texto/valores.
- Home: hero integrado a la top bar y contenido reducido. Explore: opción B, filtro colapsado y grupos al inicio. Detail: segunda versión simplificada. Trading: storyboard con microcopy prediction-first. Portfolio: **primera** imagen de dos, sin gran gráfico de performance ni asset allocation. Global: overlays de Search y Bell separados en ejecución.
- **Marca `NOVA` provisional**. Eliminar enlace `Insights` como página, CTA `Deposit` cambia a `Demo funds`; en cartera los porcentajes de movimiento siempre etiquetados en **pp** vs rendimiento económico en **%**.
- El chart no inventa periodos incompatibles: todas las series finalizan en la probabilidad indicativa del fixture; el Trade Slip utiliza ask/bid correspondiente a ese outcome/side.
- Assets visuales finales: usar arte generado o imágenes con permisos claros; evitar usar logos de empresas o fotos de personas sin licencias apropiadas. Si se reutilizan mockups generados como referencia, no confundirlo con permiso automático de uso de marcas/nombres/noticias.
- **Insights no desaparece como contenido**: pasa a bloques editoriales y `News` del detalle, siempre presentados como narrativas de demostración con timestamp propio, sin fingir Reuters/BBC reales.

## 04B.7 Arquitectura de carpetas y contrato de implementación

```text
src/
  app/                 router, providers, root layout, error boundaries
  pages/               Home, Explore, MarketDetail, Portfolio
  components/
    ui/                shadcn primitives customizados
    global/            navbar, search overlay, notifications, demo account
    markets/           market card, category, outcomes, chart, rules
    trading/           trade slip, review, receipt, advanced limit order
    portfolio/         prediction cards, tabs, position detail
  domain/
    types.ts           Market, Outcome, Order, Fill, Position, Wallet
    quotes.ts          indicative / ask / bid, liquidity and validation
    ledger.ts          cash/positions/cost basis/realizedPnL/settlement
    copy.ts            prediction-first statement templates
    selectors.ts       derived balance, marks, P&L, portfolio value
  data/                scenario loader, fixtures JSON, asset manifest
  state/               Zustand store, sessionStorage adapter, reset/presets
  styles/              Tailwind, tokens, responsive, reduced-motion
  tests/               unit, components, e2e
public/assets/         licensed or generated media + accessible fallbacks
```

**Reglas para Claude Code:** componente visual solo consume selectors y acciones de dominio (no realiza cálculo financiero ad hoc); fixtures y tiempos validados; UI que no funcione se elimina o marca no disponible con explicación; no usar APIs de terceros o pagos; versiones de npm tomadas de la documentación actual y bloqueadas en lockfile; no cambiar el stack por otro sin un motivo de implementación concreto. GitHub será la fuente de verdad del código. `npm run build`, `npm run test`, `npm run test:e2e` y `npm run lint` deben pasar. Evitar dependencia del entorno de Replit en código de dominio.

### Compatibilidad de deploy

- Vite genera `dist/`, apto para Vercel, Netlify, Render Static o un destino equivalente. En SPA con History API, configurar **rewrite de paths a `index.html`** para que `/markets/:id` funcione al abrir directamente.
- Replit permite importar proyectos desde GitHub (y ZIP) y continuar desde su editor; puede servir como ambiente de desarrollo/demo, pero la URL final de portfolio puede alojarse donde resulte más fiable y rápido. **No vincular el repo a un servicio privado para ejecutar el frontend.**
- Los enlaces de mercados solo describen contenidos demo; nunca contienen cash, operaciones o IDs de sesión.

## 04B.8 MVP vs mejoras — alcance que debe respetar el agente

| Alcance | Incluido | No incluir todavía |
|---|---|---|
| **P0 obligatorio** | Home, Explore + filtros colapsados, Detail binario/multiresultado, chart, reglas, ticket prediction-first, Review/Confirm/Receipt, compra/venta total/parcial, Portfolio 4 tabs y saldo, Search, Bell, bookmarks, Demo funds/Reset, caso de orden límite pendiente/cancelable, estados OPEN/CLOSED/RESOLVED, sessionStorage, responsive y tests. | Backend, login, registros, depósitos reales, AI chatbot, market making complejo, push/email, cientos de mercados, gamificación. |
| **P1 tras QA** | Noticias demo anotadas en gráfico, order book simulado, liquidez enriquecida, fill parcial, alertas configurables más finas, filtros avanzados, animaciones de lujo, scenario controls visibles para portfolio walkthrough. | Cambiar UX base, otra navegación Pro, compra sin revisión, reporting externo. |
| **P2 reservado** | Posible análisis contextual transparente a partir de los fixtures si aporta valor al caso de estudio. | Chatbot genérico, LLM live sin evidencia, trading real, app nativa. |

**Definition of Done P0:** todo CTA visible responde y la ruta por teclado funciona; los seis pasos Buy→Sell encadenan estado, cálculos y confirmations; un usuario nuevo entiende el contrato sin leer un glosario financiero; las reglas accesibles antes de confirmación; keyboard/contrast/reduced motion tested; rutas, filtros y activos móviles; ninguna imagen/importe contradice el motor. El contenido es correcto respecto al RELOJ DEMO, no necesariamente al día actual.

## 04B.9 Plan de construcción autónoma e iteración

1. **Bootstrap y quality gate:** repo React/TS/Vite, shadcn, router, lint, Vitest, Playwright, tokens preliminares, seed validado. Captura y referencia visual por pantalla disponible al agente.
2. **Dominio antes que UI compleja:** test unitarios quote/side, int cents, compra/venta parcial, settlement, reserva de limit order y P&L; invariantes de cartera. Prohibido continuar con pantallas complejas si fallan.
3. **Shell y descubrimiento:** layout visual, Home, Explore (grupos vs lista filtrada), búsqueda, favorito, navegación compartida, responsive básico.
4. **Market Detail + Trading:** outcomes y chart, reglas, simple slip, modal Review, receipt; e2e de Buy Yes, Buy No y cambio de precio.
5. **Portfolio + estado compartido:** cards prediction-first, gestor posición, venta parcial, pendientes, historial y saved; `Add demo funds`, reset, alertas. QA de no doble cargo, no doble settlement.
6. **Visual QA comparativo:** confrontar cada pantalla con su IMAGEN APROBADA de la carpeta `references/`; adaptar densidad, jerarquía, contraste, scroll, tamaños, mobile y motion. Primero corregir UX, luego detalles decorativos.
7. **Autocorrección final:** ejecutar lint, typecheck, build, unit, e2e, keyboard/axe checks y screenshots desktop/mobile; corregir fallos repetidamente y entregar README con cómo ejecutar, escenarios y limitaciones. No afirmar que tests pasaron sin ejecutarlos.

**Checklist E2E mínimo adicional a 04A.8:** `fresh-start → buy → portfolio → reload same tab → position remains`, `reset → state exact snapshot`, `second independent session → untouched seed`, `direct market deep link → fixture loaded`, `closing/resolved cannot buy`, `top-up not counted as P&L`, `multioutcome No text not ambiguous`, `route back restores Explore filter`, `limited liquidity blocks misleading sale`, `notifications do not multiply on reload`.

**Métricas de éxito de implementación (no métricas reales de usuarios):** 100 % de rutas P0 navegables, 100 % de botones P0 funcionales, todos los tests de dominio pasando, cero errores de conciliación a nivel de centavo, ninguna atribución falsa de noticias y al menos un recorrido guiado completo realizado en desktop y móvil. Estas son **metas de QA**, no resultados medidos ni resultados de investigación de usuarios.

## 04B.10 Decisiones delegadas resueltas / por confirmar solo si se desea cambiar

- **Aprobado explícitamente antes:** concepto generalista, impacto visual/carga cognitiva baja, Home/Explore separados, referencias seleccionadas, prediction-first, Review antes de confirmar, Portfolio predicciones, sidebar de filtros Explore colapsada.
- **Resuelto como default por petición actual de corregir/definir:** 3 tabs sin Insights, cuenta demo sin login, fondos virtuales, sesión por pestaña, no continuidad entre visitas, seed de portfolio precargado + fresh start, Vite/React/TS/shadcn/21st opcional, 24 mercados demo, fees cero, clock de demo fijo, no APIs reales.
- **No equivale a aprobación explícita de microdetalles:** duración exacta de la sesión, estética final de marca, contenido editorial exacto o modalidades P1; pueden refinarse antes o durante Claude Code sin reabrir la arquitectura.

**Changelog v1.6 — 2026-10-10:** se resolvieron 20 riesgos de auditoría como contratos de dominio, copy, navegación y QA; definido stack SPA portable compatible con shadcn/21st/Replit; decidido acceso sin login; estado de visita con sessionStorage y reset; dataset ficticio local, consistencia matemática, P0/P1/P2, estructura de carpetas, entregas incrementales y criterios de aceptación. Companion JSON de 24 mercados y cartera inicial reconciliada; empaquetadas siete referencias elegidas sin modificar imágenes.


# 05. HANDOFF IMPLEMENTACIÓN — v1.7 (10 octubre 2026)

**Estado:** READY FOR CLAUDE CODE. La app todavía NO ha sido programada. Este capítulo cierra el briefing de construcción y tiene precedencia sobre sugerencias más antiguas cuando sean incompatibles.

**Reglas operativas oficiales en el paquete:** `CLAUDE.md`, `docs/IMPLEMENTATION_CONTRACT.md`, `docs/QA_AND_SCENARIOS.md`, `docs/DESIGN_REFERENCES.md`, `data/demo-fixtures.v1.7.json`, `scripts/validate-fixtures.py` y `PROMPT_MAESTRO_PARA_CLAUDE_CODE.md`.

## 05.1 Correcciones nuevas y decisiones finales

1. **Fixtures v1.7**: mismas 24 preguntas y cifras base reconciliadas, pero cada mercado ahora tiene `resolutionRule` explícita y ficticia, `chartPoints` deterministas, `demoLiquidity` declarada y `scenarioDefinitions` ejecutables para QA. Reemplaza el JSON v1.6 al comenzar a programar.
2. **Valor de Portfolio**: fee demo $0, contratos enteros, precio en centavos, mark != ask/bid, reservas no duplicadas, valores derivados del store. Se prohíbe copiar números de las imágenes generadas.
3. **Sesión**: cuenta demo precargada sin login, `sessionStorage` versionado y reset; no reenganche persistente entre visitas garantizado. Los enlaces públicos sí preservan filtros/market id.
4. **Datos congelados**: snapshot fijo 10/10/2026. Ninguna noticia, evento, chart o probabilidades en vivo o atribuidas como hechos reales. La marca NOVA y algunos sujetos son ficticios/ilustrativos.
5. **Arquitectura P0**: SPA Vite + React/TS + Tailwind/shadcn, Router, Zustand, Recharts, Zod, Vitest/RTL/Playwright; 21st.dev opcional, Replit/importación GitHub opcional; nada de backend.
6. **UX visual**: siete referencias exactas en `docs/DESIGN_REFERENCES.md`. Home hero inmersivo; Explore opción B con filtros colapsados; Market Detail segunda simplificada; Trading prediction-first; Portfolio **primera** referencia elegida; Search/Bell en overlays separados. Navegación Home/Explore/Portfolio (Insights integrado).
7. **P0 con profundidad auténtica**: compra y venta revisadas, multiresultado NO semánticamente correcto, limit BUY pendiente/cancel, notificaciones deterministas, reset/fresh, mobile/keyboard. Funciones P1 solo cuando P0 pase QA.
8. **Ejecución autónoma**: fases con quality gates y correcciones iterativas; ningún test puede darse por ejecutado sin ejecutarlo.

## 05.2 Ready / pendiente

**GO para entregar a Claude Code.** No hace falta añadir otra pantalla o decidir el nombre/branding final para construir un MVP sólido. Quedan únicamente decisiones de producción que pueden tratarse después: licencia/creación de imágenes finales, hosting, motion refinado y P1. La auditoría completa está en `docs/READINESS_AUDIT.md`.

**Changelog v1.7 — 2026-10-10:** paquete de handoff cerrado con prompt maestro único, normas CLAUDE.md, contrato técnico/UX, QA y fixtures ampliados/verificados; referencias visuales aprobadas intactas. No hay claims de app construida ni de validación con usuarios.
