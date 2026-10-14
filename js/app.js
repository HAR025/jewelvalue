// JewelValue — Live Gold Import Parity Engine (Formula: Spot / 31.1035 * USD_INR * 10 + 16.5% Duty)

document.addEventListener('DOMContentLoaded', () => {
  // App State
  let liveRates = { ...DATA.initialRates };
  let vault = { ...DATA.initialVault };
  let formula = { ...DATA.formulaState };
  let cart = [
    { ...DATA.products[0], quantity: 1 }
  ];

  // DOM Elements - Clean 24K, 22K, 18K Live Rate Cards
  const rate24k10gElem = document.getElementById('rate24k10g');
  const rate24kPerGramElem = document.getElementById('rate24kPerGram');
  const rate22k10gElem = document.getElementById('rate22k10g');
  const rate22kPerGramElem = document.getElementById('rate22kPerGram');
  const rate18k10gElem = document.getElementById('rate18k10g');
  const rate18kPerGramElem = document.getElementById('rate18kPerGram');
  const ratesLiveIndicatorElem = document.getElementById('ratesLiveIndicator');
  const refreshRatesBtn = document.getElementById('refreshRatesBtn');

  // DOM Elements - General
  const vaultPillGrams = document.getElementById('vaultPillGrams');
  const cartBadge = document.getElementById('cartBadge');
  const ratesStreamContainer = document.getElementById('ratesStreamContainer');
  const productsGrid = document.getElementById('productsGrid');

  // Calculator Elements
  const calcWeightSlider = document.getElementById('calcWeightSlider');
  const calcWeightValue = document.getElementById('calcWeightValue');
  const calcKaratSelector = document.getElementById('calcKaratSelector');
  const calcMakingSlider = document.getElementById('calcMakingSlider');
  const calcMakingValue = document.getElementById('calcMakingValue');
  const calcMetalValue = document.getElementById('calcMetalValue');
  const calcMakingCharges = document.getElementById('calcMakingCharges');
  const calcTaxValue = document.getElementById('calcTaxValue');
  const calcTotalValue = document.getElementById('calcTotalValue');
  const calcGramsEquivalent = document.getElementById('calcGramsEquivalent');

  // Modals
  const vaultModal = document.getElementById('vaultModal');
  const cartModal = document.getElementById('cartModal');
  const toastCapsule = document.getElementById('toastCapsule');
  const toastMessage = document.getElementById('toastMessage');

  // Currency Formatter — Exclusively in INR (₹)
  function formatMoney(amountINR, showDecimals = false) {
    if (showDecimals) {
      return '₹' + amountINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '₹' + Math.round(amountINR).toLocaleString('en-IN');
  }

  // Toast Notification System
  function showToast(msg) {
    if (!toastMessage || !toastCapsule) return;
    toastMessage.textContent = msg;
    toastCapsule.classList.add('show');
    setTimeout(() => {
      toastCapsule.classList.remove('show');
    }, 4000);
  }

  // Master Formula Calculation: (Spot / 31.1035) * USD_INR * 10 + 16.5% duty
  function computeFormulaValues(spotUSD, usdInr) {
    const troyGrams = DATA.formulaConfig.troyOunceGrams; // 31.1035
    const dutyRate = DATA.formulaConfig.importDutyPercent / 100; // 0.165 (16.5%)

    // Step 1: Live dollar rate / 31.1035 gram of 1 troy
    const usdPerGram = spotUSD / troyGrams;

    // Step 2: Multiply by live dollar-inr price
    const inrPerGramBase = usdPerGram * usdInr;

    // Step 3: Multiply by 10 (value per 10 grams)
    const inr10gBase = inrPerGramBase * 10;

    // Step 4: Add + 16.5% customs duty
    const duty10g = inr10gBase * dutyRate;
    const landed10g = inr10gBase + duty10g; // or inr10gBase * 1.165

    // Per gram landed 24K rate
    const landedPerGram24k = landed10g / 10;

    formula = {
      goldSpotUSD: spotUSD,
      usdInrRate: usdInr,
      usdPerGram: usdPerGram,
      inrPerGramBase: inrPerGramBase,
      inr10gBase: inr10gBase,
      duty10g: duty10g,
      landed10g: landed10g,
      landedPerGram24k: landedPerGram24k
    };

    // Update Live Rates in Store
    liveRates['24K'].buyINR = landedPerGram24k;
    liveRates['24K'].sellINR = landedPerGram24k * 0.99;
    liveRates['22K'].buyINR = landedPerGram24k * (22 / 24);
    liveRates['22K'].sellINR = (landedPerGram24k * (22 / 24)) * 0.99;
    liveRates['18K'].buyINR = landedPerGram24k * (18 / 24);
    liveRates['18K'].sellINR = (landedPerGram24k * (18 / 24)) * 0.99;

    updateLiveRatesCards();
    renderRatesStream();
    updateValuationCalculator();
    renderProducts();
    updateVaultUI();
    updateCartUI();
  }

  // Update Clean 24K, 22K, 18K Live Rate Cards
  function updateLiveRatesCards() {
    const rate24k10g = formula.landed10g;
    const rate24k1g = formula.landedPerGram24k;
    const rate22k1g = liveRates['22K'].buyINR;
    const rate22k10g = rate22k1g * 10;
    const rate18k1g = liveRates['18K'].buyINR;
    const rate18k10g = rate18k1g * 10;

    if (rate24k10gElem) rate24k10gElem.textContent = formatMoney(rate24k10g);
    if (rate24kPerGramElem) rate24kPerGramElem.textContent = formatMoney(rate24k1g, true) + '/g';

    if (rate22k10gElem) rate22k10gElem.textContent = formatMoney(rate22k10g);
    if (rate22kPerGramElem) rate22kPerGramElem.textContent = formatMoney(rate22k1g, true) + '/g';

    if (rate18k10gElem) rate18k10gElem.textContent = formatMoney(rate18k10g);
    if (rate18kPerGramElem) rate18kPerGramElem.textContent = formatMoney(rate18k1g, true) + '/g';

    if (ratesLiveIndicatorElem) {
      const now = new Date();
      ratesLiveIndicatorElem.innerHTML = `
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #34D399; display: inline-block; box-shadow: 0 0 10px #34D399;"></span>
        Live (${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
      `;
    }
  }

  // Fetch Live Rates via Public APIs
  async function fetchLiveDollarAndInrRates() {
    if (refreshRatesBtn) {
      refreshRatesBtn.disabled = true;
      refreshRatesBtn.textContent = 'Updating...';
    }

    let fetchedSpot = formula.goldSpotUSD;
    let fetchedUsdInr = formula.usdInrRate;

    try {
      // 1. Fetch USD to INR live rate
      const inrRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (inrRes.ok) {
        const inrData = await inrRes.json();
        if (inrData.rates && inrData.rates.INR) {
          fetchedUsdInr = inrData.rates.INR;
        }
      }
    } catch (e) {
      console.warn('USD/INR fetch fallback:', e);
    }

    try {
      // 2. Fetch Live Gold Spot price in USD
      const goldRes = await fetch('https://api.gold-api.com/price/XAU');
      if (goldRes.ok) {
        const goldData = await goldRes.json();
        if (goldData.price) {
          fetchedSpot = goldData.price;
        }
      } else {
        // Fallback to CoinGecko PAX Gold Spot
        const fallbackRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd');
        if (fallbackRes.ok) {
          const fbData = await fallbackRes.json();
          if (fbData['pax-gold']?.usd) {
            fetchedSpot = fbData['pax-gold'].usd;
          }
        }
      }
    } catch (e) {
      console.warn('Gold spot fetch fallback:', e);
    }

    computeFormulaValues(fetchedSpot, fetchedUsdInr);
    showToast(`Updated live rates: Gold $${fetchedSpot.toFixed(2)}/oz • USD/INR ₹${fetchedUsdInr.toFixed(2)} • 10g + 16.5% Duty`);

    if (refreshRatesBtn) {
      refreshRatesBtn.disabled = false;
      refreshRatesBtn.textContent = 'Refresh';
    }
  }

  // Render Top Floating Rates Stream in INR
  function renderRatesStream() {
    if (!ratesStreamContainer) return;
    const karats = ['24K', '22K', '18K', 'SILVER'];
    ratesStreamContainer.innerHTML = karats.map(k => {
      const item = liveRates[k];
      return `
        <div class="rate-item">
          <span class="rate-karat">${item.label}:</span>
          <span class="rate-val">${formatMoney(item.buyINR, true)}/g</span>
          <span class="rate-badge">+${item.change24h}%</span>
        </div>
      `;
    }).join('<span style="color: rgba(255,255,255,0.2)">•</span>');
  }

  // Update Vault UI
  function updateVaultUI() {
    if (vaultPillGrams) {
      vaultPillGrams.textContent = `${vault.grams.toFixed(3)}g`;
    }

    const modalGrams = document.getElementById('modalVaultGrams');
    const modalValue = document.getElementById('modalVaultValue');
    const historyList = document.getElementById('modalVaultHistory');

    if (modalGrams) modalGrams.textContent = `${vault.grams.toFixed(3)} grams`;
    if (modalValue) {
      const valINR = vault.grams * liveRates['24K'].buyINR;
      modalValue.textContent = formatMoney(valINR);
    }

    if (historyList) {
      historyList.innerHTML = vault.history.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); font-size: 13px;">
          <div>
            <div style="font-weight: 600; color: #FFF;">${item.desc}</div>
            <div style="font-size: 11px; color: #64748B;">${item.date}</div>
          </div>
          <div style="font-family: ui-monospace, monospace; font-weight: 700; color: ${item.grams >= 0 ? '#34D399' : '#FB7185'};">
            ${item.grams >= 0 ? '+' : ''}${item.grams.toFixed(3)}g
          </div>
        </div>
      `).join('');
    }
  }

  // Update Cart UI
  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
      cartBadge.textContent = totalCount;
      cartBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    }

    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartTotalWeight = document.getElementById('cartTotalWeight');
    const cartGoldGramsNeeded = document.getElementById('cartGoldGramsNeeded');

    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: #64748B;">
          Your jewellery bag is currently empty.
        </div>
      `;
      if (cartTotalPrice) cartTotalPrice.textContent = formatMoney(0);
      if (cartTotalWeight) cartTotalWeight.textContent = '0.00g';
      if (cartGoldGramsNeeded) cartGoldGramsNeeded.textContent = '0.000g';
      return;
    }

    let sumINR = 0;
    let sumWeight = 0;

    cartItemsList.innerHTML = cart.map(item => {
      const karatRateINR = liveRates[item.purity]?.buyINR || liveRates['24K'].buyINR;
      const metalINR = item.weightGrams * karatRateINR;
      const makingINR = metalINR * (item.makingChargePercent / 100);
      const diamondINR = (item.diamondCarat || 0) * 95000;
      const itemTotalINR = (metalINR + makingINR + diamondINR) * 1.03;
      const totalItemINR = itemTotalINR * item.quantity;

      sumINR += totalItemINR;
      sumWeight += item.weightGrams * item.quantity;

      return `
        <div style="display: flex; gap: 14px; align-items: center; padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 14px;" />
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; font-size: 14px; color: #FFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
            <div style="font-size: 12px; color: #94A3B8; margin-top: 2px;">${item.karatLabel} • ${item.weightGrams}g</div>
            <div style="font-family: ui-monospace, monospace; font-weight: 700; color: var(--gold-primary); font-size: 13px; margin-top: 4px;">
              ${formatMoney(totalItemINR)}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="cart-qty-btn" data-id="${item.id}" data-action="minus" style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); border: none; color: #FFF; cursor: pointer;">-</button>
            <span style="font-size: 13px; font-weight: 700; min-width: 16px; text-align: center;">${item.quantity}</span>
            <button class="cart-qty-btn" data-id="${item.id}" data-action="plus" style="width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.08); border: none; color: #FFF; cursor: pointer;">+</button>
          </div>
        </div>
      `;
    }).join('');

    if (cartTotalPrice) cartTotalPrice.textContent = formatMoney(sumINR);
    if (cartTotalWeight) cartTotalWeight.textContent = `${sumWeight.toFixed(2)}g`;
    if (cartGoldGramsNeeded) {
      const gramsRequired = (sumINR / liveRates['24K'].sellINR * 0.95).toFixed(3);
      cartGoldGramsNeeded.textContent = `${gramsRequired}g`;
    }

    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');
        const found = cart.find(i => i.id === id);
        if (!found) return;

        if (action === 'plus') found.quantity += 1;
        if (action === 'minus') {
          found.quantity -= 1;
          if (found.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
          }
        }
        updateCartUI();
      });
    });
  }

  // Calculate Precision Valuation in INR
  function updateValuationCalculator() {
    if (!calcWeightSlider) return;

    const weightGrams = parseFloat(calcWeightSlider.value) || 10;
    const selectedKarat = calcKaratSelector ? calcKaratSelector.value : '24K';
    const makingPercent = calcMakingSlider ? parseFloat(calcMakingSlider.value) : 10;

    if (calcWeightValue) calcWeightValue.textContent = `${weightGrams.toFixed(1)}g`;
    if (calcMakingValue) calcMakingValue.textContent = `${makingPercent}%`;

    const karatRateINR = liveRates[selectedKarat]?.buyINR || liveRates['24K'].buyINR;
    const metalValINR = weightGrams * karatRateINR;
    const makingValINR = metalValINR * (makingPercent / 100);
    const subtotalINR = metalValINR + makingValINR;
    const taxValINR = subtotalINR * 0.03; // 3% GST
    const totalValINR = subtotalINR + taxValINR;

    if (calcMetalValue) calcMetalValue.textContent = formatMoney(metalValINR);
    if (calcMakingCharges) calcMakingCharges.textContent = formatMoney(makingValINR);
    if (calcTaxValue) calcTaxValue.textContent = formatMoney(taxValINR);
    if (calcTotalValue) calcTotalValue.textContent = formatMoney(totalValINR);

    if (calcGramsEquivalent) {
      const equivalent24k = (totalValINR / liveRates['24K'].sellINR).toFixed(3);
      calcGramsEquivalent.textContent = `${equivalent24k} grams`;
    }
  }

  // Render Product Catalog in INR
  function renderProducts() {
    if (!productsGrid) return;

    productsGrid.innerHTML = DATA.products.map(product => {
      const karatRateINR = liveRates[product.purity]?.buyINR || liveRates['24K'].buyINR;
      const baseMetalCostINR = product.weightGrams * karatRateINR;
      const makingChargesINR = baseMetalCostINR * (product.makingChargePercent / 100);
      const diamondCostINR = (product.diamondCarat || 0) * 95000;
      const totalINR = (baseMetalCostINR + makingChargesINR + diamondCostINR) * 1.03;

      const gramsRequired = (totalINR / liveRates['24K'].sellINR).toFixed(3);

      return `
        <div class="liquid-card product-card">
          <div>
            <div class="product-image-box">
              <img src="${product.image}" alt="${product.name}" loading="lazy" />
              <span class="product-tag">${product.karatLabel}</span>
            </div>

            <div class="product-meta-row">
              <span style="font-size: 13px; font-weight: 700; color: var(--gold-primary); font-family: ui-monospace, monospace;">
                ${product.weightGrams}g Gold
              </span>
              <span style="font-size: 12px; color: #94A3B8;">
                ★ ${product.rating} (${product.reviews})
              </span>
            </div>

            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
              <div>
                <div style="font-size: 11px; color: #64748B; text-transform: uppercase;">Live Price (incl. 3% GST)</div>
                <div style="font-size: 19px; font-weight: 800; font-family: ui-monospace, monospace; color: var(--gold-primary);">
                  ${formatMoney(totalINR)}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; color: #64748B; text-transform: uppercase;">Vault Gold</div>
                <div style="font-size: 13px; font-weight: 700; color: #34D399; font-family: ui-monospace, monospace;">
                  ${gramsRequired}g
                </div>
              </div>
            </div>

            <div class="product-action-bar">
              <button class="btn btn-liquid-glass add-to-bag-btn" data-id="${product.id}">
                Add to Bag
              </button>
              <button class="btn btn-liquid-gold pay-gold-btn" data-id="${product.id}" data-grams="${gramsRequired}">
                Pay with Gold
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.add-to-bag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const prod = DATA.products.find(p => p.id === id);
        if (prod) {
          const existing = cart.find(i => i.id === id);
          if (existing) existing.quantity += 1;
          else cart.push({ ...prod, quantity: 1 });
          updateCartUI();
          showToast(`Added "${prod.name}" to your jewellery bag.`);
        }
      });
    });

    document.querySelectorAll('.pay-gold-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const gramsNeeded = parseFloat(e.target.getAttribute('data-grams'));
        const prod = DATA.products.find(p => p.id === id);

        if (vault.grams >= gramsNeeded) {
          vault.grams -= gramsNeeded;
          vault.history.unshift({
            id: Date.now(),
            type: 'redeem',
            desc: `Redeemed for ${prod.name}`,
            grams: -gramsNeeded,
            date: 'Today'
          });
          updateVaultUI();
          showToast(`Success! Redeemed ${gramsNeeded.toFixed(3)}g gold for "${prod.name}".`);
        } else {
          showToast(`Insufficient vault gold (${vault.grams.toFixed(2)}g available). You need ${gramsNeeded.toFixed(2)}g.`);
          openModal(vaultModal);
        }
      });
    });
  }

  // Modal Helpers
  function openModal(modal) {
    if (modal) modal.classList.add('open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('open');
  }

  // Navigation Modals
  document.getElementById('openVaultBtn')?.addEventListener('click', () => {
    updateVaultUI();
    openModal(vaultModal);
  });

  document.getElementById('openCartBtn')?.addEventListener('click', () => {
    updateCartUI();
    openModal(cartModal);
  });

  document.querySelectorAll('.modal-close-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      closeModal(vaultModal);
      closeModal(cartModal);
    });
  });

  [vaultModal, cartModal].forEach(m => {
    m?.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  // Calculator Inputs
  calcWeightSlider?.addEventListener('input', updateValuationCalculator);
  calcKaratSelector?.addEventListener('change', updateValuationCalculator);
  calcMakingSlider?.addEventListener('input', updateValuationCalculator);

  // Instant Buy Button from Calculator
  document.getElementById('calcInstantBuyBtn')?.addEventListener('click', () => {
    const weightGrams = parseFloat(calcWeightSlider.value) || 10;
    vault.grams += weightGrams;
    vault.history.unshift({
      id: Date.now(),
      type: 'buy',
      desc: `Allocated ${weightGrams}g 24K Pure Bullion to Vault`,
      grams: weightGrams,
      date: 'Today'
    });
    updateVaultUI();
    showToast(`Instant Allocation: ${weightGrams}g 24K Swiss Gold added to your Brink's vault!`);
  });

  // Tab Switcher in Console
  document.querySelectorAll('.console-tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.console-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const targetTab = e.target.getAttribute('data-tab');
      document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.style.display = 'block';
    });
  });

  // Checkout Buttons
  document.getElementById('checkoutCashBtn')?.addEventListener('click', () => {
    cart = [];
    updateCartUI();
    closeModal(cartModal);
    showToast('Payment successful via UPI / NetBanking! Your order has been placed with insured delivery.');
  });

  document.getElementById('checkoutGoldBtn')?.addEventListener('click', () => {
    const totalINR = cart.reduce((sum, item) => {
      const karatRateINR = liveRates[item.purity]?.buyINR || liveRates['24K'].buyINR;
      const metalINR = item.weightGrams * karatRateINR;
      const makingINR = metalINR * (item.makingChargePercent / 100);
      const diamondINR = (item.diamondCarat || 0) * 95000;
      return sum + ((metalINR + makingINR + diamondINR) * 1.03 * item.quantity);
    }, 0);

    const gramsRequired = parseFloat((totalINR / liveRates['24K'].sellINR * 0.95).toFixed(3));

    if (vault.grams >= gramsRequired) {
      vault.grams -= gramsRequired;
      vault.history.unshift({
        id: Date.now(),
        type: 'redeem',
        desc: `Shopping bag redemption with 5% bonus`,
        grams: -gramsRequired,
        date: 'Today'
      });
      cart = [];
      updateVaultUI();
      updateCartUI();
      closeModal(cartModal);
      showToast(`Success! Redeemed ${gramsRequired}g gold with 5% making charge bonus!`);
    } else {
      showToast(`Insufficient vault gold (${vault.grams.toFixed(2)}g available). You need ${gramsRequired}g.`);
    }
  });

  // Manual Refresh Button Listener
  refreshRatesBtn?.addEventListener('click', () => {
    fetchLiveDollarAndInrRates();
  });

  // Initialize with exact formula calculation
  computeFormulaValues(DATA.formulaState.goldSpotUSD, DATA.formulaState.usdInrRate);

  // Fetch live rates on launch
  fetchLiveDollarAndInrRates();

  // Auto-refresh every 60 seconds
  setInterval(fetchLiveDollarAndInrRates, 60000);
});
