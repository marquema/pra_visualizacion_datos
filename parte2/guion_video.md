# Guion del Vídeo Explicativo

**Proyecto:** Desarrollo Humano, Sostenibilidad y Brecha de Género  
**Autor:** Marcos Marqués Primo  
**Duración objetivo:** 5 minutos

---

## Introducción (0:00 – 0:15)

Hola, soy Marcos Marqués Primo. En este vídeo os presento mi proyecto de visualización de datos para la asignatura de Visualización de Datos del Máster. He construido un dashboard interactivo que permite explorar la relación entre tres grandes dimensiones del progreso global: el desarrollo humano, la igualdad de género y la sostenibilidad medioambiental. El análisis abarca 220 países a lo largo de catorce años, desde 2010 hasta 2023.

---

## Proceso de creación (0:15 – 1:15)

El proyecto ha seguido un proceso de desarrollo en varias fases. Todo comenzó con la formulación de tres preguntas de investigación que me parecían relevantes y que quería responder visualmente. A partir de ahí, identifiqué las fuentes de datos que necesitaba y las descargué.

El siguiente paso fue el más técnico: construir un script en Python que extrajera, transformara y cruzara las tres fuentes de datos en un único dataset coherente. El principal desafío fue la normalización de los nombres de país, ya que cada fuente utiliza convenciones distintas. El PNUD usa nombres literales como "Korea (Republic of)" mientras que OWID y el Banco Mundial usan códigos ISO de tres letras. Tuve que crear una tabla de mapeo con más de cuarenta correspondencias manuales para garantizar que todos los registros se alinearan correctamente.

En cuanto al diseño visual, tomé varias decisiones deliberadas. La paleta de colores no es arbitraria: el verde representa la sostenibilidad ambiental y el lila representa la igualdad de género, que es el color universal del feminismo. La estructura de navegación por pestañas responde a un principio claro: cada sección del dashboard está diseñada para responder una pregunta concreta. Elegí D3.js como herramienta porque me daba control total sobre cada elemento visual, y el despliegue en GitHub Pages permite que cualquier persona acceda sin necesidad de instalar nada.

---

## Presentación en vivo (1:15 – 2:25)

Vamos a navegar por el dashboard. La primera vista es un mapa coroplético global. Aquí puedo seleccionar distintas métricas: si elijo el Índice de Desarrollo Humano, vemos inmediatamente el patrón norte-sur. Si cambio a desigualdad de género, el mapa se transforma y aparecen patrones diferentes. El slider de año me permite ver cómo evolucionan estas métricas en el tiempo. Puedo hacer zoom para centrarme en una región y al pasar el ratón sobre cualquier país aparece un tooltip con el valor exacto.

En la segunda sección tenemos la paradoja económica. Este scatter plot enfrenta la renta nacional bruta contra la participación laboral femenina. Cada punto es un país, el tamaño refleja su población y el color indica su nivel de desigualdad de género. Lo interesante es que no hay una relación lineal clara: hay países muy ricos con participación femenina bajísima y países de renta media donde las mujeres participan mucho más.

La tercera sección explora si existe correlación entre igualdad de género y energías renovables. Aquí vemos el índice de desigualdad de género en el eje horizontal y el porcentaje de electricidad renovable en el vertical. Se intuye una tendencia, pero no es determinante.

En la cuarta sección puedo comparar la evolución temporal de distintos países. Añado España, Noruega y China, y veo cómo sus trayectorias de CO₂ per cápita divergen a lo largo de los años.

Finalmente, el ranking IESE muestra los países que mejor combinan desarrollo humano, equidad de género y baja huella de carbono. Los países nórdicos dominan esta clasificación.

---

## Conjunto de datos (2:25 – 3:15)

El dataset final es de elaboración propia. No utilicé un conjunto de datos preexistente, sino que construí uno cruzando tres fuentes de alto prestigio internacional.

La primera fuente es el Programa de las Naciones Unidas para el Desarrollo, del que extraje el Índice de Desarrollo Humano y el Índice de Desigualdad de Género, junto con variables como esperanza de vida, años de escolaridad, participación laboral femenina y representación parlamentaria.

