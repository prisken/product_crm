import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Product } from '../data/products';
import { useStore } from '../store/useStore';
import { getVHISPremium } from '../data/pricingTables';
import { GripVertical, HelpCircle, Star, Heart, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  isOverlay?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isOverlay }) => {
  const { userProfile } = useStore();
  const [showHelp, setShowHelp] = useState(false);
  const [currentPremium, setCurrentPremium] = useState(product.defaultPremium);
  const [selectedVariant, setSelectedVariant] = useState(product.pricingTier?.defaultOption || '');

  // Sync state if prop changes or Variant/Age changes
  useEffect(() => {
    if (product.pricingTier && product.category === 'Medical') {
       const age = typeof userProfile.age === 'number' ? userProfile.age : 0;
       if (age > 0) {
          const calculatedPremium = getVHISPremium(product.id, age, selectedVariant, userProfile.gender || 'male');
          if (calculatedPremium > 0) {
             setCurrentPremium(calculatedPremium);
             return;
          }
       }
    }
    // Fallback
    setCurrentPremium(product.defaultPremium);
  }, [product.defaultPremium, product.pricingTier, selectedVariant, userProfile.age, userProfile.gender, product.id, product.category]);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: product.id,
    data: { 
      ...product, 
      defaultPremium: currentPremium, 
      selectedVariant: product.pricingTier ? selectedVariant : undefined 
    },
  });

  const style = isDragging && !isOverlay ? { opacity: 0.5 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative p-4 rounded-xl border transition-all duration-200 group cursor-grab active:cursor-grabbing
        ${isOverlay 
          ? 'bg-white shadow-xl scale-105 border-blue-500/50 rotate-2 pointer-events-none' 
          : 'bg-white/80 hover:bg-white border-white/40 shadow-sm hover:shadow-md backdrop-blur-sm'
        }
        ${showHelp ? 'z-50 ring-2 ring-blue-500/20' : 'z-0'}
      `}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2">
         {/* Help Button - Prevent Drag Propagation */}
         <div 
          className="relative"
          onPointerDown={(e) => e.stopPropagation()} 
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
                className="absolute right-0 top-8 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl z-50 pointer-events-none"
              >
                <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 rotate-45" />
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

        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
          <GripVertical size={16} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 mb-2 pr-12">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase
          ${product.category === 'Medical' ? 'bg-blue-100 text-blue-700' : 
            product.category === 'Savings' ? 'bg-green-100 text-green-700' : 
            product.category === 'Critical Illness' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'}
        `}>
          {product.category}
        </span>
        
        {product.highlightBadge && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border
            ${product.highlightBadge === 'Family Protection' 
              ? 'bg-pink-100 text-pink-700 border-pink-200' 
              : 'bg-amber-100 text-amber-700 border-amber-200'}
          `}>
            {product.highlightBadge === 'Family Protection' ? (
              <Heart size={10} className="fill-pink-700" />
            ) : (
              <Star size={10} className="fill-amber-700" />
            )}
            {product.highlightBadge}
          </span>
        )}
      </div>

      <h4 className="font-bold text-gray-900 leading-tight mb-1 text-sm">{product.name}</h4>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
      
      <div className="border-t border-gray-100 pt-3">
        {product.pricingTier ? (
           // Dropdown / Selector for Tiered Pricing
           <div className="mb-2" onPointerDown={(e) => e.stopPropagation()}>
             <div className="flex items-center justify-between text-xs mb-1.5">
               <span className="text-gray-400 font-medium uppercase tracking-wider">{product.pricingTier.type}</span>
               <span className="font-bold text-blue-600 truncate max-w-[120px] text-right">{selectedVariant}</span>
             </div>
             
             {/* Special Layout for Privilege Scheme (AVHIP) - Region + Deductible Split */}
             {product.id === 'AVHIP' ? (
               <div className="space-y-2">
                 {/* Region Selection */}
                 <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                   {['Asia', 'Worldwide'].map(region => {
                     const isSelected = selectedVariant.startsWith(region);
                     return (
                       <button
                         key={region}
                         onClick={() => {
                           // Keep current deductible suffix but switch region
                           const currentDeductible = selectedVariant.split(' - ')[1] || 'HKD 0';
                           setSelectedVariant(`${region} - ${currentDeductible}`);
                         }}
                         className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                           isSelected 
                             ? 'bg-white text-blue-600 shadow-sm' 
                             : 'text-gray-500 hover:text-gray-700'
                         }`}
                       >
                         {region}
                       </button>
                     );
                   })}
                 </div>
                 {/* Deductible Selection */}
                 <div className="grid grid-cols-4 gap-1 bg-gray-100 rounded-lg p-1">
                   {['HKD 0', 'HKD 16,000', 'HKD 25,000', 'HKD 50,000'].map(deductible => {
                     const currentRegion = selectedVariant.split(' - ')[0] || 'Asia';
                     const optionValue = `${currentRegion} - ${deductible}`;
                     return (
                       <button
                         key={deductible}
                         onClick={() => setSelectedVariant(optionValue)}
                         className={`py-1.5 text-[9px] font-bold rounded-md transition-all ${
                           selectedVariant.includes(deductible)
                             ? 'bg-white text-blue-600 shadow-sm' 
                             : 'text-gray-500 hover:text-gray-700'
                         }`}
                       >
                         {deductible.replace('HKD ', '$').replace(',000', 'k')}
                       </button>
                     );
                   })}
                 </div>
               </div>
             ) : product.id === 'AVHIS' ? (
               // Special Layout for SelectWise (AVHIS) - Grid for 5 options
               <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
                 {product.pricingTier.options.map(option => (
                   <button
                     key={option}
                     onClick={() => setSelectedVariant(option)}
                     className={`py-1.5 text-[9px] font-bold rounded-md transition-all ${
                       selectedVariant === option 
                         ? 'bg-white text-blue-600 shadow-sm' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     {option.replace('HKD ', '$').replace(',000', 'k')}
                   </button>
                 ))}
               </div>
             ) : (
               // Default Layout for others
               <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                 {product.pricingTier.options.map(option => (
                   <button
                     key={option}
                     onClick={() => setSelectedVariant(option)}
                     className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                       selectedVariant === option 
                         ? 'bg-white text-blue-600 shadow-sm' 
                         : 'text-gray-500 hover:text-gray-700'
                     }`}
                   >
                     {option.replace('Deductible ', '').replace('Ward', 'W').replace('Semi-Private', 'SP').replace('Private', 'P')}
                   </button>
                 ))}
               </div>
             )}
           </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400 flex items-center gap-1">
                <DollarSign size={10} />
                Premium
              </span>
              <span className="font-semibold text-gray-900">HKD {currentPremium.toLocaleString()}</span>
            </div>
            
            {/* Premium Slider - Stop Propagation to allow sliding without dragging card */}
            <div 
              onPointerDown={(e) => e.stopPropagation()}
              className="relative flex items-center"
            >
              <input 
                type="range"
                min={1000}
                max={Math.max(product.defaultPremium * 10, 500000)} // Increased Limit
                step={1000}
                value={currentPremium}
                onChange={(e) => setCurrentPremium(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
