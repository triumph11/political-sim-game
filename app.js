const { useState, useEffect } = React;

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) {
        console.error("ErrorBoundary caught:", error);
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="error">
                    <h2>Error: {this.state.error.message}</h2>
                    <p>Please check the console (F12) for details or reload the page.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const PoliticalSim = () => {
    console.log("PoliticalSim component initializing...");
    const [gameState, setGameState] = useState({
        cycle: 0,
        electionCycle: 4,
        player: {
            approval: 50.0,
            federal_reserve: 1000000,
            experience: 0
        },
        economy: {
            tax_rate: 20.0,
            tariff_rate: 5.0,
            gdp_growth: 2.0,
            unemployment: 5.0,
            avg_gpa: 3.0,
            life_expectancy: 75.0,
            inflation: 2.0,
            budget: {
                military: 100000,
                schools: 100000,
                humanitarian: 50000,
                healthcare: 75000
            }
        },
        world_conditions: {
            gas_prices: "normal",
            military_strength: "strong",
            global_trade: "stable"
        },
        stock_market: {
            index: 800.0,
            volatility: 0.1
        },
        conditions_history: [],
        events: [
            {
                name: "Russia-China War",
                description: "Russia and China have entered a major conflict, disrupting global trade.",
                options: [
                    { text: "Impose sanctions on both", approval: -5, gdp_growth: -0.5, global_trade: "unstable" },
                    { text: "Remain neutral", approval: 2, gdp_growth: -0.2 },
                    { text: "Mediate peace talks", approval: 5, gdp_growth: 0.1, experience: 5 }
                ]
            },
            {
                name: "Natural Disaster",
                description: "A hurricane hits a major economic region, requiring aid.",
                options: [
                    { text: "Send substantial aid", approval: 5, federal_reserve: -100000, humanitarian: 20000 },
                    { text: "Send minimal aid", approval: -3, federal_reserve: -20000 },
                    { text: "Ignore the crisis", approval: -10, gdp_growth: -0.3 }
                ]
            },
            {
                name: "Cyberattack",
                description: "A foreign cyberattack targets critical infrastructure.",
                options: [
                    { text: "Increase cybersecurity funding", approval: 3, federal_reserve: -50000, military: 10000 },
                    { text: "Retaliate with cyberattacks", approval: -2, global_trade: "unstable" },
                    { text: "Negotiate with attackers", approval: 1, experience: 3 }
                ]
            },
            {
                name: "Economic Recession",
                description: "A global recession threatens economic stability.",
                options: [
                    { text: "Implement stimulus package", approval: 3, federal_reserve: -150000, gdp_growth: 0.5, unemployment: -0.5 },
                    { text: "Cut public spending", approval: -5, federal_reserve: 50000, gdp_growth: -0.7, unemployment: 0.7 },
                    { text: "Raise interest rates", approval: -3, gdp_growth: -0.4, unemployment: 0.5 }
                ]
            },
            {
                name: "Political Scandal",
                description: "A scandal involving your administration leaks to the press.",
                options: [
                    { text: "Deny allegations", approval: -5, experience: 2 },
                    { text: "Issue a public apology", approval: -2, experience: 5 },
                    { text: "Launch an investigation", approval: 2, federal_reserve: -30000 }
                ]
            },
            {
                name: "Refugee Crisis",
                description: "A wave of refugees seeks asylum due to regional conflicts.",
                options: [
                    { text: "Accept refugees", approval: 5, federal_reserve: -80000, humanitarian: 30000 },
                    { text: "Restrict borders", approval: -5, global_trade: "unstable" },
                    { text: "Negotiate with neighbors", approval: 2, experience: 3 }
                ]
            },
            {
                name: "Trade Agreement",
                description: "A new trade agreement is proposed with major economies.",
                options: [
                    { text: "Sign the agreement", approval: 3, gdp_growth: 0.4, global_trade: "booming", unemployment: -0.3 },
                    { text: "Reject the agreement", approval: -3, gdp_growth: -0.3, unemployment: 0.3 },
                    { text: "Propose revisions", approval: 1, experience: 3 }
                ]
            },
            {
                name: "Energy Crisis",
                description: "A shortage of energy resources spikes gas prices.",
                options: [
                    { text: "Subsidize energy costs", approval: 5, federal_reserve: -100000, gas_prices: "normal" },
                    { text: "Promote renewable energy", approval: 3, federal_reserve: -50000, gdp_growth: 0.2 },
                    { text: "Do nothing", approval: -5, gas_prices: "high" }
                ]
            }
        ],
        military_actions: [
            {
                name: "Deploy Troops",
                cost: 50000,
                effects: { approval: 3, global_trade: "unstable", military_strength: "strong" }
            },
            {
                name: "Increase Defense Readiness",
                cost: 30000,
                effects: { approval: 2, military_strength: "strong", experience: 2 }
            },
            {
                name: "Cut Military Operations",
                cost: 0,
                effects: { approval: -2, military_strength: "weak", federal_reserve: 20000 }
            }
        ]
    });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [currentEvent, setCurrentEvent] = useState(null);
    const [showTutorial, setShowTutorial] = useState(true);
    const [chartData, setChartData] = useState({
        gdp: [],
        unemployment: [],
        stock: [],
        federal_reserve: []
    });

    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomChoices = (arr, weights) => {
        const sum = weights.reduce((a, b) => a + b, 0);
        const r = Math.random() * sum;
        let acc = 0;
        for (let i = 0; i < arr.length; i++) {
            acc += weights[i];
            if (r <= acc) return arr[i];
        }
        return arr[arr.length - 1];
    };

    const generateConditions = () => {
        const gas_price_weights = { high: 0.3, normal: 0.5, low: 0.2 };
        if (gameState.world_conditions.global_trade === "unstable" || gameState.economy.gdp_growth < 0) {
            gas_price_weights.high = 0.6;
            gas_price_weights.normal = 0.3;
            gas_price_weights.low = 0.1;
        } else if (gameState.world_conditions.global_trade === "booming" || gameState.economy.gdp_growth > 3) {
            gas_price_weights.high = 0.1;
            gas_price_weights.normal = 0.4;
            gas_price_weights.low = 0.5;
        }

        const newConditions = {
            gas_prices: randomChoices(["high", "normal", "low"], 
                [gas_price_weights.high, gas_price_weights.normal, gas_price_weights.low]),
            military_strength: randomChoice(["weak", "normal", "strong"]),
            global_trade: randomChoice(["unstable", "stable", "booming"])
        };
        setGameState(prev => ({
            ...prev,
            world_conditions: newConditions,
            conditions_history: [...prev.conditions_history, {
                ...newConditions,
                gdp_growth: prev.economy.gdp_growth,
                unemployment: prev.economy.unemployment
            }]
        }));
    };

    const generateEvent = () => {
        if (gameState.events.length > 0) {
            const event = randomChoice(gameState.events);
            setCurrentEvent(event);
        }
    };

    const handleEventChoice = (option) => {
        setGameState(prev => {
            const newState = { ...prev };
            if (option.approval) newState.player.approval += option.approval;
            if (option.federal_reserve) newState.player.federal_reserve += option.federal_reserve;
            if (option.gdp_growth) newState.economy.gdp_growth += option.gdp_growth;
            if (option.global_trade) newState.world_conditions.global_trade = option.global_trade;
            if (option.experience) newState.player.experience += option.experience;
            if (option.military) newState.economy.budget.military += option.military;
            if (option.humanitarian) newState.economy.budget.humanitarian += option.humanitarian;
            if (option.unemployment) newState.economy.unemployment += option.unemployment;
            if (option.gas_prices) newState.world_conditions.gas_prices = option.gas_prices;
            return newState;
        });
        setCurrentEvent(null);
    };

    const handleMilitaryAction = (action) => {
        setGameState(prev => {
            const newState = { ...prev };
            newState.player.federal_reserve -= action.cost;
            if (action.effects.approval) newState.player.approval += action.effects.approval;
            if (action.effects.global_trade) newState.world_conditions.global_trade = action.effects.global_trade;
            if (action.effects.military_strength) newState.world_conditions.military_strength = action.effects.military_strength;
            if (action.effects.experience) newState.player.experience += action.effects.experience;
            if (action.effects.federal_reserve) newState.player.federal_reserve += action.effects.federal_reserve;
            return newState;
        });
    };

    const updateEconomy = () => {
        setGameState(prev => {
            const newState = { ...prev };
            const gdp_factor = 1.0 + (newState.economy.gdp_growth / 100);
            const unemployment_factor = Math.max(0.5, 1.0 - (newState.economy.unemployment / 100));
            let tax_revenue = newState.economy.tax_rate * 10000 * gdp_factor * unemployment_factor;
            tax_revenue = Math.min(tax_revenue, 500000);

            const trade_factor = { stable: 1.0, booming: 1.2, unstable: 0.7 }[newState.world_conditions.global_trade];
            let tariff_revenue = newState.economy.tariff_rate * 5000 * trade_factor;
            tariff_revenue = Math.min(tariff_revenue, 250000);

            newState.player.federal_reserve += tax_revenue + tariff_revenue;

            const total_budget = Object.values(newState.economy.budget).reduce((a, b) => a + b, 0);
            newState.player.federal_reserve -= total_budget;

            if (newState.player.federal_reserve < 0) {
                const debt_penalty = Math.floor(Math.abs(newState.player.federal_reserve) / 100000) * 0.5;
                newState.player.approval -= debt_penalty;
                newState.economy.inflation += Math.floor(Math.abs(newState.player.federal_reserve) / 100000) * 0.1;
            }

            if (total_budget > 500000) {
                newState.economy.inflation += 0.2;
            }

            if (newState.economy.inflation > 5) {
                newState.player.approval -= 2;
                newState.economy.gdp_growth -= 0.3;
            }

            if (newState.economy.budget.military > 150000) {
                newState.world_conditions.military_strength = "strong";
                newState.player.approval += 2;
            } else if (newState.economy.budget.military < 50000) {
                newState.world_conditions.military_strength = "weak";
                newState.player.approval -= 2;
            }

            if (newState.economy.budget.schools > 300000) {
                newState.economy.avg_gpa += 0.05;
                newState.economy.unemployment -= 0.1;
                newState.player.approval += 1;
                newState.economy.gdp_growth += 0.05;
            } else if (newState.economy.budget.schools > 150000) {
                newState.economy.avg_gpa += 0.1;
                newState.economy.unemployment -= 0.2;
                newState.player.approval += 2;
                newState.economy.gdp_growth += 0.1;
            } else if (newState.economy.budget.schools < 50000) {
                newState.economy.avg_gpa -= 0.1;
                newState.economy.unemployment += 0.2;
                newState.player.approval -= 2;
                newState.economy.gdp_growth -= 0.1;
            }

            if (newState.economy.budget.humanitarian > 200000) {
                newState.player.approval += 2;
                newState.economy.gdp_growth += 0.05;
            } else if (newState.economy.budget.humanitarian > 100000) {
                newState.player.approval += 3;
                newState.economy.gdp_growth += 0.1;
            } else if (newState.economy.budget.humanitarian < 25000) {
                newState.player.approval -= 3;
                newState.economy.gdp_growth -= 0.1;
            }

            if (newState.economy.budget.healthcare > 300000) {
                newState.economy.life_expectancy += 0.25;
                newState.player.approval += 1;
                newState.economy.gdp_growth += 0.05;
            } else if (newState.economy.budget.healthcare > 150000) {
                newState.economy.life_expectancy += 0.5;
                newState.economy.unemployment -= 0.2;
                newState.player.approval += 2;
                newState.economy.gdp_growth += 0.1;
            } else if (newState.economy.budget.healthcare < 50000) {
                newState.economy.life_expectancy -= 0.5;
                newState.economy.unemployment += 0.2;
                newState.player.approval -= 2;
                newState.economy.gdp_growth -= 0.1;
            }

            if (newState.economy.avg_gpa > 3.5) {
                newState.player.approval += 2;
            } else if (newState.economy.avg_gpa < 2.5) {
                newState.player.approval -= 2;
            }

            if (newState.economy.life_expectancy > 80) {
                newState.player.approval += 2;
            } else if (newState.economy.life_expectancy < 70) {
                newState.player.approval -= 2;
            }

            if (newState.economy.tax_rate > 30) {
                newState.economy.gdp_growth -= 0.7;
                newState.player.approval -= 2;
                newState.economy.unemployment += 0.3;
            } else if (newState.economy.tax_rate < 10) {
                newState.economy.gdp_growth += 0.7;
                newState.player.approval += 3;
                newState.economy.unemployment -= 0.2;
            }

            if (newState.economy.tariff_rate > 15) {
                newState.economy.unemployment += newState.world_conditions.global_trade === "unstable" ? 0.4 : 0.2;
                newState.economy.gdp_growth -= newState.world_conditions.global_trade === "unstable" ? 0.7 : 0.3;
            } else if (newState.economy.tariff_rate < 5) {
                newState.economy.unemployment -= 0.2;
                newState.economy.gdp_growth += newState.world_conditions.global_trade === "booming" ? 0.4 : 0.2;
            }

            if (newState.world_conditions.gas_prices === "high") {
                newState.economy.gdp_growth -= 0.5;
                newState.player.approval -= 5;
                newState.economy.unemployment += 0.3;
            } else if (newState.world_conditions.gas_prices === "low") {
                newState.economy.gdp_growth += 0.3;
                newState.player.approval += 3;
                newState.economy.unemployment -= 0.2;
            }

            if (newState.economy.unemployment > 10) {
                newState.economy.gdp_growth -= 0.3;
            }
            if (newState.economy.gdp_growth < 0) {
                newState.economy.unemployment += 0.3;
            } else if (newState.economy.gdp_growth > 1) {
                newState.economy.unemployment -= 0.2;
            }
            if (newState.player.approval > 75) {
                newState.economy.gdp_growth += 0.2;
                newState.stock_market.index *= 1.005;
            }

            if (newState.conditions_history.length > 1) {
                const prev_unemployment = newState.conditions_history[newState.conditions_history.length - 2].unemployment || newState.economy.unemployment;
                newState.economy.unemployment = (newState.economy.unemployment * 0.7) + (prev_unemployment * 0.3);
                const prev_gdp = newState.conditions_history[newState.conditions_history.length - 2].gdp_growth || newState.economy.gdp_growth;
                newState.economy.gdp_growth = (newState.economy.gdp_growth * 0.5) + (prev_gdp * 0.5);
            }

            newState.economy.gdp_growth = Math.max(-5.0, Math.min(5.0, newState.economy.gdp_growth));
            newState.economy.unemployment = Math.max(0.0, Math.min(20.0, newState.economy.unemployment));
            newState.economy.avg_gpa = Math.max(0.0, Math.min(4.0, newState.economy.avg_gpa));
            newState.economy.life_expectancy = Math.max(50.0, Math.min(100.0, newState.economy.life_expectancy));
            newState.economy.inflation = Math.max(0.0, newState.economy.inflation);
            newState.player.approval = Math.max(0.0, Math.min(100.0, newState.player.approval));

            return newState;
        });
    };

    const updateStockMarket = () => {
        setGameState(prev => {
            const newState = { ...prev };
            let growth_factor = newState.economy.gdp_growth / 100;
            const volatility = newState.stock_market.volatility;
            const random_change = Math.random() * 2 * volatility - volatility;

            if (newState.economy.tariff_rate > 15 || newState.world_conditions.global_trade === "unstable") {
                growth_factor -= 0.05;
            } else if (newState.world_conditions.global_trade === "booming") {
                growth_factor += 0.03;
            }

            newState.stock_market.index *= (1 + growth_factor + random_change);
            newState.stock_market.index = Math.max(100.0, newState.stock_market.index);

            if (newState.stock_market.index < 800) {
                const points_below = Math.floor((800 - newState.stock_market.index) / 100);
                newState.player.federal_reserve -= points_below * 50000;
            } else if (newState.stock_market.index > 800) {
                const points_above = Math.floor((newState.stock_market.index - 800) / 100);
                newState.player.federal_reserve += points_above * 50000;
            }

            return newState;
        });
    };

    const runCycle = () => {
        console.log("Running cycle", gameState.cycle + 1);
        setGameState(prev => ({ ...prev, cycle: prev.cycle + 1 }));
        generateConditions();
        generateEvent();
        updateEconomy();
        updateStockMarket();
        setGameState(prev => ({ ...prev, player: { ...prev.player, experience: prev.player.experience + 1 } }));
        updateCharts();
    };

    const updateCharts = () => {
        setChartData(prev => ({
            gdp: [...prev.gdp, gameState.economy.gdp_growth].slice(-10),
            unemployment: [...prev.unemployment, gameState.economy.unemployment].slice(-10),
            stock: [...prev.stock, gameState.stock_market.index].slice(-10),
            federal_reserve: [...prev.federal_reserve, gameState.player.federal_reserve].slice(-10)
        }));
    };

    useEffect(() => {
        console.log("Chart data updated:", chartData);
        if (gameState.cycle > 0) {
            const charts = [
                { id: 'gdpChart', label: 'GDP Growth (%)', data: chartData.gdp, min: -5, max: 5 },
                { id: 'unemploymentChart', label: 'Unemployment (%)', data: chartData.unemployment, min: 0, max: 20 },
                { id: 'stockChart', label: 'Stock Market Index', data: chartData.stock, min: 100, max: 1500 },
                { id: 'federalReserveChart', label: 'Federal Reserve ($)', data: chartData.federal_reserve, min: -5000000, max: 5000000 }
            ];
            charts.forEach(chart => {
                const ctx = document.getElementById(chart.id)?.getContext('2d');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: Array(chartData.gdp.length).fill().map((_, i) => `Cycle ${gameState.cycle - chartData.gdp.length + i + 1}`),
                            datasets: [{
                                label: chart.label,
                                data: chart.data,
                                borderColor: '#8B0000',
                                backgroundColor: 'rgba(139, 0, 0, 0.2)',
                                fill: true
                            }]
                        },
                        options: { scales: { y: { min: chart.min, max: chart.max } } }
                    });
                } else {
                    console.warn(`Canvas not found for ${chart.id}`);
                }
            });
        }
    }, [chartData]);

    return (
        <ErrorBoundary>
            <div className="container">
                <div className="status-bar">
                    <span className="tooltip">
                        Approval: {gameState.player.approval.toFixed(1)}%
                        <span className="tooltiptext">High approval boosts GDP and stock market. Win elections with >50%.</span>
                    </span> | 
                    <span className="tooltip">
                        Federal Reserve: ${gameState.player.federal_reserve.toLocaleString()}{gameState.player.federal_reserve < 0 ? " (Debt)" : ""}
                        <span className="tooltiptext">Debt reduces approval. Spend wisely or raise taxes/tariffs.</span>
                    </span> | 
                    <span className="tooltip">
                        GDP Growth: {gameState.economy.gdp_growth.toFixed(1)}%
                        <span className="tooltiptext">Raise GDP with low taxes, high budgets, and stable trade.</span>
                    </span> | 
                    <span className="tooltip">
                        Unemployment: {gameState.economy.unemployment.toFixed(1)}%
                        <span className="tooltiptext">Lower unemployment with high schools/healthcare budgets and low taxes.</span>
                    </span> | 
                    <span className="tooltip">
                        Stock Market: {gameState.stock_market.index.toFixed(1)}
                        <span className="tooltiptext">Raise stock market with low tariffs and booming trade.</span>
                    </span>
                </div>
                <div className="tabs">
                    <div className={`tab ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>Dashboard</div>
                    <div className={`tab ${activeTab === "budget" ? "active" : ""}`} onClick={() => setActiveTab("budget")}>Budget</div>
                    <div className={`tab ${activeTab === "policy" ? "active" : ""}`} onClick={() => setActiveTab("policy")}>Policy</div>
                    <div className={`tab ${activeTab === "military" ? "active" : ""}`} onClick={() => setActiveTab("military")}>Military</div>
                    <div className={`tab ${activeTab === "charts" ? "active" : ""}`} onClick={() => setActiveTab("charts")}>Charts</div>
                    <div className={`tab ${activeTab === "manual" ? "active" : ""}`} onClick={() => setActiveTab("manual")}>Manual</div>
                </div>
                <div className="panel">
                    {activeTab === "dashboard" && (
                        <div>
                            <h2>Cycle {gameState.cycle}</h2>
                            <p>Tax Rate: {gameState.economy.tax_rate}%</p>
                            <p>Tariff Rate: {gameState.economy.tariff_rate}%</p>
                            <p>Average GPA: {gameState.economy.avg_gpa.toFixed(1)}</p>
                            <p>Life Expectancy: {gameState.economy.life_expectancy.toFixed(1)} years</ برتر

System: I'm sorry, it looks like the `app.js` artifact was cut off in the response. I'll provide the complete `app.js` file to ensure you have all the necessary code to resolve the blue screen issue and get the Political Simulator running on GitHub Pages. I'll also include detailed instructions for uploading to GitHub and debugging the blue screen, maintaining the same `artifact_id` as this is a continuation of the web-based game project. The `index.html` and `styles.css` from the previous response are correct and unchanged, so I'll only provide the corrected `app.js` artifact and additional guidance.

### Addressing the Blue Screen Issue
The blue screen (likely `#4682B4` from the `body` CSS) indicates that the React app isn’t rendering, leaving only the `body` background. Common causes include:
- **JavaScript Error**: A syntax error or failed CDN load (React, Babel, Chart.js) prevents the app from initializing.
- **GitHub Pages Misconfiguration**: The `index.html` file isn’t being served correctly due to incorrect branch, folder, or file placement.
- **JSX Transpilation**: Babel isn’t processing the `text/babel` script, causing a syntax error.
- **File Structure**: If only `index.html` was uploaded without `styles.css` or `app.js`, the app won’t render properly.

Since you expected separate JavaScript and CSS files, the new structure (`index.html`, `styles.css`, `app.js`) should help. The blue screen suggests the previous single-file `index.html` either didn’t load its embedded scripts or wasn’t served correctly on GitHub Pages.

### Complete app.js
Here’s the complete `app.js` file, with error logging, all 8 events, and simplified chart initialization to prevent errors:

<xaiArtifact artifact_id="6fa60d22-d1ce-4864-b5f2-ce9bc761ad0f" artifact_version_id="72f7ae04-1983-4436-aefd-991da0b9b2d9" title="app.js" contentType="text/javascript">
const { useState, useEffect } = React;

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) {
        console.error("ErrorBoundary caught:", error);
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="error">
                    <h2>Error: {this.state.error.message}</h2>
                    <p>Please check the console (F12) for details or reload the page.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const PoliticalSim = () => {
    console.log("PoliticalSim component initializing...");
    const [gameState, setGameState] = useState({
        cycle: 0,
        electionCycle: 4,
        player: {
            approval: 50.0,
            federal_reserve: 1000000,
            experience: 0
        },
        economy: {
            tax_rate: 20.0,
            tariff_rate: 5.0,
            gdp_growth: 2.0,
            unemployment: 5.0,
            avg_gpa: 3.0,
            life_expectancy: 75.0,
            inflation: 2.0,
            budget: {
                military: 100000,
                schools: 100000,
                humanitarian: 50000,
                healthcare: 75000
            }
        },
        world_conditions: {
            gas_prices: "normal",
            military_strength: "strong",
            global_trade: "stable"
        },
        stock_market: {
            index: 800.0,
            volatility: 0.1
        },
        conditions_history: [],
        events: [
            {
                name: "Russia-China War",
                description: "Russia and China have entered a major conflict, disrupting global trade.",
                options: [
                    { text: "Impose sanctions on both", approval: -5, gdp_growth: -0.5, global_trade: "unstable" },
                    { text: "Remain neutral", approval: 2, gdp_growth: -0.2 },
                    { text: "Mediate peace talks", approval: 5, gdp_growth: 0.1, experience: 5 }
                ]
            },
            {
                name: "Natural Disaster",
                description: "A hurricane hits a major economic region, requiring aid.",
                options: [
                    { text: "Send substantial aid", approval: 5, federal_reserve: -100000, humanitarian: 20000 },
                    { text: "Send minimal aid", approval: -3, federal_reserve: -20000 },
                    { text: "Ignore the crisis", approval: -10, gdp_growth: -0.3 }
                ]
            },
            {
                name: "Cyberattack",
                description: "A foreign cyberattack targets critical infrastructure.",
                options: [
                    { text: "Increase cybersecurity funding", approval: 3, federal_reserve: -50000, military: 10000 },
                    { text: "Retaliate with cyberattacks", approval: -2, global_trade: "unstable" },
                    { text: "Negotiate with attackers", approval: 1, experience: 3 }
                ]
            },
            {
                name: "Economic Recession",
                description: "A global recession threatens economic stability.",
                options: [
                    { text: "Implement stimulus package", approval: 3, federal_reserve: -150000, gdp_growth: 0.5, unemployment: -0.5 },
                    { text: "Cut public spending", approval: -5, federal_reserve: 50000, gdp_growth: -0.7, unemployment: 0.7 },
                    { text: "Raise interest rates", approval: -3, gdp_growth: -0.4, unemployment: 0.5 }
                ]
            },
            {
                name: "Political Scandal",
                description: "A scandal involving your administration leaks to the press.",
                options: [
                    { text: "Deny allegations", approval: -5, experience: 2 },
                    { text: "Issue a public apology", approval: -2, experience: 5 },
                    { text: "Launch an investigation", approval: 2, federal_reserve: -30000 }
                ]
            },
            {
                name: "Refugee Crisis",
                description: "A wave of refugees seeks asylum due to regional conflicts.",
                options: [
                    { text: "Accept refugees", approval: 5, federal_reserve: -80000, humanitarian: 30000 },
                    { text: "Restrict borders", approval: -5, global_trade: "unstable" },
                    { text: "Negotiate with neighbors", approval: 2, experience: 3 }
                ]
            },
            {
                name: "Trade Agreement",
                description: "A new trade agreement is proposed with major economies.",
                options: [
                    { text: "Sign the agreement", approval: 3, gdp_growth: 0.4, global_trade: "booming", unemployment: -0.3 },
                    { text: "Reject the agreement", approval: -3, gdp_growth: -0.3, unemployment: 0.3 },
                    { text: "Propose revisions", approval: 1, experience: 3 }
                ]
            },
            {
                name: "Energy Crisis",
                description: "A shortage of energy resources spikes gas prices.",
                options: [
                    { text: "Subsidize energy costs", approval: 5, federal_reserve: -100000, gas_prices: "normal" },
                    { text: "Promote renewable energy", approval: 3, federal_reserve: -50000, gdp_growth: 0.2 },
                    { text: "Do nothing", approval: -5, gas_prices: "high" }
                ]
            }
        ],
        military_actions: [
            {
                name: "Deploy Troops",
                cost: 50000,
                effects: { approval: 3, global_trade: "unstable", military_strength: "strong" }
            },
            {
                name: "Increase Defense Readiness",
                cost: 30000,
                effects: { approval: 2, military_strength: "strong", experience: 2 }
            },
            {
                name: "Cut Military Operations",
                cost: 0,
                effects: { approval: -2, military_strength: "weak", federal_reserve: 20000 }
            }
        ]
    });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [currentEvent, setCurrentEvent] = useState(null);
    const [showTutorial, setShowTutorial] = useState(true);
    const [chartData, setChartData] = useState({
        gdp: [],
        unemployment: [],
        stock: [],
        federal_reserve: []
    });

    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomChoices = (arr, weights) => {
        const sum = weights.reduce((a, b) => a + b, 0);
        const r = Math.random() * sum;
        let acc = 0;
        for (let i = 0; i < arr.length; i++) {
            acc += weights[i];
            if (r <= acc) return arr[i];
        }
        return arr[arr.length - 1];
    };

    const generateConditions = () => {
        const gas_price_weights = { high: 0.3, normal: 0.5, low: 0.2 };
        if (gameState.world_conditions.global_trade === "unstable" || gameState.economy.gdp_growth < 0) {
            gas_price_weights.high = 0.6;
            gas_price_weights.normal = 0.3;
            gas_price_weights.low = 0.1;
        } else if (gameState.world_conditions.global_trade === "booming" || gameState.economy.gdp_growth > 3) {
            gas_price_weights.high = 0.1;
            gas_price_weights.normal = 0.4;
            gas_price_weights.low = 0.5;
        }

        const newConditions = {
            gas_prices: randomChoices(["high", "normal", "low"], 
                [gas_price_weights.high, gas_price_weights.normal, gas_price_weights.low]),
            military_strength: randomChoice(["weak", "normal", "strong"]),
            global_trade: randomChoice(["unstable", "stable", "booming"])
        };
        setGameState(prev => ({
            ...prev,
            world_conditions: newConditions,
            conditions_history: [...prev.conditions_history, {
                ...newConditions,
                gdp_growth: prev.economy.gdp_growth,
                unemployment: prev.economy.unemployment
            }]
        }));
    };

    const generateEvent = () => {
        if (gameState.events.length > 0) {
            const event = randomChoice(gameState.events);
            setCurrentEvent(event);
        }
    };

    const handleEventChoice = (option) => {
        setGameState(prev => {
            const newState = { ...prev };
            if (option.approval) newState.player.approval += option.approval;
            if (option.federal_reserve) newState.player.federal_reserve += option.federal_reserve;
            if (option.gdp_growth) newState.economy.gdp_growth += option.gdp_growth;
            if (option.global_trade) newState.world_conditions.global_trade = option.global_trade;
            if (option.experience) newState.player.experience += option.experience;
            if (option.military) newState.economy.budget.military += option.military;
            if (option.humanitarian) newState.economy.budget.humanitarian += option.humanitarian;
            if (option.unemployment) newState.economy.unemployment += option.unemployment;
            if (option.gas_prices) newState.world_conditions.gas_prices = option.gas_prices;
            return newState;
        });
        setCurrentEvent(null);
    };

    const handleMilitaryAction = (action) => {
        setGameState(prev => {
            const newState = { ...prev };
            newState.player.federal_reserve -= action.cost;
            if (action.effects.approval) newState.player.approval += action.effects.approval;
            if (action.effects.global_trade) newState.world_conditions.global_trade = action.effects.global_trade;
            if (action.effects.military_strength) newState.world_conditions.military_strength = action.effects.military_strength;
            if (action.effects.experience) newState.player.experience += action.effects.experience;
            if (action.effects.federal_reserve) newState.player.federal_reserve += action.effects.federal_reserve;
            return newState;
        });
    };

    const updateEconomy = () => {
        setGameState(prev => {
            const newState = { ...prev };
            const gdp_factor = 1.0 + (newState.economy.gdp_growth / 100);
            const unemployment_factor = Math.max(0.5, 1.0 - (newState.economy.unemployment / 100));
            let tax_revenue = newState.economy.tax_rate * 10000 * gdp_factor * unemployment_factor;
            tax_revenue = Math.min(tax_revenue, 500000);

            const trade_factor = { stable: 1.0, booming: 1.2, unstable: 0.7 }[newState.world_conditions.global_trade];
            let tariff_revenue = newState.economy.tariff_rate * 5000 * trade_factor;
            tariff_revenue = Math.min(tariff_revenue, 250000);

            newState.player.federal_reserve += tax_revenue + tariff_revenue;

            const total_budget = Object.values(newState.economy.budget).reduce((a, b) => a + b, 0);
            newState.player.federal_reserve -= total_budget;

            if (newState.player.federal_reserve < 0) {
                const debt_penalty = Math.floor(Math.abs(newState.player.federal_reserve) / 100000) * 0.5;
                newState.player.approval -= debt_penalty;
                newState.economy.inflation += Math.floor(Math.abs(newState.player.federal_reserve) / 100000) * 0.1;
            }

            if (total_budget > 500000) {
                newState.economy.inflation += 0.2;
            }

            if (newState.economy.inflation > 5) {
                newState.player.approval -= 2;
                newState.economy.gdp_growth -= 0.3;
            }

            if (newState.economy.budget.military > 150000) {
                newState.world_conditions.military_strength = "strong";
                newState.player.approval += 2;
            } else if (newState.economy.budget.military < 50000) {
                newState.world_conditions.military_strength = "weak";
                newState.player.approval -= 2;
            }

            if (newState.economy.budget.schools > 300000) {
                newState.economy.avg_gpa += 0.05;
                newState.economy.unemployment -= 0.1;
                newState.player.approval += 1;
                newState.economy.gdp_growth += 0.05;
            } else if (newState.economy.budget.schools > 150000) {
                newState.economy.avg_gpa += 0.1;
                newState.economy.unemployment -= 0.2;
                newState.player.approval += 2;
                newState.economy.gdp_growth += 0.1;
            } else if (newState.economy.budget.schools < 50000) {
                newState.economy.avg_gpa -= 0.1;
                newState.economy.unemployment += 0.2;
                newState.player.approval -= 2;
                newState.economy.gdp_growth -= 0.1;
            }

            if (newState.economy.budget.humanitarian > 200000) {
                newState.player.approval += 2;
                newState.economy.gdp_growth += 0.05;
            } else if (newState.economy.budget.humanitarian > 100000) {
                newState.player.approval += 3;
                newState.economy.gdp_growth += 0.1;
            } else if (newState.economy.budget.humanitarian < 25000) {
                newState.player.approval -= 3;
                newState.economy.gdp_growth -= 0.1;
            }

            if (newState.economy.budget.healthcare > 300000) {
                newState.economy.life_expectancy += 0.25;
                newState.player.approval += 1;
                newState.economy.gdp_growth += 0.05;
            } else if (newState.economy.budget.healthcare > 150000) {
                newState.economy.life_expectancy += 0.5;
                newState.economy.unemployment -= 0.2;
                newState.player.approval += 2;
                newState.economy.gdp_growth += 0.1;
            } else if (newState.economy.budget.healthcare < 50000) {
                newState.economy.life_expectancy -= 0.5;
                newState.economy.unemployment += 0.2;
                newState.player.approval -= 2;
                newState.economy.gdp_growth -= 0.1;
            }

            if (newState.economy.avg_gpa > 3.5) {
                newState.player.approval += 2;
            } else if (newState.economy.avg_gpa < 2.5) {
                newState.player.approval -= 2;
            }

            if (newState.economy.life_expectancy > 80) {
                newState.player.approval += 2;
            } else if (newState.economy.life_expectancy < 70) {
                newState.player.approval -= 2;
            }

            if (newState.economy.tax_rate > 30) {
                newState.economy.gdp_growth -= 0.7;
                newState.player.approval -= 2;
                newState.economy.unemployment += 0.3;
            } else if (newState.economy.tax_rate < 10) {
                newState.economy.gdp_growth += 0.7;
                newState.player.approval += 3;
                newState.economy.unemployment -= 0.2;
            }

            if (newState.economy.tariff_rate > 15) {
                newState.economy.unemployment += newState.world_conditions.global_trade === "unstable" ? 0.4 : 0.2;
                newState.economy.gdp_growth -= newState.world_conditions.global_trade === "unstable" ? 0.7 : 0.3;
            } else if (newState.economy.tariff_rate < 5) {
                newState.economy.unemployment -= 0.2;
                newState.economy.gdp_growth += newState.world_conditions.global_trade === "booming" ? 0.4 : 0.2;
            }

            if (newState.world_conditions.gas_prices === "high") {
                newState.economy.gdp_growth -= 0.5;
                newState.player.approval -= 5;
                newState.economy.unemployment += 0.3;
            } else if (newState.world_conditions.gas_prices === "low") {
                newState.economy.gdp_growth += 0.3;
                newState.player.approval += 3;
                newState.economy.unemployment -= 0.2;
            }

            if (newState.economy.unemployment > 10) {
                newState.economy.gdp_growth -= 0.3;
            }
            if (newState.economy.gdp_growth < 0) {
                newState.economy.unemployment += 0.3;
            } else if (newState.economy.gdp_growth > 1) {
                newState.economy.unemployment -= 0.2;
            }
            if (newState.player.approval > 75) {
                newState.economy.gdp_growth += 0.2;
                newState.stock_market.index *= 1.005;
            }

            if (newState.conditions_history.length > 1) {
                const prev_unemployment = newState.conditions_history[newState.conditions_history.length - 2].unemployment || newState.economy.unemployment;
                newState.economy.unemployment = (newState.economy.unemployment * 0.7) + (prev_unemployment * 0.3);
                const prev_gdp = newState.conditions_history[newState.conditions_history.length - 2].gdp_growth || newState.economy.gdp_growth;
                newState.economy.gdp_growth = (newState.economy.gdp_growth * 0.5) + (prev_gdp * 0.5);
            }

            newState.economy.gdp_growth = Math.max(-5.0, Math.min(5.0, newState.economy.gdp_growth));
            newState.economy.unemployment = Math.max(0.0, Math.min(20.0, newState.economy.unemployment));
            newState.economy.avg_gpa = Math.max(0.0, Math.min(4.0, newState.economy.avg_gpa));
            newState.economy.life_expectancy = Math.max(50.0, Math.min(100.0, newState.economy.life_expectancy));
            newState.economy.inflation = Math.max(0.0, newState.economy.inflation);
            newState.player.approval = Math.max(0.0, Math.min(100.0, newState.player.approval));

            return newState;
        });
    };

    const updateStockMarket = () => {
        setGameState(prev => {
            const newState = { ...prev };
            let growth_factor = newState.economy.gdp_growth / 100;
            const volatility = newState.stock_market.volatility;
            const random_change = Math.random() * 2 * volatility - volatility;

            if (newState.economy.tariff_rate > 15 || newState.world_conditions.global_trade === "unstable") {
                growth_factor -= 0.05;
            } else if (newState.world_conditions.global_trade === "booming") {
                growth_factor += 0.03;
            }

            newState.stock_market.index *= (1 + growth_factor + random_change);
            newState.stock_market.index = Math.max(100.0, newState.stock_market.index);

            if (newState.stock_market.index < 800) {
                const points_below = Math.floor((800 - newState.stock_market.index) / 100);
                newState.player.federal_reserve -= points_below * 50000;
            } else if (newState.stock_market.index > 800) {
                const points_above = Math.floor((newState.stock_market.index - 800) / 100);
                newState.player.federal_reserve += points_above * 50000;
            }

            return newState;
        });
    };

    const runCycle = () => {
        console.log("Running cycle", gameState.cycle + 1);
        setGameState(prev => ({ ...prev, cycle: prev.cycle + 1 }));
        generateConditions();
        generateEvent();
        updateEconomy();
        updateStockMarket();
        setGameState(prev => ({ ...prev, player: { ...prev.player, experience: prev.player.experience + 1 } }));
        updateCharts();
    };

    const updateCharts = () => {
        setChartData(prev => ({
            gdp: [...prev.gdp, gameState.economy.gdp_growth].slice(-10),
            unemployment: [...prev.unemployment, gameState.economy.unemployment].slice(-10),
            stock: [...prev.stock, gameState.stock_market.index].slice(-10),
            federal_reserve: [...prev.federal_reserve, gameState.player.federal_reserve].slice(-10)
        }));
    };

    useEffect(() => {
        console.log("Chart data updated:", chartData);
        if (gameState.cycle > 0) {
            const charts = [
                { id: 'gdpChart', label: 'GDP Growth (%)', data: chartData.gdp, min: -5, max: 5 },
                { id: 'unemploymentChart', label: 'Unemployment (%)', data: chartData.unemployment, min: 0, max: 20 },
                { id: 'stockChart', label: 'Stock Market Index', data: chartData.stock, min: 100, max: 1500 },
                { id: 'federalReserveChart', label: 'Federal Reserve ($)', data: chartData.federal_reserve, min: -5000000, max: 5000000 }
            ];
            charts.forEach(chart => {
                const ctx = document.getElementById(chart.id)?.getContext('2d');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: Array(chartData.gdp.length).fill().map((_, i) => `Cycle ${gameState.cycle - chartData.gdp.length + i + 1}`),
                            datasets: [{
                                label: chart.label,
                                data: chart.data,
                                borderColor: '#8B0000',
                                backgroundColor: 'rgba(139, 0, 0, 0.2)',
                                fill: true
                            }]
                        },
                        options: { scales: { y: { min: chart.min, max: chart.max } } }
                    });
                } else {
                    console.warn(`Canvas not found for ${chart.id}`);
                }
            });
        }
    }, [chartData]);

    return (
        <ErrorBoundary>
            <div className="container">
                <div className="status-bar">
                    <span className="tooltip">
                        Approval: {gameState.player.approval.toFixed(1)}%
                        <span className="tooltiptext">High approval boosts GDP and stock market. Win elections with >50%.</span>
                    </span> | 
                    <span className="tooltip">
                        Federal Reserve: ${gameState.player.federal_reserve.toLocaleString()}{gameState.player.federal_reserve < 0 ? " (Debt)" : ""}
                        <span className="tooltiptext">Debt reduces approval. Spend wisely or raise taxes/tariffs.</span>
                    </span> | 
                    <span className="tooltip">
                        GDP Growth: {gameState.economy.gdp_growth.toFixed(1)}%
                        <span className="tooltiptext">Raise GDP with low taxes, high budgets, and stable trade.</span>
                    </span> | 
                    <span className="tooltip">
                        Unemployment: {gameState.economy.unemployment.toFixed(1)}%
                        <span className="tooltiptext">Lower unemployment with high schools/healthcare budgets and low taxes.</span>
                    </span> | 
                    <span className="tooltip">
                        Stock Market: {gameState.stock_market.index.toFixed(1)}
                        <span className="tooltiptext">Raise stock market with low tariffs and booming trade.</span>
                    </span>
                </div>
                <div className="tabs">
                    <div className={`tab ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>Dashboard</div>
                    <div className={`tab ${activeTab === "budget" ? "active" : ""}`} onClick={() => setActiveTab("budget")}>Budget</div>
                    <div className={`tab ${activeTab === "policy" ? "active" : ""}`} onClick={() => setActiveTab("policy")}>Policy</div>
                    <div className={`tab ${activeTab === "military" ? "active" : ""}`} onClick={() => setActiveTab("military")}>Military</div>
                    <div className={`tab ${activeTab === "charts" ? "active" : ""}`} onClick={() => setActiveTab("charts")}>Charts</div>
                    <div className={`tab ${activeTab === "manual" ? "active" : ""}`} onClick={() => setActiveTab("manual")}>Manual</div>
                </div>
                <div className="panel">
                    {activeTab === "dashboard" && (
                        <div>
                            <h2>Cycle {gameState.cycle}</h2>
                            <p>Tax Rate: {gameState.economy.tax_rate}%</p>
                            <p>Tariff Rate: {gameState.economy.tariff_rate}%</p>
                            <p>Average GPA: {gameState.economy.avg_gpa.toFixed(1)}</p>
                            <p>Life Expectancy: {gameState.economy.life_expectancy.toFixed(1)} years</p>
                            <p>Inflation: {gameState.economy.inflation.toFixed(1)}%</p>
                            <p>World Conditions:</p>
                            <ul>
                                <li>Gas Prices: {gameState.world_conditions.gas_prices}</li>
                                <li>Military Strength: {gameState.world_conditions.military_strength}</li>
                                <li>Global Trade: {gameState.world_conditions.global_trade}</li>
                            </ul>
                            <button className="button" onClick={runCycle}>Next Cycle</button>
                        </div>
                    )}
                    {activeTab === "budget" && (
                        <div>
                            <h2>Budget Allocation</h2>
                            <div className="slider-container">
                                <label className="slider-label">Military Budget: ${gameState.economy.budget.military.toLocaleString()}</label>
                                <input type="range" min="0" max="2000000" value={gameState.economy.budget.military} 
                                    onChange={(e) => setGameState(prev => ({ ...prev, economy: { ...prev.economy, budget: { ...prev.economy.budget, military: parseInt(e.target.value) } } }))} />
                            </div>
                            <div className="slider-container">
                                <label className="slider-label">Schools Budget: ${gameState.economy.budget.schools.toLocaleString()}</label>
                                <input type="range" min="0" max="2000000" value={gameState.economy.budget.schools} 
                                    onChange={(e) => setGameState(prev => ({ ...prev, economy: { ...prev.economy, budget: { ...prev.economy.budget, schools: parseInt(e.target.value) } } }))} />
                            </div>
                            <div className="slider-container">
                                <label className="slider-label">Humanitarian Budget: ${gameState.economy.budget.humanitarian.toLocaleString()}</label>
                                <input type="range" min="0" max="2000000" value={gameState.economy.budget.humanitarian} 
                                    onChange={(e) => setGameState(prev => ({ ...prev, economy: { ...prev.economy, budget: { ...prev.economy.budget, humanitarian: parseInt(e.target.value) } } }))} />
                            </div>
                            <div className="slider-container">
                                <label className="slider-label">Healthcare Budget: ${gameState.economy.budget.healthcare.toLocaleString()}</label>
                                <input type="range" min="0" max="2000000" value={gameState.economy.budget.healthcare} 
                                    onChange={(e) => setGameState(prev => ({ ...prev, economy: { ...prev.economy, budget: { ...prev.economy.budget, healthcare: parseInt(e.target.value) } } }))} />
                            </div>
                        </div>
                    )}
                    {activeTab === "policy" && (
                        <div>
                            <h2>Policy Settings</h2>
                            <div className="slider-container">
                                <label className="slider-label">Tax Rate: {gameState.economy.tax_rate}%</label>
                                <input type="range" min="0" max="100" step="0.1" value={gameState.economy.tax_rate} 
                                    onChange={(e) => setGameState(prev => ({ ...prev, economy: { ...prev.economy, tax_rate: parseFloat(e.target.value) } }))} />
                            </div>
                            <div className="slider-container">
                                <label className="slider-label">Tariff Rate: {gameState.economy.tariff_rate}%</label>
                                <input type="range" min="0" max="50" step="0.1" value={gameState.economy.tariff_rate} 
                                    onChange={(e) => setGameState(prev => ({ ...prev, economy: { ...prev.economy, tariff_rate: parseFloat(e.target.value) } }))} />
                            </div>
                        </div>
                    )}
                    {activeTab === "military" && (
                        <div>
                            <h2>Military Actions</h2>
                            {gameState.economy.budget.military < 50000 ? (
                                <p>Insufficient military budget (<$50,000) to take actions.</p>
                            ) : (
                                gameState.military_actions.map((action, index) => (
                                    <button key={index} className="button" onClick={() => handleMilitaryAction(action)}>
                                        {action.name} (Cost: ${action.cost.toLocaleString()})
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === "charts" && (
                        <div>
                            <h2>Economic Trends</h2>
                            <div className="chart-container">
                                <canvas id="gdpChart"></canvas>
                            </div>
                            <div className="chart-container">
                                <canvas id="unemploymentChart"></canvas>
                            </div>
                            <div className="chart-container">
                                <canvas id="stockChart"></canvas>
                            </div>
                            <div className="chart-container">
                                <canvas id="federalReserveChart"></canvas>
                            </div>
                        </div>
                    )}
                    {activeTab === "manual" && (
                        <div>
                            <h2>Player Manual</h2>
                            <p><strong>Raising Stock Market:</strong> Keep tariffs low (<5%), aim for booming global trade, and maintain high approval (>75%).</p>
                            <p><strong>Raising GDP:</strong> Set low taxes (<10%), increase schools and healthcare budgets (>150,000), and stabilize trade.</p>
                            <p><strong>Lowering Unemployment:</strong> Increase schools and healthcare budgets, keep taxes low, and avoid high gas prices.</p>
                            <p><strong>Managing Debt:</strong> High debt increases inflation and reduces approval. Raise taxes or cut budgets to recover.</p>
                        </div>
                    )}
                </div>
                {currentEvent && (
                    <>
                        <div className="modal-overlay"></div>
                        <div className="modal">
                            <h2>{currentEvent.name}</h2>
                            <p>{currentEvent.description}</p>
                            {currentEvent.options.map((option, index) => (
                                <button key={index} className="button" onClick={() => handleEventChoice(option)}>{option.text}</button>
                            ))}
                        </div>
                    </>
                )}
                {showTutorial && (
                    <>
                        <div className="modal-overlay"></div>
                        <div className="modal">
                            <h2>Welcome to Political Simulator!</h2>
                            <p>This is a complex simulation of running a government. Your goal is to maintain high approval and win elections every 4 cycles.</p>
                            <p><strong>Tip:</strong> Balance budgets to avoid debt, lower taxes to boost GDP, and respond to events wisely.</p>
                            <button className="button" onClick={() => setShowTutorial(false)}>Start Game</button>
                        </div>
                    </>
                )}
            </div>
        </ErrorBoundary>
    );
};

ReactDOM.render(<PoliticalSim />, document.getElementById('root'));