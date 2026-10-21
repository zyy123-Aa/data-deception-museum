/* ==========================================================
 * 数据欺骗博物馆 - 核心逻辑文件 (main.js)
 * ========================================================== */

// 全局样式常量（浅色商务风）
const axisTextColor = "#64748b";
const axisLineColor = "#cbd5e1";
const gridColor = "rgba(15, 23, 42, 0.06)";
const labelTextStyle = "12px";

// 霓虹色 → 商务低饱和色的映射（仅在渲染层替换，不修改数据配置）
const chartPalette = {
    "#00f0ff": "#0ea5e9",
    "#00ff9d": "#10b981",
    "#ff007a": "#e11d48",
    "#ffb300": "#f59e0b",
    "#9d00ff": "#8b5cf6",
    "#64748b": "#94a3b8",
    "#f472b6": "#ec4899",
    "#a3e635": "#84cc16"
};
const mapColor = (c) => chartPalette[String(c).toLowerCase()] || c;

// 共享 Tooltip
const chartTooltip = d3.select("body").append("div").attr("class", "chart-tooltip").style("opacity", 0);
function showTip(html, event) {
    chartTooltip.html(html).style("opacity", 1);
    moveTip(event);
}
function moveTip(event) {
    const node = chartTooltip.node();
    const pad = 14;
    let x = event.clientX + pad, y = event.clientY + pad;
    const w = node.offsetWidth, h = node.offsetHeight;
    if (x + w > window.innerWidth - 8) x = event.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = event.clientY - h - pad;
    chartTooltip.style("left", x + "px").style("top", y + "px");
}
function hideTip() { chartTooltip.style("opacity", 0); }
const tipRow = (label, value) => `<span class="tip-label">${label}</span> <span class="tip-value">${value}</span>`;

// ==========================================
// 1. 柱状图渲染器
// ==========================================
function renderBarChart(containerId, data, config) {
    const { yStart, yEnd, barColor } = config;
    const width = 720, height = 460;
    const margin = { top: 40, right: 30, bottom: 50, left: 110 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%").style("overflow", "visible");
    
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient").attr("id", "barGrad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", barColor).attr("stop-opacity", 1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", barColor).attr("stop-opacity", 0.2);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    let yScale = d3.scaleLinear().domain([yStart, yEnd]).range([innerH, 0]);
    const xScale = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerW]).padding(0.45);

    const gGrid = g.append("g").attr("class", "grid");
    const gY = g.append("g").attr("class", "axis-y");
    const gX = g.append("g").attr("class", "axis-x").attr("transform", `translate(0,${innerH})`);
    const format = d3.format(",");

    const styleAxes = () => {
        g.selectAll(".domain").attr("stroke", axisLineColor);
        g.selectAll(".tick line").attr("stroke", axisLineColor);
        g.selectAll(".tick text").attr("fill", axisTextColor).style("font-size", labelTextStyle).style("font-family", "inherit");
    };

    const draw = (ys, rawColor) => {
        const color = mapColor(rawColor);
        gradient.selectAll("stop").attr("stop-color", color);
        gGrid.transition().duration(800).call(d3.axisLeft(ys).tickSize(-innerW).tickFormat(""))
            .selectAll("line").attr("stroke", gridColor);
        
        g.selectAll(".bar").remove();
        g.selectAll(".label").remove();

        g.selectAll(".bar").data(data).enter().append("rect")
            .attr("class", "bar").attr("x", d => xScale(d.label)).attr("width", xScale.bandwidth())
            .attr("y", d => ys(d.value)).attr("height", d => innerH - ys(d.value))
            .attr("fill", "url(#barGrad)").attr("rx", 4).attr("ry", 4)
            .style("filter", `drop-shadow(0 2px 5px ${color}33)`)
            .style("cursor", "pointer")
            .style("transition", "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)")
            .on("mouseover", (event, d) => showTip(`<span class="tip-label">${d.label}</span><br>${tipRow("数值", format(d.value))}`, event))
            .on("mousemove", moveTip)
            .on("mouseout", hideTip);

        g.selectAll(".label").data(data).enter().append("text")
            .attr("class", "label").attr("x", d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr("y", d => ys(d.value) - 10).attr("text-anchor", "middle")
            .style("font-size", "12px").style("fill", "#334155").style("font-weight", "600").style("font-family", "inherit")
            .style("pointer-events", "none")
            .style("opacity", 0).text(d => format(d.value))
            .transition().duration(800).style("opacity", 1);

        gY.transition().duration(800).call(d3.axisLeft(ys).ticks(5).tickFormat(format)).call(styleAxes);
    };

    gX.call(d3.axisBottom(xScale)).call(styleAxes);
    draw(yScale, barColor);

    return { 
        update: (newConfig) => { 
            yScale.domain([newConfig.yStart, newConfig.yEnd]); 
            draw(yScale, newConfig.barColor); 
        } 
    };
}

