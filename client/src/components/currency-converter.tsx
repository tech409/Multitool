import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CURRENCIES } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [fromAmount, setFromAmount] = useState("1");
  const [toAmount, setToAmount] = useState("");

  const { data: exchangeRate, isLoading } = useQuery({
    queryKey: ['/api/exchange-rates', fromCurrency, toCurrency],
    enabled: fromCurrency !== toCurrency,
  });

  const { data: popularRates } = useQuery<ExchangeRate[]>({
    queryKey: ['/api/exchange-rates'],
  });

  const convertCurrency = () => {
    const amount = parseFloat(fromAmount) || 0;
    
    if (fromCurrency === toCurrency) {
      setToAmount(amount.toString());
      return;
    }

    if (exchangeRate && typeof exchangeRate === 'object' && 'rate' in exchangeRate && typeof exchangeRate.rate === 'number') {
      const convertedAmount = (amount * exchangeRate.rate).toFixed(2);
      setToAmount(convertedAmount);
    }
  };

  useEffect(() => {
    convertCurrency();
  }, [fromAmount, fromCurrency, toCurrency, exchangeRate]);

  const getPopularRates = () => {
    if (!popularRates) return [];
    
    const popularPairs = [
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'GBP' },
      { from: 'EUR', to: 'GBP' },
      { from: 'USD', to: 'JPY' }
    ];
    
    return popularPairs.map(pair => {
      const rate = popularRates.find(r => 
        r.baseCurrency === pair.from && r.targetCurrency === pair.to
      );
      return {
        pair: `${pair.from}/${pair.to}`,
        rate: rate?.rate || 1
      };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Currency Converter</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Real-time exchange rates for major currencies</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* From Currency */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {code} - {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Enter amount"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="w-full"
          />
        </div>

        {/* To Currency */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {code} - {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Converted amount"
            value={toAmount}
            readOnly
            className="w-full bg-gray-100 dark:bg-slate-600"
          />
        </div>
      </div>

      <Button 
        onClick={convertCurrency} 
        className="w-full mb-4"
        disabled={isLoading}
      >
        {isLoading ? "Converting..." : "Convert Currency"}
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg mb-6">
        {exchangeRate && typeof exchangeRate === 'object' && 'rate' in exchangeRate && typeof exchangeRate.rate === 'number' ? (
          `1 ${fromCurrency} = ${exchangeRate.rate.toFixed(4)} ${toCurrency}`
        ) : fromCurrency === toCurrency ? (
          `1 ${fromCurrency} = 1 ${toCurrency}`
        ) : (
          "Loading exchange rate..."
        )}
      </div>

      {/* Popular Conversions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Popular Conversions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {getPopularRates().map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg text-center">
              <div className="text-sm font-medium">{item.pair}</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {item.rate.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
