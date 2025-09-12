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
        <h2 className="text-2xl font-bold mb-2">Unit Converter</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Convert between different units of measurement</p>
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
    </div>
  );
}
