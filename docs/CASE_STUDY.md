# Likely — rediseñando los prediction markets para personas, no para traders

**Rol:** Product Designer (concepto, UX, UI, identidad y prototipo funcional)
**Tipo:** Proyecto personal / concepto de producto
**Entregable:** Web app interactiva con mercados ficticios y dinero virtual

---

## El punto de partida

Los prediction markets (Polymarket, Kalshi…) son una idea muy potente: la gente apuesta por lo que cree que va a pasar y el precio refleja lo que piensa el colectivo. Pero la experiencia está diseñada para quien ya sabe operar. Se habla de *contratos*, *ask*, *bid*, *order books* y porcentajes que suben y bajan, y todo se presenta con la estética de un terminal financiero: fondo oscuro, verde y rojo de bolsa y mucha densidad de datos.

Para alguien que solo tiene una opinión ("creo que esta candidata va a ganar"), el camino entre esa intuición y la operación está lleno de jerga y de miedo a equivocarse con el dinero.

**La pregunta del proyecto:** ¿cómo sería un prediction market pensado para cualquier persona? Intuitivo, visual y tranquilo. Como si lo hubiera diseñado Apple.

## Intención

1. **Partir de la opinión, no del instrumento financiero.** El usuario no "compra 125 contratos Yes a 40¢": dice lo que cree que va a pasar.
2. **Hacer que la probabilidad se entienda de un vistazo**, sin saber leer mercados.
3. **Que el dinero nunca dé sorpresas:** antes de confirmar, la persona sabe qué pone, qué puede ganar y qué puede perder.
4. **Profundidad progresiva:** lo simple delante y los datos técnicos (precios de compra y venta, reglas, tabla de mercado) disponibles bajo demanda, sin desaparecer.

## Qué lo hace diferente

### 1. La probabilidad, en 100 puntos
En lugar de "48%", Likely muestra **48 de cada 100** con una cuadrícula de 100 puntos. Las frecuencias naturales ("48 de 100") se entienden mejor que los porcentajes, y la cuadrícula funciona a la vez como número y como barra. Los puntos son grises y solo se ilumina el lado que eliges: si cambias a "No", se encienden los puntos del No y la cifra pasa a "52 de cada 100: posibilidad de que no ocurra".

### 2. Una operación que se lee como una frase
El ticket de compra está escrito como una frase que el usuario completa:

> **Creo que** [Sí / No] · **y pongo** [$50] · **Si acierto, recibo $102**

Debajo, una barra muestra qué parte es tu dinero de vuelta y qué parte es beneficio. Los detalles técnicos ("102 contratos a 49¢") están, pero en segundo plano. La proposición elegida acompaña al usuario en todo el recorrido: en la revisión, el recibo y el portfolio siempre lee la misma frase ("Una misión tripulada llegará a Marte antes de 2035").

### 3. Honestidad en los números
- Los cambios de probabilidad se expresan en **puntos porcentuales** (+4 pp), nunca como "+4%", que confunde con rentabilidad.
- Se distinguen el **precio de compra**, el **precio de venta**, la **probabilidad indicativa** y el **valor estimado** de una posición, y se explica cuál se usa en cada caso ("¿Por qué 49¢ y no 48%?").
- Ninguna operación se ejecuta al primer clic: siempre hay **Revisar → Confirmar**. Si el precio cambia mientras revisas, el sistema te obliga a revisarlo otra vez.
- El "No" de un candidato en un mercado con varias opciones nunca se traduce como "Sí" a su rival.

### 4. Un portfolio que cuenta una historia
Cada predicción muestra dónde entraste y dónde está ahora ("Entraste a 40 de cada 100 · ahora 48"), cuánto pusiste y cuánto vale, en lenguaje natural y no como una tabla de posiciones.

### 5. Calma visual en lugar de terminal financiero
La identidad pasó por tres iteraciones:
- **v1** seguía las referencias habituales (dashboard oscuro). Era correcta, pero indistinguible de la competencia.
- **v2** probó una dirección editorial con serif y colores llamativos. Ganó personalidad, pero sonaba a revista.
- **v3**, la final, responde a *"¿cómo lo haría Apple?"*: neutros tranquilos, tipografía del sistema (SF Pro) con titulares en dos tonos y **un solo acento**: azul para actuar o "Sí" y naranja para "No". No hay verde y rojo de bolsa ni widgets de trader en primera vista.

Home funciona como una página de producto: una gran pregunta de la semana, una fotografía con la probabilidad superpuesta, tarjetas de tendencias, categorías y los movimientos de la semana contados en una frase ("44 → 48 de cada 100"). Tiene modo claro, oscuro e híbrido (las fotos siempre en marcos oscuros).

## Proceso y decisiones clave

- **Del brief a un sistema.** Definí rutas, estados y escenarios (mercado suspendido, precio que cambia antes de confirmar, liquidez limitada, órdenes límite, resolución de un mercado) antes de diseñar pantallas.
- **Crítica propia como método.** Tras cada iteración hice una revisión honesta de qué funcionaba y qué no. Los dos conceptos de producto, los 100 puntos y la frase, sobrevivieron a todas las versiones. La estética cambió dos veces.
- **Fotografía a medida.** Las imágenes clave (la candidata ficticia, la artista, el festival, la cumbre) se generaron con IA (Higgsfield Soul 2.0) a partir de prompts de dirección de arte. Se descartaron las variantes con texto mal generado o con edificios reales reconocibles.
- **Accesibilidad como requisito.** Contraste AA verificado automáticamente en los dos temas, navegación por teclado, foco gestionado en los diálogos y respeto a "reducir movimiento".

## Resultado

Un prototipo **funcional**, no un mockup: se puede explorar, predecir, revisar, confirmar, vender, dejar órdenes límite, recibir notificaciones y ver cómo se resuelve un mercado. Todo con datos ficticios y dinero virtual.

- Lógica de dinero en céntimos enteros, sin dobles cargos y con un historial reconciliado.
- 51 tests unitarios y 49 end-to-end (incluidas auditorías de accesibilidad en claro y oscuro).
- Responsive para escritorio, tablet y móvil.

## Aprendizajes

- **Diferenciarse no es decorar.** Lo que separa a Likely de la competencia no es el color, sino *cómo se expresa la probabilidad y cómo se formula la decisión*. La estética solo funcionó cuando se puso al servicio de esas dos ideas.
- **Las referencias genéricas producen productos genéricos.** Seguirlas con fidelidad dio un resultado correcto pero olvidable. Romper con ellas dio identidad.
- **La claridad financiera es un problema de lenguaje.** Puntos porcentuales frente a porcentajes y precio frente a probabilidad: muchas de las mejoras más importantes fueron de copy, no de UI.

---

*Concepto de diseño. Todos los mercados, personas, precios y noticias son ficticios; no hay dinero real ni datos en vivo.*
