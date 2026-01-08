import { create } from 'zustand';

interface UserProfile {
  name: string;
  age: number | '';
  gender: 'male' | 'female' | '';
  smokingStatus: 'smoker' | 'non-smoker' | '';
  monthlyBudget: number | '';
}

export interface PortfolioItem {
  instanceId: string;
  productId: string;
  premium: number;
  // Premium Offset / Funding Features
  linkedTo?: string; // ID of the parent Generator item
  isAutoPayEnabled?: boolean; // Only for Generators
  customReturnRate?: number; // Override default growth rate (e.g., 0.045)
  fundingStartYear?: number; // Year to start paying linked premiums (default 1)
  paymentTerm?: number; // Years to pay premium (default: 10 for Savings, 100/Life for others)
  selectedVariant?: string; // e.g. "Ward", "Semi-Private", "Deductible 0"
}

interface AppState {
  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  isProfileComplete: boolean;
  completeProfile: () => void;
  resetProfile: () => void;
  
  // Portfolio State
  portfolio: PortfolioItem[];
  addToPortfolio: (productId: string, defaultPremium: number, linkedTo?: string, selectedVariant?: string) => void;
  removeFromPortfolio: (instanceId: string) => void;
  updatePremium: (instanceId: string, amount: number) => void;
  toggleAutoPay: (instanceId: string) => void;
  updateItemSettings: (instanceId: string, settings: Partial<PortfolioItem>) => void;

  // Guide Mode State
  isGuideModeActive: boolean;
  currentGuideStep: number;
  setGuideMode: (isActive: boolean) => void;
  setGuideStep: (step: number) => void;
  nextGuideStep: () => void;
}

export const useStore = create<AppState>((set) => ({
  userProfile: {
    name: '',
    age: '',
    gender: '',
    smokingStatus: '',
    monthlyBudget: '',
  },
  isProfileComplete: false,
  setUserProfile: (profile) =>
    set((state) => ({
      userProfile: { ...state.userProfile, ...profile },
    })),
  completeProfile: () => set({ isProfileComplete: true }),
  resetProfile: () =>
    set({
      userProfile: {
        name: '',
        age: '',
        gender: '',
        smokingStatus: '',
        monthlyBudget: '',
      },
      isProfileComplete: false,
      portfolio: [],
      isGuideModeActive: false,
      currentGuideStep: 1,
    }),

  portfolio: [],
  addToPortfolio: (productId, defaultPremium, linkedTo, selectedVariant) =>
    set((state) => ({
      portfolio: [
        ...state.portfolio,
        {
          instanceId: Math.random().toString(36).substr(2, 9),
          productId,
          premium: defaultPremium,
          linkedTo,
          selectedVariant,
          isAutoPayEnabled: false,
          customReturnRate: undefined,
          fundingStartYear: 1,
          paymentTerm: 100, // Default to Life/100, will be adjusted by component logic or initial setter
        },
      ],
    })),
  removeFromPortfolio: (instanceId) =>
    set((state) => ({
      // Remove the item AND any items linked to it
      portfolio: state.portfolio.filter((item) => 
        item.instanceId !== instanceId && item.linkedTo !== instanceId
      ),
    })),
  updatePremium: (instanceId, amount) =>
    set((state) => ({
      portfolio: state.portfolio.map((item) =>
        item.instanceId === instanceId ? { ...item, premium: amount } : item
      ),
    })),
  toggleAutoPay: (instanceId) =>
    set((state) => ({
      portfolio: state.portfolio.map((item) =>
        item.instanceId === instanceId ? { ...item, isAutoPayEnabled: !item.isAutoPayEnabled } : item
      ),
    })),
  updateItemSettings: (instanceId, settings) =>
    set((state) => ({
      portfolio: state.portfolio.map((item) =>
        item.instanceId === instanceId ? { ...item, ...settings } : item
      ),
    })),

  isGuideModeActive: false,
  currentGuideStep: 1,
  setGuideMode: (isActive) => set({ isGuideModeActive: isActive, currentGuideStep: 1 }),
  setGuideStep: (step) => set({ currentGuideStep: step }),
  nextGuideStep: () => set((state) => ({ currentGuideStep: state.currentGuideStep + 1 })),
}));
