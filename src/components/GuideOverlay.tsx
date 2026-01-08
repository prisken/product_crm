import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronRight, X, Sparkles } from 'lucide-react';

export const GuideOverlay: React.FC = () => {
  const { 
    isGuideModeActive, 
    currentGuideStep, 
    nextGuideStep, 
    setGuideMode 
  } = useStore();

  const steps = [
    {
      id: 1,
      title: "Let's build your Safety Net",
      description: "Start by protecting yourself against unexpected medical costs and accidents. Drag a Medical or Accident plan to your portfolio.",
      highlight: "Medical, Accident, Critical Illness"
    },
    {
      id: 2,
      title: "Plan for the Future",
      description: "Now let's look at wealth accumulation. Add Savings or Annuity plans to secure your financial future.",
      highlight: "Savings, Annuity, Life"
    },
    {
      id: 3,
      title: "Review Tax Efficiency",
      description: "Check your estimated tax savings below. Ensure you're maximizing your deductions with VHIS and QDAP plans.",
      highlight: "Tax Summary"
    }
  ];

  const currentStepData = steps.find(s => s.id === currentGuideStep);

  if (!isGuideModeActive || !currentStepData) return null;

  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGuideStep}
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white/90 backdrop-blur-md border border-white/50 shadow-2xl rounded-2xl p-6 max-w-2xl w-full mx-4 pointer-events-auto"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-blue-500/30">
                {currentGuideStep}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  {currentStepData.title}
                  <Sparkles size={16} className="text-amber-400 fill-amber-400" />
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setGuideMode(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex gap-1">
              {steps.map(s => (
                <div 
                  key={s.id} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.id === currentGuideStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setGuideMode(false)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Exit Guide
              </button>
              <button
                onClick={() => {
                  if (currentGuideStep < steps.length) {
                    nextGuideStep();
                  } else {
                    setGuideMode(false);
                  }
                }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20"
              >
                {currentGuideStep === steps.length ? 'Finish' : 'Next Step'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

