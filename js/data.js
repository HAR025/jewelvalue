// JewelValue Data Store — Exclusively in INR (₹) with Live Formula Calculation
const DATA = {
  currency: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee'
  },

  // Formula parameters
  formulaConfig: {
    troyOunceGrams: 31.1035,
    importDutyPercent: 16.5,
    lastFetchedTime: null
  },

  // Live Formula State (updated dynamically from live APIs)
  formulaState: {
    goldSpotUSD: 4148.50,         // Live $/oz
    usdInrRate: 95.32,            // Live USD to INR
    usdPerGram: 133.377,          // goldSpotUSD / 31.1035
    inrPerGramBase: 12713.41,     // usdPerGram * usdInrRate
    inr10gBase: 127134.10,        // inrPerGramBase * 10
    duty10g: 20977.13,            // inr10gBase * 16.5%
    landed10g: 148111.23,         // inr10gBase + duty10g
    landedPerGram24k: 14811.12    // landed10g / 10
  },

  initialRates: {
    '24K': {
      label: '24K Gold',
      purity: '99.9% Pure Swiss Bullion',
      buyINR: 14811.12,
      sellINR: 14663.00,
      change24h: +1.42
    },
    '22K': {
      label: '22K Gold',
      purity: '91.6% BIS 916 Hallmark',
      buyINR: 13567.00,
      sellINR: 13431.00,
      change24h: +1.28
    },
    '18K': {
      label: '18K Gold',
      purity: '75.0% Diamond Setting Gold',
      buyINR: 11108.00,
      sellINR: 10996.00,
      change24h: +0.95
    },
    'SILVER': {
      label: '999 Silver',
      purity: '99.9% Fine Bullion Silver',
      buyINR: 105.50,
      sellINR: 103.00,
      change24h: +2.15
    }
  },

  products: [
    {
      id: 'jv-1',
      name: 'Swiss Minted 24K Gold Ingot (10g)',
      category: 'bullion',
      purity: '24K',
      karatLabel: '24K 999.9 Bullion',
      weightGrams: 10.0,
      makingChargePercent: 2.5,
      image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
      description: 'Individually numbered 10g 999.9 pure investment bar in tamper-evident certicard with assay authenticity guarantee.',
      certifications: ['LBMA Good Delivery', 'Swiss Refinery Stamped', 'Brink\'s Insured'],
      rating: 4.95,
      reviews: 312
    },
    {
      id: 'jv-2',
      name: 'Aura Crown 18K Solitaire Diamond Ring',
      category: 'rings',
      purity: '18K',
      karatLabel: '18K Fine Gold',
      weightGrams: 5.4,
      diamondCarat: 0.85,
      makingChargePercent: 12.0,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      description: 'Handcrafted six-prong cathedral ring in 18K solid yellow gold crowned with an IGI certified brilliant solitaire.',
      certifications: ['IGI Diamond Certified', 'Hallmark 750', 'Lifetime Polish'],
      rating: 4.98,
      reviews: 184
    },
    {
      id: 'jv-3',
      name: 'Elysian 22K Royal Heritage Choker',
      category: 'necklaces',
      purity: '22K',
      karatLabel: '22K 916 Hallmark',
      weightGrams: 34.5,
      makingChargePercent: 14.0,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      description: 'Intricately filigreed bridal choker necklace inspired by royal heirlooms with micro-beaded gold droplets.',
      certifications: ['BIS 916 Stamped', 'Master Artisan Certified', 'Insured Delivery'],
      rating: 4.92,
      reviews: 96
    },
    {
      id: 'jv-4',
      name: 'Luminous 22K Fluted Kada Bangles (Pair)',
      category: 'bangles',
      purity: '22K',
      karatLabel: '22K 916 Hallmark',
      weightGrams: 28.0,
      makingChargePercent: 11.5,
      image: 'https://images.unsplash.com/photo-1611591475155-42ac629938b8?auto=format&fit=crop&w=800&q=80',
      description: 'Pair of precision-fluted solid kada bangles with mirror-finish facets designed for lifetime heirloom wear.',
      certifications: ['BIS Hallmarked', 'Zero Weight Loss Guarantee', 'Instant Buyback'],
      rating: 4.89,
      reviews: 118
    },
    {
      id: 'jv-5',
      name: 'Imperial 24K Lakshmi & Ganesha Coin (20g)',
      category: 'bullion',
      purity: '24K',
      karatLabel: '24K 999.9 Pure',
      weightGrams: 20.0,
      makingChargePercent: 3.0,
      image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      description: 'High-relief laser minted 20g 24K gold coin symbolizing abundance and divine blessings in tamper-proof blister pack.',
      certifications: ['Assay Certified 999.9', 'Tamper Evident Pack', 'Free Custody Storage'],
      rating: 4.97,
      reviews: 245
    },
    {
      id: 'jv-6',
      name: 'Celeste 18K Emerald Drop Earrings',
      category: 'earrings',
      purity: '18K',
      karatLabel: '18K Fine Gold',
      weightGrams: 7.8,
      diamondCarat: 0.45,
      makingChargePercent: 13.0,
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      description: 'Deep Colombian emerald teardrops haloed by micro-pave natural diamonds set in 18K radiant gold.',
      certifications: ['IGI Verified', 'Natural Gemstone Assay', 'Secure Comfort Post'],
      rating: 4.91,
      reviews: 74
    }
  ],

  initialVault: {
    grams: 14.850,
    lockerId: 'JV-8412-BRINKS',
    history: [
      { id: 1, type: 'buy', desc: 'Acquired 10g 24K Swiss Bullion', grams: 10.0, date: '12 Oct 2026' },
      { id: 2, type: 'sip', desc: 'Monthly Swarna SIP Auto-Debit', grams: 4.85, date: '14 Oct 2026' }
    ]
  }
};
