# Guion del Vídeo Explicativo (4-6 minutos)

**Proyecto:** Desarrollo Humano, Sostenibilidad y Brecha de Género  
**Autor:** Marcos Marqués Primo  
**Duración objetivo:** 5 minutos

---

## 0. Intro (0:00 – 0:15) — 15 segundos

> "Hola, soy Marcos Marqués. En este vídeo presento mi proyecto de visualización de datos: un dashboard interactivo que explora la relación entre desarrollo humano, igualdad de género y sostenibilidad medioambiental en 220 países durante el periodo 2010-2023."

---

## 1. Proceso de creación [20%] (0:15 – 1:15) — 60 segundos

**Qué contar:**

- **Etapas del desarrollo:**
  1. Definición de preguntas de investigación (Parte 1)
  2. Selección y descarga de fuentes (PNUD, OWID, Banco Mundial)
  3. ETL en Python: limpieza, normalización ISO-3, cruce de 3 fuentes
  4. Diseño del dashboard: wireframes, elección de gráficos por pregunta
  5. Implementación en D3.js + HTML/CSS
  6. Despliegue en GitHub Pages

- **Decisiones de diseño:**
  - Paleta verde-lila: verde = sostenibilidad, lila = igualdad de género (simbolismo intencional)
  - Navegación por pestañas: cada sección responde una pregunta concreta
  - Mapa como punto de entrada: visión global antes de profundizar
  - Scatter plots con tamaño = población: contextualiza la relevancia de cada país
  - Serie temporal con comparación: permite al usuario construir su propia narrativa

- **Fundamentos:**
  - Principios de Tufte: maximizar ratio datos/tinta
  - Gramática de gráficos: posición para variables principales, color para categorías
  - Accesibilidad: contraste WCAG, navegación por teclado, etiquetas ARIA

**[Mostrar brevemente el código ETL y la estructura de carpetas]**

---

## 2. Presentación en vivo [20%] (1:15 – 2:25) — 70 segundos

**Qué hacer:** Navegar por el dashboard en vivo mostrando:

1. **Mapa Global** (20s)
   - Cambiar métrica: HDI → GII → CO₂ → Renovables
   - Mover slider de año: mostrar que CO₂ cambia en el tiempo
   - Hacer zoom en Europa, hover sobre España
   - "El mapa permite una exploración geográfica inmediata"

2. **Paradoja Económica** (15s)
   - Mostrar scatter GNI vs Participación laboral femenina
   - Señalar países ricos con baja participación (Arabia Saudí, Qatar)
   - Señalar países con alta participación y renta media (Ruanda, Mozambique)

3. **Correlación Verde-Lila** (15s)
   - Hover sobre puntos: mostrar tooltip
   - "No hay correlación lineal clara, pero los países con bajo GII tienden a tener más renovables"

4. **Evolución Temporal** (10s)
   - Añadir España, Noruega, China: comparar trayectorias CO₂

5. **Ranking IESE** (10s)
   - Mostrar top 30: "Países nórdicos dominan, combinan alto HDI, bajo GII y baja huella"

---

## 3. Conjunto de datos [15%] (2:25 – 3:15) — 50 segundos

**Qué contar:**

- **Origen:** 3 fuentes de prestigio internacional
  - PNUD HDR 2025: HDI, GII, esperanza de vida, escolaridad, participación laboral
  - OWID Energy: CO₂, renovables, fósiles — serie temporal completa
  - Banco Mundial: PIB PPP como complemento macroeconómico

- **Proceso de preparación (ETL):**
  - Script Python (`etl_dataset_final.py`)
  - Desafío principal: normalización de nombres de país → mapeo ISO-3 (42 mapeos manuales)
  - PNUD solo tiene snapshot 2023; OWID aporta la serie temporal
  - Resultado: 3.078 registros × 27 variables × 220 países

- **Métrica propia (IESE):**
  - Fórmula: `HDI × (1 - GII) / CO₂_normalizado`
  - Penaliza desigualdad de género Y huella de carbono
  - Premia desarrollo humano eficiente y equitativo

