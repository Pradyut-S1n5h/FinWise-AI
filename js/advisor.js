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
    
    // Show typing indicator
    if (indicator) {
        indicator.classList.remove('hidden');
        indicator.classList.add('visible');
    }
    
    // Send to Gemini backend
    fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: query,
            conversationHistory: window.state.chatHistory || []
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('AI service error: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (indicator) indicator.classList.add('hidden');
        
        if (data.success && data.response) {
            // Append bot response
            appendChatMessage(data.response, 'bot');
            
            // Update conversation history
            if (!window.state.chatHistory) window.state.chatHistory = [];
            window.state.chatHistory.push(
                { role: 'user', parts: [query] },
                { role: 'model', parts: [data.response] }
            );
        } else {
            throw new Error(data.error || 'Unexpected response from AI service');
        }
    })
    .catch(err => {
        console.error('Gemini API Query failed:', err);
        
        if (indicator) indicator.classList.add('hidden');
        
        // Show user-friendly error message
        let userMessage;
        if (err.message.includes('API key')) {
            userMessage = 'Please configure your Google Gemini API key in the AI Settings.';
        } else if (err.message.includes('quota')) {
            userMessage = 'Google Gemini API quota exceeded. Please try again later.';
        } else {
            userMessage = 'Unable to connect to AI service. Please try again later.';
        }
        
        if (userMessage && window.appendChatMessage) {
            window.appendChatMessage(userMessage, 'bot');
        }
    });
    
    // Prevent the local fallback from running if the fetch started
    // The fetch is asynchronous, so we let it complete or fail naturally
}

// Expose prompt function globally
window.sendQuickPrompt = sendQuickPrompt;
