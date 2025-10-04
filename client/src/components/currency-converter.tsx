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
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Currency Converter</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Convert between major world currencies with live exchange rates updated in real-time
        </p>
        
        {/* Features List */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Features:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Real-time exchange rates
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              8 major world currencies
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Instant conversion calculations
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Popular currency pairs
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Two-way currency swapping
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Accurate to 4 decimal places
            </div>
          </div>
        </div>
        
        {/* Usage Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>How to use:</strong> Select currencies, enter amount, and get instant conversions. 
          Perfect for travelers, international business, and forex trading analysis.</p>
        </div>
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

      {/* Comprehensive Content Section */}
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complete Guide to Our Currency Converter</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our online currency converter is an essential financial tool providing real-time exchange rates for major world currencies. Whether you're planning international travel, conducting cross-border business transactions, shopping from overseas retailers, or simply tracking foreign exchange markets, our converter delivers accurate, up-to-date currency conversions instantly. The tool supports eight major global currencies including USD, EUR, GBP, JPY, CAD, AUD, CHF, and CNY, covering the vast majority of international transactions.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Real-Time Exchange Rates You Can Trust</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Currency exchange rates fluctuate constantly based on global economic conditions, political events, market sentiment, and central bank policies. Our converter uses reliable exchange rate data to provide you with current market rates, helping you make informed financial decisions. Unlike static conversion tools that use outdated rates, our system reflects real market conditions. The exchange rates are displayed with precision to four decimal places, ensuring accuracy even for large transactions where minor rate differences can result in significant monetary variations.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Who Benefits From Currency Conversion Tools?</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          International travelers use our converter to budget trips, understand costs in different countries, and avoid unfavorable exchange rates at airports and hotels. Business professionals rely on it for pricing international services, calculating invoice amounts in multiple currencies, and planning foreign investments. Online shoppers compare prices from international retailers to find the best deals. Forex traders and investors monitor exchange rate movements to identify trading opportunities. Students studying abroad use it to manage budgets and understand tuition costs in local currency. Freelancers working with international clients can quickly convert payment amounts to their home currency.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Understanding Exchange Rates and Conversion</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          An exchange rate represents how much one currency is worth in terms of another currency. For example, if 1 USD equals 0.92 EUR, you would receive 92 Euro cents for every US dollar exchanged. Exchange rates are determined by supply and demand in global forex markets, influenced by interest rates, inflation, economic growth, political stability, and trade balances. When converting currency, it's important to understand that retail exchange rates offered by banks and currency exchange services typically include a markup or commission. Our converter shows the mid-market rate, which represents the midpoint between buying and selling prices in the wholesale market.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Popular Currency Pairs and Global Trade</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          The most traded currency pairs include USD/EUR (US Dollar to Euro), USD/JPY (US Dollar to Japanese Yen), GBP/USD (British Pound to US Dollar), and USD/CHF (US Dollar to Swiss Franc). These pairs account for the majority of daily foreign exchange trading volume, which exceeds $6 trillion globally. The US Dollar remains the world's primary reserve currency and is involved in approximately 88% of all currency trades. The Euro is the second most traded currency, serving as the official currency for 20 European Union member countries. Understanding these major pairs helps international businesses hedge currency risk and optimize cross-border transactions.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Maximize Your Financial Tools</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Enhance your financial planning with our other professional calculators. Need to perform complex financial calculations? Try our <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Scientific Calculator</a> for advanced mathematical operations including compound interest and statistical analysis. Managing international measurements? Use our <a href="/units" className="text-blue-600 dark:text-blue-400 hover:underline">Unit Converter</a> to seamlessly convert between metric and imperial systems for accurate product specifications and shipping calculations. Concerned about health while traveling? Check our <a href="/bmi" className="text-blue-600 dark:text-blue-400 hover:underline">BMI Calculator</a> to monitor your fitness goals. Need precision measurements for international projects? Our <a href="/level" className="text-blue-600 dark:text-blue-400 hover:underline">Digital Spirit Level</a> provides accurate leveling anywhere in the world.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Tips for Currency Exchange and Conversion</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          When exchanging currency for travel, avoid airport and hotel exchange services that often charge premium rates. Instead, use ATMs at your destination for better rates, or exchange money at local banks. For large transactions, consider using specialized forex services that offer competitive rates for bulk exchanges. Always check current exchange rates before making international purchases to ensure you're getting fair value. When traveling, notify your bank of your international plans to avoid card blocks. Consider using credit cards that don't charge foreign transaction fees for optimal savings. For businesses, implement currency hedging strategies to protect against adverse exchange rate movements that could impact profit margins.
        </p>
      </div>
    </div>
  );
}
