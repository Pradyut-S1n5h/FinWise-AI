/**
 * FinWise AI - REST API Connection Adapters
 * Connects forms and chatbot queries to Google Sheets and Anthropic Claude servers.
 */

// Global namespaces setup
window.state = window.state || {};

function postTelemetryToSheetsLedger() {
    if (!window.state.settings || !window.state.settings.sheetsUrl) return;
    
    const p = window.state.currentProfile || {};
    const r = window.state.calculatedData || {};
    
    const payload = {
        timestamp: new Date().toISOString(),
        age: p.age,
        employment: p.employment,
        income: p.income,
        creditScore: p.creditScore,
        existingEmi: p.existingEmi,
        loanAmount: p.loanAmount,
        purpose: p.loanPurpose,
        approvalStatus: r.approvalStatus,
        eligibleAmount: r.eligibleAmount,
        riskLevel: r.riskLevel,
        dtiRatio: r.dtiRatio ? r.dtiRatio.toFixed(2) : '0.00',
        confidenceScore: r.confidenceScore
    };
    
    fetch(window.state.settings.sheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        if (window.showToast) window.showToast('Sheets Underwriting Ledger Updated', 'info');
    })
    .catch((err) => {
        console.error('Sheets webhook failed:', err);
        if (window.showToast) window.showToast('Google Sheets export failed', 'error');
    });
}

function queryClaudeAPI(query) {
    const apiKey = window.state.settings.claudeKey;
    const p = window.state.currentProfile || {};
    const r = window.state.calculatedData || {};
    
    const sysPrompt = `You are the FinWise AI Financial Co-Pilot, an investor-ready expert fintech advisor.
Analyze the user's financial variables:
- Age: ${p.age || ''}
- Employment Type: ${p.employment || ''}
- Net Income: ₹${p.income || ''}/month
- Credit Score: ${p.creditScore || ''}
- Existing Monthly Debt EMIs: ₹${p.existingEmi || ''}/month
- Proposed Loan amount: ₹${p.loanAmount || ''}
- Loan Purpose: ${p.loanPurpose || ''}
- Calculated Debt-To-Income (DTI) ratio: ${r.dtiRatio ? r.dtiRatio.toFixed(2) : ''}%
- Maximum Eligible Amount: ₹${r.eligibleAmount || ''}

Provide high-fidelity, premium financial guidance in Indian Rupees (INR, ₹). Use headings, bullet lists, and tables where helpful. Do not mention API keys or technical platform details to the end-user. Respond directly to their prompt.`;

    const requestBody = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        system: sysPrompt,
        messages: [
            { role: 'user', content: query }
        ]
    };
    
    const indicator = document.getElementById('chat-typing-indicator');
    
    fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'dangerously-allow-the-user-api-key-in-the-browser': 'true'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) throw new Error(`Anthropic server response: ${response.status}`);
        return response.json();
    })
    .then(data => {
        if (indicator) indicator.classList.add('hidden');
        if (data.content && data.content[0] && data.content[0].text) {
            if (window.appendChatMessage) {
                window.appendChatMessage(data.content[0].text, 'bot');
            } else {
                alert(data.content[0].text);
            }
        } else {
            throw new Error('Malformed API response content payload');
        }
    })
    .catch(err => {
        console.error('Claude API Query failed:', err);
        if (indicator) indicator.classList.add('hidden');
        
        const failMessage = `**Claude API Connection Failed**\n\nError details: ${err.message}\n\n*Falling back to local simulation module response:*`;
        if (window.appendChatMessage) {
            window.appendChatMessage(failMessage, 'bot');
        }
        
        // Trigger local simulation fallback (requires advisor.js window.executeAdvisorQuery logic)
        // Temporarily disable delay during local fallback processing
        const savedDelaySetting = window.state.settings.forceDelay;
        window.state.settings.forceDelay = false;
        if (window.executeAdvisorQuery) {
            window.executeAdvisorQuery(query);
        }
        window.state.settings.forceDelay = savedDelaySetting;
    });
}

// Expose functions globally
window.postTelemetryToSheetsLedger = postTelemetryToSheetsLedger;
window.queryClaudeAPI = queryClaudeAPI;
