import { PortfolioItem } from "../store/useStore";
import { Product } from "../data/products";
import { getVHISPremium } from "../data/pricingTables";

export interface ProjectionInput {
  savingsPremium: number;
  savingsPaymentTerm?: number; // Default to 10 if not provided
  savingsGrowthRate?: number; // Default to 4.5% if not provided
  initialMedicalPremium: number;
  medicalInflationRate?: number; // Default to 3% if not provided
  startingAge?: number; // Default to 30 if not provided
  fundingStrategy?: 'Coupon' | 'Dividend' | 'TaxSavings'; // Add strategy
  fundingStartYear?: number; // Year to start paying linked premiums (default 1)
}

export interface ProjectionResult {
  isSustainable: boolean;
  depletionYear: number | null; // Year relative to start (e.g., 15)
  depletionAge: number | null; // Age when funds run out
  crossoverYear: number | null; // Year when annual return >= medical cost
  finalWealth: number; // Value at end of projection
  cashFlow: {
    year: number;
    age: number;
    savingsValue: number; // The "Net" value
    untouchedSavingsValue: number; // The "Gross" value (if no medical paid)
    cumulativeMedicalCost: number; // Total medical paid so far
    medicalCost: number; // Annual cost
    annualReturn: number; // Interest earned this year
  }[];
}

export interface PremiumScheduleResult {
  year: number;
  age: number;
  totalPremium: number;
  breakdown: Record<string, number>;
}

export const calculateFundingProjection = (input: ProjectionInput): ProjectionResult => {
  const {
    savingsPremium,
    savingsPaymentTerm = 10,
    savingsGrowthRate = 0.045,
    initialMedicalPremium,
    medicalInflationRate = 0.03,
    startingAge = 35,
    fundingStrategy = 'Dividend', // Default to Dividend/Growth strategy
    fundingStartYear = 1,
  } = input;

  const cashFlow = [];
  let currentSavingsValue = 0;
  let untouchedSavingsValue = 0;
  let currentMedicalCost = initialMedicalPremium;
  let cumulativeMedicalCost = 0;
  
  let isSustainable = true;
  let depletionYear: number | null = null;
  let depletionAge: number | null = null;
  let crossoverYear: number | null = null;

  // Simulate 50 years into the future or until age 100
  const projectionYears = 100 - startingAge;

  for (let year = 1; year <= projectionYears; year++) {
    const currentAge = startingAge + year;
    
    // 1. Add Premium (if within payment term)
    const premiumIn = year <= savingsPaymentTerm ? savingsPremium : 0;

    // --- Untouched Scenario ---
    // Start + Premium
    const startUntouched = untouchedSavingsValue + premiumIn;
    // Growth
    untouchedSavingsValue = startUntouched * (1 + savingsGrowthRate);

    // --- Net Scenario ---
    // Start + Premium
    const startNet = currentSavingsValue + premiumIn;
    
    // Calculate Annual "Return" or "Income" available for funding
    let annualIncome = 0;
    
    // Is funding active this year?
    const isFundingActive = year >= fundingStartYear;

    if (fundingStrategy === 'TaxSavings') {
      // Tax Savings: 17% of premium paid THIS year
      annualIncome = premiumIn * 0.17; 
      
      const potGrowth = startNet * savingsGrowthRate;
      
      // Let's separate "Pot Growth" from "Funding Source"
      currentSavingsValue = startNet + potGrowth;
      
      // For crossover check: Does Tax Refund cover Medical Cost?
      if (crossoverYear === null && isFundingActive && (premiumIn * 0.17) >= currentMedicalCost) {
        crossoverYear = year;
      }
      
    } else if (fundingStrategy === 'Coupon') {
      // Forever Love: Fixed Coupon
      const premiumBase = Math.min(savingsPremium * savingsPaymentTerm, savingsPremium * year);
      annualIncome = premiumBase * 0.05; 
      
      currentSavingsValue = startNet + (startNet * 0.02); 
      
      if (crossoverYear === null && isFundingActive && annualIncome >= currentMedicalCost) {
        crossoverYear = year;
      }
      
      // Use Coupon to pay first - ONLY if funding is active
      if (isFundingActive) {
        if (annualIncome >= currentMedicalCost) {
          // Covered by coupon! 
        } else {
          // Coupon not enough. Withdraw difference from principal.
          const shortfall = currentMedicalCost - annualIncome;
          currentSavingsValue -= shortfall;
        }
      }

    } else {
      // Standard Dividend/Growth (Bonus Power, etc.)
      const annualGrowth = startNet * savingsGrowthRate;
      annualIncome = annualGrowth;
      
      if (crossoverYear === null && isFundingActive && annualIncome >= currentMedicalCost) {
        crossoverYear = year;
      }
      
      // Standard Withdrawal Logic
      currentSavingsValue = startNet + annualGrowth;
      
      if (isFundingActive) {
        currentSavingsValue -= currentMedicalCost;
      }
    }

    // --- Special Handling for Tax Savings Strategy (Non-depleting) ---
    if (fundingStrategy === 'TaxSavings') {
        const taxRefund = year <= savingsPaymentTerm ? savingsPremium * 0.17 : 0;
        
        if (isFundingActive) {
          if (taxRefund < currentMedicalCost) {
              if (isSustainable) { 
                  isSustainable = false;
                  depletionYear = year; 
                  depletionAge = currentAge;
              }
          }
        }
        // Visual: Savings Value is the DA Value (Untouched effectively)
        currentSavingsValue = startNet * (1 + savingsGrowthRate); 
    }

    // Record Flow
    cashFlow.push({
      year,
      age: currentAge,
      savingsValue: Math.max(0, currentSavingsValue),
      untouchedSavingsValue,
      cumulativeMedicalCost: isFundingActive ? cumulativeMedicalCost + currentMedicalCost : cumulativeMedicalCost, // Visualize accum cost only when active? Or always? Let's track cumulative paid.
      medicalCost: currentMedicalCost,
      annualReturn: annualIncome
    });

    if (isFundingActive) {
      cumulativeMedicalCost += currentMedicalCost;
    }

    // Check for Depletion (Standard Strategy)
    if (fundingStrategy !== 'TaxSavings' && currentSavingsValue < 0) {
      isSustainable = false;
      if (depletionYear === null) {
        depletionYear = year;
        depletionAge = currentAge;
      }
      currentSavingsValue = 0; 
    }

    // Inflate Medical Cost for next year
    currentMedicalCost *= (1 + medicalInflationRate);
  }

  return {
    isSustainable,
    depletionYear,
    depletionAge,
    crossoverYear,
    finalWealth: Math.round(currentSavingsValue),
    cashFlow,
  };
};

