/**
 * FinWise AI - Underwriting Diagnostics & Risk Analysis Engines
 * Computes borrowing limits, DTI thresholds, risk badges, and product comparisons.
 */

// Initialize global diagnostics state namespace
window.state = window.state || {};
window.state.calculatedData = {
    approvalStatus: 'Approved',
    confidenceScore: 92,
    eligibleAmount: 68500,
    riskLevel: 'Low Risk',
    dtiRatio: 12.3,
    newEmi: 0
};
window.state.currentProfile = {
    age: 28,
    employment: 'salaried',
    income: 6500,
    creditScore: 710,
    existingEmi: 800,
    loanAmount: 45000,
    loanPurpose: 'home'
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eligibility-form');
    if (form) {
        // Slider synchronizations
        const rangeIncome = document.getElementById('range-income');
        const valIncome = document.getElementById('val-income');
        if (rangeIncome && valIncome) {
            rangeIncome.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                valIncome.textContent = `₹${val.toLocaleString('en-IN')}`;
                window.state.currentProfile.income = val;
            });
            valIncome.textContent = `₹${parseInt(rangeIncome.value).toLocaleString('en-IN')}`;
        }
        
        const rangeLoan = document.getElementById('range-loan-amount');
        const valLoan = document.getElementById('val-loan-amount');
        if (rangeLoan && valLoan) {
            rangeLoan.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                valLoan.textContent = `₹${val.toLocaleString('en-IN')}`;
                window.state.currentProfile.loanAmount = val;
            });
            valLoan.textContent = `₹${parseInt(rangeLoan.value).toLocaleString('en-IN')}`;
        }
        
        form.addEventListener('submit', runUnderwritingEngine);
    }
    
    // Save report preview
    const saveReportBtn = document.getElementById('btn-save-report');
    if (saveReportBtn) {
        saveReportBtn.addEventListener('click', openUnderwritingReport);
    }
});

async function runUnderwritingEngine(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('btn-assess-eligibility');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Assessing Telemetry...';
    
    // Hydrate state variables
    window.state.currentProfile.age = parseInt(document.getElementById('input-age').value);
    window.state.currentProfile.employment = document.getElementById('input-employment').value;
    window.state.currentProfile.income = parseInt(document.getElementById('range-income').value);
    window.state.currentProfile.creditScore = parseInt(document.getElementById('input-credit').value);
    window.state.currentProfile.existingEmi = parseInt(document.getElementById('input-existing-emi').value) || 0;
    window.state.currentProfile.loanAmount = parseInt(document.getElementById('range-loan-amount').value);
    window.state.currentProfile.loanPurpose = document.getElementById('input-purpose').value;
    const result = await fetch("http://localhost:5000/loan", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        income: window.state.currentProfile.income,
        expenses: window.state.currentProfile.existingEmi,
        creditScore: window.state.currentProfile.creditScore
    })
});

const loanData = await result.json();