La segunda fuente es Our World in Data, que aporta toda la dimensión energética y medioambiental: emisiones de gases de efecto invernadero, porcentaje de renovables, consumo energético. Esta fuente es la que proporciona la serie temporal completa.

La tercera fuente es el Banco Mundial, que complementa con el PIB en paridad de poder adquisitivo.

El resultado es un dataset de más de tres mil registros con veintisiete variables. Además, diseñé una métrica propia que he llamado Índice de Eficiencia Sostenible y Equitativa, o IESE. Su fórmula multiplica el HDI por uno menos el GII, y divide entre el CO₂ normalizado. De esta forma, premia a los países que logran alto desarrollo con equidad y bajo impacto ambiental.

---

## Preguntas clave (3:15 – 4:25)

La primera pregunta que me planteé fue si la riqueza garantiza la equidad de género. La respuesta visual es clara: no. El scatter plot muestra que países del Golfo Pérsico como Arabia Saudí o Qatar tienen rentas per cápita altísimas pero una participación laboral femenina inferior al veinte por ciento. En cambio, países africanos como Ruanda o Mozambique, con rentas mucho más bajas, superan el sesenta por ciento. Esto sugiere que los factores culturales y legislativos pesan más que la riqueza económica.

La segunda pregunta era si es posible alcanzar un alto nivel de desarrollo humano sin comprometer el planeta. El ranking IESE responde a esto: sí es posible, pero son pocos los que lo logran. Noruega, Suecia, Suiza y Costa Rica aparecen consistentemente en los primeros puestos. La mayoría de países con HDI superior a 0,9 tienen emisiones por encima de cinco toneladas por persona.

La tercera pregunta exploraba si existe relación entre igualdad de género y adopción de renovables. El scatter plot muestra una tendencia débil pero visible: los países con menor desigualdad de género tienden a tener mayor porcentaje de electricidad renovable. No podemos hablar de causalidad, pero sugiere que las sociedades más igualitarias también priorizan la transición energética.

---

## Interactividad y accesibilidad (4:25 – 5:15)

El dashboard incorpora múltiples elementos interactivos que siguen el mantra de Shneiderman: visión general primero, zoom y filtrado, y detalles bajo demanda.

El mapa ofrece selección de métrica, slider temporal y zoom con arrastre. Los scatter plots tienen tooltips que aparecen al pasar el ratón, mostrando información detallada de cada país. La vista temporal permite añadir y quitar países para construir comparaciones personalizadas. Y el ranking permite ajustar cuántos países se muestran.

En cuanto a accesibilidad, he implementado etiquetas ARIA en todos los controles y gráficos SVG para que los lectores de pantalla puedan interpretar la estructura. Los controles son navegables por teclado. He respetado ratios de contraste adecuados y el CSS incluye media queries para desactivar animaciones cuando el usuario tiene configurada la preferencia de movimiento reducido, así como un modo oscuro automático.

---

## Reflexión final (5:15 – 5:50)

De este proyecto me llevo varios aprendizajes. El primero es que los datos cuentan historias que los indicadores aislados no revelan. Cruzar desarrollo humano con desigualdad de género y huella de carbono muestra que el progreso tiene muchas dimensiones y que no todos los modelos de desarrollo son equivalentes.

El segundo aprendizaje es técnico: D3.js ofrece un control absoluto sobre la visualización, pero a cambio exige mucho más esfuerzo que herramientas como Tableau o Flourish.

En cuanto a limitaciones, la principal es que el PNUD solo publica un snapshot del año más reciente, no series históricas en formato abierto. Esto impide analizar cómo han evolucionado el HDI y el GII país a país. También hay países pequeños, especialmente islas del Pacífico, que carecen de datos energéticos.

Si pudiera continuar el proyecto, me habría gustado implementar un modelo predictivo para estimar qué países mejorarán su IESE hacia 2030, y añadir brushing and linking entre todas las vistas para que al seleccionar un país en el mapa se resalte automáticamente en el resto de gráficos.

---

## Cierre (5:50 – 6:00)

Muchas gracias por vuestra atención. El dashboard está disponible públicamente en GitHub Pages y todo el código fuente es abierto. Cualquier duda, estoy a vuestra disposición.