// ==========================================
// 2. 折线图渲染器
// ==========================================
function renderLineChart(containerId, data, config) {
    const { yStart, yEnd, inverted, lineColor, xType = "point", width = 720, height = 460 } = config; 
    
    const isNarrow = width < 500;
    const margin = { top: 40, right: isNarrow ? 20 : 30, bottom: isNarrow ? 70 : 50, left: isNarrow ? 50 : 80 };
    
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%").style("overflow", "visible");
        
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const gGrid = g.append("g").attr("class", "grid");
    const gY = g.append("g").attr("class", "axis-y");
    const gX = g.append("g").attr("class", "axis-x").attr("transform", `translate(0,${innerH})`);

    const styleAxes = () => {
        g.selectAll(".domain").attr("stroke", axisLineColor);
        g.selectAll(".tick line").attr("stroke", axisLineColor);
        g.selectAll(".tick text").attr("fill", axisTextColor).style("font-size", labelTextStyle).style("font-family", "inherit");
        
        if (isNarrow) {
            gX.selectAll(".tick text").attr("transform", "rotate(-45)").attr("text-anchor", "end").attr("dx", "-0.5em").attr("dy", "0.5em");
        } else {
            gX.selectAll(".tick text").attr("transform", null).attr("text-anchor", "middle").attr("dx", null).attr("dy", "0.71em");
        }
    };

    const draw = (ys, rawColor, isInverted, currentXType) => {
        const color = mapColor(rawColor);
        g.selectAll(".line").remove(); 
        g.selectAll(".dot").remove();
        gX.selectAll("*").remove(); 
        
        let xScale;
        if (currentXType === "time") {
            xScale = d3.scaleTime().domain(d3.extent(data, d => new Date(d.label + "-01-01"))).range([0, innerW]);
        } else {
            xScale = d3.scalePoint().domain(data.map(d => d.label)).range([0, innerW]);
        }

        const range = isInverted ? [0, innerH] : [innerH, 0];
        ys.range(range);

        gGrid.transition().duration(800).call(d3.axisLeft(ys).tickSize(-innerW).tickFormat(""))
            .selectAll("line").attr("stroke", gridColor);

        const getX = (d) => currentXType === "time" ? xScale(new Date(d.label + "-01-01")) : xScale(d.label);

        const lineGenerator = d3.line().x(getX).y(d => ys(d.value)).curve(d3.curveMonotoneX);

        g.append("path").datum(data).attr("class", "line").attr("fill", "none").attr("stroke", color).attr("stroke-width", 2.5)
            .attr("stroke-linecap", "round").attr("stroke-linejoin", "round")
            .style("filter", `drop-shadow(0 2px 4px ${color}26)`).style("transition", "all 0.8s")
            .attr("d", lineGenerator);

        g.selectAll(".dot").data(data).enter().append("circle").attr("class", "dot")
            .attr("cx", getX).attr("cy", d => ys(d.value))
            .attr("r", 4.5).attr("fill", "#ffffff").attr("stroke", color).attr("stroke-width", 2)
            .style("cursor", "pointer").style("transition", "all 0.8s")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 6);
                showTip(`<span class="tip-label">${d.label}</span><br>${tipRow("数值", d.value)}`, event);
            })
            .on("mousemove", moveTip)
            .on("mouseout", function() { d3.select(this).attr("r", 4.5); hideTip(); });

        gY.transition().duration(800).call(d3.axisLeft(ys).ticks(5)).call(styleAxes);
        
        if (currentXType === "time") {
            gX.transition().duration(800).call(d3.axisBottom(xScale).ticks(isNarrow ? 3 : 5)).call(styleAxes);
        } else {
            gX.transition().duration(800).call(d3.axisBottom(xScale)).call(styleAxes);
        }
    };

    let yScale = d3.scaleLinear().domain([yStart, yEnd]);
    draw(yScale, lineColor, inverted, xType);

    return { 
        update: (newConfig) => { 
            yScale.domain([newConfig.yStart, newConfig.yEnd]); 
            const newXType = newConfig.xType !== undefined ? newConfig.xType : xType;
            draw(yScale, newConfig.lineColor, newConfig.inverted, newXType); 
        } 
    };
}

