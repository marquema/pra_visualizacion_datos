/**
 * map.js - Mapa coroplético global con D3.js
 */

let mapInitialized = false;
let mapSvg, mapProjection, mapPath, mapG;
let worldGeo = null;

async function renderMap() {
    const container = document.getElementById('map-container');
    const metric = document.getElementById('map-metric').value;
    const year = +document.getElementById('map-year').value;

    // Cargar topojson del mundo si no está cargado
    if (!worldGeo) {
        try {
            const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            worldGeo = topojson.feature(world, world.objects.countries);
        } catch (e) {
            container.innerHTML = '<p style="text-align:center;padding:2rem;">Error cargando mapa base.</p>';
            return;
        }
    }

    if (!mapInitialized) {
        initMap(container);
        setupMapControls();
        mapInitialized = true;
    }

    updateMap(metric, year);
}

function initMap(container) {
    const width = container.clientWidth - 32;
    const height = Math.min(500, width * 0.55);

    container.innerHTML = '';
    mapSvg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('role', 'img')
        .attr('aria-label', 'Mapa coroplético mundial');

    mapProjection = d3.geoNaturalEarth1()
        .fitSize([width, height], worldGeo);

    mapPath = d3.geoPath().projection(mapProjection);

    mapG = mapSvg.append('g');

    // Dibujar países
    mapG.selectAll('path')
        .data(worldGeo.features)
        .join('path')
        .attr('d', mapPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('fill', '#ddd');

    // Zoom
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            mapG.attr('transform', event.transform);
        });
    mapSvg.call(zoom);
}

function updateMap(metric, year) {
    const yearData = state.dataByYear[year] || [];
    const colorScale = getColor(metric);

    // Crear lookup ISO numérico → datos
    // world-atlas usa IDs numéricos (ISO 3166-1 numeric)
    const isoNumToAlpha = buildIsoMapping();
    const dataMap = new Map();
    yearData.forEach(d => {
        if (d[metric] != null) {
            dataMap.set(d.ISO3_Code, d);
        }
    });

    mapG.selectAll('path')
        .transition()
        .duration(300)
        .attr('fill', d => {
            const alpha3 = isoNumToAlpha[d.id];
            const record = dataMap.get(alpha3);
            if (record && record[metric] != null) {
                return colorScale(record[metric]);
            }
            return '#eee';
        });

    // Tooltip
    mapG.selectAll('path')
        .on('mouseover', function(event, d) {
            const alpha3 = isoNumToAlpha[d.id];
            const record = dataMap.get(alpha3);
            d3.select(this).attr('stroke', '#333').attr('stroke-width', 1.5);

            const tooltip = d3.select('#map-container')
                .selectAll('.map-tooltip')
                .data([0])
                .join('div')
                .attr('class', 'tooltip map-tooltip visible');

            if (record) {
                tooltip.html(`
                    <strong>${record.Country_Name}</strong><br>
                    ${getMetricLabel(metric)}: ${formatValue(record[metric], metric)}
                `);
            } else {
                tooltip.html(`<em>Sin datos</em>`);
            }

            tooltip.style('left', (event.offsetX + 15) + 'px')
                   .style('top', (event.offsetY - 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this).attr('stroke', '#fff').attr('stroke-width', 0.5);
            d3.selectAll('.map-tooltip').classed('visible', false);
        });

    // Actualizar leyenda
    updateMapLegend(metric, colorScale);
}

function updateMapLegend(metric, colorScale) {
    const legend = document.getElementById('map-legend');
    const domain = colorScale.domain();
    const width = 300;
    const height = 12;

    legend.innerHTML = '';
    const svg = d3.select(legend).append('svg').attr('width', width + 60).attr('height', 40);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient').attr('id', 'legend-gradient');
    
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        gradient.append('stop')
            .attr('offset', `${t * 100}%`)
            .attr('stop-color', colorScale(domain[0] + t * (domain[1] - domain[0])));
    }

    svg.append('rect')
        .attr('x', 30).attr('y', 5)
        .attr('width', width).attr('height', height)
        .style('fill', 'url(#legend-gradient)');

    svg.append('text').attr('x', 30).attr('y', 32).text(formatValue(domain[0], metric)).attr('font-size', '11px');
    svg.append('text').attr('x', width + 30).attr('y', 32).text(formatValue(domain[1], metric)).attr('font-size', '11px').attr('text-anchor', 'end');
}

function setupMapControls() {
    document.getElementById('map-metric').addEventListener('change', () => renderMap());
    
    const yearSlider = document.getElementById('map-year');
    yearSlider.addEventListener('input', () => {
        document.getElementById('map-year-label').textContent = yearSlider.value;
        updateMap(document.getElementById('map-metric').value, +yearSlider.value);
    });
}

