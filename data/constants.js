/**
 * FinWise AI - Application Configuration & Actuarial Constants
 * Declared globally to support local file:// protocols without module CORS blocks.
 */

window.CONFIG = {
    DEFAULT_EMI_INTEREST_RATE: 8.5,
    DEFAULT_EMI_TENURE_YEARS: 5,
    MAX_EMI_TENURE_YEARS: 30,
    MAX_DTI_TARGET_LIMIT: 35.0,
    MAX_DTI_DANGER_THRESHOLD: 50.0,
    MAX_LENDING_BUDGET_RATIO: 0.45,
    MAX_LENDABLE_PRINCIPAL_LIMIT: 10000000,
    ANNUAL_INCOME_MULTIPLIER_CAP: 10,
    
    // Credit Score Bands
    CREDIT_BANDS: {
        EXCELLENT: { min: 800, max: 850, label: 'Excellent' },
        VERY_GOOD: { min: 740, max: 799, label: 'Very Good' },
        GOOD:      { min: 670, max: 739, label: 'Good' },
        FAIR:      { min: 580, max: 669, label: 'Fair' },
        POOR:      { min: 300, max: 579, label: 'Poor' }
    },
    
    // Simulated delay durations (ms)
    DELAYS: {
        AUTH_GATE: 1200,
        RISK_ENGINE: 2200,
        AI_CO_PILOT: 1800,
        FORM_TRANSMIT: 1500
    }
};
