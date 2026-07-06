/**
 * FinWise AI - Chat Advisor System
 * Formats Markdown streams, manages conversation nodes, and handles queries.
 */

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('btn-chat-send');
    const clearBtn = document.getElementById('btn-clear-chat');
    const inputField = document.getElementById('chat-user-input');
    
    if (sendBtn) sendBtn.addEventListener('click', sendUserChatMessage);
    if (clearBtn) clearBtn.addEventListener('click', clearAdvisorChatLogs);
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendUserChatMessage();
        });
    }
});

function sendUserChatMessage() {
    const input = document.getElementById('chat-user-input');
    if (!input) return;
    
    const query = input.value.trim();
    if (!query) return;
    
    input.value = '';
    appendChatMessage(query, 'user');
    executeAdvisorQuery(query);
}

function sendQuickPrompt(type) {
    let promptText = '';
    // Pull current profile values if loaded from loan.js
    const p = window.state.currentProfile || { income: 6500, existingEmi: 800, creditScore: 710 };
    const r = window.state.calculatedData || { dtiRatio: 12.3 };
    
    if (type === 'savings') {
        promptText = `Create a Savings Maximization roadmap. Focus on current net income (₹${p.income}/mo) and existing DTI ratio (${r.dtiRatio.toFixed(1)}%). Provide actionable bullet recommendations.`;
    } else if (type === 'budget') {
        promptText = `Draft a detailed 50/30/20 budget framework optimized for monthly income (₹${p.income}/mo) and current EMI debt obligation (₹${p.existingEmi}/mo). Include a markdown cost summary table.`;
    } else if (type === 'debt') {
        promptText = `Build a debt reduction strategy (Snowball vs. Avalanche) addressing an existing debt EMI profile (₹${p.existingEmi}/mo) and credit score (${p.creditScore}). Suggest timeline milestones.`;
    } else if (type === 'emergency') {
        promptText = `Help me calculate emergency cash reserves targeting 6 months of expenses, assuming monthly revenues (₹${p.income}/mo) and debt EMIs (₹${p.existingEmi}/mo). Outline cash storage parameters.`;
    }
    
    if (promptText) {
        appendChatMessage(promptText, 'user');
        executeAdvisorQuery(promptText);
    }
}

function appendChatMessage(text, sender) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message message-${sender}`;
    
    const formattedText = parseMarkdownToHTML(text);
    
    msgDiv.innerHTML = `
        <div class="message-bubble">
            ${formattedText}
        </div>
        <span class="message-time">Just Now</span>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function clearAdvisorChatLogs() {
    const container = document.getElementById('chat-messages-container');
    if (container) {
        container.innerHTML = `
            <div class="message message-bot">
                <div class="message-bubble">
                    <p>Hello! I am your AI Financial Advisor. Based on the parameters currently loaded on the dashboard, I can generate specialized blueprints. Choose one of the prompts below or type your custom query:</p>
                </div>
                <span class="message-time">Just Now</span>
            </div>
        `;
        if (window.showToast) window.showToast('Conversation Logs Reset', 'info');
    }
}

