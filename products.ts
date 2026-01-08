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
}

export const products: Product[] = [
  {
    id: "AVHIF",
    name: "AIA Voluntary Health Insurance Flexi Scheme",
    category: "Medical",
    isTaxDeductible: true,
    description: "A flexible VHIS plan that offers comprehensive medical protection with no lifetime benefit limit.",
    keyFeatures: [
      "Full cover for major budget items",
      "Guaranteed renewal up to age 100",
      "Tax deduction eligibility",
      "No lifetime benefit limit"
    ],
    defaultPremium: 4800,
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low"
  },
  {
    id: "AVHIP",
    name: "AIA Voluntary Health Insurance Privilege Scheme",
    category: "Medical",
    isTaxDeductible: true,
    description: "Premium VHIS plan offering superior medical coverage with high annual limits and extensive benefits.",
    keyFeatures: [
      "High annual benefit limit",
      "Full cover for hospitalization and surgery",
      "Tax deduction eligibility",
      "Global coverage options"
    ],
    defaultPremium: 8500,
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low"
  },
  {
    id: "AVHIS",
    name: "AIA Voluntary Health Insurance Standard Scheme",
    category: "Medical",
    isTaxDeductible: true,
    description: "Standard VHIS plan providing essential medical protection at an affordable premium.",
    keyFeatures: [
      "Essential hospital cover",
      "Guaranteed renewal up to age 100",
      "Tax deduction eligibility",
      " standardized policy terms"
    ],
    defaultPremium: 2500,
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low"
  },
  {
    id: "AVHISS",
    name: "AIA Voluntary Health Insurance Standard Plus",
    category: "Medical",
    isTaxDeductible: true,
    description: "Enhanced Standard VHIS plan with additional supplementary medical benefits.",
    keyFeatures: [
      "Enhanced hospital benefits",
      "Supplementary major medical coverage",
      "Tax deduction eligibility",
      "Affordable comprehensive option"
    ],
    defaultPremium: 3200,
    protectionType: "Medical Reimbursement",
    savingsPotential: "Low"
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
    savingsPotential: "High"
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
    savingsPotential: "High"
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
    savingsPotential: "Low"
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
    savingsPotential: "Medium"
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
    savingsPotential: "Medium"
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
    savingsPotential: "High"
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
    savingsPotential: "Low"
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
    savingsPotential: "Low"
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
    savingsPotential: "Low"
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
    savingsPotential: "High"
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
    savingsPotential: "High"
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
    savingsPotential: "Low"
  }
];

