import React, { useId } from 'react';

const InputBox = ({
  label,
  amount,
  onAmountChange,
  onCurrencyChange,
  selectedCurrency = "usd",
  currencyOptions = [],
  className = "",
}) => {
  const id = useId();

  return (
    <div className={`bg-white p-3 rounded-lg text-sm flex ${className}`}>
      <div className='w-1/2'>
        <label htmlFor={id} className='text-black/40 mb-2 inline-block'>{label}</label>
        <input
          id={id}
          type="number"
          value={amount}
          placeholder="Amount"
          className='outline-none w-full bg-transparent py-1.5'
          onChange={(e) => {
            if (onAmountChange) onAmountChange(Number(e.target.value));
          }}
        />
      </div>

      <div className='w-1/2 flex flex-wrap justify-end text-right'>
        <p className="text-black/40 mb-2 w-full">Currency Type</p>
        <select
          className='rounded-lg px-1 py-1 bg-gray-100 cursor-pointer outline-none'
          value={selectedCurrency}
          onChange={(e) => {
            if (onCurrencyChange) onCurrencyChange(e.target.value);
          }}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency.toUpperCase()} {/* ✅ Fixed: .toUpperCase() for better appearance */}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InputBox;