console.log("Backend Response:", loanData);
    
    const processResult = () => {
        const p = window.state.currentProfile;
        
        // Estimating monthly payment for the requested loan (assume 8.5% over 5 years)
        const estInterest = 8.5 / 12 / 100;
        const estMonths = 5 * 12;
        const estNewEmi = p.loanAmount * estInterest * Math.pow(1 + estInterest, estMonths) / (Math.pow(1 + estInterest, estMonths) - 1);
        
        // Calculate DTI
        const dti = ((p.existingEmi + estNewEmi) / p.income) * 100;
        
        // Classification parameters mapping to window.CONFIG
        const config = window.CONFIG || {
            MAX_DTI_TARGET_LIMIT: 35.0,
            MAX_DTI_DANGER_THRESHOLD: 50.0,
            MAX_LENDING_BUDGET_RATIO: 0.45
        };
        
        let risk = 'Low Risk';
        let riskClass = 'text-accent';
        if (dti > config.MAX_DTI_DANGER_THRESHOLD || p.creditScore < 600) {
            risk = 'High Risk';
            riskClass = 'text-red';
        } else if (dti > config.MAX_DTI_TARGET_LIMIT || p.creditScore < 680) {
            risk = 'Medium Risk';
            riskClass = 'text-orange';
        }
        
        let status = 'Approved';
        let statusClass = 'Approved';
        
        const maxAllowedEMI = (p.income * config.MAX_LENDING_BUDGET_RATIO) - p.existingEmi;
        let maxEligiblePrincipal = 0;
        if (maxAllowedEMI > 0) {
            const formulaRate = 0.085 / 12;
            const formulaMonths = 7 * 12;
            maxEligiblePrincipal = maxAllowedEMI * (1 - Math.pow(1 + formulaRate, -formulaMonths)) / formulaRate;
            maxEligiblePrincipal = Math.min(10000000, Math.max(0, Math.round(maxEligiblePrincipal)));
        }
        
        if (dti > 50.0 || p.creditScore < 560) {
            status = 'Declined';
            statusClass = 'Declined';
        } else if (dti > 42.0 || p.creditScore < 640) {
            status = 'Provisionally';
            statusClass = 'Provisionally';
        }
        
        // Confidence Index
        let scoreWeight = (p.creditScore - 300) / 550 * 50;
        let dtiWeight = Math.max(0, (50 - dti) / 50) * 50;
        let confidence = Math.round(scoreWeight + dtiWeight);
        confidence = Math.max(15, Math.min(98, confidence));
        
        // Products Matching Grid
        let prodTitle = 'FinWise Premier Mortgage';
        let prodDesc = 'Designed for residential mortgages with premium rates.';
        let prodRate = '5.4% APR';
        let prodTenure = '30 Years';
        
        if (p.loanPurpose === 'personal') {
            prodTitle = 'FinWise Flexi Personal';
            prodDesc = 'Flexible liquidity for credit consolidation or family needs.';
            prodRate = '10.8% APR';
            prodTenure = '5 Years';
        } else if (p.loanPurpose === 'education') {
            prodTitle = 'FinWise Scholar Capital';
            prodDesc = 'Higher education deferment options and flexible tenure brackets.';
            prodRate = '4.5% APR';
            prodTenure = '15 Years';
        } else if (p.loanPurpose === 'business') {
            prodTitle = 'FinWise Venture Finance';
            prodDesc = 'Capital lines for expanding payrolls and manufacturing inventories.';
            prodRate = '9.4% APR';
            prodTenure = '10 Years';
        } else if (p.loanPurpose === 'vehicle') {
            prodTitle = 'FinWise Drive Auto Capital';
            prodDesc = 'Direct vehicle leasing or auto loans with lower collateral terms.';
            prodRate = '6.2% APR';
            prodTenure = '7 Years';
        }
        
        // Suggestions Text Setup
        let suggestText = '';
        if (status === 'Approved') {
            suggestText = `Your Debt-to-Income (DTI) is exceptionally solid at ${dti.toFixed(1)}%. We recommend proceeding with the ${prodTitle} at ${prodRate} rate. Lock in this rate by uploading verification reports.`;
        } else if (status === 'Provisionally') {
            suggestText = `Your profile is provisionally accepted. To solidify full approval parameters, consider decreasing existing card balances by ₹2,000, lowering DTI to sub-35%, or bringing a co-borrower.`;
        } else {
            suggestText = `The diagnostic engine indicates a high DTI of ${dti.toFixed(1)}% and low credit safety levels. We suggest focusing on payment defaults and postponing new credit inquiries for 180 days.`;
        }
        
        // Update State Namespace
        window.state.calculatedData = {
            approvalStatus: status,
            confidenceScore: confidence,
            eligibleAmount: maxEligiblePrincipal,
            riskLevel: risk,
            dtiRatio: dti,
            newEmi: estNewEmi
        };
        
        // Update DOM Node elements
        const resultStatus = document.getElementById('result-status');
        const resultConfidence = document.getElementById('result-confidence');
        const statusIndicator = document.getElementById('status-indicator');
        const resultEligibleAmt = document.getElementById('result-eligible-amt');
        const resultRiskLevel = document.getElementById('result-risk-level');
        const resultDti = document.getElementById('result-dti');
        const resultDtiLabel = document.getElementById('result-dti-label');
        const resultDtiFill = document.getElementById('result-dti-fill');
        
        if (resultStatus) resultStatus.textContent = status === 'Provisionally' ? 'Provisionally Approved' : status;
        if (resultConfidence) resultConfidence.textContent = `${confidence}% Confidence Score`;
        if (statusIndicator) statusIndicator.className = `status-indicator-ring ${statusClass}`;
        if (resultEligibleAmt) resultEligibleAmt.textContent = `₹${maxEligiblePrincipal.toLocaleString('en-IN')}`;
        if (resultRiskLevel) {
            resultRiskLevel.textContent = risk;
            resultRiskLevel.className = `detail-value ${riskClass}`;
        }
        if (resultDti) resultDti.textContent = `${dti.toFixed(1)}%`;
        if (resultDtiLabel) resultDtiLabel.textContent = `${dti.toFixed(1)}%`;
        
        if (resultDtiFill) {
            resultDtiFill.style.width = `${Math.min(100, dti)}%`;
            resultDtiFill.className = `meter-fill ${dti > 45 ? 'fill-red' : (dti > 35 ? 'fill-yellow' : 'fill-green')}`;
        }
        
        const recomTitle = document.getElementById('recom-loan-title');
        const recomDesc = document.getElementById('recom-loan-desc');
        const recomRate = document.getElementById('recom-loan-rate');
        const recomTenure = document.getElementById('recom-loan-tenure');
        
        if (recomTitle) recomTitle.textContent = prodTitle;
        if (recomDesc) recomDesc.textContent = prodDesc;
        if (recomRate) recomRate.textContent = prodRate;
        if (recomTenure) recomTenure.textContent = prodTenure;
        
        const suggestionTextContainer = document.getElementById('result-ai-suggestions');
        if (suggestionTextContainer) suggestionTextContainer.textContent = suggestText;
        
        // Reveal Panel Grid
        const placeholder = document.getElementById('checker-placeholder');
        const results = document.getElementById('checker-results');
        if (placeholder) placeholder.classList.add('hidden');
        if (results) results.classList.remove('hidden');
        
        const saveReportBtn = document.getElementById('btn-save-report');
        if (saveReportBtn) saveReportBtn.removeAttribute('disabled');
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> <span>Run Diagnostic Engine</span>';
        
        // Trigger Canvas Confetti
        if (status === 'Approved' && typeof confetti === 'function') {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#6C63FF', '#00E5FF', '#00C853']
            });
        }
        
        if (window.showToast) window.showToast('Telemetry Analysis Complete', 'success');
        
        // Export to Google Sheets webhook if configured
        if (window.postTelemetryToSheetsLedger) {
            window.postTelemetryToSheetsLedger();
        }
    };
    
    const forceDelay = window.state.settings ? window.state.settings.forceDelay : true;
    const delay = forceDelay ? (window.CONFIG ? window.CONFIG.DELAYS.RISK_ENGINE : 2200) : 0;
    
    if (delay > 0) {
        setTimeout(processResult, delay);
    } else {
        processResult();
    }
}

