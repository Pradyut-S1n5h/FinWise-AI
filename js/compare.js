/**
 * FinWise AI - Loan Comparison Script
 * Dynamically compares quotes for SBI, HDFC, ICICI, and Axis banks.
 */

document.addEventListener('DOMContentLoaded', () => {
    const rangeAmt = document.getElementById('range-comp-amount');
    const rangeTenure = document.getElementById('range-comp-tenure');
    
    if (rangeAmt && rangeTenure) {
        setupComparison(rangeAmt, rangeTenure);
    }
});

function setupComparison(rangeAmt, rangeTenure) {
    const valAmt = document.getElementById('val-comp-amount');
    const valTenure = document.getElementById('val-comp-tenure');
    const wrapper = document.getElementById('comparison-cards-wrapper');
    
    const banks = [
        {
            name: 'SBI (State Bank of India)',
            rate: 8.40,
            fee: '0.35% + GST',
            tag: 'Lowest Rate',
            tagClass: 'bg-green',
            logo: 'fa-building-columns',
            color: '#00a4e4'
        },
        {
            name: 'HDFC Bank',
            rate: 8.50,
            fee: '0.50% min ₹3,000',
            tag: 'Fastest Disbursal',
            tagClass: 'bg-purple',
            logo: 'fa-landmark',
            color: '#1c3f94'
        },
        {
            name: 'ICICI Bank',
            rate: 8.75,
            fee: '0.50% min ₹5,000',
            tag: 'Best Digital App',
            tagClass: 'bg-cyan',
            logo: 'fa-building-ngo',
            color: '#f58220'
        },
        {
            name: 'Axis Bank',
            rate: 8.65,
            fee: '0.40% min ₹10,000',
            tag: 'Minimal Documentation',
            tagClass: 'bg-magenta',
            logo: 'fa-money-check-dollar',
            color: '#97144d'
        }
    ];

    const runComparison = () => {
        const P = parseInt(rangeAmt.value);
        const Y = parseInt(rangeTenure.value);
        
        valAmt.textContent = `₹${P.toLocaleString('en-IN')}`;
        valTenure.textContent = `${Y} Year${Y > 1 ? 's' : ''}`;
        
        const n = Y * 12;
        let cardsHTML = '';
        
        banks.forEach(bank => {
            const r = (bank.rate / 12) / 100;
            let emi = 0;
            if (r > 0) {
                emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
            } else {
                emi = P / n;
            }
            
            const totalPayment = emi * n;
            const totalInterest = totalPayment - P;
            
            cardsHTML += `
                <div class="glass-card" style="padding: 24px; border-left: 5px solid ${bank.color}; position: relative; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                        <div>
                            <span class="badge ${bank.tagClass}" style="margin-bottom: 8px; display: inline-block;">${bank.tag}</span>
                            <h4 style="font-size: 1.15rem; color: #FFF; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid ${bank.logo}" style="color: ${bank.color};"></i>
                                ${bank.name}
                            </h4>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); display: block; text-transform: uppercase;">Interest Rate</span>
                            <strong style="font-size: 1.4rem; color: var(--accent);">${bank.rate.toFixed(2)}% <span style="font-size: 0.85rem; font-weight:400; color:var(--text-secondary);">p.a.</span></strong>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; border-top: 1px solid var(--border-light); padding-top: 16px;">
                        <div>
                            <span style="font-size: 0.72rem; color: var(--text-muted); display: block; text-transform: uppercase;">Monthly EMI</span>
                            <strong style="font-size: 1.1rem; color: #FFF;">₹${Math.round(emi).toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                            <span style="font-size: 0.72rem; color: var(--text-muted); display: block; text-transform: uppercase;">Total Interest</span>
                            <strong style="font-size: 1.1rem; color: #FFF;">₹${Math.round(totalInterest).toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                            <span style="font-size: 0.72rem; color: var(--text-muted); display: block; text-transform: uppercase;">Processing Fees</span>
                            <strong style="font-size: 0.95rem; color: var(--text-secondary);">${bank.fee}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
        
        wrapper.innerHTML = cardsHTML;
    };
    
    rangeAmt.addEventListener('input', runComparison);
    rangeTenure.addEventListener('input', runComparison);
    
    runComparison();
}
