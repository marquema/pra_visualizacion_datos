/**
 * main.js - Controlador principal del dashboard
 * Carga datos y gestiona navegación entre secciones
 */

// Estado global
const state = {
    data: null,
    dataByYear: {},
    countries: [],
    currentSection: 'mapa'
};

// Carga de datos
async function loadData() {
    try {
        const raw = await d3.csv('data/dataset_final.csv', d => ({
            ISO3_Code: d.ISO3_Code,
            Year: +d.Year,
            Country_Name: d.Country_Name,
            population: +d.population || null,
            gdp: +d.gdp || null,
            CO2_PerCapita: +d.CO2_PerCapita || null,
            Renewables_Share_Elec: +d.Renewables_Share_Elec || null,
            Renewables_Share_Energy: +d.Renewables_Share_Energy || null,
            Fossil_Share_Energy: +d.Fossil_Share_Energy || null,
            GDP_PPP: +d.GDP_PPP || null,
            HDI_Value: +d.HDI_Value || null,
            GNI_PerCapita: +d.GNI_PerCapita || null,
            Life_Expectancy: +d.Life_Expectancy || null,
            GII_Value: +d.GII_Value || null,
            Seats_Parliament_Female: +d.Seats_Parliament_Female || null,
            Labour_Force_Female: +d.Labour_Force_Female || null,
            Labour_Force_Male: +d.Labour_Force_Male || null,
            IESE: +d.IESE || null,
            Energy_PerCapita_kWh: +d.Energy_PerCapita_kWh || null,
            carbon_intensity_elec: +d.carbon_intensity_elec || null
        }));

        state.data = raw;

        // Agrupar por año
        for (let y = 2010; y <= 2023; y++) {
            state.dataByYear[y] = raw.filter(d => d.Year === y);
        }

        // Lista de países únicos (con datos HDI)
        state.countries = [...new Set(raw.filter(d => d.HDI_Value).map(d => d.Country_Name))].sort();

        console.log(`Datos cargados: ${raw.length} registros, ${state.countries.length} países con HDI`);
        return true;
    } catch (error) {
        console.error('Error cargando datos:', error);
        document.querySelector('main').innerHTML = `
            <div style="text-align:center;padding:3rem;">
                <h2>Error cargando datos</h2>
                <p>Asegúrate de que el archivo <code>data/dataset_final.csv</code> está disponible.</p>
                <p style="color:red;">${error.message}</p>
            </div>`;
        return false;
    }
}

// Navegación entre secciones
function setupNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.section;

            // Actualizar botones
            buttons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            // Actualizar secciones
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            state.currentSection = target;

            // Renderizar sección si es la primera vez
            renderSection(target);
        });
    });
}

// Renderizar sección
function renderSection(section) {
    switch (section) {
        case 'mapa':
            if (typeof renderMap === 'function') renderMap();
            break;
        case 'paradoja':
            if (typeof renderParadoja === 'function') renderParadoja();
            break;
        case 'correlacion':
            if (typeof renderCorrelacion === 'function') renderCorrelacion();
            break;
        case 'temporal':
            if (typeof renderTemporal === 'function') renderTemporal();
            break;
        case 'ranking':
            if (typeof renderRanking === 'function') renderRanking();
            break;
    }
}

// Utilidades compartidas
function getColor(metric) {
    const scales = {
        HDI_Value: d3.scaleSequential(d3.interpolateYlGn).domain([0.3, 1]),
        GII_Value: d3.scaleSequential(d3.interpolateRdPu).domain([0, 0.7]),
        CO2_PerCapita: d3.scaleSequential(d3.interpolateOrRd).domain([0, 20]),
        Renewables_Share_Elec: d3.scaleSequential(d3.interpolateGnBu).domain([0, 100]),
        IESE: d3.scaleSequential(d3.interpolateViridis).domain([0, 6])
    };
    return scales[metric] || d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);
}

function formatValue(value, metric) {
    if (value == null || isNaN(value)) return 'N/D';
    switch (metric) {
        case 'HDI_Value':
        case 'GII_Value':
            return value.toFixed(3);
        case 'CO2_PerCapita':
            return value.toFixed(2) + ' t';
        case 'Renewables_Share_Elec':
        case 'Fossil_Share_Energy':
        case 'Labour_Force_Female':
        case 'Seats_Parliament_Female':
            return value.toFixed(1) + '%';
        case 'GNI_PerCapita':
        case 'GDP_PPP':
            return '$' + d3.format(',.0f')(value);
        case 'IESE':
            return value.toFixed(2);
        default:
            return value.toFixed(2);
    }
}

function getMetricLabel(metric) {
    const labels = {
        HDI_Value: 'Índice de Desarrollo Humano',
        GII_Value: 'Índice de Desigualdad de Género',
        CO2_PerCapita: 'CO₂ per cápita (toneladas)',
        Renewables_Share_Elec: '% Electricidad Renovable',
        Fossil_Share_Energy: '% Energía Fósil',
        IESE: 'Índice IESE',
        GNI_PerCapita: 'RNB per cápita (PPP $)',
        Labour_Force_Female: 'Participación laboral femenina (%)',
        Seats_Parliament_Female: 'Escaños parlamentarios mujeres (%)'
    };
    return labels[metric] || metric;
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    const loaded = await loadData();
    if (loaded) {
        renderSection('mapa');
    }
});
