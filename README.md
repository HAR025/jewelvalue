# 💎 JewelValue — Liquid Gold Investment & Fine Jewellery

An ultra-modern, luxury gold investment and fine jewellery platform inspired by **Apple Water UI / Liquid Glass Design**, operating exclusively in **Indian Rupees (INR - ₹)**.

---

## 🌟 Features

- **Live Gold Rates (24K, 22K, 18K)**:
  - Powered by the real-time Indian Bullion Import Parity formula:
    $$\text{Final Landed Rate (10g)} = \left[ \left( \frac{\text{Live Spot } (\$/\text{oz})}{31.1035} \times \text{USD/INR Rate} \right) \times 10 \right] \times (1 + 0.165)$$
  - Real-time updates with live streaming indicators.
- **Dynamic Precision Valuation Calculator**:
  - Interactive fluid sliders for gold weight (grams) and artisan making charges.
  - Transparent breakdown of pure metal value, crafting fee, GST (3%), and equivalent vault gold grams.
- **Swarna SIP Wealth Builder**:
  - Auto-compounding wealth accumulation starting from ₹1,000/month with +3% bonus grams.
- **Swarna Varsha 11 + 1 Scheme**:
  - Pay 11 monthly installments, JewelValue contributes the 12th month for free + 0% making charges.
- **Curated Haute Joaillerie & Ingot Showcase**:
  - High-resolution luxury bullion bars, coins, bridal chokers, kada bangles, and solitaire diamond rings.
  - Dual checkout options: Pay via UPI/Card or **"Pay with Vault Gold"**.
- **Personal Brink's Gold Vault**:
  - Institutional allocated storage tracking physical grams, market valuation, and audit ledger.

---

## 📁 File Structure

```
jewelvalue/
│
├── index.html           # Main HTML5 layout with Apple Water UI
├── css/
│   └── style.css        # Liquid Glass design system, frosted blur & fluid sliders
├── js/
│   ├── data.js          # Product catalog, rates, and initial vault state
│   └── app.js           # Live formula engine, API fetching, calculator, and modals
└── assets/              # Icons and images
```

---

## 🚀 How to Run Locally

Simply open `index.html` in any web browser, or serve it using Python or Node.js:

```bash
# Using Node.js
npx serve .

# Or using Python
python -m http.server 3000
```

---

## 🌐 GitHub Pages Deployment

To view this site live on GitHub Pages:
1. Go to **Settings** > **Pages** in this GitHub repository.
2. Under **Branch**, select `main` and folder `/ (root)`.
3. Click **Save**.
4. Your website will be live at:
   `https://har025.github.io/jewelvalue/`
