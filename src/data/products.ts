export interface Product {
  id: string;
  name: string;
  category: "Medical" | "Critical Illness" | "Savings" | "Accident" | "Annuity" | "Life";
  isTaxDeductible: boolean;
  description: string;
  keyFeatures: string[];
  defaultPremium: number; // HKD per year estimate for 35yo male non-smoker
  protectionType: "Life Protection" | "Medical Reimbursement" | "Lump Sum Cash" | "Income Protection";
  savingsPotential: "Low" | "Medium" | "High";
  highlightBadge?: string; // New property for specific badges
  cashFlowType?: 'Generator' | 'Consumer';
  getEstimatedYearlyReturn?: (premium: number, year: number) => number;
  fundingStrategy?: 'Coupon' | 'Dividend' | 'TaxSavings'; // New property for funding logic
  pricingTier?: {
    type: 'Ward' | 'Deductible' | 'Standard';
    options: string[];
    defaultOption: string;
  };
  medicalCoverage?: {
    annualLimit?: string;
    lifetimeLimit?: string;
    wardClass?: string;
    deductibleOptions?: string[];
    majorBenefits?: { category: string; limit: string; description?: string }[];
  };
}

const defaultGeneratorReturn = (premium: number, year: number) => {
  if (year >= 3) return premium * 0.045;
  return 0;
};

const flReturn = (premium: number, year: number) => {
  if (year >= 1) return premium * 0.05; // Fixed coupon starting Year 1
  return 0;
};

