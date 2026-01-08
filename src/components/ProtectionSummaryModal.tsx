import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { products } from '../data/products';
import { X, Shield, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProtectionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtectionSummaryModal: React.FC<ProtectionSummaryModalProps> = ({ isOpen, onClose }) => {
  const { portfolio } = useStore();

  const protectionItems = useMemo(() => {
    return portfolio
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.medicalCoverage) {
          return {
            instanceId: item.instanceId,
            premium: item.premium,
            product,
            coverage: product.medicalCoverage
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [portfolio]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Protection Details</h2>
                <p className="text-gray-500 text-sm">Summary of your Medical and Critical Illness Coverage</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {protectionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Shield size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No Medical or CI plans in portfolio.</p>
                <p className="text-sm">Add Medical or Critical Illness products to view protection details.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {protectionItems.map(({ instanceId, product, coverage }) => (
                  <div key={instanceId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-white">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            product.category === 'Medical' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {product.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-gray-400 font-bold uppercase">Annual Limit</div>
                         <div className="text-xl font-bold text-gray-800">{coverage.annualLimit}</div>
                      </div>
                    </div>
                    
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                         <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                              <Activity size={12} /> Ward Class
                            </div>
                            <div className="font-semibold text-gray-900">{coverage.wardClass}</div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                              <FileText size={12} /> Lifetime Limit
                            </div>
                            <div className="font-semibold text-gray-900">{coverage.lifetimeLimit}</div>
                         </div>
                         {coverage.deductibleOptions && (
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <div className="text-xs text-gray-500 font-medium mb-1">Deductible Options</div>
                              <div className="text-xs text-gray-600">
                                {coverage.deductibleOptions.join(', ')}
                              </div>
                           </div>
                         )}
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key Benefit Limits</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {coverage.majorBenefits?.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                              <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-bold text-sm text-gray-800">{benefit.category}</div>
                                <div className="text-sm text-teal-700 font-medium">{benefit.limit}</div>
                                {benefit.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">{benefit.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
