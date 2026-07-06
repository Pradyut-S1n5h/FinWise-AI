/**
 * FinWise AI - EMI & Amortization Calculations Engine
 * Real-time mathematics and slider updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Bind controls if on calculator page
    const rangeAmount = document.getElementById('range-emi-amount');
    const rangeRate = document.getElementById('range-emi-rate');
    const rangeTenure = document.getElementById('range-emi-tenure');
    
    if (rangeAmount && rangeRate && rangeTenure) {
        setupEMICalculator(rangeAmount, rangeRate, rangeTenure);
    }
});

function setupEMICalculator(rangeAmount, rangeRate, rangeTenure) {
    const valAmount = document.getElementById('val-emi-amount');
    const valRate = document.getElementById('val-emi-rate');
    const valTenure = document.getElementById('val-emi-tenure');
    
    const updateCalculations = () => {
        const P = parseInt(rangeAmount.value);
        const annualRate = parseFloat(rangeRate.value);
        const Y = parseInt(rangeTenure.value);
        
        valAmount.textContent = `₹${P.toLocaleString('en-IN')}`;
        valRate.textContent = `${annualRate.toFixed(1)}%`;
        valTenure.textContent = `${Y} Year${Y > 1 ? 's' : ''}`;
        
        const r = (annualRate / 12) / 100;
        const n = Y * 12;
        
        let emi = 0;
        if (r > 0) {
            emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        } else {
            emi = P / n;
        }
        
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;
        
        // Update DOM metrics
        document.getElementById('emi-monthly-repay').textContent = `₹${emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('emi-total-principal').textContent = `₹${P.toLocaleString('en-IN')}`;
        document.getElementById('emi-total-interest').textContent = `₹${Math.round(totalInterest).toLocaleString('en-IN')}`;
        document.getElementById('emi-total-payment').textContent = `₹${Math.round(totalPayment).toLocaleString('en-IN')}`;
        
        // Generate schedule table rows and collect charting telemetry
        const chartData = renderAmortizationTable(P, r, Y, emi);
        
        // Update charts if active
        if (window.updateEMIPieChart) {
            window.updateEMIPieChart(P, Math.round(totalInterest), chartData.labels, chartData.balances);
        }
    };
    
    // Bind listeners
    rangeAmount.addEventListener('input', updateCalculations);
    rangeRate.addEventListener('input', updateCalculations);
    rangeTenure.addEventListener('input', updateCalculations);
    
    // Initial run
    updateCalculations();
}

function renderAmortizationTable(principal, monthlyRate, years, monthlyEMI) {
    const tableBody = document.querySelector('#amortization-schedule-table tbody');
    
    let balance = principal;
    let scheduleHTML = '';
    
    const labels = ['Start'];
    const balances = [principal];
    
    for (let year = 1; year <= years; year++) {
        let interestPaidYear = 0;
        let principalPaidYear = 0;
        
        for (let month = 1; month <= 12; month++) {
            const interestMonth = balance * monthlyRate;
            let principalMonth = monthlyEMI - interestMonth;
            
            if (balance < principalMonth) {
                principalMonth = balance;
            }
            
            interestPaidYear += interestMonth;
            principalPaidYear += principalMonth;
            balance -= principalMonth;
            
            if (balance <= 0) break;
        }
        
        const yrLabel = `Yr ${year}`;
        labels.push(yrLabel);
        balances.push(Math.max(0, Math.round(balance)));
        
        if (tableBody) {
            scheduleHTML += `
                <tr>
                    <td>Year ${year}</td>
                    <td>₹${Math.round(principalPaidYear).toLocaleString('en-IN')}</td>
                    <td>₹${Math.round(interestPaidYear).toLocaleString('en-IN')}</td>
                    <td>₹${Math.max(0, Math.round(balance)).toLocaleString('en-IN')}</td>
                </tr>
            `;
        }
        
        if (balance <= 0) break;
    }
    
    if (tableBody) tableBody.innerHTML = scheduleHTML;
    
    return { labels, balances };
}
