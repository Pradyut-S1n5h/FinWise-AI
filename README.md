# FinWise AI - Modular Credit Assessment & Underwriting Platform

FinWise AI is a premium, investor-ready fintech SaaS platform that provides automated credit diagnostics, borrowing envelope underwriting, real-time mortgage calculators, and tailored conversational co-pilot roadmaps.

This codebase has been restructured into an organized, multi-page application (MPA) layout to improve modularity, scale libraries, and support clean division of logic controllers.

---

## 📂 Directory Structure

```
finwise-ai/
│
├── index.html            # Landing Portal & Security Login Gate
│
├── pages/                # Modular Static Pages
│   ├── dashboard.html    # Hub overview with quick-metrics summaries
│   ├── eligibility.html  # Actuarial Loan Underwriting interface
│   ├── calculator.html   # Mortgage simulator & Speedometer gauges
│   └── advisor.html      # Claude AI conversational adviser interface
│
├── assets/               # Branding, assets, images
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── css/                  # Granular Stylesheets
│   ├── main.css          # Core design system tokens, variables, & buttons
│   ├── navbar.css        # Sticky headers and mobile toggle draw panels
│   ├── hero.css          # Landing authenticator layout graphics
│   ├── dashboard.css     # Charts layout, speedometer gauges, timelines, & chat screens
│   ├── forms.css         # customized sliders tracks, selectors, & visibility buttons
│   └── animations.css    # Skeletons, pulsing alerts, floating, & page transitions
│
├── js/                   # Logical Module Controllers
│   ├── app.js            # General settings configuration & global interface binds
│   ├── auth.js           # Session storage verification & page router interceptors
│   ├── calculator.js     # EMI amortization schedules & math logic
│   ├── loan.js           # Loan checks & confidence scorer
│   ├── credit.js         # Needle rotation vectors & rating thresholds
│   ├── advisor.js        # markdown renders & local chatbot responses
│   ├── charts.js         # Donut Chart.js wrapper updates
│   └── api.js            # Sheets webhook dispatches & Claude API routers
│
├── data/                 # System Parameters
│   └── constants.js      # Underwriting caps, grading thresholds, & default delays
│
└── README.md             # Developer documentation
```

---

## 🔒 Session Security Interceptors

Under the hood, **`js/auth.js`** functions as a global security router:
- If a user tries to access `pages/dashboard.html` or other subpages directly without authentication, they are immediately redirected to root `/index.html`.
- On entering credentials (**`admin@finwise.ai`** / **`admin123`**), they are authenticated and redirected to `/pages/dashboard.html`.
- Sign-out buttons destroy active sessions and return them back to `/index.html`.

---

## 📊 Google Sheets Apps Script Integration

To enable spreadsheets logging:
1. Create a new Google Sheet.
2. Go to **Extensions** -> **Apps Script**.
3. Overwrite all content with this trigger script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Type", "Age", "Employment", "Net Income", 
        "Credit Score", "Existing EMIs", "Loan Amount", "Purpose", 
        "Approval Status", "Eligible Limit", "Risk Level", "DTI Ratio", 
        "Confidence Score", "Inquiry Message / Name", "Email"
      ]);
    }
    
    if (payload.type === "contact_form_inquiry") {
      sheet.appendRow([
        payload.timestamp, payload.type, 
        "", "", "", "", "", "", "", "", "", "", "", "", 
        payload.name + " (" + payload.message + ")", payload.email
      ]);
    } else {
      sheet.appendRow([
        payload.timestamp, "underwriting_telemetry",
        payload.age, payload.employment, payload.income,
        payload.creditScore, payload.existingEmi, payload.loanAmount,
        payload.purpose, payload.approvalStatus, payload.eligibleAmount,
        payload.riskLevel, payload.dtiRatio + "%", payload.confidenceScore + "%",
        "", ""
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Deploy web app: set Executed As: **Me** and Access: **Anyone**.
5. Save the Web App URL and paste it in the **Developer API** settings on the dashboard.

---

## 💻 Local Testing Guide

1. Open your terminal in VS Code.
2. Spin up a local server: `python -m http.server 8000`.
3. Open `http://localhost:8000` in your web browser.
4. Input credentials `admin@finwise.ai` / `admin123` to enter the dashboard.