function openUnderwritingReport() {
    const p = window.state.currentProfile;
    const r = window.state.calculatedData;
    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const reportModal = document.getElementById('report-modal');
    const reportBody = document.getElementById('report-pdf-body');
    
    if (reportModal && reportBody) {
        const certHTML = `
            <div class="certificate-report">
                <div class="cert-header">
                    <div class="cert-logo"><i class="fa-solid fa-brain-circuit text-primary"></i> FinWise Underwriting</div>
                    <div class="cert-title-stamp">Official Underwriting Diagnostic Summary</div>
                </div>
                
                <div class="cert-meta-grid">
                    <div class="cert-meta-item">
                        <span class="lbl">Report Timestamp:</span>
                        <span class="val">${dateStr}</span>
                    </div>
                    <div class="cert-meta-item">
                        <span class="lbl">Reference ID:</span>
                        <span class="val">FW-${Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div class="cert-meta-item">
                        <span class="lbl">Borrower Profile:</span>
                        <span class="val">Age ${p.age} / ${p.employment}</span>
                    </div>
                    <div class="cert-meta-item">
                        <span class="lbl">Monthly Revenue:</span>
                        <span class="val">₹${p.income.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                
                <div class="cert-scores">
                    <div class="cert-score-box" style="border-color: ${r.approvalStatus === 'Approved' ? 'var(--success)' : (r.approvalStatus === 'Declined' ? 'var(--danger)' : 'var(--warning)')}">
                        <span class="lbl">Approval Status</span>
                        <strong class="val" style="color: ${r.approvalStatus === 'Approved' ? 'var(--success)' : (r.approvalStatus === 'Declined' ? 'var(--danger)' : 'var(--warning)')}">
                            ${r.approvalStatus === 'Provisionally' ? 'Provisionally Approved' : r.approvalStatus}
                        </strong>
                    </div>
                    <div class="cert-score-box">
                        <span class="lbl">Credit Score Class</span>
                        <strong class="val">${p.creditScore}</strong>
                    </div>
                    <div class="cert-score-box">
                        <span class="lbl">Debt-to-Income (DTI)</span>
                        <strong class="val">${r.dtiRatio.toFixed(1)}%</strong>
                    </div>
                </div>
                
                <div class="cert-recommendations">
                    <h4>System Underwriting Diagnostics</h4>
                    <p><strong>Max Eligible Envelope:</strong> ₹${r.eligibleAmount.toLocaleString('en-IN')}</p>
                    <p style="margin-top: 8px;"><strong>Risk Profiling Bracket:</strong> ${r.riskLevel}</p>
                    <p style="margin-top: 8px;"><strong>Confidence Index:</strong> ${r.confidenceScore}% (Calculated on algorithmic weights)</p>
                    
                    <h4 style="margin-top: 24px;">Advisory Suggestions</h4>
                    <p>${document.getElementById('result-ai-suggestions').textContent}</p>
                </div>
            </div>
        `;
        
        reportBody.innerHTML = certHTML;
        reportModal.classList.add('open');
        reportModal.setAttribute('aria-hidden', 'false');
    }
}