- **Completitud:** HDI 84%, GII 77%, CO₂ 95%, Renovables 95%

---

## 4. Preguntas clave [20%] (3:15 – 4:25) — 70 segundos

**Pregunta 1: La paradoja económica** (25s)
> "¿Garantiza una renta alta la equidad de género?"

- Respuesta visual: scatter plot GNI vs Labour_Force_Female
- Hallazgo: NO. Países del Golfo tienen GNI altísimo pero participación femenina <20%. Países africanos con renta baja superan el 60%.
- Conclusión: la riqueza no implica equidad; factores culturales y legislativos pesan más.

**Pregunta 2: El coste del desarrollo** (25s)
> "¿Se puede tener alto HDI con baja huella de carbono?"

- Respuesta visual: mapa HDI + ranking IESE
- Hallazgo: Sí, pero son pocos. Noruega, Suecia, Suiza, Costa Rica lo logran. La mayoría de países con HDI>0.9 tienen CO₂>5t/persona.
- El IESE identifica estos "campeones de la eficiencia".

**Pregunta 3: Correlación verde-lila** (20s)
> "¿Menos desigualdad de género = más renovables?"

- Respuesta visual: scatter GII vs Renewables
- Hallazgo: Tendencia débil pero visible. Países con GII<0.1 tienen en promedio más renovables. Pero hay excepciones (Islandia: 100% renovable; países nórdicos lideran ambos).
- No es causalidad, pero sugiere que sociedades más igualitarias priorizan la transición energética.

---

## 5. Interactividad [15%] (4:25 – 5:15) — 50 segundos

**Elementos interactivos:**

| Elemento | Sección | Contribución UX |
|----------|---------|-----------------|
| Selector de métrica | Mapa | Exploración multidimensional sin cambiar de vista |
| Slider temporal | Mapa | Animación de cambios año a año |
| Zoom + pan | Mapa | Detalle regional sin perder contexto global |
| Tooltips hover | Todas | Información bajo demanda (principio de Shneiderman) |
| Selector eje Y | Paradoja | Reformular la pregunta en tiempo real |
| Añadir/quitar países | Temporal | Comparación personalizada |
| Selector top N | Ranking | Control de densidad informativa |

**Accesibilidad:**
- Etiquetas ARIA en todos los controles y gráficos SVG
- Navegación por teclado (tab entre controles)
- Contraste de colores cumple ratio mínimo
- `prefers-reduced-motion`: desactiva transiciones
- `prefers-color-scheme: dark`: modo oscuro automático
- Tooltips con `role="tooltip"` para lectores de pantalla

---

## 6. Reflexión final [10%] (5:15 – 5:50) — 35 segundos

**¿Qué he aprendido?**
- Los datos cuentan historias que los indicadores aislados no revelan. Cruzar HDI con GII y CO₂ muestra que el "desarrollo" tiene muchas dimensiones.
- D3.js ofrece un control total sobre la visualización, pero requiere mucho más esfuerzo que herramientas como Tableau.

**¿Qué limitaciones he encontrado?**
- El PNUD solo publica un snapshot (2023), no series históricas en formato abierto. Esto limita el análisis temporal de HDI/GII.
- El CO₂ de OWID es de emisiones totales de GEI, no solo CO₂ puro.
- Algunos países pequeños (islas) carecen de datos energéticos.

**¿Qué me habría gustado hacer?**
- Añadir un modelo predictivo: ¿qué países mejorarán su IESE en 2030?
- Implementar brushing & linking entre todas las vistas simultáneamente.
- Incluir una vista de small multiples para comparar regiones.

---

## Cierre (5:50 – 6:00) — 10 segundos

> "Gracias por vuestra atención. El dashboard está disponible en GitHub Pages y el código fuente es abierto. Cualquier duda, estoy a vuestra disposición."

---

## Notas de producción

- **Herramienta de grabación:** OBS Studio o grabación de pantalla de Windows
- **Formato:** Pantalla compartida con el dashboard + voz en off
- **Tip:** Ensayar 2 veces antes de grabar. Cronometrar cada sección.
- **Duración total estimada:** ~5:50 (dentro del rango 4-6 min)
