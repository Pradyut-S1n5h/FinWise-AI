/**
 * FinWise AI - Goal Planner Script
 * Handles configuration sliders and targets for Buy House, Buy Car, Emergency Fund, and Retirement.
 */

// Active state
let activeGoalType = 'house';

const goalProfiles = {
    house: {
        title: 'House Purchase Parameters',
        minAmt: 500000,
        maxAmt: 20000000,
        stepAmt: 100000,
        defAmt: 5000000,
        minTime: 1,
        maxTime: 30,
        defTime: 10,
        minSave: 5000,
        maxSave: 500000,
        defSave: 25000
    },
    car: {
        title: 'Car Purchase Parameters',
        minAmt: 100000,
        maxAmt: 5000000,
        stepAmt: 50000,
        defAmt: 1200000,
        minTime: 1,
        maxTime: 10,
        defTime: 5,
        minSave: 2000,
        maxSave: 200000,
        defSave: 15000
    },
    emergency: {
        title: 'Emergency Fund Parameters',
        minAmt: 50000,
        maxAmt: 1500000,
        stepAmt: 10000,
        defAmt: 300000,
        minTime: 1,
        maxTime: 5,
        defTime: 2,
        minSave: 1000,
        maxSave: 100000,
        defSave: 10000
    },
    retirement: {
        title: 'Retirement Fund Parameters',
        minAmt: 1000000,
        maxAmt: 100000000,
        stepAmt: 500000,
        defAmt: 20000000,
        minTime: 5,
        maxTime: 40,
        defTime: 25,
        minSave: 5000,
        maxSave: 500000,
        defSave: 20000
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    selectGoal('house');
});

function selectGoal(type) {
    activeGoalType = type;
    
    // Toggle active buttons style
    const goalBtns = ['house', 'car', 'emergency', 'retirement'];
    goalBtns.forEach(g => {
        const btn = document.getElementById(`btn-goal-${g}`);
        if (btn) {
            if (g === type) {
                btn.classList.add('active-goal-btn');
            } else {
                btn.classList.remove('active-goal-btn');
            }
        }
    });
    
    // Hydrate form parameters
    const p = goalProfiles[type];
    document.getElementById('goal-form-title').textContent = p.title;
    
    const sliderAmt = document.getElementById('range-goal-target');
    const sliderTime = document.getElementById('range-goal-time');
    const sliderSave = document.getElementById('range-goal-monthly');
    
    if (sliderAmt && sliderTime && sliderSave) {
        // Set constraints
        sliderAmt.min = p.minAmt;
        sliderAmt.max = p.maxAmt;
        sliderAmt.step = p.stepAmt;
        sliderAmt.value = p.defAmt;
        
        sliderTime.min = p.minTime;
        sliderTime.max = p.maxTime;
        sliderTime.value = p.defTime;
        
        sliderSave.min = p.minSave;
        sliderSave.max = p.maxSave;
        sliderSave.value = p.defSave;
        
        // Remove old listeners by replacing elements or re-binding
        sliderAmt.oninput = calculateGoal;
        sliderTime.oninput = calculateGoal;
        sliderSave.oninput = calculateGoal;
        
        calculateGoal();
    }
}

function calculateGoal() {
    const sliderAmt = document.getElementById('range-goal-target');
    const sliderTime = document.getElementById('range-goal-time');
    const sliderSave = document.getElementById('range-goal-monthly');
    
    const valAmt = document.getElementById('val-goal-target');
    const valTime = document.getElementById('val-goal-time');
    const valSave = document.getElementById('val-goal-monthly');
    
    const needed = parseInt(sliderAmt.value);
    const years = parseInt(sliderTime.value);
    const currentSave = parseInt(sliderSave.value);
    
    // Update labels
    valAmt.textContent = `₹${needed.toLocaleString('en-IN')}`;
    valTime.textContent = `${years} Year${years > 1 ? 's' : ''}`;
    valSave.textContent = `₹${currentSave.toLocaleString('en-IN')}`;
    
    const months = years * 12;
    const accumulated = currentSave * months;
    const requiredSave = Math.ceil(needed / months);
    const shortfall = needed - accumulated;
    
    // Update metrics DOM
    document.getElementById('goal-total-needed').textContent = `₹${needed.toLocaleString('en-IN')}`;
    document.getElementById('goal-accumulated').textContent = `₹${accumulated.toLocaleString('en-IN')}`;
    document.getElementById('goal-target-monthly').textContent = `₹${requiredSave.toLocaleString('en-IN')}`;
    
    // Update Progress Indicator
    const progressPercent = Math.min(100, Math.round((accumulated / needed) * 100));
    document.getElementById('goal-progress-percent').textContent = `${progressPercent}% Pace`;
    
    const indicatorRing = document.getElementById('goal-status-indicator');
    const statusText = document.getElementById('goal-status-text');
    const warningBox = document.getElementById('goal-warning-box');
    const warningText = document.getElementById('goal-warning-text');
    const warningTitle = document.getElementById('goal-warning-title');
    const warningIcon = document.getElementById('goal-warning-icon');
    
    // Color thresholds
    if (shortfall <= 0) {
        statusText.textContent = 'Safe';
        indicatorRing.style.borderColor = 'var(--success)';
        indicatorRing.style.boxShadow = '0 0 15px var(--success-glow)';
        
        warningBox.style.borderLeftColor = 'var(--success)';
        warningIcon.className = 'fa-solid fa-circle-check text-success';
        warningTitle.textContent = 'Goal fully funded';
        warningText.textContent = `Your savings pace of ₹${currentSave.toLocaleString('en-IN')}/mo will generate ₹${accumulated.toLocaleString('en-IN')} in ${years} years, fully funding your target goal of ₹${needed.toLocaleString('en-IN')}.`;
    } else if (progressPercent >= 70) {
        statusText.textContent = 'On Track';
        indicatorRing.style.borderColor = 'var(--accent)';
        indicatorRing.style.boxShadow = '0 0 15px rgba(0, 229, 255, 0.4)';
        
        warningBox.style.borderLeftColor = 'var(--accent)';
        warningIcon.className = 'fa-solid fa-circle-info text-accent';
        warningTitle.textContent = 'Minimal Funding Gap';
        warningText.textContent = `At this pace, you will experience a minimal shortfall of ₹${shortfall.toLocaleString('en-IN')}. Raise your monthly contributions to ₹${requiredSave.toLocaleString('en-IN')} to close the gap.`;
    } else {
        statusText.textContent = 'Behind';
        indicatorRing.style.borderColor = 'var(--danger)';
        indicatorRing.style.boxShadow = '0 0 15px rgba(255, 23, 70, 0.4)';
        
        warningBox.style.borderLeftColor = 'var(--danger)';
        warningIcon.className = 'fa-solid fa-triangle-exclamation text-danger';
        warningTitle.textContent = 'Significant Shortfall Warning';
        warningText.textContent = `At ₹${currentSave.toLocaleString('en-IN')}/mo, you will achieve ₹${accumulated.toLocaleString('en-IN')}, leaving a shortfall of ₹${shortfall.toLocaleString('en-IN')}. To hit your goal, increase savings to ₹${requiredSave.toLocaleString('en-IN')}/mo.`;
    }
}

// Expose globally
window.selectGoal = selectGoal;
