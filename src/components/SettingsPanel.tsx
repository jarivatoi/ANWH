import React, { useState } from 'react';
import { Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { Settings, ShiftCombination } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateBasicSalary: (salary: number) => void;
  onUpdateShiftHours: (combinationId: string, hours: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateBasicSalary,
  onUpdateShiftHours
}) => {
  const [salaryDisplayValue, setSalaryDisplayValue] = useState('');

  const formatCurrency = (amount: number) => {
    // Always use thousands separator with comma
    return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatHourlyRate = (rate: number) => {
    // Always use thousands separator with comma for hourly rate display
    return rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatSalaryWithCommas = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  const parseSalaryFromDisplay = (displayValue: string) => {
    // Remove commas and parse as number
    return parseInt(displayValue.replace(/,/g, ''), 10) || 0;
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove any non-digit characters except commas
    const cleanValue = inputValue.replace(/[^\d,]/g, '');
    
    // Parse the numeric value (removing commas)
    const numericValue = parseSalaryFromDisplay(cleanValue);
    
    // Format with commas for display
    const formattedValue = formatSalaryWithCommas(numericValue);
    setSalaryDisplayValue(formattedValue);
    
    // Update the actual salary value
    onUpdateBasicSalary(numericValue);
  };

  const handleSalaryFocus = () => {
    // When focused, show the formatted value
    setSalaryDisplayValue(formatSalaryWithCommas(settings.basicSalary || 0));
  };

  const handleSalaryBlur = () => {
    // When blurred, clear the display value to show the controlled value
    setSalaryDisplayValue('');
  };

  const getSalaryInputValue = () => {
    // If we have a display value (user is typing), use that
    // Otherwise, use the formatted settings value
    return salaryDisplayValue || formatSalaryWithCommas(settings.basicSalary || 0);
  };

  const calculateAmount = (hours: number) => {
    return hours * (settings?.hourlyRate || 0);
  };

  // Show error if settings are not properly loaded
  if (!settings) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-red-900 text-center">Settings Loading Error</h2>
        </div>
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-700 mb-4">Settings data is not available. This may be due to:</p>
          <ul className="text-sm text-red-600 space-y-1">
            <li>• Database initialization issues</li>
            <li>• Import process incomplete</li>
            <li>• Browser storage problems</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show warning if shift combinations are missing
  if (!settings.shiftCombinations || settings.shiftCombinations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-amber-900 text-center">Missing Shift Combinations</h2>
        </div>
        <div className="text-center p-6 bg-amber-50 rounded-lg">
          <p className="text-amber-700 mb-4">Shift combinations are missing from settings. This will prevent amount calculations.</p>
          <div className="text-sm text-amber-600 space-y-1 mb-4">
            <p><strong>Current Settings:</strong></p>
            <p>Basic Salary: Rs {settings.basicSalary?.toLocaleString() || 'Not set'}</p>
            <p>Hourly Rate: Rs {settings.hourlyRate?.toFixed(2) || 'Not set'}</p>
            <p>Shift Combinations: {settings.shiftCombinations?.length || 0}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Settings & Configuration</h2>
      </div>

      {/* Basic Salary Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 text-center">Salary Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Basic Salary (Monthly)
            </label>
            <div className="relative max-w-xs mx-auto">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rs</span>
              <input
                type="text"
                value={getSalaryInputValue()}
                onChange={handleSalaryChange}
                onFocus={handleSalaryFocus}
                onBlur={handleSalaryBlur}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-base font-medium"
                placeholder="Enter basic salary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Hourly Rate (Auto-calculated)
            </label>
            <div className="relative max-w-xs mx-auto">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rs</span>
              <input
                type="text"
                value={formatHourlyRate(settings.hourlyRate || 0)}
                readOnly
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-center text-base font-medium"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Formula: Basic Salary × 12 ÷ 52 ÷ 40
            </p>
          </div>
        </div>
      </div>

      {/* Work Hours Configuration - Mobile Optimized */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 text-center">Work Hours Configuration</h3>
        
        {/* Mobile Card Layout */}
        <div className="block sm:hidden space-y-3">
          {settings.shiftCombinations.map((combination, index) => (
            <div key={combination.id} className={`p-4 rounded-lg border ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <div className="text-center mb-3">
                <div className="font-semibold text-gray-800 text-sm mb-1">
                  {combination.combination}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 text-center">Hours</label>
                  <input
                    type="number"
                    value={combination.hours || 0}
                    onChange={(e) => onUpdateShiftHours(combination.id, Number(e.target.value))}
                    className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-sm"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 text-center">Amount</label>
                  <div className="px-2 py-2 bg-gray-100 rounded text-center text-sm font-mono text-gray-700">
                    {formatCurrency(calculateAmount(combination.hours || 0))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                  Shift Combination
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                  Hours
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                  Amount (Rs)
                </th>
              </tr>
            </thead>
            <tbody>
              {settings.shiftCombinations.map((combination, index) => (
                <tr key={combination.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-800 text-center">
                    {combination.combination}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <input
                      type="number"
                      value={combination.hours || 0}
                      onChange={(e) => onUpdateShiftHours(combination.id, Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                      min="0"
                      step="0.5"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3 font-mono text-gray-700 text-center">
                    {formatCurrency(calculateAmount(combination.hours || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};