// ==========================================
// 3. 双轴组合图渲染器
// ==========================================
function renderDualAxisChart(containerId, data, config) {
    const { gdpDomain, chocolateDomain, gdpColor, chocolateColor } = config;
    const width = 720, height = 460;
    const margin = { top: 60, right: 100, bottom: 50, left: 80 }; 
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%").style("overflow", "visible");
        
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const xScale = d3.scalePoint().domain(data.map(d => d.label)).range([25, innerW - 25]);
    
    let yScaleLeft = d3.scaleLinear().domain(gdpDomain).range([innerH, 0]);
    let yScaleRight = d3.scaleLinear().domain(chocolateDomain).range([innerH, 0]);

    const gGrid = g.append("g").attr("class", "grid");
    const gYLeft = g.append("g").attr("class", "axis-y-left");
    const gYRight = g.append("g").attr("class", "axis-y-right").attr("transform", `translate(${innerW}, 0)`);
    const gX = g.append("g").attr("class", "axis-x").attr("transform", `translate(0,${innerH})`);

    const legend = g.append("g").attr("transform", "translate(0, -30)");
    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 12).attr("height", 12).attr("rx", 3).attr("fill", mapColor(gdpColor));
    legend.append("text").attr("x", 20).attr("y", 10).text("人均GDP (现价美元)").style("fill", "#475569").style("font-size", "12px");
    legend.append("circle").attr("cx", 160).attr("cy", 6).attr("r", 5).attr("fill", "#ffffff").attr("stroke", mapColor(chocolateColor)).attr("stroke-width", 2);
    legend.append("text").attr("x", 172).attr("y", 10).text("人均可可豆消费量 (kg/年)").style("fill", "#475569").style("font-size", "12px");

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient").attr("id", "dualBarGrad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", gdpColor).attr("stop-opacity", 1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", gdpColor).attr("stop-opacity", 0.3);

    const styleAxes = () => {
        g.selectAll(".domain").attr("stroke", axisLineColor);
        g.selectAll(".tick line").attr("stroke", axisLineColor);
        g.selectAll(".tick text").style("font-size", labelTextStyle).style("font-family", "inherit");
        gYLeft.selectAll(".tick text").attr("fill", "#475569").attr("text-anchor", "end").attr("x", -10);
        gYRight.selectAll(".tick text").attr("fill", "#475569").attr("text-anchor", "start").attr("x", 10);
        gX.selectAll(".tick text").attr("fill", axisTextColor).attr("text-anchor", "middle");
    };

    const draw = (yLeft, yRight, rawC1, rawC2) => {
        const c1 = mapColor(rawC1), c2 = mapColor(rawC2);
        gradient.selectAll("stop").attr("stop-color", c1);
        legend.select("rect").attr("fill", c1);
        legend.select("circle").attr("stroke", c2);
        gGrid.transition().duration(800).call(d3.axisLeft(yLeft).tickSize(-innerW).tickFormat("")).selectAll("line").attr("stroke", gridColor);

        const bars = g.selectAll(".bar").data(data);
        bars.exit().remove();
        bars.enter().append("rect").attr("class", "bar").merge(bars)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 0.8);
                showTip(`<span class="tip-label">${d.label}</span><br>${tipRow("人均GDP", d3.format(",")(d.gdp))}`, event);
            })
            .on("mousemove", moveTip)
            .on("mouseout", function() { d3.select(this).style("opacity", 1); hideTip(); })
            .transition().duration(800)
            .attr("x", d => xScale(d.label) - 18) .attr("width", 36)
            .attr("y", d => yLeft(d.gdp)).attr("height", d => innerH - yLeft(d.gdp))
            .attr("fill", "url(#dualBarGrad)").attr("rx", 4)
            .style("filter", `drop-shadow(0 2px 4px ${c1}26)`);

        const lineGenerator = d3.line().x(d => xScale(d.label)).y(d => yRight(d.chocolate)).curve(d3.curveMonotoneX);
        g.selectAll(".line").remove(); 
        g.append("path").datum(data).attr("class", "line").attr("fill", "none").attr("stroke", c2).attr("stroke-width", 2.5)
            .attr("stroke-linecap", "round").attr("stroke-linejoin", "round")
            .style("filter", `drop-shadow(0 2px 4px ${c2}26)`).style("transition", "all 0.8s")
            .attr("d", lineGenerator);

        const dots = g.selectAll(".dot").data(data);
        dots.exit().remove();
        dots.enter().append("circle").attr("class", "dot").merge(dots)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 6);
                showTip(`<span class="tip-label">${d.label}</span><br>${tipRow("可可豆消费", d.chocolate + " kg/年")}`, event);
            })
            .on("mousemove", moveTip)
            .on("mouseout", function() { d3.select(this).attr("r", 4.5); hideTip(); })
            .transition().duration(800)
            .attr("cx", d => xScale(d.label)).attr("cy", d => yRight(d.chocolate))
            .attr("r", 4.5).attr("fill", "#ffffff").attr("stroke", c2).attr("stroke-width", 2);

        gYLeft.transition().duration(800).call(d3.axisLeft(yLeft).ticks(5).tickFormat(d3.format(","))).call(styleAxes);
        gYRight.transition().duration(800).call(d3.axisRight(yRight).ticks(5).tickFormat(d3.format(".2f"))).call(styleAxes);
        gYLeft.raise(); gYRight.raise(); gX.raise();
    };

    gX.call(d3.axisBottom(xScale)).call(styleAxes);
    draw(yScaleLeft, yScaleRight, gdpColor, chocolateColor);

    return { 
        update: (newConfig) => { 
            yScaleLeft.domain(newConfig.gdpDomain); 
            yScaleRight.domain(newConfig.chocolateDomain); 
            draw(yScaleLeft, yScaleRight, newConfig.gdpColor, newConfig.chocolateColor); 
        } 
    };
}

