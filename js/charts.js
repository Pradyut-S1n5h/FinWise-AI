/**
 * FinWise AI - Visualizations Engine
 * Interfaces with Chart.js library to update principal vs interest, expense analysis, and amortization schedule.
 */

// Global references
window.state = window.state || {};
window.state.emiChart = null;
window.state.emiBarChart = null;
window.state.emiLineChart = null;

function updateEMIPieChart(principal, interest, yearlyLabels = [], yearlyBalances = []) {
    const canvas = document.getElementById('emiPieChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 1. Doughnut Chart: Principal vs Interest
    if (window.state.emiChart) {
        window.state.emiChart.data.datasets[0].data = [principal, interest];
        window.state.emiChart.update();
    } else {
        window.state.emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: ['#6C63FF', '#00E5FF'],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '70%'
            }
        });
    }

    // 2. Bar Chart: Expense Analysis (Principal, Interest, Est. Taxes & Insurance)
    const canvasBar = document.getElementById('emiBarChart');
    if (canvasBar) {
        const ctxBar = canvasBar.getContext('2d');
        const estTaxesIns = Math.round(principal * 0.05); // Estimate 5% of principal for escrow taxes/insurance fees
        
        if (window.state.emiBarChart) {
            window.state.emiBarChart.data.datasets[0].data = [principal, interest, estTaxesIns];
            window.state.emiBarChart.update();
        } else {
            window.state.emiBarChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Principal', 'Interest Cost', 'Escrow Esc. (5%)'],
                    datasets: [{
                        label: 'Total Commitment (₹)',
                        data: [principal, interest, estTaxesIns],
                        backgroundColor: ['#6C63FF', '#00E5FF', '#FF9100'],
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 9 } }
                        },
                        x: {
                            ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 9 } }
                        }
                    }
                }
            });
        }
    }

    // 3. Line Chart: Amortization Balance Schedule
    const canvasLine = document.getElementById('emiLineChart');
    if (canvasLine && yearlyLabels.length > 0) {
        const ctxLine = canvasLine.getContext('2d');
        
        if (window.state.emiLineChart) {
            window.state.emiLineChart.data.labels = yearlyLabels;
            window.state.emiLineChart.data.datasets[0].data = yearlyBalances;
            window.state.emiLineChart.update();
        } else {
            window.state.emiLineChart = new Chart(ctxLine, {
                type: 'line',
                data: {
                    labels: yearlyLabels,
                    datasets: [{
                        label: 'Remaining Principal (₹)',
                        data: yearlyBalances,
                        borderColor: '#00C853',
                        backgroundColor: 'rgba(0, 200, 83, 0.1)',
                        fill: true,
                        tension: 0.2,
                        borderWidth: 2,
                        pointRadius: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 8 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 8 } }
                        }
                    }
                }
            });
        }
    }
}

// Expose globally
window.updateEMIPieChart = updateEMIPieChart;
