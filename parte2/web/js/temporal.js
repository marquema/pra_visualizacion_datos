/**
 * temporal.js - Gráfico de evolución temporal con comparación de países
 */

let temporalInitialized = false;
let selectedCountries = ['Spain'];
const countryColors = d3.scaleOrdinal(d3.schemeTableau10);

function renderTemporal() {
    if (!temporalInitialized) {
        setupTemporalControls();
        temporalInitialized = true;
    }
    drawTemporal();
}

function setupTemporalControls() {
    const select = document.getElementById('temporal-country');
    
    // Poblar selector de países
    state.countries.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        if (c === 'Spain') opt.selected = true;
        select.appendChild(opt);
    });

    document.getElementById('temporal-add').addEventListener('click', () => {
        const country = select.value;
        if (!selectedCountries.includes(country)) {
            selectedCountries.push(country);
            drawTemporal();
        }
    });

    document.getElementById('temporal-clear').addEventListener('click', () => {
        selectedCountries = [select.value];
        drawTemporal();
    });

    document.getElementById('temporal-metric').addEventListener('change', () => drawTemporal());
    select.addEventListener('change', () => {
        if (selectedCountries.length === 0) {
            selectedCountries = [select.value];
            drawTemporal();
        }
    });
}

function drawTemporal() {
    const container = document.getElementById('temporal-container');
    const metric = document.getElementById('temporal-metric').value;
    container.innerHTML = '';

    const margin = { top: 30, right: 150, bottom: 50, left: 60 };
    const width = container.clientWidth - 32 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('role', 'img')
        .attr('aria-label', `Evolución temporal de ${getMetricLabel(metric)}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filtrar datos para países seleccionados
    const filteredData = state.data.filter(d =>
        selectedCountries.includes(d.Country_Name) && d[metric] != null
    );

    if (filteredData.length === 0) {
        svg.append('text')
            .attr('x', width / 2).attr('y', height / 2)
            .attr('text-anchor', 'middle').attr('fill', '#999')
            .text('Sin datos para la selección actual');
        return;
    }

    // Escalas
    const x = d3.scaleLinear()
        .domain([2010, 2023])
        .range([0, width]);

    const yExtent = d3.extent(filteredData, d => d[metric]);
    const y = d3.scaleLinear()
        .domain([Math.min(0, yExtent[0]), yExtent[1] * 1.1])
        .range([height, 0])
        .nice();

    // Ejes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(14).tickFormat(d3.format('d')));

    svg.append('g')
        .call(d3.axisLeft(y).ticks(6));

    // Label eje Y
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2).attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px').attr('fill', '#666')
        .text(getMetricLabel(metric));

    // Líneas por país
    const line = d3.line()
        .defined(d => d[metric] != null)
        .x(d => x(d.Year))
        .y(d => y(d[metric]))
        .curve(d3.curveMonotoneX);

    const grouped = d3.group(filteredData, d => d.Country_Name);

    grouped.forEach((values, country) => {
        const color = countryColors(country);
        const sorted = values.sort((a, b) => a.Year - b.Year);

        // Línea
        svg.append('path')
            .datum(sorted)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('d', line);

        // Puntos
        svg.selectAll(`.dot-${country.replace(/\s/g, '')}`)
            .data(sorted.filter(d => d[metric] != null))
            .join('circle')
            .attr('cx', d => x(d.Year))
            .attr('cy', d => y(d[metric]))
            .attr('r', 4)
            .attr('fill', color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .append('title')
            .text(d => `${d.Country_Name} (${d.Year}): ${formatValue(d[metric], metric)}`);
    });

    // Leyenda
    const legend = svg.append('g')
        .attr('transform', `translate(${width + 10}, 10)`);

    selectedCountries.forEach((country, i) => {
        const g = legend.append('g').attr('transform', `translate(0, ${i * 22})`);
        g.append('rect')
            .attr('width', 14).attr('height', 14)
            .attr('fill', countryColors(country))
            .attr('rx', 2);
        g.append('text')
            .attr('x', 20).attr('y', 11)
            .attr('font-size', '11px').attr('fill', '#333')
            .text(country.length > 15 ? country.slice(0, 15) + '…' : country);
    });
}