function parseMarkdownToHTML(md) {
    let html = md;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Headers: ####, ###, ##
    html = html.replace(/#### (.*?)\n/g, '<h4>$1</h4>');
    html = html.replace(/### (.*?)\n/g, '<h3>$1</h3>');
    html = html.replace(/## (.*?)\n/g, '<h2>$1</h2>');
    
    // Unordered lists
    html = html.replace(/^- (.*?)\n/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Tables parser
    if (html.includes('|') && html.includes('\n|')) {
        const lines = html.split('\n');
        let inTable = false;
        let tableHTML = '<table>';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('|') && line.endsWith('|')) {
                if (line.includes('---')) continue;
                
                const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
                if (!inTable) {
                    inTable = true;
                    tableHTML += '<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
                } else {
                    tableHTML += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
                }
            } else {
                if (inTable) {
                    inTable = false;
                    tableHTML += '</tbody></table>';
                    lines[i] = tableHTML + '\n' + lines[i];
                }
            }
        }
        if (inTable) tableHTML += '</tbody></table>';
        html = lines.join('\n');
    }
    
    html = html.replace(/\n\n/g, '<p></p>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

function executeAdvisorQuery(query) {
    const indicator = document.getElementById('chat-typing-indicator');
    const container = document.getElementById('chat-messages-container');
    if (indicator) indicator.classList.remove('hidden');
    if (container) container.scrollTop = container.scrollHeight;
    
    // Pull state profile values
    const p = window.state.currentProfile || { income: 6500, existingEmi: 800, creditScore: 710 };
    const r = window.state.calculatedData || { dtiRatio: 12.3, approvalStatus: 'Approved', riskLevel: 'Low Risk' };
    
    // Check if Claude API key is configured
    if (window.state.settings && window.state.settings.claudeKey) {
        if (window.queryClaudeAPI) {
            window.queryClaudeAPI(query);
            return;
        }
    }
    
    // Intelligent local fallback rules engine
    const generateLocalResponse = () => {
        let answer = '';
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('saving') || queryLower.includes('savings')) {
            const estExpenses = Math.round(p.income * 0.4) + p.existingEmi;
            const estSavings = Math.round(p.income * 0.2);
            const emergencyFund = estSavings * 6;
            answer = `
#### AI Saving Blueprint
Based on your **₹${p.income.toLocaleString('en-IN')}** monthly income and **₹${estExpenses.toLocaleString('en-IN')}** expenses, you can save **₹${estSavings.toLocaleString('en-IN')}** per month and build an emergency fund of **₹${emergencyFund.toLocaleString('en-IN')}** in six months.

- **Overhead Control:** Keep fixed needs and bills below ₹${estExpenses.toLocaleString('en-IN')} to protect your capacity.
- **Auto Drafts Setup:** Route ₹${estSavings.toLocaleString('en-IN')} mid-cycle to a separate emergency vault account.
- **Liquidity Lock:** Maintain this plan for 180 days to achieve full safety status.
            `;
        } else if (queryLower.includes('budget')) {
            answer = `
#### Customized 50/30/20 Budgeting Framework
Optimized for monthly revenues of **₹${p.income.toLocaleString('en-IN')}**:

| Budget Category | Ideal Split (%) | Allocated Budget (₹) | Your Profile Status |
| :--- | :--- | :--- | :--- |
| **Needs (Rent, Bills)** | 50% | ₹${(p.income * 0.5).toLocaleString('en-IN')} | Debt consumes ₹${p.existingEmi.toLocaleString('en-IN')} |
| **Wants (Dining, Gym)** | 30% | ₹${(p.income * 0.3).toLocaleString('en-IN')} | Keep below ₹${(p.income * 0.2).toLocaleString('en-IN')} |
| **Savings (HYSA, IRA)** | 20% | ₹${(p.income * 0.2).toLocaleString('en-IN')} | Automated goal targets |

**Advisory Notes:** 
Your existing debt EMIs of **₹${p.existingEmi.toLocaleString('en-IN')}** consume a sizable portion of your Needs pocket. Keep additional lifestyle costs minimal.
            `;
        } else if (queryLower.includes('debt') || queryLower.includes('avalanche') || queryLower.includes('snowball')) {
            answer = `
#### Debt Reduction Strategy Analysis
Your credit profile score is **${p.creditScore}** with monthly debt obligations of **₹${p.existingEmi.toLocaleString('en-IN')}**:

- **Recommended: Debt Avalanche Model**
  - Order debt items by highest interest rate. Pay minimum drafts on all except the highest rate account.
  - Dedicate excess capital of **₹${(p.income * 0.1).toLocaleString('en-IN')}** monthly toward the target card.
- **Alternative: Debt Snowball Model**
  - Repay cards with the smallest absolute balances first to achieve quick psychological milestones.
  - Works best if your score of **${p.creditScore}** is impacted by high account balances on multiple store cards.
            `;
        } else if (queryLower.includes('emergency')) {
            const estExpenses = Math.round(p.income * 0.4) + p.existingEmi;
            const estSavings = Math.round(p.income * 0.2);
            const emergencyFund = estSavings * 6;
            answer = `
#### Emergency Fund Blueprint
Based on your **₹${p.income.toLocaleString('en-IN')}** monthly income and **₹${estExpenses.toLocaleString('en-IN')}** expenses, you can save **₹${estSavings.toLocaleString('en-IN')}** per month and build an emergency fund of **₹${emergencyFund.toLocaleString('en-IN')}** in six months.

- **Target Reserve Envelope:** ₹${emergencyFund.toLocaleString('en-IN')} (covers 6 months of basic needs).
- **Monthly Contribution:** Allocate ₹${estSavings.toLocaleString('en-IN')} directly from payroll deposits.
- **Storage Recommendation:** Utilize a liquid savings account with automatic draft bounds to prevent premature withdrawals.
            `;
        } else {
            answer = `
#### FinWise Financial Advisory Brief
Your loaded profile parameters:
- **Net Income:** ₹${p.income.toLocaleString('en-IN')}/mo
- **Credit integrity:** Rating category: **${p.creditScore}**
- **Underwriting Risks:** DTI Ratio: **${r.dtiRatio.toFixed(1)}%**

To answer your specific query regarding *"${query}"*:
We suggest keeping fixed leverage elements (existing loans and card debt) below a **36% DTI limit**. For personalized lending structures, please finalize your parameter calculations inside the *Eligibility Tab* and download your Underwriting Certificate.
            `;
        }
        
        if (indicator) indicator.classList.add('hidden');
        appendChatMessage(answer.trim(), 'bot');
    };
    
    const forceDelay = window.state.settings ? window.state.settings.forceDelay : true;
    const delay = forceDelay ? (window.CONFIG ? window.CONFIG.DELAYS.AI_CO_PILOT : 1800) : 0;
    
    if (delay > 0) {
        setTimeout(generateLocalResponse, delay);
    } else {
        generateLocalResponse();
    }
}

// Expose prompt function globally
window.sendQuickPrompt = sendQuickPrompt;