// ==========================================
// 4. 气泡图渲染器
// ==========================================
function renderBubbleChart(containerId, data, config) {
    const { encodingType, bubbleColor: rawBubbleColor } = config;
    const bubbleColor = mapColor(rawBubbleColor);
    const width = 720, height = 460;
    const margin = { top: 80, right: 40, bottom: 60, left: 40 }; 
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%").style("overflow", "visible");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const maxValue = d3.max(data, d => d.value);
    const maxRadius = (innerH - 20) / 2; 

    const getRadius = (value) => {
        if (encodingType === "radius") return (value / maxValue) * maxRadius; 
        else return Math.sqrt(value / maxValue) * maxRadius; 
    };

    const xScale = d3.scalePoint().domain(data.map(d => d.label)).range([maxRadius, innerW - maxRadius]);
    const yBase = innerH; 

    const defs = svg.append("defs");
    const radialGrad = defs.append("radialGradient").attr("id", "bubbleGrad").attr("cx", "30%").attr("cy", "30%").attr("r", "70%");
    radialGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff").attr("stop-opacity", 0.85);
    radialGrad.append("stop").attr("offset", "30%").attr("stop-color", bubbleColor).attr("stop-opacity", 0.55);
    radialGrad.append("stop").attr("offset", "100%").attr("stop-color", bubbleColor).attr("stop-opacity", 0.25);

    g.append("line").attr("x1", 0).attr("x2", innerW).attr("y1", yBase).attr("y2", yBase)
        .attr("stroke", axisLineColor).attr("stroke-width", 1.5).attr("stroke-dasharray", "4,4");

    const bubbles = g.selectAll(".bubble-group").data(data).enter().append("g").attr("class", "bubble-group")
        .attr("transform", d => `translate(${xScale(d.label)}, ${yBase})`)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).select("circle").attr("stroke-width", 3);
            showTip(`<span class="tip-label">${d.label}</span><br>${tipRow("人口", d.value + " 亿")}`, event);
        })
        .on("mousemove", moveTip)
        .on("mouseout", function() { d3.select(this).select("circle").attr("stroke-width", 1.5); hideTip(); });

    bubbles.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", d => -getRadius(d.value))
        .attr("stroke", bubbleColor).attr("stroke-width", 1).attr("stroke-dasharray", "3,3").style("opacity", 0.35);

    bubbles.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 0)
        .attr("transform", d => `translate(0, ${-getRadius(d.value)})`)
        .attr("fill", "url(#bubbleGrad)").attr("stroke", bubbleColor).attr("stroke-width", 1.5)
        .style("filter", `drop-shadow(0 3px 8px ${bubbleColor}33)`)
        .transition().duration(1000).ease(d3.easeElasticOut).attr("r", d => getRadius(d.value));

    const labelGroups = bubbles.append("g").attr("transform", d => `translate(0, ${-getRadius(d.value) * 2 - 25})`);
    labelGroups.append("rect").attr("x", -32).attr("y", -14).attr("width", 64).attr("height", 22).attr("rx", 6)
        .attr("fill", "#ffffff").attr("stroke", bubbleColor).attr("stroke-width", 1).attr("stroke-opacity", 0.45);
    labelGroups.append("text").attr("text-anchor", "middle").attr("y", 2)
        .style("fill", "#334155").style("font-size", "12px").style("font-weight", "600").style("font-family", "inherit")
        .style("pointer-events", "none")
        .text(d => `${d.value.toFixed(1)}%`);

    bubbles.append("text").attr("x", 0).attr("y", 25).attr("text-anchor", "middle")
        .style("fill", axisTextColor).style("font-size", "12px").style("font-family", "inherit").text(d => d.label);

    return { update: () => {} };
}

