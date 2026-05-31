"""
ETL - Desarrollo Humano, Sostenibilidad y Brecha de Género
===========================================================
Construye el dataset multidimensional cruzando:
  1. PNUD HDI (HDR25) - Índice de Desarrollo Humano
  2. PNUD GII (HDR25) - Índice de Desigualdad de Género
  3. OWID Energy Data - Emisiones CO2 y renovables
  4. Banco Mundial - PIB PPP (como complemento macro)

Salida: parte2/dataset_final.csv
"""

import pandas as pd
import zipfile
import io
import os
import warnings

warnings.filterwarnings("ignore")

# --- CONFIGURACIÓN ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATOS_DIR = os.path.join(BASE_DIR, "datos_origen")
OUTPUT_PATH = os.path.join(BASE_DIR, "dataset_final.csv")

YEAR_MIN = 2010
YEAR_MAX = 2023


# =============================================================================
# 1. CARGA PNUD - HDI (Human Development Index)
# =============================================================================
def load_hdi():
    """
    Carga el HDI Table del PNUD (HDR25).
    Estructura: filas 0-7 son cabeceras, datos desde fila 8.
    Columnas relevantes: HDI rank, Country, HDI Value, Life expectancy,
    Expected years schooling, Mean years schooling, GNI per capita.
    Solo tiene datos de 2023 (snapshot).
    """
    path = os.path.join(DATOS_DIR, "HDR25_Statistical_Annex_HDI_Table.xlsx")
    df = pd.read_excel(path, header=None, skiprows=8)

    # Seleccionar columnas relevantes (basado en inspección):
    # Col 0: HDI rank, Col 1: Country, Col 2: HDI Value,
    # Col 4: Life expectancy, Col 6: Expected years schooling,
    # Col 8: Mean years schooling, Col 10: GNI per capita
    df = df.iloc[:, [0, 1, 2, 4, 6, 8, 10]].copy()
    df.columns = [
        "HDI_Rank", "Country", "HDI_Value",
        "Life_Expectancy", "Expected_Years_Schooling",
        "Mean_Years_Schooling", "GNI_PerCapita"
    ]

    # Limpiar: eliminar filas de categorías y notas al pie
    df = df[df["Country"].notna()].copy()
    df["Country"] = df["Country"].astype(str)
    df = df[~df["Country"].str.contains(
        "human development|Developing|OECD|World|Arab|East Asia|"
        "Europe and Central|Latin America|South Asia|Sub-Saharan|"
        "Small Island|Least Developed|Very high|High|Medium|Low|"
        "Column |Note|Definition|calculated|based on|data sources|"
        "Regions|Other countries|IMF |UNDESA|UNESCO|UNICEF|IPU |"
        "Barro and Lee|Eurostat|ICF Macro",
        case=False, na=False
    )].copy()
    # Eliminar filas donde Country es demasiado largo (notas)
    df = df[df["Country"].str.len() < 50].copy()

    # Convertir numéricas
    for col in ["HDI_Value", "Life_Expectancy", "Expected_Years_Schooling",
                "Mean_Years_Schooling", "GNI_PerCapita"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["Country"] = df["Country"].str.strip()
    df = df.reset_index(drop=True)

    print(f"  HDI cargado: {len(df)} países")
    return df


# =============================================================================
# 2. CARGA PNUD - GII (Gender Inequality Index)
# =============================================================================
def load_gii():
    """
    Carga el GII Table del PNUD (HDR25).
    Columnas: GII Value, GII Rank, Maternal mortality ratio,
    Adolescent birth rate, Seats in parliament (% women),
    Secondary education Female/Male, Labour force Female/Male.
    Solo tiene datos de 2023 (snapshot).
    """
    path = os.path.join(DATOS_DIR, "HDR25_Statistical_Annex_GII_Table.xlsx")
    df = pd.read_excel(path, header=None, skiprows=8)

    # Columnas basado en inspección:
    # Col 0: HDI rank, Col 1: Country, Col 2: GII Value, Col 4: GII Rank,
    # Col 6: Maternal mortality ratio, Col 8: Adolescent birth rate,
    # Col 10: Seats parliament (% women), Col 12: Secondary edu Female,
    # Col 14: Secondary edu Male, Col 16: Labour force Female,
    # Col 18: Labour force Male
    df = df.iloc[:, [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18]].copy()
    df.columns = [
        "HDI_Rank", "Country", "GII_Value", "GII_Rank",
        "Maternal_Mortality_Ratio", "Adolescent_Birth_Rate",
        "Seats_Parliament_Female", "Secondary_Edu_Female",
        "Secondary_Edu_Male", "Labour_Force_Female", "Labour_Force_Male"
    ]

    # Limpiar categorías y notas al pie
    df = df[df["Country"].notna()].copy()
    df["Country"] = df["Country"].astype(str)
    df = df[~df["Country"].str.contains(
        "human development|Developing|OECD|World|Arab|East Asia|"
        "Europe and Central|Latin America|South Asia|Sub-Saharan|"
        "Small Island|Least Developed|Very high|High|Medium|Low|"
        "Column |Note|Definition|calculated|based on|data sources|"
        "Regions|Other countries|IMF |UNDESA|UNESCO|UNICEF|IPU |"
        "Barro and Lee|Eurostat|ICF Macro|Adolescent birth rate:",
        case=False, na=False
    )].copy()
    df = df[df["Country"].str.len() < 50].copy()

    # Convertir numéricas
    for col in ["GII_Value", "Maternal_Mortality_Ratio", "Adolescent_Birth_Rate",
                "Seats_Parliament_Female", "Secondary_Edu_Female",
                "Secondary_Edu_Male", "Labour_Force_Female", "Labour_Force_Male"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["Country"] = df["Country"].str.strip()
    df = df.drop(columns=["HDI_Rank", "GII_Rank"])
    df = df.reset_index(drop=True)

    print(f"  GII cargado: {len(df)} países")
    return df


# =============================================================================
# 3. CARGA OWID - Energy Data (serie temporal)
# =============================================================================
def load_owid():
    """
    Carga OWID energy data. Tiene series temporales por país y año.
    Variables clave: country, year, iso_code, population, gdp,
    greenhouse_gas_emissions, renewables_share_elec, fossil_share_energy,
    primary_energy_consumption, etc.
    """
    path = os.path.join(DATOS_DIR, "owid-energy-data.csv")
    df = pd.read_csv(path)

    # Filtrar rango temporal
    df = df[(df["year"] >= YEAR_MIN) & (df["year"] <= YEAR_MAX)].copy()

    # Eliminar agregados (no tienen iso_code o son grupos)
    df = df[df["iso_code"].notna()].copy()
    df = df[df["iso_code"].str.len() == 3].copy()

    # Seleccionar columnas relevantes
    cols_keep = [
        "country", "year", "iso_code", "population", "gdp",
        "greenhouse_gas_emissions",
        "renewables_share_elec", "renewables_share_energy",
        "fossil_share_energy", "fossil_share_elec",
        "primary_energy_consumption", "energy_per_capita",
        "carbon_intensity_elec",
        "solar_share_elec", "wind_share_elec", "hydro_share_elec",
        "nuclear_share_elec"
    ]
    cols_available = [c for c in cols_keep if c in df.columns]
    df = df[cols_available].copy()

    # Calcular CO2 per cápita (greenhouse_gas_emissions está en millones de toneladas)
    if "greenhouse_gas_emissions" in df.columns and "population" in df.columns:
        df["CO2_PerCapita"] = (
            df["greenhouse_gas_emissions"] * 1e6 / df["population"]
        )

    # Renombrar para claridad
    df = df.rename(columns={
        "country": "Country_OWID",
        "iso_code": "ISO3_Code",
        "renewables_share_elec": "Renewables_Share_Elec",
        "renewables_share_energy": "Renewables_Share_Energy",
        "fossil_share_energy": "Fossil_Share_Energy",
        "primary_energy_consumption": "Primary_Energy_TWh",
        "energy_per_capita": "Energy_PerCapita_kWh",
    })

    print(f"  OWID cargado: {len(df)} registros ({df['ISO3_Code'].nunique()} países, {YEAR_MIN}-{YEAR_MAX})")
    return df


# =============================================================================
# 4. CARGA BANCO MUNDIAL - PIB PPP
# =============================================================================
def load_world_bank():
    """
    Carga PIB PPP ($ internacionales corrientes) del Banco Mundial.
    Formato: países en filas, años en columnas.
    """
    zip_path = os.path.join(DATOS_DIR, "API_NY.GDP.MKTP.PP.CD_DS2_es_csv_v2_16163.zip")

    with zipfile.ZipFile(zip_path) as z:
        csv_name = [n for n in z.namelist() if n.startswith("API_") and n.endswith(".csv")][0]
        with z.open(csv_name) as f:
            df = pd.read_csv(f, skiprows=4)

    # Seleccionar Country Code y años 2010-2023
    year_cols = [str(y) for y in range(YEAR_MIN, YEAR_MAX + 1)]
    available_years = [y for y in year_cols if y in df.columns]

    df = df[["Country Name", "Country Code"] + available_years].copy()
    df = df.rename(columns={"Country Name": "Country_WB", "Country Code": "ISO3_Code"})

    # Melt a formato largo
    df = df.melt(
        id_vars=["Country_WB", "ISO3_Code"],
        value_vars=available_years,
        var_name="Year",
        value_name="GDP_PPP"
    )
    df["Year"] = df["Year"].astype(int)
    df["GDP_PPP"] = pd.to_numeric(df["GDP_PPP"], errors="coerce")

    print(f"  Banco Mundial cargado: {len(df)} registros ({df['ISO3_Code'].nunique()} países)")
    return df


# =============================================================================
# 5. TABLA DE MAPEO: Nombre país PNUD → ISO3
# =============================================================================
def build_country_mapping(owid_df):
    """
    Construye tabla de mapeo Country Name → ISO3 usando OWID como referencia
    (que ya tiene ambos). Además añade mapeos manuales para discrepancias PNUD.
    """
    # Extraer mapeo de OWID
    mapping = owid_df[["Country_OWID", "ISO3_Code"]].drop_duplicates()
    mapping = mapping.rename(columns={"Country_OWID": "Country"})

    # Mapeos manuales para nombres PNUD que difieren
    manual_mappings = {
        "Türkiye": "TUR",
        "Korea (Republic of)": "KOR",
        "Korea (Democratic People's Rep. of)": "PRK",
        "Russian Federation": "RUS",
        "Iran (Islamic Republic of)": "IRN",
        "Venezuela (Bolivarian Republic of)": "VEN",
        "Bolivia (Plurinational State of)": "BOL",
        "Tanzania (United Republic of)": "TZA",
        "Viet Nam": "VNM",
        "Moldova (Republic of)": "MDA",
        "Congo (Democratic Republic of the)": "COD",
        "Congo": "COG",
        "Côte d'Ivoire": "CIV",
        "Lao People's Democratic Republic": "LAO",
        "Syrian Arab Republic": "SYR",
        "Palestine, State of": "PSE",
        "Eswatini (Kingdom of)": "SWZ",
        "Micronesia (Federated States of)": "FSM",
        "Hong Kong, China (SAR)": "HKG",
        "Czechia": "CZE",
        "United Kingdom": "GBR",
        "United States": "USA",
        "Dominican Republic": "DOM",
        "Trinidad and Tobago": "TTO",
        "Saudi Arabia": "SAU",
        "South Africa": "ZAF",
        "Sri Lanka": "LKA",
        "North Macedonia": "MKD",
        "Timor-Leste": "TLS",
        "Cabo Verde": "CPV",
        "Guinea-Bissau": "GNB",
        "Gambia": "GMB",
        "Central African Republic": "CAF",
        "South Sudan": "SSD",
        "Brunei Darussalam": "BRN",
        "Kyrgyzstan": "KGZ",
        "Andorra": "AND",
        "Liechtenstein": "LIE",
        "Monaco": "MCO",
        "San Marino": "SMR",
        "Marshall Islands": "MHL",
        "Palau": "PLW",
    }

    manual_df = pd.DataFrame(
        list(manual_mappings.items()),
        columns=["Country", "ISO3_Code"]
    )

    mapping = pd.concat([mapping, manual_df], ignore_index=True)
    mapping = mapping.drop_duplicates(subset="Country", keep="last")

    return mapping


# =============================================================================
# 6. MERGE FINAL
# =============================================================================
def merge_all(hdi_df, gii_df, owid_df, wb_df, country_map):
    """
    Estrategia de merge:
    - OWID es la base (tiene serie temporal + ISO3)
    - Banco Mundial se une por ISO3 + Year
    - PNUD (HDI + GII) se une por Country → ISO3 (solo 2023, se replica o se une solo al año 2023)
    
    Para mantener la serie temporal completa, los datos PNUD se asocian
    como atributos "estáticos" del país (último valor disponible).
    """
    print("\n--- MERGE ---")

    # 6.1 Unir HDI y GII por Country
    pnud_df = hdi_df.merge(gii_df, on="Country", how="outer")
    print(f"  PNUD combinado (HDI+GII): {len(pnud_df)} países")

    # 6.2 Asignar ISO3 al PNUD
    pnud_df = pnud_df.merge(country_map, on="Country", how="left")
    sin_iso = pnud_df[pnud_df["ISO3_Code"].isna()]["Country"].tolist()
    if sin_iso:
        print(f"  ⚠️  Países PNUD sin ISO3 ({len(sin_iso)}): {sin_iso[:10]}...")
    pnud_df = pnud_df[pnud_df["ISO3_Code"].notna()].copy()
    print(f"  PNUD con ISO3: {len(pnud_df)} países")

    # 6.3 Base: OWID (serie temporal)
    base = owid_df[["ISO3_Code", "year", "Country_OWID", "population", "gdp",
                     "CO2_PerCapita", "Renewables_Share_Elec",
                     "Renewables_Share_Energy", "Fossil_Share_Energy",
                     "Primary_Energy_TWh", "Energy_PerCapita_kWh",
                     "carbon_intensity_elec"]].copy()
    base = base.rename(columns={"year": "Year", "Country_OWID": "Country_Name"})

    # 6.4 Unir Banco Mundial
    base = base.merge(
        wb_df[["ISO3_Code", "Year", "GDP_PPP"]],
        on=["ISO3_Code", "Year"],
        how="left"
    )

    # 6.5 Unir PNUD (datos estáticos del último año)
    pnud_cols = ["ISO3_Code", "Country", "HDI_Value", "GNI_PerCapita",
                 "Life_Expectancy", "Expected_Years_Schooling",
                 "Mean_Years_Schooling", "GII_Value",
                 "Maternal_Mortality_Ratio", "Adolescent_Birth_Rate",
                 "Seats_Parliament_Female", "Secondary_Edu_Female",
                 "Secondary_Edu_Male", "Labour_Force_Female",
                 "Labour_Force_Male"]
    pnud_cols = [c for c in pnud_cols if c in pnud_df.columns]
    pnud_merge = pnud_df[pnud_cols].copy()
    pnud_merge = pnud_merge.drop(columns=["Country"])  # usamos Country_Name de OWID

    base = base.merge(pnud_merge, on="ISO3_Code", how="left")

    # 6.6 Calcular IESE (Índice de Eficiencia Sostenible y Equitativa)
    # IESE = HDI^2 * (1 - GII) / log(1 + CO2_PerCapita)
    # - HDI^2: pondera fuertemente el desarrollo (países con bajo HDI no dominan)
    # - (1-GII): premia equidad de género
    # - log(1+CO2): penaliza huella de carbono de forma logarítmica
    # Solo se calcula para países con HDI >= 0.7 (desarrollo medio-alto)
    import numpy as np

    mask = (
        base["HDI_Value"].notna() &
        base["CO2_PerCapita"].notna() &
        (base["CO2_PerCapita"] > 0) &
        (base["HDI_Value"] >= 0.8)
    )

    base["IESE"] = np.where(
        mask,
        (base["HDI_Value"] ** 2) * (1 - base["GII_Value"].fillna(0))
        / np.log1p(base["CO2_PerCapita"]),
        np.nan
    )

    # 6.7 Ordenar y limpiar
    base = base.sort_values(["ISO3_Code", "Year"]).reset_index(drop=True)

    print(f"\n  Dataset final: {len(base)} registros")
    print(f"  Países: {base['ISO3_Code'].nunique()}")
    print(f"  Años: {base['Year'].min()} - {base['Year'].max()}")
    print(f"  Columnas: {list(base.columns)}")

    return base


# =============================================================================
# MAIN
# =============================================================================
def main():
    print("=" * 60)
    print("ETL - Dataset Desarrollo Humano, Sostenibilidad y Género")
    print("=" * 60)

    print("\n1. Cargando fuentes de datos...")
    hdi_df = load_hdi()
    gii_df = load_gii()
    owid_df = load_owid()
    wb_df = load_world_bank()

    print("\n2. Construyendo mapeo de países...")
    country_map = build_country_mapping(owid_df)
    print(f"  Mapeo: {len(country_map)} entradas")

    print("\n3. Realizando merge...")
    dataset = merge_all(hdi_df, gii_df, owid_df, wb_df, country_map)

    print(f"\n4. Guardando en: {OUTPUT_PATH}")
    dataset.to_csv(OUTPUT_PATH, index=False, encoding="utf-8-sig")

    # Resumen estadístico
    print("\n" + "=" * 60)
    print("RESUMEN DEL DATASET")
    print("=" * 60)
    print(f"  Registros totales: {len(dataset):,}")
    print(f"  Países únicos: {dataset['ISO3_Code'].nunique()}")
    print(f"  Rango temporal: {dataset['Year'].min()}-{dataset['Year'].max()}")
    print(f"  Variables: {len(dataset.columns)}")
    print(f"\n  Completitud por variable clave:")
    key_vars = ["HDI_Value", "GII_Value", "CO2_PerCapita",
                "Renewables_Share_Elec", "GDP_PPP", "Labour_Force_Female", "IESE"]
    for var in key_vars:
        if var in dataset.columns:
            pct = dataset[var].notna().mean() * 100
            print(f"    {var}: {pct:.1f}%")

    print(f"\n  Archivo guardado: {OUTPUT_PATH}")
    print(f"  Tamaño: {os.path.getsize(OUTPUT_PATH) / 1024:.0f} KB")
    print("\n✅ ETL completado con éxito.")


if __name__ == "__main__":
    main()
