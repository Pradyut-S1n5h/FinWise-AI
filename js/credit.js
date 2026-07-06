/**
 * FinWise AI - Credit Analyzer Gauge Engine
 * Computes speedometer dial physics, positive/negative drivers list, and timeline items.
 */

// Initialize current profile defaults if not existing
window.state = window.state || {};
window.state.currentProfile = window.state.currentProfile || { creditScore: 720 };

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('range-credit-score');
    if (slider) {
        setupCreditAnalyzer(slider);
    }
});

function setupCreditAnalyzer(slider) {
    const valText = document.getElementById('val-credit-analyzer');
    
    const updateGauge = () => {
        const score = parseInt(slider.value);
        valText.textContent = score;
        window.state.currentProfile.creditScore = score;
        
        // Update needle rotation angle
        const ratio = (score - 300) / 550;
        const angle = (ratio * 180) - 90;
        const needle = document.getElementById('gauge-needle');
        if (needle) needle.style.transform = `rotate(${angle}deg)`;
        
        // Update fill arc dashoffset
        const fillArc = document.getElementById('gauge-fill-arc');
        if (fillArc) {
            const dashOffset = 125 - (ratio * 125);
            fillArc.style.strokeDashoffset = dashOffset;
        }
        
        // Update text labels
        const scoreLabel = document.getElementById('gauge-score-val');
        const gradeLabel = document.getElementById('gauge-grade-val');
        
        if (scoreLabel) scoreLabel.textContent = score;
        
        // Match constants from data/constants.js if loaded
        let grade = 'Good';
        let gradeClass = 'text-yellow';
        let recommendations = [];
        
        if (score >= 800) {
            grade = 'Excellent';
            gradeClass = 'text-success';
            recommendations = [
                { icon: 'fa-star', title: 'Unlock Premier Rates', desc: 'You qualify for all bottom-market lending rates. Always negotiate points with providers.' },
                { icon: 'fa-shield-halved', title: 'Maintain Integrity', desc: 'Maintain existing credit accounts open to secure historic account age records.' }
            ];
        } else if (score >= 740) {
            grade = 'Very Good';
            gradeClass = 'text-green';
            recommendations = [
                { icon: 'fa-wallet', title: 'Consolidate Inquiries', desc: 'Freeze new credit applications for 90 days to solidify your rating.' },
                { icon: 'fa-money-bill-transfer', title: 'Keep Utilization Small', desc: 'Pay down balances mid-cycle to keep reported utilization under 10%.' }
            ];
        } else if (score >= 670) {
            grade = 'Good';
            gradeClass = 'text-yellow';
            recommendations = [
                { icon: 'fa-hand-holding-dollar', title: 'Optimize Card Limits', desc: 'Ask for card credit limit expansions (without hard inquiries) to lower overall utilization index.' },
                { icon: 'fa-calendar-check', title: 'Automatic Drafts', desc: 'Automate balance repayments to guarantee 100% on-time execution indicators.' }
            ];
        } else if (score >= 580) {
            grade = 'Fair';
            gradeClass = 'text-orange';
            recommendations = [
                { icon: 'fa-triangle-exclamation', title: 'High Card Balances', desc: 'Target debt balances above 35% utilization and repay them immediately.' },
                { icon: 'fa-building-columns', title: 'Credit Builder Options', desc: 'Look into secured credit products to rebuild solid payment histories.' }
            ];
        } else {
            grade = 'Poor';
            gradeClass = 'text-red';
            recommendations = [
                { icon: 'fa-triangle-exclamation', title: 'High Risk Alert', desc: 'Your rating makes loan acquisition difficult. Target payment defaults first.' },
                { icon: 'fa-user-shield', title: 'Check Credit Auditing', desc: 'Examine official logs for erroneous late flags or fraudulent accounts.' }
            ];
        }
        
        if (gradeLabel) {
            gradeLabel.textContent = grade;
            gradeLabel.className = `gauge-grade ${gradeClass}`;
        }
        
        // Render timeline
        const container = document.getElementById('credit-roadmap-container');
        if (container) {
            container.innerHTML = recommendations.map(item => `
                <div class="timeline-item">
                    <div class="timeline-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div class="timeline-body">
                        <h5>${item.title}</h5>
                        <p>${item.desc}</p>
                    </div>
                </div>
            `).join('');
        }
    };
    
    slider.addEventListener('input', updateGauge);
    updateGauge();
    
    // Initialize FICO factors pie chart
    const canvasPie = document.getElementById('creditPieChart');
    if (canvasPie) {
        const ctxPie = canvasPie.getContext('2d');
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: ['Payment History (35%)', 'Amounts Owed (30%)', 'Credit Age (15%)', 'New Credit (10%)', 'Credit Mix (10%)'],
                datasets: [{
                    data: [35, 30, 15, 10, 10],
                    backgroundColor: ['#6C63FF', '#00E5FF', '#00C853', '#FF9100', '#D500F9'],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}