// ==========================================
// 5. 3D 饼图渲染器
// ==========================================
function renderPie3DChart(containerId, data, config) {
    const { is3D, targetLabel } = config;
    const width = 720, height = 460;
    const centerX = width / 2 - 110;
    const centerY = height / 2 + 12;
    const radius = 118;
    const tilt = 0.52;
    const thickness = is3D ? 40 : 0;
    const lift = is3D ? -30 : 0;

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%").style("overflow", "visible");

    const rootDefs = svg.append("defs");
    const calloutGrad = rootDefs.append("linearGradient").attr("id", "calloutGrad")
        .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    calloutGrad.append("stop").attr("offset", "0%").attr("stop-color", "#0f172a");
    calloutGrad.append("stop").attr("offset", "100%").attr("stop-color", "#2563eb");

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.label))
        .range(["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#e11d48", "#94a3b8"]);

    const pie = d3.pie().sort(null).value(d => d.value);
    let pieData = pie(data);

    let rotateAngle = 0;
    let targetSlice = null;
    if (is3D && targetLabel) {
        targetSlice = pieData.find(d => d.data.label === targetLabel);
        if (targetSlice) {
            const midAngle = (targetSlice.startAngle + targetSlice.endAngle) / 2;
            rotateAngle = Math.PI / 2 - midAngle; // 旋转至正下方
        }
    }

    // 应用旋转到数据
    pieData.forEach(d => {
        d.startAngle += rotateAngle;
        d.endAngle += rotateAngle;
    });

    const chartG = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);

    // 辅助函数：生成 3D 路径
    const getPath = {
        top: (d, r, t) => {
            const s = d.startAngle, e = d.endAngle;
            const x1 = r * Math.cos(s), y1 = r * Math.sin(s) * t;
            const x2 = r * Math.cos(e), y2 = r * Math.sin(e) * t;
            const largeArc = e - s > Math.PI ? 1 : 0;
            return `M 0 0 L ${x1} ${y1} A ${r} ${r * t} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        },
        sideOuter: (d, r, t, h) => {
            const s = d.startAngle, e = d.endAngle;
            const x1 = r * Math.cos(s), y1 = r * Math.sin(s) * t;
            const x2 = r * Math.cos(e), y2 = r * Math.sin(e) * t;
            const largeArc = e - s > Math.PI ? 1 : 0;
            return `M ${x1} ${y1} L ${x1} ${y1 + h} A ${r} ${r * t} 0 ${largeArc} 1 ${x2} ${y2 + h} L ${x2} ${y2} A ${r} ${r * t} 0 ${largeArc} 0 ${x1} ${y1} Z`;
        },
        sideStart: (d, r, t, h) => {
            const s = d.startAngle;
            const x = r * Math.cos(s), y = r * Math.sin(s) * t;
            return `M 0 0 L ${x} ${y} L ${x} ${y + h} L 0 ${h} Z`;
        },
        sideEnd: (d, r, t, h) => {
            const e = d.endAngle;
            const x = r * Math.cos(e), y = r * Math.sin(e) * t;
            return `M 0 0 L ${x} ${y} L ${x} ${y + h} L 0 ${h} Z`;
        }
    };

    // 排序：从后往前画
    const sortedData = [...pieData].sort((a, b) => {
        const midA = (a.startAngle + a.endAngle) / 2;
        const midB = (b.startAngle + b.endAngle) / 2;
        // 在旋转后，y 坐标越小的越在后面 (sin 越小)
        return Math.sin(midA) - Math.sin(midB);
    });

    // 渲染函数
    function renderSlice(d, isTarget) {
        const r = isTarget ? radius + 16 : radius;
        const h = thickness;
        const t = is3D ? tilt : 1;
        const offset = isTarget ? lift : 0; // 目标切片上浮，增强立体感

        const g = chartG.append("g")
            .attr("class", "slice-group")
            .attr("transform", `translate(0, 0)`) // 初始位置
            .style("opacity", 0);

        // 入场动画
        g.transition()
            .duration(800)
            .delay(d.index * 50)
            .attr("transform", `translate(0, ${offset})`)
            .style("opacity", 1);

        const baseColor = d3.color(color(d.data.label));
        const brighterColor = baseColor.brighter(0.55);
        const slug = d.data.label.replace(/\s+/g, '-');

        const defs = svg.append("defs");

        // 顶面：受光渐变（上亮下暗）
        const topGrad = defs.append("linearGradient")
            .attr("id", `grad-top-${slug}`)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        topGrad.append("stop").attr("offset", "0%").attr("stop-color", brighterColor);
        topGrad.append("stop").attr("offset", "100%").attr("stop-color", baseColor);

        // 柱面：模拟圆柱受光（两侧暗、中间亮）
        const sideGrad = defs.append("linearGradient")
            .attr("id", `grad-side-${slug}`)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
        sideGrad.append("stop").attr("offset", "0%").attr("stop-color", baseColor.darker(1.3));
        sideGrad.append("stop").attr("offset", "50%").attr("stop-color", baseColor.darker(0.35));
        sideGrad.append("stop").attr("offset", "100%").attr("stop-color", baseColor.darker(1.3));

        if (is3D) {
            g.append("path")
                .attr("d", getPath.sideOuter(d, r, t, h))
                .attr("fill", `url(#grad-side-${slug})`);

            g.append("path")
                .attr("d", getPath.sideStart(d, r, t, h))
                .attr("fill", baseColor.darker(1.6));

            g.append("path")
                .attr("d", getPath.sideEnd(d, r, t, h))
                .attr("fill", baseColor.darker(1.2));
        }

        // 顶面
        g.append("path")
            .attr("d", getPath.top(d, r, t))
            .attr("fill", `url(#grad-top-${slug})`)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", isTarget ? 2 : 1)
            .style("cursor", "pointer")
            .on("mouseover", function(event) {
                d3.select(this).style("filter", "brightness(1.06)");
                showTip(`<span class="tip-label">${d.data.label}</span><br>${tipRow("占比", d.data.value + "%")}`, event);
            })
            .on("mousemove", moveTip)
            .on("mouseout", function() {
                d3.select(this).style("filter", "none");
                hideTip();
            });

        if (isTarget) {
            g.style("filter", `drop-shadow(0 14px 18px rgba(15, 23, 42, 0.28))`);
        }
    }

    // 地面投影：双层柔化，增强悬浮感
    if (is3D) {
        chartG.append("ellipse")
            .attr("cx", 0).attr("cy", thickness + 26)
            .attr("rx", radius + 34).attr("ry", (radius + 34) * tilt * 0.92)
            .attr("fill", "#94a3b8").attr("opacity", 0.16)
            .style("filter", "blur(22px)");
        chartG.append("ellipse")
            .attr("cx", 0).attr("cy", thickness + 14)
            .attr("rx", radius + 8).attr("ry", (radius + 8) * tilt)
            .attr("fill", "#64748b").attr("opacity", 0.14)
            .style("filter", "blur(10px)");
    }

    // 按顺序渲染切片
    sortedData.forEach(d => {
        const isTarget = is3D && targetLabel === d.data.label;
        renderSlice(d, isTarget);
    });

    // 渲染百分比标签 (仅在 2D 模式)
    if (!is3D) {
        const labelArc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.6);
        chartG.selectAll(".pie-label")
            .data(pieData)
            .enter().append("text")
            .attr("transform", d => {
                const [x, y] = labelArc.centroid(d);
                return `translate(${x}, ${y})`;
            })
            .attr("text-anchor", "middle")
            .style("fill", "#fff").style("font-size", "12px").style("font-weight", "600")
            .style("pointer-events", "none")
            .text(d => `${d.data.value}%`);
    }

    // 3D 模式：底部装饰性重点标注（美工字大数字 + 引导线）
    if (is3D && targetSlice) {
        const edgeY = centerY + (radius + 16) * tilt + thickness + lift + 8;
        svg.append("line")
            .attr("x1", centerX).attr("x2", centerX)
            .attr("y1", edgeY).attr("y2", height - 62)
            .attr("stroke", "#cbd5e1").attr("stroke-width", 1.5).attr("stroke-dasharray", "4,4");
        svg.append("circle")
            .attr("cx", centerX).attr("cy", edgeY).attr("r", 3)
            .attr("fill", color(targetSlice.data.label));

        const callout = svg.append("g").attr("transform", `translate(${centerX}, ${height - 34})`);
        callout.append("text")
            .attr("text-anchor", "end").attr("x", -8)
            .style("font-size", "32px").style("font-weight", "800").style("letter-spacing", "1px")
            .attr("fill", "url(#calloutGrad)")
            .text(`${targetSlice.data.value}%`);
        callout.append("text")
            .attr("text-anchor", "start").attr("x", 8).attr("y", -4)
            .style("font-size", "13px").style("fill", "#64748b").style("font-weight", "600")
            .text(`「${targetSlice.data.label}」占比`);
        callout.append("text")
            .attr("text-anchor", "start").attr("x", 8).attr("y", 14)
            .style("font-size", "12px").style("fill", "#e11d48").style("letter-spacing", "1px")
            .text("3D 透视下被视觉放大");
    }

    // 图例
    const legendG = svg.append("g").attr("transform", `translate(${width - 210}, 110)`);
    legendG.append("text").attr("x", 0).attr("y", -18)
        .style("fill", "#8a94a6").style("font-size", "12px").style("letter-spacing", "2px")
        .text("支出结构占比");
    data.forEach((d, i) => {
        const row = legendG.append("g").attr("transform", `translate(0, ${i * 30})`);
        row.append("rect").attr("width", 14).attr("height", 14).attr("rx", 3).attr("fill", color(d.label));
        row.append("text").attr("x", 24).attr("y", 11).style("fill", "#475569").style("font-size", "13px")
            .style("font-weight", is3D && d.label === targetLabel ? "600" : "normal")
            .style("opacity", is3D && d.label !== targetLabel ? 0.55 : 1)
            .text(`${d.label} (${d.value}%)`);
    });

    return { update: () => {} };
}


