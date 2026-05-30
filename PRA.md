Propuesta de Práctica Final (PR1)
Título: Desarrollo Humano, Sostenibilidad y Brecha de Género: Un Análisis Multidimensional (2010-2023)
1. Justificación de la elección
El presente proyecto nace de un profundo interés por comprender las dinámicas ocultas del desarrollo global. Habitualmente, el éxito de las naciones se mide a través de indicadores macroeconómicos estáticos (como el PIB), los cuales invisibilizan realidades fundamentales como el peaje ecológico de dicho crecimiento y la desigualdad estructural entre hombres y mujeres.
Como estudiante del ámbito del análisis de datos, mi motivación es aplicar técnicas de visualización compleja para desenmascarar la "paradoja del bienestar": explorar si es posible alcanzar altos niveles de desarrollo y equidad social sin comprometer los límites biofísicos del planeta. Este enfoque integral es vital hoy en día para sectores como la consultoría estratégica, las políticas públicas y la Responsabilidad Social Corporativa (RSC).
2. Relevancia y contexto
Este conjunto de datos posee una gran relevancia social y temporal. Los orígenes de datos son las siguientes:
1.	PNUD:  Documentation and downloads | Human Development Reports
2.	OWID: owid/energy-data: Data on energy by Our World in Data
3.	Banco Mundial: Indicators | Data
Los datasets incorporan las últimas actualizaciones disponibles (año 2023) correspondientes a los Objetivos de Desarrollo Sostenible (ODS), tales como Salud, Educación e Igualdad de Género.
El proyecto integra un componente social crítico al poner en el centro la perspectiva de género. Al incluir métricas como la tasa de mortalidad materna, la representación parlamentaria femenina y la brecha en la participación laboral, se busca identificar sesgos sistémicos en países catalogados como muy desarrollados. Asimismo, el cruce con datos medioambientales dota al proyecto de una gran actualidad contemporánea frente a la crisis climática, evaluando la resiliencia y sostenibilidad de los diferentes modelos de Estado.
3. Complejidad técnica
Para garantizar la solidez estadística y la riqueza visual, el proyecto no utilizará un conjunto de datos simple. Se construirá un conjunto de datos multidimensional que superará los 2.500 registros: aproximadamente 190 países analizados en una serie temporal continua desde 2010 hasta 2023, último año disponible.
Técnicamente, el dataset combinará una rica variedad de tipologías de datos:
•	Datos Cuantitativos, Continuos y Discretos: Renta Nacional Bruta (GNI), emisiones de CO2 per cápita, porcentaje de energías renovables, años esperados de escolaridad.
•	Datos Categóricos: Región geográfica, grupo de ingresos económicos según clasificación del Banco Mundial.
•	Datos Temporales y Geoespaciales: Año de registro y códigos ISO-3 para representaciones cartográficas. Para este punto, hemos encontrado un desafío de normalización de Datos debido a que he identificado una discrepancia en los formatos de origen: mientras que el Banco Mundial y OWID utilizan el estándar ISO 3166-1 alpha-3, los informes del PNUD emplean nomenclaturas literales. Para garantizar la integridad referencial del dataset final, se implementará un proceso de Mapeo de Entidades mediante una tabla de codificación, asegurando que el 100% de los registros estén alineados bajo el mismo código de país antes del análisis final multivariable.
4. Originalidad y enriquecimiento
La originalidad del proyecto radica en que no se utilizará un conjunto de datos preexistente. El dataset final será de elaboración propia mediante un proceso de extracción, transformación y carga (ETL), cruzando y enriqueciendo tres fuentes de datos de alto prestigio internacional mediante la clave compartida del código ISO del país:
1.	PNUD (Programa de las Naciones Unidas para el Desarrollo): Datos de Índice de Desarrollo Humano (HDI) y el Índice de Desigualdad de Género (GII).
2.	Banco Mundial (Open Data): Variables macroeconómicas base.
3.	Our World in Data: Métricas de emisiones de carbono y transición energética.
Además, como valor añadido, se tratará de calcular mediante transformación de variables una nueva métrica propia denominada Índice de Eficiencia Sostenible y Equitativa (IESE), que evaluará la relación entre el bienestar social penalizado por la desigualdad de género y el coste medioambiental.
5. Objetivos y Diccionario de datos
El objetivo principal de la visualización será permitir al usuario descubrir patrones, excepciones y correlaciones entre riqueza, igualdad y ecología a través de un dashboard interactivo. Las preguntas de investigación planteadas son:
1.	La paradoja económica: ¿Garantiza una Renta Nacional Bruta alta una participación equitativa de la mujer en el mercado laboral y en la política?
2.	El coste del desarrollo: ¿Qué naciones han logrado posicionarse en el cuartil superior de desarrollo humano manteniendo una huella de carbono sostenible?
3.	Correlación verde-lila: ¿Existe una relación estadísticamente visual entre los países con menor índice de desigualdad de género y una mayor adopción de energías renovables?
El simbolismo de los colores:
•	Verde: Representa la sostenibilidad ambiental, la ecología, las energías renovables y la lucha contra el cambio climático, algo que extraeremos de los datos de Our World in Data.
•	Lila: Es el color universal del feminismo y la igualdad de género. Representa el empoderamiento de la mujer y la justicia social, que trataremos de observar de los datos del PNUD/GII.

Diccionario de variables principales:
Variable	Origen de datos	Significado / Descripción	Rol analítico
ISO3_Code	Todas	Código estandarizado de 3 letras del país	Dimensión
Country_Name	Todas	Nombre oficial del país	Dimensión
Year	Todas	Año del registro (2010-2023)	Dimensión
HDI_Value	PNUD	Índice de Desarrollo Humano (0 a 1)	Hecho
GNI_PerCapita	PNUD / BM	Renta Nacional Bruta per cápita (PPP $)	Hecho
GII_Value	PNUD	Índice de Desigualdad de Género (0 a 1)	Hecho
Female_Labor_Part	PNUD	Tasa de participación laboral femenina (%)	Hecho
Seats_Parliament	PNUD	Porcentaje de escaños ocupados por mujeres	Hecho
CO2_PerCapita	OWID	Emisiones de CO2 en toneladas por persona	Hecho
Renewables_Share	OWID	% de electricidad proveniente de fuentes renovables	Hecho

