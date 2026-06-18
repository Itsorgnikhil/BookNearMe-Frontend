import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { number: 1, label: 'Review Details' },
  { number: 2, label: 'Add Guests' },
  { number: 3, label: 'Payment' }
];

export default function BookingWizardLayout({ currentStep, children }) {
  return (
    <div className="flex-grow bg-[#FAFAFA] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper Progress Bar */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="flex items-center justify-between relative">
            
            {/* Background progress bar line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute left-0 top-1/2 h-0.5 bg-brand -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isActive = currentStep === step.number;
              
              return (
                <div key={step.number} className="relative z-10 flex flex-col items-center">
                  
                  {/* Step Bubble Indicator */}
                  <div 
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border duration-300 ${
                      isCompleted 
                        ? 'bg-brand border-brand text-white shadow-subtle' 
                        : isActive 
                          ? 'bg-white border-brand text-brand ring-4 ring-brand/10 shadow-md scale-105' 
                          : 'bg-white border-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>

                  {/* Label tag */}
                  <span 
                    className={`text-[10px] sm:text-xs font-bold mt-2.5 transition-colors tracking-wide uppercase ${
                      isActive 
                        ? 'text-brand font-black' 
                        : isCompleted 
                          ? 'text-gray-800' 
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard content */}
        <div>
          {children}
        </div>

      </div>
    </div>
  );
}
