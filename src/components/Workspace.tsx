import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
  closestCorners,
} from '@dnd-kit/core';
import { useStore } from '../store/useStore';
import { products, Product } from '../data/products';
import { ProductCard } from './ProductCard';
import { PortfolioItem } from './PortfolioItem';
import { PortfolioSummary } from './PortfolioSummary';
import { GuideOverlay } from './GuideOverlay';
import { Search, PieChart, Wallet, Wand2 } from 'lucide-react';

// Separate component for the Droppable Area to keep things clean
const DropZone = ({ children }: { children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'portfolio-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 m-4 mt-0 rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden
        ${isOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-white/30'}
      `}
    >
      <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export const Workspace: React.FC = () => {
  const { portfolio, addToPortfolio, userProfile, isGuideModeActive, currentGuideStep, setGuideMode } = useStore();
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Robust sensor configuration for Mouse and Touch (iPad)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current) {
      setActiveProduct(event.active.data.current as Product);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const product = active.data.current as Product;
      
      // Case 1: Drop into Main Portfolio Zone
      if (over.id === 'portfolio-zone') {
        if (product) {
          // Use the dynamic defaultPremium from the drag data if available
          const premiumToAdd = (active.data.current as any).defaultPremium || product.defaultPremium;
          const selectedVariant = (active.data.current as any).selectedVariant;
          addToPortfolio(product.id, premiumToAdd, undefined, selectedVariant);
        }
      } 
      // Case 2: Drop onto an existing Generator Portfolio Item (Premium Offset)
      else if (typeof over.id === 'string' && over.id.startsWith('portfolio-item-')) {
        const parentInstanceId = over.id.replace('portfolio-item-', '');
        const parentItem = portfolio.find(p => p.instanceId === parentInstanceId);
        
        if (parentItem && product) {
           const parentProduct = products.find(p => p.id === parentItem.productId);
           // Allow dropping if parent is a Generator. 
           // Relaxed check: Child can be Consumer OR Generator (Savings funding Savings).
           // Prevent self-referential linking (A -> A)
           if (parentProduct && parentProduct.cashFlowType === 'Generator' && parentItem.productId !== product.id) {
             const premiumToAdd = (active.data.current as any).defaultPremium || product.defaultPremium;
             const selectedVariant = (active.data.current as any).selectedVariant;
             addToPortfolio(product.id, premiumToAdd, parentInstanceId, selectedVariant);
           }
        }
      }
    }
    setActiveProduct(null);
  };

  // Filtering Logic
  const groupedProducts = useMemo(() => {
    // 1. Filter by Search Query
    let filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Filter by Guide Mode Step
    if (isGuideModeActive) {
      if (currentGuideStep === 1) {
        // Step 1: Safety Net (Medical, Accident, Critical Illness)
        filtered = filtered.filter(p => ['Medical', 'Accident', 'Critical Illness'].includes(p.category));
      } else if (currentGuideStep === 2) {
        // Step 2: Future (Savings, Annuity, Life)
        filtered = filtered.filter(p => ['Savings', 'Annuity', 'Life'].includes(p.category));
      }
      // Step 3 is Tax Review, we might show everything or just tax deductible items, 
      // but usually review steps allow seeing everything. 
      // Let's keep it open or maybe filter by Tax Deductible?
      // For now, let's show all in step 3 as it's a review.
    }

    const groups: Record<string, Product[]> = {
      'Medical & Health': [],
      'Savings & Annuity': [],
      'Protection': []
    };

    filtered.forEach(p => {
      if (['Medical'].includes(p.category)) {
        groups['Medical & Health'].push(p);
      } else if (['Savings', 'Annuity'].includes(p.category)) {
        groups['Savings & Annuity'].push(p);
      } else {
        groups['Protection'].push(p);
      }
    });

    return groups;
  }, [searchQuery, isGuideModeActive, currentGuideStep]);

  const totalPremium = portfolio.reduce((sum, item) => sum + item.premium, 0);
  const budgetUtilization = userProfile.monthlyBudget 
    ? (totalPremium / 12 / (userProfile.monthlyBudget as number)) * 100 
    : 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <GuideOverlay />

      <div className={`flex h-screen overflow-hidden bg-gray-50 transition-all duration-500 ${isGuideModeActive ? 'pt-24' : ''}`}>
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-[30%] min-w-[320px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Product Library</h2>
              {!isGuideModeActive && (
                <button
                  onClick={() => setGuideMode(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                >
                  <Wand2 size={14} />
                  Guide Me
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {Object.entries(groupedProducts).map(([category, items]) => (
              items.length > 0 && (
                <div key={category}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {items.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* --- RIGHT AREA --- */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Header Stats */}
          <div className="relative px-8 py-6 flex items-center justify-between z-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-gray-900">{userProfile.name || 'Guest'}</span>
                {userProfile.age && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {userProfile.age} y/o {userProfile.gender ? (userProfile.gender === 'male' ? 'Male' : 'Female') : ''}
                    </span>
                  </>
                )}
                {userProfile.smokingStatus && (
                  <>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {userProfile.smokingStatus === 'smoker' ? 'Smoker' : 'Non-Smoker'}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Wallet size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase">Total Annual Premium</div>
                  <div className="text-xl font-bold text-gray-900">HKD ${totalPremium.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-sm flex items-center gap-3">
                <div className={`p-2 rounded-lg ${budgetUtilization > 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  <PieChart size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase">Monthly Budget Used</div>
                  <div className={`text-xl font-bold ${budgetUtilization > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                    {budgetUtilization.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DropZone>
            {portfolio.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet size={40} className="opacity-50" />
                </div>
                <p className="text-lg font-medium">Your portfolio is empty</p>
                <p className="text-sm">Drag products from the library to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {portfolio
                  .filter(item => !item.linkedTo) // Only render top-level items
                  .map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <PortfolioItem 
                        key={item.instanceId} 
                        item={item} 
                        product={product} 
                      />
                    );
                })}
              </div>
            )}
          </DropZone>
        </div>
      </div>
      
      {/* Portfolio Summary Sticky Bar */}
      <PortfolioSummary />

      {/* --- DRAG OVERLAY PORTAL --- */}
      {createPortal(
        <DragOverlay>
          {activeProduct ? (
            <div className="w-[300px] cursor-grabbing pointer-events-none">
              <ProductCard product={activeProduct} isOverlay />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
