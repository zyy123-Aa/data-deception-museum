const museumCases = [
    {
        id: "truncated-axis-gdp-year",
        title: "截断Y轴",
        subtitle: "年度国内生产总值",
        category: "坐标轴陷阱",
        difficulty: "初级",
        icon: "📊",
        chartType: "bar",
        data: [
            { label: "2020", value: 1034867.6 },
            { label: "2021", value: 1173823.0 },
            { label: "2022", value: 1234029.4 },
            { label: "2023", value: 1294271.7 },
            { label: "2024", value: 1348066.2 },
            { label: "2025", value: 1401879.2 }
        ],
        correctConfig: { yStart: 0, yEnd: 1500000, barColor: "#00f0ff" },
        misleadingConfig: { yStart: 900000, yEnd: 1500000, barColor: "#ff007a" },
        explainText: "数据全部来自国家统计局，真实准确。Y轴从0开始时，年度GDP增长平缓；截断Y轴起点至90万亿元后，相同的数据在视觉上增幅被放大数倍，是政府报告、财经通稿中最常用的视觉美化手法。"
    },
    {
        id: "inverted-y-axis-poverty",
        title: "倒置Y轴",
        subtitle: "全球极端贫困率（1990-2024）",
        category: "坐标轴陷阱",
        difficulty: "初级",
        icon: "📈",
        chartType: "line",
        data: [
            { label: "1990", value: 43.6 },
            { label: "2000", value: 36.2 },
            { label: "2010", value: 21.0 },
            { label: "2015", value: 12.6 },
            { label: "2019", value: 11.1 },
            { label: "2024", value: 10.1 }
        ],
        correctConfig: { yStart: 0, yEnd: 50, inverted: false, lineColor: "#00ff9d" },
        misleadingConfig: { yStart: 0, yEnd: 50, inverted: true, lineColor: "#ffb300" },
        explainText: "全球极端贫困率在过去三十年间大幅下降，这是人类历史上最伟大的减贫成就之一。但当Y轴倒置后，同一条折线在视觉上瞬间变成了‘一路飙升的恶化曲线’——数据本身没有说谎，只是坐标系翻转了方向，故事的结论就完全逆转了。"
    },
    {
        id: "uneven-x-axis-gdp",
        title: "不规则X轴",
        subtitle: "中国历年GDP（1978-2024）",
        category: "坐标轴陷阱",
        difficulty: "初级",
        icon: "📉",
        chartType: "line",
        data: [
            { label: "1978", value: 0.37 },
            { label: "1990", value: 1.89 },
            { label: "2000", value: 10.13 },
            { label: "2010", value: 41.93 },
            { label: "2015", value: 70.25 },
            { label: "2020", value: 103.49 },
            { label: "2024", value: 134.91 }
        ],
        correctConfig: { yStart: 0, yEnd: 150, xType: "time", lineColor: "#00ff9d" },
        misleadingConfig: { yStart: 0, yEnd: 150, xType: "point", lineColor: "#ffb300" },
        explainText: "数据全部真实。X轴均匀排列时，1978到2000年的漫长增长被压缩在很小的空间里，而近年增速却被放大。切换为真实时间轴后，早期的平缓与后期的陡峭才显现出真实的比例。"
    },
    {
        id: "dual-axis-fake-correlation",
        title: "双轴制造虚假相关",
        subtitle: "巧克力消费与人均GDP",
        category: "感知欺骗",
        difficulty: "中级",
        icon: "🍫",
        chartType: "dual-axis",
        data: [
            { label: "2000", gdp: 969.20, chocolate: 0.030 },
            { label: "2005", gdp: 1777.64, chocolate: 0.040 },
            { label: "2010", gdp: 4629.25, chocolate: 0.050 },
            { label: "2015", gdp: 8175.33, chocolate: 0.080 },
            { label: "2020", gdp: 10627.46, chocolate: 0.100 },
            { label: "2024", gdp: 13293.12, chocolate: 0.120 }
        ],
        correctConfig: { 
            gdpDomain: [0, 15000], 
            chocolateDomain: [0, 0.15],
            gdpColor: "#00f0ff", 
            chocolateColor: "#ff007a" 
        },
        misleadingConfig: { 
            gdpDomain: [0, 15000], 
            chocolateDomain: [0.025, 0.125],
            gdpColor: "#00f0ff", 
            chocolateColor: "#ff007a" 
        },
        explainText: "数据完全真实，巧克力与GDP毫无因果关系。但通过强行对齐左右双轴的视觉高度，并截断右侧巧克力轴的起点，两条原本独立的曲线变得高度重合。观众会本能地产生错觉：巧克力吃得多，经济就越发达。"
    },
    {
        id: "aspect-ratio-stretch",
        title: "宽高比拉伸",
        subtitle: "全球气温异常值（1980-2024）",
        category: "感知欺骗",
        difficulty: "中级",
        icon: "🌡️",
        chartType: "line",
        data: [
            { label: "1980", value: 0.345 },
            { label: "1985", value: 0.393 },
            { label: "1990", value: 0.442 },
            { label: "1995", value: 0.450 },
            { label: "2000", value: 0.507 },
            { label: "2005", value: 0.581 },
            { label: "2010", value: 0.623 },
            { label: "2015", value: 0.596 },
            { label: "2020", value: 0.667 },
            { label: "2024", value: 0.719 }
        ],
        correctConfig: { 
            yStart: 0, 
            yEnd: 1.0, 
            width: 800,
            height: 250,
            lineColor: "#00ff9d" 
        },
        misleadingConfig: { 
            yStart: 0, 
            yEnd: 1.0, 
            width: 250,
            height: 600,
            lineColor: "#ffb300" 
        },
        explainText: "数据完全真实。当画布被拉伸得又宽又扁时，气候变化的趋势显得非常平缓；但只要把画布压缩成瘦高型，同样的微小波动就会在视觉上变成急剧飙升。这就是著名的‘曲棍球棍图’争议中的核心视觉手法。"
    },
        {
        id: "bubble-radius-vs-area",
        title: "气泡图感知欺骗",
        subtitle: "2025年各国人口对比",
        category: "感知欺骗",
        difficulty: "中级",
        icon: "🫧",
        chartType: "bubble",
        data: [
            { label: "中国", value: 14.06 },
            { label: "美国", value: 3.40 },
            { label: "印尼", value: 2.81 },
            { label: "巴西", value: 2.12 },
            { label: "日本", value: 1.24 },
            { label: "澳大利亚", value: 0.27 }
        ],
        correctConfig: { 
            encodingType: "area", 
            bubbleColor: "#00ff9d" 
        },
        misleadingConfig: { 
            encodingType: "radius", 
            bubbleColor: "#ff007a" 
        },
        explainText: "数值是绝对真实的。但在‘误导版’中，我们直接将数值与圆的半径绑定。由于面积与半径的平方成正比，中国（14亿）的半径是澳洲（0.27亿）的50倍，视觉面积就变成了可怕的2500倍！切换到‘正确版’按面积编码后，差距才回归正常。"
    },
    {
        id: "fake-3d-pie",
        title: "3D透视扭曲",
        subtitle: "居民人均消费支出结构（2025）",
        category: "感知欺骗",
        difficulty: "高级",
        icon: "🥧",
        chartType: "pie3d",
        data: [
            { label: "食品烟酒", value: 29.3 },
            { label: "居住", value: 21.7 },
            { label: "交通通信", value: 14.6 },
            { label: "教育文化娱乐", value: 11.8 },
            { label: "医疗保健", value: 8.7 },
            { label: "其他", value: 13.9 }
        ],
        correctConfig: { 
            is3D: false, 
            targetLabel: "居住" 
        },
        misleadingConfig: { 
            is3D: true, 
            targetLabel: "居住" 
        },
        explainText: "占比21.7%的‘居住’项原本只占五分之一。但在3D透视下，把它放在靠近观察者的最前端，它的视觉面积会被严重放大，看起来像占了30%以上；而放在远端的切片则会被压缩。数据没变，但在大脑里加工出的结论变了。"
    },
        {
        id: "window-truncation-oil",
        title: "截取时间窗口",
        subtitle: "国际原油价格（1861-2025）",
        category: "叙事框架",
        difficulty: "高级",
        icon: "🛢️",
        chartType: "line",
        // 欺骗版数据：只有3个点，看起像一路暴涨
        misleadingData: [
            { label: "2020", value: 328.5 },
            { label: "2021", value: 531.8 },
            { label: "2022", value: 703.5 }
        ],
        // 正确版数据：拉长到25年，展现剧烈波动
        correctData: [
            { label: "2000", value: 336.2 },
            { label: "2001", value: 280.5 },
            { label: "2002", value: 282.7 },
            { label: "2003", value: 318.5 },
            { label: "2004", value: 411.7 },
            { label: "2005", value: 567.3 },
            { label: "2006", value: 656.7 },
            { label: "2007", value: 709.5 },
            { label: "2008", value: 918.0 },
            { label: "2009", value: 584.2 },
            { label: "2010", value: 740.8 },
            { label: "2011", value: 1005.2 },
            { label: "2012", value: 988.4 },
            { label: "2013", value: 947.9 },
            { label: "2014", value: 849.4 },
            { label: "2015", value: 449.2 },
            { label: "2016", value: 370.3 },
            { label: "2017", value: 449.3 },
            { label: "2018", value: 577.1 },
            { label: "2019", value: 510.4 },
            { label: "2020", value: 328.5 },
            { label: "2021", value: 531.8 },
            { label: "2022", value: 703.5 },
            { label: "2023", value: 551.1 },
            { label: "2024", value: 523.2 },
            { label: "2025", value: 434.6 }
        ],
        correctConfig: { yStart: 0, yEnd: 1100, xType: "time", lineColor: "#00ff9d" },
        // 误导版用 point 均匀分布，加剧直线的垂直感
        misleadingConfig: { yStart: 0, yEnd: 800, xType: "point", lineColor: "#ffb300" },
        explainText: "数据完全真实。如果只看 2020-2022 年，原油价格确实在暴涨；但只要拉长到 25 年的完整周期，你就会发现刚才那段暴涨只是漫长震荡中的一个小波峰，随后价格再次腰斩。挑选数据窗口，就是在挑选故事的结局。"
    },
    {
    id: "stacked-area-aggregation",
    title: "改变聚合口径",
    subtitle: "中国三次产业就业人员结构（万人）",
    category: "分类操纵",
    difficulty: "高级",
    icon: "📊",
    chartType: "stacked-area",

    // 欺骗版：服务业合并为一个大类
    misleadingData: [
        { year: "2019", 第一产业: 19445, 第二产业: 21304, 第三产业: 36791 },
        { year: "2020", 第一产业: 17715, 第二产业: 21543, 第三产业: 35806 },
        { year: "2021", 第一产业: 17072, 第二产业: 21746, 第三产业: 36561 },
        { year: "2022", 第一产业: 17663, 第二产业: 21382, 第三产业: 36719 },
        { year: "2023", 第一产业: 16882, 第二产业: 21516, 第三产业: 35639 }
    ],

    // 正确版：第三产业拆分为多个细分行业，总和与欺骗版完全一致
    correctData: [
        { year: "2019", 第一产业: 19445, 第二产业: 21304, 批发零售: 9000, 交通运输: 3400, 住宿餐饮: 2900, 金融: 650, 教育: 1900, 其他服务: 18941 },
        { year: "2020", 第一产业: 17715, 第二产业: 21543, 批发零售: 8500, 交通运输: 3300, 住宿餐饮: 2600, 金融: 680, 教育: 1950, 其他服务: 18776 },
        { year: "2021", 第一产业: 17072, 第二产业: 21746, 批发零售: 8800, 交通运输: 3350, 住宿餐饮: 2750, 金融: 720, 教育: 2000, 其他服务: 18941 },
        { year: "2022", 第一产业: 17663, 第二产业: 21382, 批发零售: 8900, 交通运输: 3300, 住宿餐饮: 2700, 金融: 750, 教育: 2050, 其他服务: 19019 },
        { year: "2023", 第一产业: 16882, 第二产业: 21516, 批发零售: 9000, 交通运输: 3400, 住宿餐饮: 2800, 金融: 800, 教育: 2100, 其他服务: 17539 }
    ],

    misleadingConfig: {
        keys: ["第一产业", "第二产业", "第三产业"],
        colors: ["#00ff9d", "#ffb300", "#ff007a"],
        yStart: 0,
        yEnd: 80000,
        xKey: "year"
    },

    correctConfig: {
        keys: ["第一产业", "第二产业", "批发零售", "交通运输", "住宿餐饮", "金融", "教育", "其他服务"],
        colors: ["#00ff9d", "#ffb300", "#00f0ff", "#9d00ff", "#ff007a", "#64748b", "#f472b6", "#a3e635"],
        yStart: 0,
        yEnd: 80000,
        xKey: "year"
    },

    explainText: "欺骗版把整个服务业合并成一个巨大的『第三产业』区块，视觉上显得服务业绝对主导。还原后，原本巨大的区块被拆分为批发零售、交通运输、住宿餐饮、金融、教育等多个细分行业——总面积没有变，但故事从『服务业一家独大』变成了『内部结构高度分散』。同一组数据，分类方式决定叙事。"
},
{
    id: "heatmap-energy-intensity",
    title: "色阶断点人为切割",
    subtitle: "中国各省能耗强度（2000–2022）",
    category: "视觉编码操纵",
    difficulty: "中级",
    icon: "🔥",
    chartType: "heatmap",
    metric: "energy_intensity",
    misleadingConfig: {
        colorMode: "threshold",
        thresholds: [1.0],
        colors: ["#00f0ff", "#ff007a"]
    },
    correctConfig: {
        colorMode: "sequential"
    },
    explainText: "欺骗版把连续变化的能耗强度强行在 1.0 处切成两段：低于 1.0 全部亮青，高于 1.0 全部亮红。原本是平滑梯度的省际差异，瞬间被渲染成『一半低碳、一半高耗』的撕裂图景。还原后使用连续色阶，所谓的鸿沟只是人为切出来的一刀——数据没有变，变的只是色阶的断点。"
}
];