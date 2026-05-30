/**
 * ranking.js - Bar chart horizontal del ranking IESE
 */

let rankingInitialized = false;

function renderRanking() {
    if (!rankingInitialized) {
        document.getElementById('ranking-top').addEventListener('change', () => drawRanking());
        rankingInitialized = true;
    }
    drawRanking();
}

function drawRanking() {
    const container = document.getElementById('ranking-container');
    const topN = +document.getElementById('ranking-top').value;
    container.innerHTML = '';

    // Datos 2023, con IESE válido
    const data = state.dataByYear[2023]
        .filter(d => d.IESE != null && d.IESE > 0 && d.HDI_Value != null)
        .sort((a, b) => b.IESE - a.IESE)
        .slice(0, topN);

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;">Sin datos IESE disponibles.</p>';
        return;
    }

    const margin = { top: 20, right: 80, bottom: 30, left: 160 };
    const barHeight = 22;
    const gap = 4;
    const height = data.length * (barHeight + gap) + margin.top + margin.bottom;
    const width = container.clientWidth - 32 - margin.left - margin.right;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height)
        .attr('role', 'img')
        .attr('aria-label', `Ranking de los ${topN} países con mayor IESE`)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Escalas
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.IESE) * 1.1])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.Country_Name))
        .range([0, data.length * (barHeight + gap)])
        .padding(0.15);

    // Color basado en HDI
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0.5, 1]);

    // Eje Y (países)
    svg.append('g')
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll('text')
        .attr('font-size', '11px');

    // Eje X
    svg.append('g')
        .attr('transform', `translate(0,${data.length * (barHeight + gap)})`)
        .call(d3.axisBottom(x).ticks(5))
        .append('text')
        .attr('x', width / 2).attr('y', 25)
        .attr('fill', '#666').attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .text('Índice IESE');

    // Barras
    svg.selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => y(d.Country_Name))
        .attr('width', 0)
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(d.HDI_Value))
        .attr('rx', 3)
        .transition()
        .duration(600)
        .delay((d, i) => i * 20)
        .attr('width', d => x(d.IESE));

    // Valores al final de la barra
    svg.selectAll('.value-label')
        .data(data)
        .join('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d.IESE) + 5)
        .attr('y', d => y(d.Country_Name) + y.bandwidth() / 2 + 4)
        .attr('font-size', '10px')
        .attr('fill', '#555')
        .text(d => d.IESE.toFixed(2));

    // Tooltip en hover
    svg.selectAll('.bar')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 0.8);
            const tip = d3.select(container)
                .selectAll('.ranking-tip')
                .data([0])
                .join('div')
                .attr('class', 'tooltip ranking-tip visible')
                .html(`
                    <strong>${d.Country_Name}</strong><br>
                    IESE: ${d.IESE.toFixed(2)}<br>
                    HDI: ${d.HDI_Value.toFixed(3)}<br>
                    GII: ${formatValue(d.GII_Value, 'GII_Value')}<br>
                    CO₂/cap: ${formatValue(d.CO2_PerCapita, 'CO2_PerCapita')}<br>
                    Renovables: ${formatValue(d.Renewables_Share_Elec, 'Renewables_Share_Elec')}
                `)
                .style('left', (event.offsetX + 15) + 'px')
                .style('top', (event.offsetY - 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
            d3.selectAll('.ranking-tip').classed('visible', false);
        });
}
