import { useState, useEffect } from 'react';

const useCurrencyInfo = (baseCurrency) => {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency}.json`);
        const output = await res.json();
        setData(output[baseCurrency]); // ✅ Fixed key extraction
      } catch (error) {
        console.log("Error in fetching currency", error); // ✅ Fixed typo
        setData({});
      }
    };

    fetchRates(); // ✅ Moved outside the try block and inside useEffect
  }, [baseCurrency]);

  return data;
};

export default useCurrencyInfo;
