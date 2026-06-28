import React from 'react';
import CareerPathPanel from '../components/CareerPathPanel';

// CareerPlanningPage (audit task 14e65214, Step 8 AC44): the /career-planning
// route — renders the future-projection engine's output in a readable layout.
function CareerPlanningPage({ embedded = false }) {
  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="career-planning-page">
      <div className="max-w-3xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ترسیم آینده شغلی</h1>
        <p className="text-sm text-gray-500 mb-6">
          بر اساس علایق، سلیقه‌ها، روحیات و شخصیت شما — دقیق و شخصی‌سازی‌شده.
        </p>
        <CareerPathPanel />
      </div>
    </div>
  );
}

export default CareerPlanningPage;