// Mapeo ISO numérico a alpha-3 (subset principal)
function buildIsoMapping() {
    return {
        '4': 'AFG', '8': 'ALB', '12': 'DZA', '20': 'AND', '24': 'AGO',
        '28': 'ATG', '32': 'ARG', '51': 'ARM', '36': 'AUS', '40': 'AUT',
        '31': 'AZE', '44': 'BHS', '48': 'BHR', '50': 'BGD', '52': 'BRB',
        '112': 'BLR', '56': 'BEL', '84': 'BLZ', '204': 'BEN', '64': 'BTN',
        '68': 'BOL', '70': 'BIH', '72': 'BWA', '76': 'BRA', '96': 'BRN',
        '100': 'BGR', '854': 'BFA', '108': 'BDI', '132': 'CPV', '116': 'KHM',
        '120': 'CMR', '124': 'CAN', '140': 'CAF', '148': 'TCD', '152': 'CHL',
        '156': 'CHN', '170': 'COL', '174': 'COM', '178': 'COG', '180': 'COD',
        '188': 'CRI', '384': 'CIV', '191': 'HRV', '192': 'CUB', '196': 'CYP',
        '203': 'CZE', '208': 'DNK', '262': 'DJI', '212': 'DMA', '214': 'DOM',
        '218': 'ECU', '818': 'EGY', '222': 'SLV', '226': 'GNQ', '232': 'ERI',
        '233': 'EST', '231': 'ETH', '242': 'FJI', '246': 'FIN', '250': 'FRA',
        '266': 'GAB', '270': 'GMB', '268': 'GEO', '276': 'DEU', '288': 'GHA',
        '300': 'GRC', '308': 'GRD', '320': 'GTM', '324': 'GIN', '624': 'GNB',
        '328': 'GUY', '332': 'HTI', '340': 'HND', '348': 'HUN', '352': 'ISL',
        '356': 'IND', '360': 'IDN', '364': 'IRN', '368': 'IRQ', '372': 'IRL',
        '376': 'ISR', '380': 'ITA', '388': 'JAM', '392': 'JPN', '400': 'JOR',
        '398': 'KAZ', '404': 'KEN', '296': 'KIR', '408': 'PRK', '410': 'KOR',
        '414': 'KWT', '417': 'KGZ', '418': 'LAO', '428': 'LVA', '422': 'LBN',
        '426': 'LSO', '430': 'LBR', '434': 'LBY', '438': 'LIE', '440': 'LTU',
        '442': 'LUX', '450': 'MDG', '454': 'MWI', '458': 'MYS', '462': 'MDV',
        '466': 'MLI', '470': 'MLT', '478': 'MRT', '480': 'MUS', '484': 'MEX',
        '498': 'MDA', '496': 'MNG', '499': 'MNE', '504': 'MAR', '508': 'MOZ',
        '104': 'MMR', '516': 'NAM', '524': 'NPL', '528': 'NLD', '554': 'NZL',
        '558': 'NIC', '562': 'NER', '566': 'NGA', '807': 'MKD', '578': 'NOR',
        '512': 'OMN', '586': 'PAK', '591': 'PAN', '598': 'PNG', '600': 'PRY',
        '604': 'PER', '608': 'PHL', '616': 'POL', '620': 'PRT', '634': 'QAT',
        '642': 'ROU', '643': 'RUS', '646': 'RWA', '662': 'LCA', '670': 'VCT',
        '882': 'WSM', '678': 'STP', '682': 'SAU', '686': 'SEN', '688': 'SRB',
        '690': 'SYC', '694': 'SLE', '702': 'SGP', '703': 'SVK', '705': 'SVN',
        '90': 'SLB', '706': 'SOM', '710': 'ZAF', '724': 'ESP', '144': 'LKA',
        '736': 'SDN', '740': 'SUR', '748': 'SWZ', '752': 'SWE', '756': 'CHE',
        '760': 'SYR', '762': 'TJK', '834': 'TZA', '764': 'THA', '626': 'TLS',
        '768': 'TGO', '776': 'TON', '780': 'TTO', '788': 'TUN', '792': 'TUR',
        '795': 'TKM', '800': 'UGA', '804': 'UKR', '784': 'ARE', '826': 'GBR',
        '840': 'USA', '858': 'URY', '860': 'UZB', '548': 'VUT', '862': 'VEN',
        '704': 'VNM', '887': 'YEM', '894': 'ZMB', '716': 'ZWE',
        '728': 'SSD', '275': 'PSE', '-99': 'XKX'
    };
}
