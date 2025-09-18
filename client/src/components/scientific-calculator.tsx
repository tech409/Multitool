import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "@/lib/calculations";

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState("");
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const appendToDisplay = useCallback((value: string) => {
    setDisplay(prev => {
      if (shouldResetDisplay) {
        setShouldResetDisplay(false);
        return value;
      }
      return prev === "0" ? value : prev + value;
    });
  }, [shouldResetDisplay]);

  const clearCalculator = useCallback(() => {
    setDisplay("0");
    setHistory("");
    setShouldResetDisplay(false);
  }, []);

  const calculateFunction = useCallback((func: string) => {
    try {
      const currentValue = parseFloat(display) || 0;
      let result: number;
      
      switch(func) {
        case 'sin':
          result = Calculator.sin(currentValue);
          break;
        case 'cos':
          result = Calculator.cos(currentValue);
          break;
        case 'tan':
          result = Calculator.tan(currentValue);
          break;
        case 'log':
          result = Calculator.log(currentValue);
          break;
        case 'ln':
          result = Calculator.ln(currentValue);
          break;
        case 'sqrt':
          result = Calculator.sqrt(currentValue);
          break;
        case 'pow':
          result = Calculator.pow(currentValue);
          break;
        case 'pi':
          result = Math.PI;
          break;
        case 'e':
          result = Math.E;
          break;
        default:
          return;
      }
      
      setHistory(`${func}(${currentValue}) =`);
      setDisplay(Calculator.formatResult(result));
      setShouldResetDisplay(true);
    } catch (error) {
      setDisplay("Error");
      setShouldResetDisplay(true);
    }
  }, [display]);

  const calculateResult = useCallback(() => {
    try {
      setHistory(display + " =");
      const result = Calculator.evaluate(display);
      setDisplay(Calculator.formatResult(result));
      setShouldResetDisplay(true);
    } catch (error) {
      setDisplay("Error");
      setShouldResetDisplay(true);
    }
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if ('0123456789.+-*/'.includes(key)) {
        event.preventDefault();
        let displayKey = key;
        if (key === '*') displayKey = '×';
        if (key === '/') displayKey = '÷';
        if (key === '-') displayKey = '−';
        appendToDisplay(displayKey);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        event.preventDefault();
        clearCalculator();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [appendToDisplay, calculateResult, clearCalculator]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header and Description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Scientific Calculator</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Professional scientific calculator with advanced mathematical functions, trigonometry, logarithms, and more
        </p>
        
        {/* Features List */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Features:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Basic arithmetic operations (+, -, ×, ÷)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Trigonometric functions (sin, cos, tan)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Logarithmic functions (log, ln)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Power and square root operations
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Mathematical constants (π, e)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Keyboard support for faster input
            </div>
          </div>
        </div>
        
        {/* Usage Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>How to use:</strong> Click buttons or use your keyboard for calculations. 
          Press 'C' to clear, 'Enter' or '=' to calculate results. Perfect for students, engineers, and professionals.</p>
        </div>
      </div>
      
      {/* Display */}
      <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 mb-6">
        <div className="text-right text-2xl font-mono font-semibold text-gray-800 dark:text-white min-h-[3rem] flex items-center justify-end overflow-hidden">
          {display}
        </div>
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1 h-5">
          {history}
        </div>
      </div>

      {/* Scientific Functions Row */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('sin')}>
          sin
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('cos')}>
          cos
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('tan')}>
          tan
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('log')}>
          log
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('ln')}>
          ln
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-3">
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('sqrt')}>
          √
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('pow')}>
          x²
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('pi')}>
          π
        </Button>
        <Button variant="outline" size="sm" className="calc-btn calc-btn-function p-3" onClick={() => calculateFunction('e')}>
          e
        </Button>
        <Button variant="destructive" size="sm" className="calc-btn calc-btn-clear p-3" onClick={clearCalculator}>
          C
        </Button>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-4 gap-3">
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('7')}>7</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('8')}>8</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('9')}>9</Button>
        <Button className="calc-btn calc-btn-operator p-4 text-lg font-semibold" onClick={() => appendToDisplay('÷')}>÷</Button>
        
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('4')}>4</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('5')}>5</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('6')}>6</Button>
        <Button className="calc-btn calc-btn-operator p-4 text-lg font-semibold" onClick={() => appendToDisplay('×')}>×</Button>
        
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('1')}>1</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('2')}>2</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('3')}>3</Button>
        <Button className="calc-btn calc-btn-operator p-4 text-lg font-semibold" onClick={() => appendToDisplay('−')}>−</Button>
        
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold col-span-2" onClick={() => appendToDisplay('0')}>0</Button>
        <Button variant="outline" className="calc-btn calc-btn-number p-4 text-lg font-semibold" onClick={() => appendToDisplay('.')}>.</Button>
        <Button className="calc-btn calc-btn-operator p-4 text-lg font-semibold" onClick={() => appendToDisplay('+')}>+</Button>
        
        <Button className="calc-btn calc-btn-equals p-4 text-lg font-semibold col-span-4" onClick={calculateResult}>=</Button>
      </div>
    </div>
  );
}
