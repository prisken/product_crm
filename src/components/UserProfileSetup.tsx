import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronRight } from 'lucide-react';

export const UserProfileSetup: React.FC = () => {
  const { userProfile, setUserProfile, completeProfile } = useStore();
  const [step, setStep] = useState(0);

  // Steps configuration
  const steps = [
    {
      id: 'name',
      title: "Hi there! What's your name?",
      component: (
        <input
          type="text"
          placeholder="Enter your name"
          value={userProfile.name}
          onChange={(e) => setUserProfile({ name: e.target.value })}
          className="w-full text-2xl p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/50 backdrop-blur-sm"
          autoFocus
        />
      ),
      isValid: () => userProfile.name.trim().length > 0
    },
    {
      id: 'basic-info',
      title: "Tell us a bit about yourself",
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Age</label>
            <input
              type="number"
              placeholder="Age"
              value={userProfile.age}
              onChange={(e) => setUserProfile({ age: parseInt(e.target.value) || '' })}
              className="w-full text-xl p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gender</label>
            <div className="grid grid-cols-2 gap-4">
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  onClick={() => setUserProfile({ gender: g.toLowerCase() as 'male' | 'female' })}
                  className={`p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 ${
                    userProfile.gender === g.toLowerCase()
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-200 text-gray-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Smoking Status</label>
             <div className="grid grid-cols-2 gap-4">
              {['Non-Smoker', 'Smoker'].map((s) => (
                <button
                  key={s}
                  onClick={() => setUserProfile({ smokingStatus: s.toLowerCase().replace(' ', '-') as 'smoker' | 'non-smoker' })}
                  className={`p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 ${
                    userProfile.smokingStatus === s.toLowerCase().replace(' ', '-')
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-200 text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      isValid: () => userProfile.age !== '' && userProfile.gender !== '' && userProfile.smokingStatus !== ''
    },
    {
      id: 'budget',
      title: "What is your monthly budget for insurance?",
      component: (
        <div className="space-y-6">
           <input
              type="number"
              placeholder="Amount in HKD"
              value={userProfile.monthlyBudget}
              onChange={(e) => setUserProfile({ monthlyBudget: parseInt(e.target.value) || '' })}
              className="w-full text-3xl p-6 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/50 text-center font-bold text-blue-900"
            />
            <div className="flex flex-wrap gap-3 justify-center">
              {[2000, 5000, 10000, 20000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setUserProfile({ monthlyBudget: amount })}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>
        </div>
      ),
      isValid: () => userProfile.monthlyBudget !== ''
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeProfile();
    }
  };

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 w-full">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                {currentStep.title}
              </h2>
              
              <div className="min-h-[200px]">
                {currentStep.component}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!currentStep.isValid()}
              className={`
                group flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300
                ${currentStep.isValid() 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              {step === steps.length - 1 ? 'Start Planning' : 'Continue'}
              <ChevronRight className={`w-5 h-5 transition-transform ${currentStep.isValid() ? 'group-hover:translate-x-1' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

