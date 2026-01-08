import React, { useState } from 'react';
import { PortfolioItem as IPortfolioItem, useStore } from '../store/useStore';
import { products, Product } from '../data/products';
import { X, DollarSign, Shield, Info, Star, Link, Zap, CheckCircle, AlertTriangle, Sliders, ChevronDown, ChevronUp, HelpCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';

interface PortfolioItemProps {
  item: IPortfolioItem;
  product: Product;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({ item, product }) => {
  const { updatePremium, removeFromPortfolio, toggleAutoPay, updateItemSettings, portfolio } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Generator Logic: Enable Dropping
  const isGenerator = product.cashFlowType === 'Generator';
  const { setNodeRef, isOver } = useDroppable({
    id: `portfolio-item-${item.instanceId}`,
    disabled: !isGenerator
  });

  // Handle Linked Items
  const linkedItems = portfolio.filter(p => p.linkedTo === item.instanceId);
  const totalLinkedPremium = linkedItems.reduce((sum, i) => sum + i.premium, 0);
  
  // Calculate Sustainability with custom settings
  const customReturnRate = item.customReturnRate !== undefined ? item.customReturnRate : 0.045;
  const fundingStartYear = item.fundingStartYear || 1;
  const paymentTerm = item.paymentTerm !== undefined ? item.paymentTerm : 
    (['Savings', 'Annuity', 'Life'].includes(product.category) ? 10 : 100);

  let estimatedReturn = 0;
  
  if (product.fundingStrategy === 'TaxSavings') {
    estimatedReturn = item.premium * 0.17; 
  } else if (product.fundingStrategy === 'Coupon') {
    estimatedReturn = item.premium * 0.05; 
  } else {
    // Dividend Strategy using custom rate
    // Estimate at steady state (e.g. Year 10) for badge check
    // Simple calc: Accumulated value at Y10 * rate? Or just premium * rate?
    // Let's use simple yield on premium for the badge check to be conservative/simple.
    // Real calculation is in the chart.
    estimatedReturn = item.premium * customReturnRate; 
  }
  
  const isSelfSustaining = estimatedReturn >= totalLinkedPremium;

  const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePremium(item.instanceId, parseInt(e.target.value));
  };

  return (
    <div 
      ref={setNodeRef}
      className={`
        group relative bg-white/60 backdrop-blur-md rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden
        ${isOver ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' : 'border-white/50'}
        ${showHelp ? 'z-50 ring-2 ring-blue-500/20' : 'z-0'}
      `}
    >
      {/* Help Button - Top Left */}
      <div className="absolute top-2 left-2 z-20">
         <div 
          className="relative"
          onClick={(e) => {
            e.stopPropagation();
            setShowHelp(!showHelp);
          }}
        >
          <button className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50">
            <HelpCircle size={14} />
          </button>
          
          <AnimatePresence>
            {showHelp && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 top-8 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl z-50 pointer-events-none"
              >
                <div className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 rotate-45" />
                <p className="relative z-10 leading-relaxed mb-2 font-medium border-b border-gray-700 pb-2">
                  {product.description}
                </p>
                <ul className="space-y-1 relative z-10 text-gray-300">
                  {product.keyFeatures?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromPortfolio(item.instanceId)}
        className="absolute top-2 right-2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <X size={16} />
      </button>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className={`
            p-3 rounded-xl shrink-0 relative
            ${product.category === 'Medical' ? 'bg-blue-100 text-blue-600' : 
              product.category === 'Savings' ? 'bg-green-100 text-green-600' : 
              product.category === 'Critical Illness' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'}
          `}>
            <Shield size={24} />
            {isGenerator && (
              <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5 border-2 border-white">
                <Zap size={10} className="text-white fill-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{product.category}</span>
              {product.highlightBadge && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-700 border border-amber-200">
                  <Star size={10} className="fill-amber-700" />
                  {product.highlightBadge}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
          </div>
        </div>

        {/* Premium Section */}
        <div className="bg-white/50 rounded-xl p-4 border border-white/50 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign size={16} />
              <span className="font-medium text-sm">Annual Premium</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              HKD ${item.premium.toLocaleString()}
            </div>
          </div>
          
          {product.pricingTier && item.selectedVariant ? (
             // Static Display for Tiered Products (Medical)
             <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
               <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                 Selected Plan Option
               </div>
               <div className="font-bold text-blue-900 text-sm">
                 {item.selectedVariant}
               </div>
             </div>
          ) : (
             // Slider for adjustable products
             <>
               <input
                 type="range"
                 min={1000}
                 max={Math.max(product.defaultPremium * 10, 1000000)} // Increased Max Limit
                 step={1000}
                 value={item.premium}
                 onChange={handlePremiumChange}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
               />
               <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                 <span>$1,000</span>
                 <span>Recommended: ${product.defaultPremium.toLocaleString()}</span>
                 <span>${Math.max(product.defaultPremium * 10, 1000000).toLocaleString()}</span>
               </div>
             </>
          )}

          {/* Payment Term Slider for Savings/Life/Annuity - Hidden/Fixed for Single Premium (TMP2) */}
          {['Savings', 'Annuity', 'Life'].includes(product.category) && product.id !== 'TMP2' && (
            <div className="mt-4 pt-3 border-t border-gray-200/50">
               <div className="flex justify-between items-center mb-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Payment Term</label>
                 <span className="text-xs font-bold text-blue-600">{paymentTerm} Years</span>
               </div>
               <input 
                  type="range" 
                  min={1} 
                  max={30} 
                  step={1}
                  value={paymentTerm}
                  onChange={(e) => updateItemSettings(item.instanceId, { paymentTerm: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>
          )}
          
          {/* Static Payment Term for TMP2 */}
          {product.id === 'TMP2' && (
            <div className="mt-4 pt-3 border-t border-gray-200/50">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-gray-500 uppercase">Payment Term</label>
                 <span className="text-xs font-bold text-blue-600">1 Year (Single Premium)</span>
               </div>
            </div>
          )}
        </div>

        {/* Generator Features: Auto-Pay & Settings */}
        {isGenerator && (
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            {/* Custom Settings Panel (Projection Rate) - Always visible for Dividend Generators */}
            {product.fundingStrategy === 'Dividend' && (
              <div className="mb-4">
                 <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                      <TrendingUp size={12} />
                      Proj. Return Rate
                    </label>
                    <span className="text-xs font-bold text-blue-600">{(customReturnRate * 100).toFixed(1)}%</span>
                 </div>
                 <input 
                   type="range" min="0.01" max="0.10" step="0.005"
                   value={customReturnRate}
                   onChange={(e) => updateItemSettings(item.instanceId, { customReturnRate: parseFloat(e.target.value) })}
                   className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 />
                 <div className="flex justify-between mt-1 text-[9px] text-gray-400">
                   <span>Conservative (1%)</span>
                   <span>Aggressive (10%)</span>
                 </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Link size={12} />
                Linked Protection
              </span>
              
              <div className="flex items-center gap-2">
                {linkedItems.length > 0 && (
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-1.5 rounded-full transition-colors ${showSettings ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-100 text-gray-500'}`}
                    title="Adjust Funding Settings"
                  >
                    <Sliders size={16} />
                  </button>
                )}
                
                {linkedItems.length > 0 && (
                  <button 
                    onClick={() => toggleAutoPay(item.instanceId)}
                    className={`
                      relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none
                      ${item.isAutoPayEnabled ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  >
                    <span className={`
                      inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
                      ${item.isAutoPayEnabled ? 'translate-x-4.5' : 'translate-x-1'}
                    `} />
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Settings Panel (Start Funding Year) - Only when linked items exist */}
            {showSettings && linkedItems.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                    Start Funding Year
                    <span className="text-blue-600">Year {fundingStartYear}</span>
                  </label>
                  <input 
                    type="range" min="1" max="30" step="1"
                    value={fundingStartYear}
                    onChange={(e) => updateItemSettings(item.instanceId, { fundingStartYear: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Pay premiums out-of-pocket until Year {fundingStartYear}, then use savings.
                  </p>
                </div>
              </div>
            )}

            {/* Linked Items List */}
            <div className="space-y-2">
              {linkedItems.map(linkedItem => {
                const linkedProduct = products.find(p => p.id === linkedItem.productId);
                if (!linkedProduct) return null;
                return (
                  <div key={linkedItem.instanceId} className="flex items-center justify-between bg-white/80 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{linkedProduct.name}</div>
                        <div className="text-xs text-gray-500">Premium: HKD {linkedItem.premium.toLocaleString()}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromPortfolio(linkedItem.instanceId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}

              {linkedItems.length === 0 && (
                <div className={`
                  border-2 border-dashed rounded-xl p-4 text-center text-xs transition-colors
                  ${isOver ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}
                `}>
                  {isOver ? 'Drop here to link!' : 'Drag a Plan here to fund it with savings'}
                </div>
              )}
            </div>

            {/* Auto-Pay Status */}
            {linkedItems.length > 0 && item.isAutoPayEnabled && !showSettings && (
              <div className={`mt-4 p-3 rounded-xl border flex items-start gap-3 ${
                isSelfSustaining 
                  ? 'bg-green-50 border-green-100 text-green-800' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}>
                {isSelfSustaining ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-sm">
                    {isSelfSustaining ? 'Self-Sustaining Plan' : 'Top-up Needed'}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {product.fundingStrategy === 'TaxSavings'
                      ? isSelfSustaining 
                        ? 'Projected Tax Savings cover the premium.' 
                        : 'Tax Savings partially cover the premium.'
                      : isSelfSustaining 
                        ? `Returns (${(estimatedReturn/item.premium*100).toFixed(1)}%) cover costs.`
                        : `Returns cover ${(estimatedReturn / totalLinkedPremium * 100).toFixed(0)}% of costs.`
                    }
                  </div>
                  
                  {product.fundingStrategy === 'Dividend' && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 bg-white/50 px-2 py-1 rounded-md w-fit">
                      <Info size={10} />
                      Non-guaranteed {customReturnRate !== 0.045 ? `(${ (customReturnRate*100).toFixed(1)}%)` : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