// ==========================================
// 6. 堆叠面积图渲染器（改变聚合口径）
// ==========================================
function renderStackedAreaChart(containerId, data, config) {
    const { keys, colors, yStart, yEnd, xKey = "year" } = config;
    const width = 720, height = 460;
    const margin = { top: 80, right: 30, bottom: 50, left: 80 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%")
        .style("overflow", "visible");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scalePoint()
        .domain(data.map(d => d[xKey]))
        .range([0, innerW]);

    const yScale = d3.scaleLinear()
        .domain([yStart, yEnd])
        .range([innerH, 0]);

    const stack = d3.stack().keys(keys);
    const series = stack(data);

    const colorScale = d3.scaleOrdinal().domain(keys).range(colors.map(mapColor));

    // 网格
    g.append("g").attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-innerW).tickFormat(""))
        .selectAll("line").attr("stroke", gridColor);
    g.select(".grid .domain").attr("stroke", "none");

    // 堆叠面积
    const area = d3.area()
        .x(d => xScale(d.data[xKey]))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

    g.selectAll(".area")
        .data(series)
        .enter().append("path")
        .attr("class", "area")
        .attr("d", area)
        .attr("fill", d => colorScale(d.key))
        .attr("opacity", 0.8)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .append("title")
        .text(d => d.key);

    // X 轴
    const gX = g.append("g").attr("class", "axis-x")
        .attr("transform", `translate(0,${innerH})`);
    gX.call(d3.axisBottom(xScale));
    gX.selectAll(".tick text").attr("fill", axisTextColor)
        .style("font-size", labelTextStyle).style("font-family", "inherit");
    gX.selectAll(".domain").attr("stroke", axisLineColor);
    gX.selectAll(".tick line").attr("stroke", axisLineColor);

    // Y 轴
    const gY = g.append("g").attr("class", "axis-y");
    gY.call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(",")));
    gY.selectAll(".tick text").attr("fill", axisTextColor)
        .style("font-size", labelTextStyle).style("font-family", "inherit");
    gY.selectAll(".domain").attr("stroke", axisLineColor);
    gY.selectAll(".tick line").attr("stroke", axisLineColor);

    // 顶部图例（自动换行）
    const legendG = svg.append("g").attr("transform", `translate(${margin.left}, 15)`);
    let offsetX = 0, offsetY = 0;
    keys.forEach((k) => {
        const textWidth = k.length * 13 + 30;
        if (offsetX + textWidth > innerW && offsetX > 0) {
            offsetX = 0; offsetY += 22;
        }
        const row = legendG.append("g").attr("transform", `translate(${offsetX}, ${offsetY})`);
        row.append("rect").attr("width", 12).attr("height", 12).attr("rx", 2)
            .attr("fill", colorScale(k));
        row.append("text").attr("x", 16).attr("y", 10)
            .style("fill", "#475569").style("font-size", "12px").style("font-family", "inherit")
            .text(k);
        offsetX += textWidth;
    });

    return { update: () => {} };
}

