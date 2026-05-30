/**
 * scatter.js - Scatter plots para Paradoja Económica y Correlación Verde-Lila
 */

let paradojaInitialized = false;
let correlacionInitialized = false;

// =============================================================================
// PARADOJA ECONÓMICA: GNI vs Participación laboral femenina
// =============================================================================
function renderParadoja() {
    const container = document.getElementById('paradoja-container');
    const yMetric = document.getElementById('paradoja-y').value;

    // Datos: último año disponible por país (2023)
    const data = state.dataByYear[2023]
        .filter(d => d.GNI_PerCapita && d[yMetric]);

    drawScatter({
        container,
        data,
        xMetric: 'GNI_PerCapita',
        yMetric,
        colorMetric: 'GII_Value',
        sizeMetric: 'population',
        tooltipId: 'paradoja-tooltip',
        xLabel: 'Renta Nacional Bruta per cápita (PPP $)',
        yLabel: getMetricLabel(yMetric),
        xLog: true
    });

    if (!paradojaInitialized) {
        document.getElementById('paradoja-y').addEventListener('change', () => renderParadoja());
        paradojaInitialized = true;
    }
}

// =============================================================================
// CORRELACIÓN VERDE-LILA: GII vs Renovables
// =============================================================================
function renderCorrelacion() {
    const container = document.getElementById('correlacion-container');

    const data = state.dataByYear[2023]
        .filter(d => d.GII_Value && d.Renewables_Share_Elec);

    drawScatter({
        container,
        data,
        xMetric: 'GII_Value',
        yMetric: 'Renewables_Share_Elec',
        colorMetric: 'HDI_Value',
        sizeMetric: 'population',
        tooltipId: 'correlacion-tooltip',
        xLabel: 'Índice de Desigualdad de Género (GII) →  Mayor desigualdad',
        yLabel: '% Electricidad de fuentes renovables',
        xLog: false
    });

    correlacionInitialized = true;
}

// =============================================================================
// FUNCIÓN GENÉRICA DE SCATTER PLOT
// =============================================================================
function drawScatter({ container, data, xMetric, yMetric, colorMetric, sizeMetric, tooltipId, xLabel, yLabel, xLog }) {
    container.innerHTML = '';

    const margin = { top: 30, right: 30, bottom: 60, left: 70 };
    const width = container.clientWidth - 32 - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('role', 'img')
        .attr('aria-label', `Scatter plot: ${xLabel} vs ${yLabel}`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escalas
    const xExtent = d3.extent(data, d => d[xMetric]);
    const yExtent = d3.extent(data, d => d[yMetric]);

    const x = xLog
        ? d3.scaleLog().domain([Math.max(500, xExtent[0]), xExtent[1]]).range([0, width])
        : d3.scaleLinear().domain(xExtent).range([0, width]).nice();

    const y = d3.scaleLinear().domain(yExtent).range([height, 0]).nice();

    const colorScale = colorMetric === 'GII_Value'
        ? d3.scaleSequential(d3.interpolateRdPu).domain([0, 0.7])
        : d3.scaleSequential(d3.interpolateYlGn).domain([0.3, 1]);

    const sizeScale = d3.scaleSqrt()
        .domain(d3.extent(data.filter(d => d[sizeMetric]), d => d[sizeMetric]))
        .range([3, 20]);

    // Ejes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6, xLog ? '~s' : null))
        .append('text')
        .attr('x', width / 2).attr('y', 45)
        .attr('fill', '#666').attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(xLabel);

    svg.append('g')
        .call(d3.axisLeft(y).ticks(6))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2).attr('y', -55)
        .attr('fill', '#666').attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(yLabel);

    // Puntos
    const tooltip = document.getElementById(tooltipId);

    svg.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => {
            const val = x(d[xMetric]);
            return isNaN(val) ? -100 : val;
        })
        .attr('cy', d => y(d[yMetric]))
        .attr('r', d => d[sizeMetric] ? sizeScale(d[sizeMetric]) : 5)
        .attr('fill', d => d[colorMetric] ? colorScale(d[colorMetric]) : '#999')
        .attr('opacity', 0.7)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1).attr('stroke', '#333').attr('stroke-width', 2);
            tooltip.classList.add('visible');
            tooltip.innerHTML = `
                <strong>${d.Country_Name}</strong><br>
                ${xLabel.split('(')[0].trim()}: ${formatValue(d[xMetric], xMetric)}<br>
                ${yLabel.split('(')[0].trim()}: ${formatValue(d[yMetric], yMetric)}<br>
                ${colorMetric === 'GII_Value' ? 'GII' : 'HDI'}: ${formatValue(d[colorMetric], colorMetric)}
            `;
            tooltip.style.left = (event.offsetX + 15) + 'px';
            tooltip.style.top = (event.offsetY - 10) + 'px';
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.7).attr('stroke', '#fff').attr('stroke-width', 0.5);
            tooltip.classList.remove('visible');
        });

    // Leyenda de color inline
    const legendG = svg.append('g').attr('transform', `translate(${width - 120}, 5)`);
    legendG.append('text').attr('font-size', '10px').attr('fill', '#666')
        .text(colorMetric === 'GII_Value' ? 'Color: GII' : 'Color: HDI');
}
