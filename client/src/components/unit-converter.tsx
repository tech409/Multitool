import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UNIT_CONVERSIONS } from "@/lib/constants";
import { UnitConverter } from "@/lib/calculations";

export function UnitConverterComponent() {
  const [category, setCategory] = useState<keyof typeof UNIT_CONVERSIONS>("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const [conversionFormula, setConversionFormula] = useState("");

  const updateUnitOptions = (newCategory: keyof typeof UNIT_CONVERSIONS) => {
    setCategory(newCategory);
    const units = Object.keys(UNIT_CONVERSIONS[newCategory].units);
    setFromUnit(units[0] || "");
    setToUnit(units[1] || units[0] || "");
  };

  const convertUnits = () => {
    try {
      const value = parseFloat(fromValue) || 0;
      
      if (!fromUnit || !toUnit) return;
      
      const result = UnitConverter.convert(value, fromUnit, toUnit, category);
      setToValue(result.toFixed(6));
      
      const fromUnitName = UNIT_CONVERSIONS[category].units[fromUnit as keyof typeof UNIT_CONVERSIONS[typeof category]['units']];
      const toUnitName = UNIT_CONVERSIONS[category].units[toUnit as keyof typeof UNIT_CONVERSIONS[typeof category]['units']];
      setConversionFormula(`${value} ${fromUnitName} = ${result.toFixed(6)} ${toUnitName}`);
    } catch (error) {
      setToValue("Error");
      setConversionFormula("Conversion error");
    }
  };

  useEffect(() => {
    updateUnitOptions(category);
  }, []);

  useEffect(() => {
    if (fromUnit && toUnit) {
      convertUnits();
    }
  }, [fromValue, fromUnit, toUnit, category]);

  useEffect(() => {
    const units = Object.keys(UNIT_CONVERSIONS[category].units);
    setFromUnit(units[0] || "");
    setToUnit(units[1] || units[0] || "");
  }, [category]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Unit Converter</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Convert between different units of measurement across length, weight, temperature, and volume
        </p>
        
        {/* Features List */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Supported Categories:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Length (meters, feet, inches, miles, etc.)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Weight (grams, pounds, ounces, kilograms)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Temperature (Celsius, Fahrenheit, Kelvin)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Volume (liters, gallons, cups, milliliters)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Instant conversion calculations
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              High precision results
            </div>
          </div>
        </div>
        
        {/* Usage Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>How to use:</strong> Select a category, choose units, enter value, and get instant conversions. 
          Essential for cooking, construction, science, and everyday measurements.</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-2">Category</Label>
        <Select value={category} onValueChange={(value) => updateUnitOptions(value as keyof typeof UNIT_CONVERSIONS)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(UNIT_CONVERSIONS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* From Unit */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">From</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UNIT_CONVERSIONS[category].units).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Enter value"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full"
          />
        </div>

        {/* To Unit */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UNIT_CONVERSIONS[category].units).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Converted value"
            value={toValue}
            readOnly
            className="w-full bg-gray-100 dark:bg-slate-600"
          />
        </div>
      </div>

      <Button onClick={convertUnits} className="w-full mb-4">
        Convert Units
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
        {conversionFormula || "Enter values to see conversion"}
      </div>

      {/* Comprehensive Content Section */}
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Master Unit Conversions Instantly</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our comprehensive unit converter simplifies the complex task of converting between different measurement systems. Whether you're working with metric measurements, imperial units, or need to switch between systems for international projects, our tool provides instant, accurate conversions across four major categories: length, weight, temperature, and volume. Perfect for students learning measurement systems, professionals working on global projects, home cooks adapting international recipes, and anyone needing quick unit conversions in daily life.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Why Unit Conversion Matters</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          The world uses two primary measurement systems: the metric system (used by most countries) and the imperial system (primarily used in the United States). This creates constant conversion challenges for international trade, scientific research, construction projects, and everyday activities. Engineers must convert specifications between systems when collaborating internationally. Travelers need to understand distances in kilometers versus miles, temperatures in Celsius versus Fahrenheit. Scientists require precise conversions for laboratory work and research publications. Our converter eliminates errors and saves time by handling these conversions automatically with professional-grade accuracy.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Length Conversions Made Simple</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Length conversions are essential for construction, engineering, sports, travel, and countless other applications. Our tool converts between meters, centimeters, kilometers, feet, inches, yards, and miles seamlessly. Architects convert building plans between metric and imperial measurements. Athletes track running distances in miles or kilometers based on their location. Fabric buyers convert between yards and meters for international orders. Land surveyors work with acres, hectares, and square meters. Whether you're measuring room dimensions for furniture, calculating travel distances, or working on professional engineering drawings, accurate length conversions prevent costly mistakes and ensure project success.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Weight and Mass Precision</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Weight conversions are crucial for shipping, cooking, scientific experiments, health monitoring, and commercial transactions. Convert effortlessly between grams, kilograms, pounds, ounces, and tons. Cooks adapt international recipes by converting ingredient measurements from metric to imperial or vice versa. Shipping companies calculate package weights in different units for international logistics. Fitness enthusiasts track body weight and lifting progress using their preferred measurement system. Scientists measure samples with precision using appropriate units for their field. Medical professionals convert medication dosages between systems. Accurate weight conversions ensure recipe success, proper dosing, fair commercial transactions, and scientific precision.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Temperature Conversion Essentials</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Temperature conversions between Celsius, Fahrenheit, and Kelvin are vital for weather forecasting, cooking, scientific research, and international communication. Weather reports vary by country, with most using Celsius while the US uses Fahrenheit. Bakers need precise oven temperature conversions when using recipes from different countries - a few degrees can make the difference between perfectly baked goods and kitchen disasters. Scientists use Kelvin for absolute temperature measurements in physics and chemistry. HVAC professionals work with multiple temperature scales when installing international equipment. Our converter handles these conversions accurately, accounting for the complex formulas required (temperature conversions aren't simple multiplication like other units).
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Volume Measurements for Every Need</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Volume conversions serve cooking, automotive, chemistry, construction, and many other fields. Convert between liters, milliliters, gallons, cups, pints, quarts, and fluid ounces with precision. Home cooks follow recipes from around the world by converting liquid measurements accurately. Automotive enthusiasts track fuel efficiency in miles per gallon or liters per 100 kilometers. Chemists measure solution volumes for experiments. Paint contractors calculate coverage areas using appropriate volume units. Beverage companies formulate products with precise volume measurements. Pool owners calculate chemical additions based on water volume. Whether measuring ingredients, fuel consumption, or chemical solutions, accurate volume conversions ensure proper proportions and successful outcomes.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Complete Your Toolkit</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Expand your capabilities with our other precision tools. Need complex calculations? Use our <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Scientific Calculator</a> for advanced mathematical operations essential in engineering and science. Working internationally? Try our <a href="/currency" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Converter</a> for real-time exchange rates on global transactions. Monitoring fitness goals? Check our <a href="/bmi" className="text-blue-600 dark:text-blue-400 hover:underline">BMI Calculator</a> for health insights. Need construction precision? Our <a href="/level" className="text-blue-600 dark:text-blue-400 hover:underline">Digital Spirit Level</a> ensures perfect alignment on any project using your device's built-in sensors.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Professional Tips and Best Practices</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          For best results, always double-check critical conversions, especially in professional or safety-critical applications. When cooking, remember that volume and weight conversions for ingredients can differ - a cup of flour weighs differently than a cup of water. In construction and engineering, maintain consistent units throughout a project to avoid errors. For international shipping, verify weight calculations with your carrier as they may use different rounding methods. Scientific work requires understanding significant figures - our converter provides high precision, but remember to round appropriately for your application. Store frequently used conversions for quick reference. When traveling, familiarize yourself with common conversions (like 1 mile ≈ 1.6 km) for mental calculations. Always specify units clearly in documentation to prevent misunderstandings.
        </p>
      </div>
    </div>
  );
}