// ==========================================
// 7. 热力图渲染器（色阶断点人为切割）
// ==========================================
function renderHeatmapChart(containerId, metricKey, config) {
    const panel = window.HEATMAP_PANEL.metrics[metricKey];
    if (!panel) {
        d3.select(containerId).append("div")
            .style("color", "#f87171").style("padding", "20px")
            .text(`未找到指标: ${metricKey}，请检查 heatmap-panel.js`);
        return { update: () => {} };
    }

    const { colorMode = "sequential", thresholds = [], colors = ["#00f0ff", "#ff007a"] } = config;
    const palette = colors.map(mapColor);
    const width = 760, height = 600;
    const margin = { top: 40, right: 30, bottom: 80, left: 70 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const years = panel.years;
    const provinces = panel.provinces;
    const values = panel.values;

    const allVals = [];
    provinces.forEach(p => values[p].forEach(v => { if (v !== null) allVals.push(v); }));
    const [d0, d1] = d3.extent(allVals);

    let color;
    if (colorMode === "threshold") {
        color = d3.scaleThreshold().domain(thresholds).range(palette);
    } else {
        color = d3.scaleSequential(d3.interpolateBlues).domain([d0, d1]);
    }

    const container = d3.select(containerId);
    const svg = container.append("svg")
        .attr("width", width).attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%").style("max-height", "100%")
        .style("overflow", "visible");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand().domain(years).range([0, innerW]).padding(0.05);
    const yScale = d3.scaleBand().domain(provinces).range([0, innerH]).padding(0.08);

    g.selectAll(".cell")
        .data(provinces.flatMap(p => years.map(y => ({ province: p, year: y }))))
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.province))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("rx", 2)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.5)
        .attr("fill", d => {
            const i = years.indexOf(d.year);
            const v = values[d.province][i];
            return v === null ? "#eceff4" : color(v);
        })
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#1e293b").attr("stroke-width", 1.5);
            const i = years.indexOf(d.year);
            const v = values[d.province][i];
            showTip(`<span class="tip-label">${d.province} · ${d.year}</span><br>${tipRow("数值", v === null ? "无数据" : d3.format(".4f")(v))}`, event);
        })
        .on("mousemove", moveTip)
        .on("mouseout", function() {
            d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 0.5);
            hideTip();
        });

    const gX = g.append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).tickSize(0));

    gX.selectAll("text")
        .attr("transform", "rotate(-55)")
        .attr("text-anchor", "end")
        .attr("dx", "-0.3em")
        .attr("dy", "0.3em")
        .attr("fill", axisTextColor)
        .style("font-size", "10px")
        .style("font-family", "inherit");

    gX.selectAll("path").attr("stroke", axisLineColor);

    const gY = g.append("g")
        .call(d3.axisLeft(yScale).tickSize(0));

    gY.selectAll("text")
        .attr("fill", axisTextColor)
        .style("font-size", "11px")
        .style("font-family", "inherit");

    gY.selectAll("path").attr("stroke", axisLineColor);

    // 图例：按数据量级自动选格式
    const fmt = d1 > 1e6 ? d3.format(".3s") : d3.format(".2f");
    const legendW = 260;
    const legendX = margin.left;
    const legendY = height - 30;
    const legend = svg.append("g").attr("transform", `translate(${legendX},${legendY})`);

    if (colorMode === "threshold") {
        const step = legendW / palette.length;
        palette.forEach((c, i) => {
            legend.append("rect")
                .attr("x", i * step).attr("y", 0)
                .attr("width", step).attr("height", 10)
                .attr("fill", c);
        });
        thresholds.forEach((t, i) => {
            legend.append("text")
                .attr("x", (i + 1) * step).attr("y", 24)
                .attr("text-anchor", "middle")
                .style("fill", axisTextColor)
                .style("font-size", "10px")
                .style("font-family", "inherit")
                .text(fmt(t));
        });
    } else {
        const n = 40;
        for (let i = 0; i < n; i++) {
            const v = d0 + (d1 - d0) * i / (n - 1);
            legend.append("rect")
                .attr("x", i * legendW / n).attr("y", 0)
                .attr("width", legendW / n + 1).attr("height", 10)
                .attr("fill", color(v));
        }
        legend.append("text").attr("x", 0).attr("y", 24)
            .style("fill", axisTextColor).style("font-size", "10px").text(fmt(d0));
        legend.append("text").attr("x", legendW).attr("y", 24).attr("text-anchor", "end")
            .style("fill", axisTextColor).style("font-size", "10px").text(fmt(d1));
    }

    return { update: () => {} };
}


// ==========================================
// 8. 主控制逻辑 & UI 交互
// ==========================================
let currentChart = null;
let currentCase = null;
let isMisleading = true; 

document.getElementById("enter-btn").addEventListener("click", () => {
    document.getElementById("landing-page").classList.add("hidden");
    setTimeout(() => {
        document.getElementById("museum-app").classList.add("show");
        if (museumCases.length > 0) {
            d3.select(`.nav-btn[data-id="${museumCases[0].id}"]`).classed("active", true);
            loadCase(museumCases[0].id);
        }
    }, 600);
});

const navContainer = d3.select("#nav-container");
const groups = d3.group(museumCases, d => d.difficulty);
const diffOrder = ["初级", "中级", "高级"];