export const products: Product[] = [
  {
    id: "AVHIF",
    name: "AIA Voluntary Health Insurance Flexi Scheme",
    category: "Medical",
    isTaxDeductible: true,
    description: "A flexible VHIS plan that offers comprehensive medical protection with no lifetime benefit limit and full cover for major items.",
    keyFeatures: [
      "Full cover for hospitalization & surgery",
      "Guaranteed lifetime renewal",
      "Tax deduction eligibility",
      "No lifetime benefit limit",
      "Supplementary Major Medical (SMM) safety net"
    ],
    defaultPremium: 5855,
    pricingTier: {
      type: 'Ward',
      options: ['Ward', 'Semi-Private', 'Private'],
      defaultOption: 'Ward'
    },
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low",
    highlightBadge: "Tax Deduction",
    cashFlowType: 'Consumer',
    medicalCoverage: {
      annualLimit: "Nil (Per Disability Limits Apply)",
      lifetimeLimit: "Nil",
      wardClass: "Ward / Semi-Private / Private",
      deductibleOptions: ["Nil"],
      majorBenefits: [
        { category: "Room & Board", limit: "Ward: $1,100/day | Semi-Private: $2,400/day | Private: $4,400/day" },
        { category: "Surgical Fee", limit: "Up to $120,000 (Private) - Full Cover for Complex Surgeries" },
        { category: "Non-surgical Cancer", limit: "Ward: $96k | Semi-Private: $120k | Private: $180k per year" },
        { category: "Supplementary Major Medical (SMM)", limit: "Extra cover up to $480,000/year (Private)" },
        { category: "Coinsurance (SMM)", limit: "Ward: 15% | Semi-Private/Private: 20%" }
      ]
    }
  },
  {
    id: "AVHIP",
    name: "AIA Voluntary Health Insurance Privilege Ultra Scheme (AVPU)",
    category: "Medical",
    isTaxDeductible: true,
    description: "High-end VHIS Certified Flexi Plan designed to provide full reimbursement for major medical expenses with high benefit limits and special cancer/stroke support.",
    keyFeatures: [
      "Annual Limit: HKD 12M | Lifetime Limit: HKD 60M",
      "Full Cover for Hospitalization, Surgery & Non-surgical Cancer",
      "Unknown Pre-existing Conditions covered from Day 31",
      "Special support for Cancer (Clinical Trials) & Stroke Rehabilitation",
      "Stage-of-Life Health Check-up every 3 years"
    ],
    defaultPremium: 11320,
    pricingTier: {
      type: 'Deductible',
      options: [
        'Asia - HKD 0', 
        'Asia - HKD 16,000', 
        'Asia - HKD 25,000', 
        'Asia - HKD 50,000',
        'Worldwide - HKD 0', 
        'Worldwide - HKD 16,000', 
        'Worldwide - HKD 25,000', 
        'Worldwide - HKD 50,000'
      ],
      defaultOption: 'Asia - HKD 0'
    },
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low",
    highlightBadge: "Tax Deduction",
    cashFlowType: 'Consumer',
    medicalCoverage: {
      annualLimit: "HKD 12,000,000",
      lifetimeLimit: "HKD 60,000,000",
      wardClass: "Semi-Private (Asia) / Standard Private (Global)",
      deductibleOptions: ["HKD 0", "HKD 16,000", "HKD 25,000", "HKD 50,000"],
      majorBenefits: [
        { category: "Room & Board", limit: "Full Cover" },
        { category: "Surgical Fee", limit: "Full Cover" },
        { category: "Non-surgical Cancer", limit: "Full Cover" },
        { category: "Cancer Clinical Trials", limit: "HKD 500,000 / year (Stage 3 & 4)" },
        { category: "Stroke Rehabilitation", limit: "HKD 50,000 (Home mod) + HKD 5,000/month subsidy" }
      ]
    }
  },
  {
    id: "AVHIS",
    name: "AIA Voluntary Health Insurance SelectWise Scheme",
    category: "Medical",
    isTaxDeductible: true,
    description: "A VHIS Flexi Plan offering high-end medical protection at an affordable premium by incentivizing the use of designated hospital networks.",
    keyFeatures: [
      "Annual Limit: HKD 12M | Lifetime Limit: HKD 60M",
      "Full Cover for major medical expenses",
      "Upgrade to Semi-Private/Private at Designated Hospitals",
      "Unknown Pre-existing Conditions covered from Day 31",
      "Special support for Cancer, Stroke Rehab & Day Surgery"
    ],
    defaultPremium: 7416,
    pricingTier: {
      type: 'Deductible',
      options: [
        'HKD 0', 
        'HKD 8,800', 
        'HKD 18,000', 
        'HKD 30,000', 
        'HKD 55,000'
      ],
      defaultOption: 'HKD 0'
    },
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low",
    highlightBadge: "Tax Deduction",
    cashFlowType: 'Consumer',
    medicalCoverage: {
      annualLimit: "HKD 12,000,000",
      lifetimeLimit: "HKD 60,000,000",
      wardClass: "General Ward (Upgradeable to Semi-Private/Private at Designated Hospitals)",
      deductibleOptions: ["HKD 0", "HKD 8,800", "HKD 18,000", "HKD 30,000", "HKD 55,000"],
      majorBenefits: [
        { category: "Room & Board", limit: "Full Cover" },
        { category: "Surgical Fee", limit: "Full Cover" },
        { category: "Non-surgical Cancer", limit: "Full Cover" },
        { category: "Stroke Rehabilitation", limit: "HKD 50,000 (Home mod) + HKD 5,000/month subsidy" }
      ]
    }
  },
  {
    id: "AVHISS",
    name: "AIA Voluntary Health Insurance Standard Scheme",
    category: "Medical",
    isTaxDeductible: true,
    description: "A VHIS Standard Plan certified by the Hong Kong Government, providing essential medical coverage with guaranteed renewal up to age 100.",
    keyFeatures: [
      "Annual Benefit Limit: HKD 420,000",
      "Guaranteed Renewal up to Age 100",
      "Tax Deduction Eligibility",
      "Unknown Pre-existing Conditions Coverage (gradual)"
    ],
    defaultPremium: 2443,
    pricingTier: {
      type: 'Standard',
      options: ['Standard'],
      defaultOption: 'Standard'
    },
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low",
    highlightBadge: "Tax Deduction",
    cashFlowType: 'Consumer',
    medicalCoverage: {
      annualLimit: "HKD 420,000",
      lifetimeLimit: "Nil",
      wardClass: "General Ward",
      majorBenefits: [
        { category: "Room & Board", limit: "HKD 750 / day" },
        { category: "Surgical Fee", limit: "HKD 50,000 / surgery (Complex)" },
        { category: "Prescribed Non-surgical Cancer", limit: "HKD 80,000 / year" },
        { category: "Prescribed Diagnostic Imaging", limit: "HKD 20,000 / year (30% Co-insurance)" }
      ]
    }
  },
  {
    id: "BP",
    name: "AIA Bonus Power Plan",
    category: "Savings",
    isTaxDeductible: false,
    description: "Long-term savings plan with potential for capital growth through reversionary bonuses.",
    keyFeatures: [
      "Potential capital growth",
      "Reversionary and terminal bonuses",
      "Flexible premium payment terms",
      "Life protection component"
    ],
    defaultPremium: 15000,
    protectionType: "Life Protection",
    savingsPotential: "High",
    highlightBadge: "Wealth Accumulation",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'Dividend'
  },
  {
    id: "DA",
    name: "AIA Deferred Annuity Plan",
    category: "Annuity",
    isTaxDeductible: true,
    description: "Qualifying Deferred Annuity Policy (QDAP) designed for retirement income with tax benefits.",
    keyFeatures: [
      "Guaranteed monthly annuity income",
      "Tax deduction eligibility",
      "Flexible premium payment periods",
      "Guaranteed cash value"
    ],
    defaultPremium: 30000,
    protectionType: "Income Protection",
    savingsPotential: "High",
    highlightBadge: "Tax Deduction",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'TaxSavings'
  },
  {
    id: "ETL",
    name: "AIA Executive Term Life",
    category: "Life",
    isTaxDeductible: false,
    description: "Pure term life insurance providing high protection at affordable rates for a fixed term.",
    keyFeatures: [
      "High sum assured at low cost",
      "Guaranteed renewable",
      "Convertible to permanent plan",
      "Flexible policy terms"
    ],
    defaultPremium: 1800,
    protectionType: "Life Protection",
    savingsPotential: "Low",
    cashFlowType: 'Consumer'
  },
  {
    id: "FL",
    name: "AIA Fortune Life",
    category: "Savings",
    isTaxDeductible: false,
    description: "Savings insurance plan focusing on wealth accumulation and legacy planning.",
    keyFeatures: [
      "Wealth accumulation focus",
      "Flexible withdrawal options",
      "Legacy planning tools",
      "Change of insured option"
    ],
    defaultPremium: 20000,
    protectionType: "Life Protection",
    savingsPotential: "Medium",
    highlightBadge: "Guaranteed Cash",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: flReturn,
    fundingStrategy: 'Coupon'
  },
  {
    id: "GF",
    name: "AIA Global Future",
    category: "Savings",
    isTaxDeductible: false,
    description: "Savings plan offering global investment opportunities and currency flexibility.",
    keyFeatures: [
      "Global investment access",
      "Currency switching options",
      "Potential for higher returns",
      "Wealth transfer features"
    ],
    defaultPremium: 25000,
    protectionType: "Life Protection",
    savingsPotential: "Medium",
    highlightBadge: "Wealth Accumulation",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'Dividend'
  },
  {
    id: "GP",
    name: "AIA Global Power Multi-Currency Plan",
    category: "Savings",
    isTaxDeductible: false,
    description: "Multi-currency savings plan designed for long-term wealth growth and flexibility.",
    keyFeatures: [
      "Multi-currency options (up to 9 currencies)",
      "High long-term savings potential",
      "Bonus lock-in option",
      "Policy split option"
    ],
    defaultPremium: 35000,
    protectionType: "Life Protection",
    savingsPotential: "High",
    highlightBadge: "Wealth Accumulation",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'Dividend'
  },
  {
    id: "OYS",
    name: "AIA On Your Side Plan",
    category: "Critical Illness",
    isTaxDeductible: false,
    description: "Comprehensive critical illness protection with multiple claims and continuous support.",
    keyFeatures: [
      "Covers multiple critical illnesses",
      "Continuous protection after claims",
      "Health management services",
      "Early stage coverage"
    ],
    defaultPremium: 5500,
    protectionType: "Lump Sum Cash",
    savingsPotential: "Low",
    highlightBadge: "Critical Illness Protection",
    cashFlowType: 'Consumer',
    medicalCoverage: {
      annualLimit: "N/A (Lump Sum)",
      lifetimeLimit: "Multiple Claims (up to 900%)",
      wardClass: "N/A",
      majorBenefits: [
        { category: "Major CI", limit: "100% Sum Assured", description: "Cancer, Heart Attack, Stroke" },
        { category: "Early Stage CI", limit: "20% Sum Assured" },
        { category: "Cancer", limit: "Multiple Claims up to 80" },
        { category: "ICU Support", limit: "20% Sum Assured" }
      ]
    }
  },
  {
    id: "plp",
    name: "AIA Protect Life Plan",
    category: "Life",
    isTaxDeductible: false,
    description: "Whole life protection plan ensuring financial security for loved ones.",
    keyFeatures: [
      "Lifetime life protection",
      "Guaranteed cash value",
      "Level premiums",
      "Supplementary rider options"
    ],
    defaultPremium: 4200,
    protectionType: "Life Protection",
    savingsPotential: "Low",
    cashFlowType: 'Consumer'
  },
  {
    id: "SCE",
    name: "AIA Smart Care Executive",
    category: "Medical",
    isTaxDeductible: false,
    description: "Comprehensive medical plan designed for executives with extensive hospital coverage.",
    keyFeatures: [
      "Full reimbursement for hospitalization",
      "High annual limit",
      "Worldwide coverage (excluding USA)",
      "Guaranteed renewal"
    ],
    defaultPremium: 6000,
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low",
    cashFlowType: 'Consumer',
    medicalCoverage: {
      annualLimit: "HKD 2,000,000",
      lifetimeLimit: "Nil",
      wardClass: "Semi-Private",
      majorBenefits: [
        { category: "Room & Board", limit: "Full Cover" },
        { category: "Surgical Fee", limit: "Full Cover" },
        { category: "SMM", limit: "Subject to 20% Co-insurance" },
        { category: "Outpatient Surgery", limit: "Full Cover" }
      ]
    }
  },
  {
    id: "SP",
    name: "AIA Simply Love",
    category: "Savings",
    isTaxDeductible: false,
    description: "Short-term savings plan with guaranteed returns and life protection.",
    keyFeatures: [
      "Guaranteed cash value",
      "Short premium payment term",
      "Life protection included",
      "Easy application"
    ],
    defaultPremium: 10000,
    protectionType: "Life Protection",
    savingsPotential: "High",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'Coupon'
  },
  {
    id: "SSP",
    name: "AIA Simply Love Plus",
    category: "Savings",
    isTaxDeductible: false,
    description: "Enhanced savings plan offering higher potential returns and flexibility.",
    keyFeatures: [
      "Higher potential returns",
      "Flexible premium terms",
      "Wealth accumulation",
      "Life insurance benefit"
    ],
    defaultPremium: 12000,
    protectionType: "Life Protection",
    savingsPotential: "High",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'Coupon'
  },
  {
    id: "XP",
    name: "AIA Executive Protection",
    category: "Accident",
    isTaxDeductible: false,
    description: "Personal accident protection plan for executives and professionals.",
    keyFeatures: [
      "Accidental death and disablement cover",
      "Double indemnity for public transport",
      "Medical expenses reimbursement",
      "Global coverage"
    ],
    defaultPremium: 1200,
    protectionType: "Lump Sum Cash",
    savingsPotential: "Low",
    cashFlowType: 'Consumer'
  },
  {
    id: "SuperKids",
    name: "AIA Super Kids Shield",
    category: "Accident",
    isTaxDeductible: false,
    description: "Accident protection specially designed for children aged 2-17.",
    keyFeatures: [
      "Double indemnity for school bus accidents",
      "Medical expenses reimbursement",
      "Major burns benefit",
      "No claim bonus"
    ],
    defaultPremium: 1500,
    protectionType: "Lump Sum Cash",
    savingsPotential: "Low",
    highlightBadge: "Family Protection",
    cashFlowType: 'Consumer'
  },
  {
    id: "SuperAdults",
    name: "AIA Super Adults Shield",
    category: "Accident",
    isTaxDeductible: false,
    description: "Comprehensive accident protection for adults aged 18-65.",
    keyFeatures: [
      "High accidental death benefit",
      "Disablement coverage",
      "Worldwide protection",
      "Daily hospital income"
    ],
    defaultPremium: 2000,
    protectionType: "Lump Sum Cash",
    savingsPotential: "Low",
    highlightBadge: "Family Protection",
    cashFlowType: 'Consumer'
  },
  {
    id: "SuperSeniors",
    name: "AIA Super Seniors Shield",
    category: "Accident",
    isTaxDeductible: false,
    description: "Tailored accident protection for seniors aged 50-70.",
    keyFeatures: [
      "Broken bones benefit",
      "Mobility aid reimbursement",
      "Home nursing allowance",
      "24-hour emergency assistance"
    ],
    defaultPremium: 2500,
    protectionType: "Lump Sum Cash",
    savingsPotential: "Low",
    highlightBadge: "Family Protection",
    cashFlowType: 'Consumer'
  },
  {
    id: "TMP2",
    name: "AIA Treasure Master Plus 2",
    category: "Savings",
    isTaxDeductible: false,
    description: "An Investment-Linked Assurance Scheme (ILAS) for long-term wealth accumulation (recommended >8 years). Features diverse investment options, Welcome and Long-term bonuses, and legacy planning tools. Note: This product involves investment risks and high upfront charges in the first 5 years.",
    keyFeatures: [
      "Single Premium (Min: HKD 48,000 / USD 6,000)",
      "Welcome Bonus: 1.25% of Premium (Subject to 5-year clawback)",
      "Long-term Customer Bonus: Monthly from 6th Policy Year",
      "Death Benefit: Higher of (100% Premium - Withdrawals) or 105% Account Value (Age ≤80)",
      "Legacy: Change of Insured (from Year 3) & Second Insured Option",
      "Fees: 1.35% p.a. Upfront (First 5 Years) + 1% p.a. Account Fee",
      "Liquidity: Flexible withdrawals (Charges & Bonus Clawback apply in first 5 years)"
    ],
    defaultPremium: 48000,
    protectionType: "Life Protection",
    savingsPotential: "High",
    highlightBadge: "ILAS & Legacy",
    cashFlowType: 'Generator',
    getEstimatedYearlyReturn: defaultGeneratorReturn,
    fundingStrategy: 'Dividend'
  }
];