export const calculatePremiumSchedule = (
  portfolio: PortfolioItem[],
  products: Product[],
  currentAge: number = 35,
  gender: string = 'male'
): PremiumScheduleResult[] => {
  const schedule: PremiumScheduleResult[] = [];
  const maxAge = 100;
  const projectionYears = maxAge - currentAge;

  for (let year = 1; year <= projectionYears; year++) {
    const age = currentAge + year;
    let totalPremium = 0;
    const breakdown: Record<string, number> = {};

    portfolio.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      let itemPremium = 0;
      
      // Determine Payment Duration & Type
      const isLimitedPay = ['Savings', 'Annuity', 'Life'].includes(product.category);
      // Default to 10 years for limited pay if not set, or 100 (life) for others if not set
      // BUT we used item.paymentTerm default in store now.
      const paymentTerm = item.paymentTerm || (isLimitedPay ? 10 : 100); 

      // Check if within payment term
      if (year <= paymentTerm) {
        if (isLimitedPay) {
          // Fixed Premium
          itemPremium = item.premium;
        } else if (product.category === 'Medical' && product.pricingTier) {
          // --- VHIS Age-Based Pricing ---
          // Use the lookup table for exact premium at this specific age
          // item.selectedVariant should be something like "Ward", "Deductible 0", etc.
          // Fallback to inflation logic if lookup fails or variant missing
          const tablePremium = getVHISPremium(product.id, age, item.selectedVariant || product.pricingTier.defaultOption, gender);
          
          if (tablePremium > 0) {
            itemPremium = tablePremium;
          } else {
            // Fallback: Inflation from base
            const inflationRate = 0.03;
            itemPremium = item.premium * Math.pow(1 + inflationRate, year - 1);
          }
        } else {
          // Inflationary Premium (Medical/CI)
          // Assume 3% inflation per year for Medical/CI
          // Year 1 = Base Premium. Year 2 = Base * 1.03...
          const inflationRate = 0.03;
          itemPremium = item.premium * Math.pow(1 + inflationRate, year - 1);
        }
      }

      if (itemPremium > 0) {
        totalPremium += itemPremium;
        // Group by Product Name or Category? Let's use Name for detail
        breakdown[product.name] = (breakdown[product.name] || 0) + itemPremium;
      }
    });

    schedule.push({
      year,
      age,
      totalPremium,
      breakdown
    });
  }

  return schedule;
};