diffOrder.forEach(diff => {
    if (!groups.has(diff)) return;
    const cases = groups.get(diff);
    const groupDiv = navContainer.append("div").attr("class", "nav-group");
    
    groupDiv.append("h3")
        .text(diff)
        .style("color", diff === '初级' ? '#0ea5e9' : diff === '中级' ? '#f59e0b' : '#e11d48');
    
    cases.forEach(c => {
        const btn = groupDiv.append("button")
            .attr("class", "nav-btn")
            .attr("data-id", c.id)
            .on("click", function() {
                if (d3.select(this).classed("active")) return;
                d3.selectAll(".nav-btn").classed("active", false);
                d3.select(this).classed("active", true);
                loadCase(c.id);
            });

        btn.append("span").attr("class", "icon").text(c.icon);
        btn.append("span").attr("class", "title-text").text(c.title);
    });
});

function loadCase(caseId) {
    currentCase = museumCases.find(c => c.id === caseId);
    
    const titleEl = document.getElementById("exhibit-title");
    const categoryEl = document.getElementById("exhibit-category");
    const difficultyEl = document.getElementById("exhibit-difficulty");
    const explainEl = document.getElementById("explain-text");
    
    // 文字淡入淡出动画
    [titleEl, categoryEl, difficultyEl, explainEl].forEach(el => {
        el.style.opacity = 0;
        el.style.transform = "translateY(10px)";
    });

    setTimeout(() => {
        titleEl.innerHTML = `${currentCase.title} <span style="font-size: 15px; color: #8a94a6; font-weight: 400; margin-left: 12px;">| ${currentCase.subtitle}</span>`;
        categoryEl.textContent = currentCase.category;
        difficultyEl.textContent = `${currentCase.difficulty}难度`;
        explainEl.textContent = currentCase.explainText;
        
        [titleEl, categoryEl, difficultyEl, explainEl].forEach(el => {
            el.style.transition = "all 0.5s ease";
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
        });
    }, 300);
    
    isMisleading = true;
    const btn = document.getElementById("toggle-btn");
    btn.textContent = "还原真实视觉"; 
    btn.classList.add("is-misleading"); 
    updateViewChip();
    
    renderCurrentChart();
}

function updateViewChip() {
    const chip = document.getElementById("view-chip");
    chip.textContent = isMisleading ? "误导呈现中" : "已还原真实";
    chip.classList.toggle("is-misleading", isMisleading);
    chip.classList.toggle("is-honest", !isMisleading);
}

function renderCurrentChart() {
    const chartContainer = d3.select("#chart");
    const btn = document.getElementById("toggle-btn");
    
    // 图表容器切换动画
    chartContainer.style("opacity", 0).style("transform", "scale(0.98)");
    
    setTimeout(() => {
        chartContainer.selectAll("*").remove(); 
        const config = isMisleading ? currentCase.misleadingConfig : currentCase.correctConfig;
        
        // 数据处理逻辑
        let data = currentCase.data;
        if (currentCase.misleadingData) {
            data = isMisleading ? currentCase.misleadingData : currentCase.correctData;
        }

        if (currentCase.chartType === "bar") {
            currentChart = renderBarChart("#chart", data, config);
        } else if (currentCase.chartType === "line") {
            currentChart = renderLineChart("#chart", data, config);
        } else if (currentCase.chartType === "dual-axis") {
            currentChart = renderDualAxisChart("#chart", data, config);
        } else if (currentCase.chartType === "bubble") {
            currentChart = renderBubbleChart("#chart", data, config);
        } else if (currentCase.chartType === "pie3d") {
            currentChart = renderPie3DChart("#chart", data, config);
        } else if (currentCase.chartType === "heatmap") {
            currentChart = renderHeatmapChart("#chart", currentCase.metric, config);
        } else if (currentCase.chartType === "stacked-area") {
            currentChart = renderStackedAreaChart("#chart", data, config);
        } else if (currentCase.chartType === "placeholder") {
            chartContainer.append("div").style("color", "#94a3b8").style("font-size", "20px").style("text-align", "center")
               .html(`🎨<br><br>该图表正在建设中...<br><span style="font-size:14px">你可以在此处实现 3D 饼图或其他复杂图表</span>`);
            currentChart = { update: () => {} };
            btn.disabled = true; btn.style.opacity = 0.5;
        }

        if (currentCase.chartType !== "placeholder") {
            btn.disabled = false; btn.style.opacity = 1;
        }

        chartContainer.transition().duration(600).style("opacity", 1).style("transform", "scale(1)");
    }, 300);
}

document.getElementById("toggle-btn").addEventListener("click", function() {
    isMisleading = !isMisleading;
    this.textContent = isMisleading ? "还原真实视觉" : "查看误导视角";
    this.classList.toggle("is-misleading", isMisleading);
    updateViewChip();
    renderCurrentChart();
});

// ==========================================
// 9. 鼠标交互效果
// ==========================================
document.addEventListener('mousemove', e => {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// 初始化应用
if (museumCases.length > 0) {
    const navContainer = d3.select("#nav-container");
    // ... 原有的导航初始化逻辑已经在上面更新过了，这里只需要确保调用 loadCase
    setTimeout(() => {
        const firstCase = museumCases[0];
        const firstBtn = document.querySelector(`.nav-btn[data-id="${firstCase.id}"]`);
        if (firstBtn) firstBtn.classList.add("active");
        loadCase(firstCase.id);
    }, 100);
}