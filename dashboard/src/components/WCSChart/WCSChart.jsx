//TODO:
// (*) fix issue where if you click a point outside the coverage area, and then back in coverage area it blows up
// increase font size of axes // make inverse of bg? 
// [-] add marker on map where clicked 
// [-] add double y-axis to show Kelvin? mph?
// [-] add a legend to the chart to show which color corresponds to which level (currently in hover tooltip)
// [-] establish lower y-lim for select vars like windspeed and relative humidity 


// wishlist features:
// [-] dynamic parameter buttons based on the selected stack from the map 
// [-] specify which forecast to use based on the latest model run available from the GetCapabilities response
// [-] add a "remove chart" button to each chart to remove that specific chart from the view
// [-] add a "clear all charts" button to remove all charts from the view
// [-] When Play is pressed, animate the chart to show the forecast evolution over time
//     effectively emulating hover behavior
// [-] dropdown timezone selector in addition to UTC / Local checkboxes

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import './WCSChart.css';

const WCSChart = forwardRef((props, ref) => {
    const [currentParameter, setCurrentParameter] = useState('temperature');
    const [currentTimeZone, setCurrentTimeZone] = useState('UTC');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [status, setStatus] = useState('Click on the map to get latest forecast for a point.');
    const [charts, setCharts] = useState([]);
    const [coverageSubtype, setCoverageSubtype] = useState('hrrr-conus-subhf');
    // called from App.jsx via the ref
    useImperativeHandle(ref, () => ({
        fetchForCoordinates(lat, lon) {
            setLatitude(lat);
            setLongitude(lon);
            fetchAndDraw(lat, lon, currentParameter);
        }
    }));

    // if parameter changes, fetch data & populate new chart
    const handleParameterChange = (param) => {
        setCurrentParameter(param);
        if (latitude !== null && longitude !== null) {
            fetchAndDraw(latitude, longitude, param);
        }
    };
    
    // enable selection of coverage subtype via dropdrown
    const handleCoverageSubtypeChange = (subtype) => {
        setCoverageSubtype(subtype);
        if (latitude !== null && longitude !== null) {
            fetchAndDraw(latitude, longitude, currentParameter);
        }
    };

    // Go fetch!
    const fetchAndDraw = async (lat, lon, parameter) => {
        setStatus("Fetching latest model run...");
        try {
            const capabilitiesUrl = `https://truwx-dev.api.wetdogweather.com/wcs/GetCapabilities`; 
            const response = await fetch(capabilitiesUrl);
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            const modelIds = Array.from(xmlDoc.getElementsByTagName('wcs:CoverageId'))
                .map(node => node.textContent)
                .filter(id => id.startsWith(coverageSubtype)) 
                .sort().reverse();
            
            if (modelIds.length === 0) throw new Error(`No data coverage found.`);
            
            const latestCoverageId = modelIds[0];
            setStatus(`Found ${latestCoverageId}. Fetching data...`);

            const dataUrl = new URL('https://truwx-dev.api.wetdogweather.com/wcs/GetCoverage'); 
            dataUrl.searchParams.append('CoverageId', latestCoverageId);
            dataUrl.searchParams.append('SUBSET', `lat(${lat})`);
            dataUrl.searchParams.append('SUBSET', `long(${lon})`);
            dataUrl.searchParams.append('RANGESUBSET', parameter);
            dataUrl.searchParams.append('FORMAT', 'JSON');
            console.log(dataUrl.href);
            const dataResponse = await fetch(dataUrl.href);

            if (!dataResponse.ok) { // non 200 
                const errorText = await dataResponse.text();
                console.error("Server responded with an error:", errorText);
                throw new Error(`Request failed with status ${dataResponse.status}`);
            }

            const apiData = await dataResponse.json();
            if (!apiData || !apiData.coverageData || !Array.isArray(apiData.coverageData)) { // bad news
                throw new Error(`Point is probably beyond coverage area or data is somehow invalid.` + 
                    (apiData?.message ? `: ${apiData.message}` : '') // print any message from the server if it exists in the response
                );
            }

            const newChart = {
                id: Date.now(), // guaranteed unique identifier
                wrapper: React.createRef(),
                apiData,
                coverageId: latestCoverageId
            };
            setCharts(prevCharts => [newChart, ...prevCharts]);

            setStatus("Plot complete! Query a new location or parameter to update");
        } catch (error) {
            console.error("Error during fetch and draw process:", error);
            setStatus(`Failed to load data...`);
        }
    };
    // draw charts when the `charts` state updates
    useEffect(() => {
        charts.forEach(chart => {
            if (chart.wrapper.current) {
                drawNewChart(d3.select(chart.wrapper.current), chart.apiData, chart.coverageId);
            }
        });
    }, [charts, currentTimeZone]); // also redraw if timezone changes too

    

    const drawNewChart = (containerSelection, apiData, coverageId) => {
        containerSelection.select("svg").remove();
        const margin = { top: 40, right: 40, bottom: 50, left: 60 };
        const baseWidth = containerSelection.node().getBoundingClientRect().width * 0.95; // width < 100% avoids horiz. scrollbar
        if (baseWidth === 0) return;

        const width = baseWidth - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const svg = containerSelection.append("svg") 
            .attr("width", baseWidth)
            .attr("height", height + margin.top + margin.bottom);
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        
        const processedData = apiData.coverageData.map(d => {
            let value = d.values[0][0][0]; 
            if (d.parameterName === 'temperature') value = value - 273.15;  // K to C
            if (d.parameterName === 'pressure') value = value / 100;        // Pa to hPa
            return { date: new Date(d.validity), value: value, level: d.level };
        });

        const groupedData = d3.group(processedData, d => d.level);

        let xScale, tooltipFormat;
        const timeFormat = currentTimeZone === 'UTC' ? d3.utcFormat : d3.timeFormat; 

        if (currentTimeZone === 'UTC') {
            xScale = d3.scaleUtc().domain(d3.extent(processedData, d => d.date)).range([0, width]); // use UTC scale for x-axis when in UTC mode
            tooltipFormat = timeFormat("%b %d, %H:%M UTC");
        } else { 
            xScale = d3.scaleTime().domain(d3.extent(processedData, d => d.date)).range([0, width]); // use local time scale for x-axis when in Local mode
            tooltipFormat = timeFormat("%b %-d, %a %-I%p"); 
        }
        
        const yMin = d3.min(processedData, d => d.value); 
        const yMax = d3.max(processedData, d => d.value);
        const yPadding = (yMax - yMin) * 0.0 || 0.5; // some breathing room

        const yScale = d3.scaleLinear().domain([yMin - yPadding, yMax + yPadding]).range([height, 0]).nice();
        // https://d3js.org/d3-scale-chromatic/categorical
        const colorPair = [d3.schemeSet1[2], d3.schemeSet1[3]]; // green and purple seem nice and contrasty 
        const colorScale = d3.scaleOrdinal(colorPair);


        g.append("g").attr("class", "grid x-grid").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));
        g.append("g").attr("class", "grid y-grid").call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));


        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeHour.every(0.5)) // A tick every hour
            .tickFormat(d => {
                if (d.getHours() === 0) {
                    return timeFormat('%Y-%m-%d')(d); // on new day show the date
                }
                return timeFormat('%I:%M %p')(d);        // else just time e.g. 11:30 PM | %I:%M %p for 11 PM
            });


        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .selectAll(".tick text") 
            .each(function(d) {

                if (d.getHours() === 0) {  // slight style adjustment for midnight ticks 
                    d3.select(this) 
                        .style("text-anchor", "middle")
                        .style("font-size", "1.2em")
                        .attr("dy", "1.0em")
                        .attr("transform", "rotate()");
                }
                else {
                    d3.select(this) 
                        .style("text-anchor", "middle")
                        .style("font-size", "1.4em")
                        .attr("dx", "-.5em")
                        .attr("dy", ".55em")
                        .attr("transform", "rotate(0)");
                }
            });

        const yAxis = g.append("g").call(d3.axisLeft(yScale));
        yAxis.selectAll("text").style("font-size", "1.4em"); 
        yAxis.selectAll(".tick text").each(function (d, i) {  
            if (i % 2 !== 0) { // hide every other tick label to reduce y-axis clutter
                d3.select(this).style("display", "none");
            }
        });
        let yLabel = apiData.parameterName.replace(/_/g, ' '); // replace underscores with spaces for better readability
        let yUnits = (apiData.coverageData[0]) ? apiData.coverageData[0].units : ''; // default to empty string if no coverage data available
        if (apiData.parameterName === 'temperature') yUnits = '°C';
        if (apiData.parameterName === 'pressure') yUnits = 'hPa';
        if (yUnits) yLabel += ` (${yUnits})`;

        yAxis.append("text") 
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left) // Position left of the axis
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "1.8em")
            .text(yLabel);


        const lineGenerator = d3.line().x(d => xScale(d.date)).y(d => yScale(d.value)); // create a line generator function for the data points
        groupedData.forEach((dataForLevel, level) => {                                  // for each level in the grouped data, create a line path using the line generator
            g.append("path").datum(dataForLevel)
                .attr("class", "line")
                .attr("d", lineGenerator)
                .style("stroke", colorScale(level));
        });

        const lon = parseFloat(apiData.coverageData[0].coordinates[0][0].lon).toFixed(2); 
        const lat = parseFloat(apiData.coverageData[0].coordinates[0][0].lat).toFixed(2); 
        g.append("text").attr("x", width / 2).attr("y", -15).attr("text-anchor", "middle").attr("class", "chart-title") // add a title to the chart
            .text(`${apiData.parameterName.replace(/_/g, ' ')} at Lon: ${lon}, Lat: ${lat}`);
            
        const hoverGroup = g.append("g").attr("class", "hover-group").style("display", "none"); 
        hoverGroup.append("line").attr("class", "hover-line").attr("y1", 0).attr("y2", height); // vertical line that follows the mouse
        const tooltip = hoverGroup.append("g").attr("class", "chart-tooltip");                  // group for the tooltip box and text
        const tooltipBox = tooltip.append("rect"); 
        const tooltipText = tooltip.append("text").attr("x", 8).attr("y", 15);

        groupedData.forEach((dataForLevel, level) => { // create a hover circle for each level in the data
            hoverGroup.append("circle")
                .attr("class", `hover-circle level-${String(level).replace(/\s+/g, '-')}`) 
                .attr("r", 5).style("fill", colorScale(level)); 
        });

        g.append("rect") // not unlike the "looking glass", the "listening rectangle" is an invisible rectangle to capture mouse events
            .attr("class", "listening-rect")
            .attr("width", width).attr("height", height)
            .on("mouseover", () => hoverGroup.style("display", null))
            .on("mouseout", () => hoverGroup.style("display", "none"))
            .on("mousemove", mousemove); 

        function mousemove(event) {
            if (!processedData || processedData.length === 0) return; // in case dataset is empty
            const [mouseX] = d3.pointer(event, this);                 // get mouse position relative to the listening rect
            const xDate = xScale.invert(mouseX);                      // convert mouse x position to date using the xScale
            
            const bisector = d3.bisector(d => d.date).left;           // create a bisector function to find the closest data point
            const index = bisector(processedData, xDate, 1);          // find the index of the closest data point to the mouse x position
            const d0 = processedData[index - 1];                      // get the data point just before the mouse x position
            const d1 = processedData[index];                          // get the data point just after the mouse x position
            const d = (d1 && (xDate - d0.date > d1.date - xDate)) ? d1 : d0; // choose the closest point
            if (!d) return;

            const pointsAtTime = processedData.filter(p => p.date.getTime() === d.date.getTime()); // get all points at the same time as the closest point (e.g. wspd)
            hoverGroup.attr("transform", `translate(${xScale(d.date)}, 0)`); // move the hover group to the x position of the closest point
            hoverGroup.selectAll(".hover-circle").style("display", "none");  

            pointsAtTime.forEach(point => { // for each point at the same time, position the hover circle at the correct y position and make it visible
                hoverGroup.select(`.hover-circle.level-${String(point.level).replace(/\s+/g, '-')}`)
                    .attr("transform", `translate(0, ${yScale(point.value)})`)
                    .style("display", null); 
            });

            tooltipText.selectAll("tspan").remove();
            tooltipText.append("tspan").attr("x", 8).attr("dy", "1.2em").style("font-weight", "bold").text(tooltipFormat(d.date));

            pointsAtTime.sort((a,b) => String(a.level).localeCompare(String(b.level))).forEach(point => { // sort points by level to ensure consistent order in tooltip
                let unit = "";
                if (apiData.parameterName === 'temperature') unit = " °C";
                else if (apiData.parameterName === 'pressure') unit = " hPa";
                else unit = ` ${apiData.coverageData[0]?.units || ''}`;
                
                tooltipText.append("tspan").attr("x", 8).attr("dy", "1.2em")
                    .style("fill", colorScale(point.level))
                    .text(`${point.level}: ${point.value.toFixed(1)}${unit}`);
            });

            const bbox = tooltipText.node().getBBox(); 
            tooltipBox.attr("x", bbox.x - 4).attr("y", bbox.y - 2).attr("width", bbox.width + 8).attr("height", bbox.height + 4); // add some padding around the text
            const tooltipX = xScale(d.date) > width / 2 ? -bbox.width - 15 : 15; // position tooltip to left or right of hover line based on available space
            tooltip.attr("transform", `translate(${tooltipX}, 5)`);
        }
    };


    return (
        <div className="wcs-chart-container">
            <div className="horizontal-controls-pane">
                 <div className="parameter-buttons">
                    {/* TODO: dynamically generate several core met. var. buttons based on selected coverage type? example using relative humidity*/}
                    <button className={currentParameter === 'temperature' ? 'active' : ''} onClick={() => handleParameterChange('temperature')}>Temperature</button>
                    <button className={currentParameter === 'wind_speed' ? 'active' : ''} onClick={() => handleParameterChange('wind_speed')}>Wind Speed</button>
                    {coverageSubtype === 'hrrr-conus-sfcf' && (
                        <button className={currentParameter === 'relative_humidity' ? 'active' : ''} onClick={() => handleParameterChange('relative_humidity')}>Humidity</button>
                    )}                </div>
                <div className="right-section">
                    <div className="coverage-controls">
                        <label>
                            Coverage: 
                                <select value={coverageSubtype} onChange={(e) => handleCoverageSubtypeChange(e.target.value)}>
                                <option value="hrrr-conus-subhf">HRRR CONUS SubHF</option>
                                <option value="hrrr-conus-sfcf">HRRR CONUS sfcf</option>
                                {/* Takes forever... <option value="gfs-global-atmos">GFS Global Atmos</option> */} 
                            </select>
                        </label>
                    </div>
                     <div className="time-controls">
                        <label><input type="checkbox" checked={currentTimeZone === 'UTC'} onChange={() => setCurrentTimeZone('UTC')} /> UTC</label>
                        <label><input type="checkbox" checked={currentTimeZone === 'Local'} onChange={() => setCurrentTimeZone('Local')} /> Local</label>
                    </div>
                    <div className="status-text">{status}</div>
                </div>
            </div>
            <div className="charts-pane">
                {charts.map(chart => (
                    <div key={chart.id} className="chart-wrapper" ref={chart.wrapper}></div>
                ))}
            </div>
        </div>
    );
});

export default WCSChart;