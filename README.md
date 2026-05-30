# Desarrollo Humano, Sostenibilidad y Brecha de Género

Práctica de Visualización de Datos — Máster en Ciencia de Datos (UOC, 2026)

## Estructura del proyecto

```
├── PRA.md                      # Propuesta (Parte 1)
├── parte1/                     # Datos fuente originales
│   ├── HDR25_Statistical_Annex_HDI_Table.xlsx
│   ├── HDR25_Statistical_Annex_GII_Table.xlsx
│   ├── owid-energy-data.csv
│   └── API_NY.GDP.MKTP.PP.CD_DS2_es_csv_v2_16163.zip
├── parte2/                     # Parte 2: Visualización
│   ├── etl_dataset_final.py    # Script ETL (Python)
│   ├── dataset_final.csv       # Dataset generado
│   ├── datos_origen/           # Copia de fuentes para ETL
│   └── web/                    # Dashboard interactivo (D3.js)
│       ├── index.html
│       ├── css/styles.css
│       ├── js/
│       └── data/dataset_final.csv
```

## Visualización online

🔗 **[Ver dashboard](https://marquema.github.io/pra_visualizacion_datos/)**

## Fuentes de datos

- [PNUD HDR](https://hdr.undp.org/data-center/documentation-and-downloads) — HDI y GII
- [OWID Energy](https://github.com/owid/energy-data) — Emisiones y renovables
- [Banco Mundial](https://data.worldbank.org/indicator) — PIB PPP

## Ejecución local

```bash
# Generar dataset
cd parte2
python etl_dataset_final.py

# Servir dashboard
cd web
python -m http.server 8080
# Abrir http://localhost:8080
```

## Autor

Marcos Marqués Primo
