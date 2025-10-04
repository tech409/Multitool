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
        
        <Button className="calc-btn calc-btn-equals p-4 text-lg font-semibold col-span-4" onClick={calculateResult} data-testid="button-equals">=</Button>
      </div>

      {/* Comprehensive Content Section */}
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About Our Scientific Calculator</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our free online scientific calculator is a powerful computational tool designed for students, professionals, engineers, and anyone who needs to perform complex mathematical calculations quickly and accurately. Whether you're solving advanced physics problems, conducting statistical analysis, or working through engineering equations, this calculator provides all the essential functions you need in one convenient, easy-to-use interface.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Why Use an Online Scientific Calculator?</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Traditional scientific calculators can be expensive and easily misplaced. Our web-based calculator offers several advantages: it's completely free, accessible from any device with internet connectivity, requires no downloads or installations, and is always available when you need it. Students can access it during homework sessions, professionals can use it for quick calculations at work, and educators can demonstrate mathematical concepts in real-time. The calculator works seamlessly on desktops, laptops, tablets, and smartphones, making it the perfect companion for mathematical problem-solving on the go.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Advanced Mathematical Functions</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This scientific calculator goes beyond basic arithmetic to include comprehensive trigonometric functions including sine, cosine, and tangent calculations essential for geometry, physics, and engineering applications. The logarithmic functions (both common logarithm and natural logarithm) enable complex exponential calculations required in chemistry, biology, and advanced mathematics. Square root and power functions allow for quick polynomial evaluations and algebraic manipulations. Mathematical constants π (pi) and e (Euler's number) are readily accessible for precise scientific calculations without manual input errors.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">User-Friendly Features</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We've designed this calculator with user experience in mind. The intuitive button layout mirrors traditional scientific calculators, reducing the learning curve for new users. Full keyboard support means you can type calculations directly using your computer keyboard - simply enter numbers and operators, press Enter for results, and use the C key to clear. The large, responsive display shows your current calculation and maintains a history of recent operations, helping you track your work and verify results. The dark mode option ensures comfortable use during extended calculation sessions and reduces eye strain in low-light environments.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Perfect for Multiple Applications</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This calculator serves diverse needs across various fields. Students use it for algebra, calculus, trigonometry, and physics homework. Engineers rely on it for structural calculations, electrical circuit analysis, and mechanical design work. Scientists employ it for laboratory calculations, data analysis, and research computations. Financial professionals utilize it for compound interest calculations and statistical analysis. The calculator's versatility makes it an indispensable tool for anyone working with numbers and mathematical formulas.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Explore More Tools</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          While you're here, discover our other professional tools designed to make your work easier. Need to work with measurements? Try our <a href="/units" className="text-blue-600 dark:text-blue-400 hover:underline">Unit Converter</a> for seamless conversion between metric and imperial units including length, weight, temperature, and volume. Planning international travel or handling foreign transactions? Use our <a href="/currency" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Converter</a> for real-time exchange rates across major world currencies. Concerned about health and fitness? Check out our <a href="/bmi" className="text-blue-600 dark:text-blue-400 hover:underline">BMI Calculator</a> for personalized health insights. Working on construction or DIY projects? Our <a href="/level" className="text-blue-600 dark:text-blue-400 hover:underline">Digital Spirit Level</a> uses your device's gyroscope for professional-grade leveling measurements. All tools are free, fast, and optimized for accuracy.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Tips for Efficient Use</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          To maximize your productivity with this calculator, familiarize yourself with keyboard shortcuts for faster input. Use parentheses to clearly define order of operations in complex expressions. Remember that trigonometric functions typically work with radians, so convert degrees if necessary. Take advantage of the mathematical constants π and e for more accurate results instead of manually typing approximate values. The clear button (C) gives you a fresh start whenever needed. For repeated similar calculations, the display history helps you track patterns and verify results across multiple operations.
        </p>
      </div>
    </div>
  );
}