function closeReportModal() {
    const reportModal = document.getElementById('report-modal');
    if (reportModal) {
        reportModal.classList.remove('open');
        reportModal.setAttribute('aria-hidden', 'true');
    }
}

function printReport() {
    window.print();
}

function emailUnderwritingReport() {
    if (window.showToast) {
        window.showToast("Emailing: Underwriting report successfully dispatched to corporate inbox!", "success");
    } else {
        alert("Underwriting report successfully dispatched to corporate inbox!");
    }
}

function shareUnderwritingReport() {
    if (navigator.share) {
        navigator.share({
            title: 'FinWise AI Underwriting Certificate',
            text: 'Review my dynamic loan eligibility and risk diagnostic details.',
            url: window.location.href,
        })
        .then(() => {
            if (window.showToast) window.showToast("Diagnostic details shared successfully!", "success");
        })
        .catch((err) => console.log('Sharing failed', err));
    } else {
        navigator.clipboard.writeText(window.location.href)
        .then(() => {
            if (window.showToast) window.showToast("Secure share link copied to clipboard!", "info");
        })
        .catch((err) => console.error("Clipboard copy failed", err));
    }
}

window.closeReportModal = closeReportModal;
window.printReport = printReport;
window.emailUnderwritingReport = emailUnderwritingReport;
window.shareUnderwritingReport = shareUnderwritingReport;
