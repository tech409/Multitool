import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BMICalculator } from "@/lib/calculations";

export function BMICalculatorComponent() {
  const [heightValue, setHeightValue] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [bmiResult, setBmiResult] = useState<{
    value: number;
    category: string;
    color: string;
    recommendations: string;
    indicatorPosition: number;
  } | null>(null);

  const calculateBMI = () => {
    try {
      let bmi: number;
      
      if (heightUnit === "ft") {
        const feetValue = parseFloat(feet) || 0;
        const inchesValue = parseFloat(inches) || 0;
        const weight = parseFloat(weightValue);
        
        if (!weight || (!feetValue && !inchesValue)) {
          alert('Please enter both height and weight values');
          return;
        }
        
        bmi = BMICalculator.calculateFromFeetInches(feetValue, inchesValue, weight, weightUnit);
      } else {
        const height = parseFloat(heightValue);
        const weight = parseFloat(weightValue);
        
        if (!height || !weight) {
          alert('Please enter both height and weight values');
          return;
        }
        
        bmi = BMICalculator.calculate(height, weight, heightUnit, weightUnit);
      }
      
      const { category, color } = BMICalculator.getCategory(bmi);
      const recommendations = BMICalculator.getRecommendations(bmi);
      const indicatorPosition = BMICalculator.getBMIIndicatorPosition(bmi);
      
      setBmiResult({
        value: bmi,
        category,
        color,
        recommendations,
        indicatorPosition
      });
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Calculation error');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">BMI Calculator</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Calculate your Body Mass Index and health category</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Height Input */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">Height</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Enter height"
              value={heightValue}
              onChange={(e) => setHeightValue(e.target.value)}
              className={`flex-1 ${heightUnit === "ft" ? "hidden" : ""}`}
            />
            <Select value={heightUnit} onValueChange={setHeightUnit}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="ft">ft/in</SelectItem>
                <SelectItem value="m">m</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {heightUnit === "ft" && (
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Feet"
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Inches"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                className="flex-1"
              />
            </div>
          )}
        </div>

        {/* Weight Input */}
        <div className="space-y-4">
          <Label className="block text-sm font-medium">Weight</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Enter weight"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              className="flex-1"
            />
            <Select value={weightUnit} onValueChange={setWeightUnit}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={calculateBMI} className="w-full mb-6">
        Calculate BMI
      </Button>

      {/* BMI Result */}
      {bmiResult && (
        <div className="animate-slide-up">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {bmiResult.value.toFixed(1)}
              </div>
              <div className={`text-lg font-semibold ${bmiResult.color}`}>
                {bmiResult.category}
              </div>
            </div>
            
            {/* BMI Scale */}
            <div className="relative mb-4">
              <div className="h-4 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full"></div>
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full transform -translate-x-1/2 -translate-y-px"
                style={{
                  top: '-2px',
                  left: `${Math.min(Math.max(bmiResult.indicatorPosition, 0), 100)}%`
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-xs text-center text-gray-600 dark:text-gray-400">
              <div>Underweight<br />&lt;18.5</div>
              <div>Normal<br />18.5-24.9</div>
              <div>Overweight<br />25-29.9</div>
              <div>Obese<br />≥30</div>
            </div>
          </div>

          {/* Health Recommendations */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">Health Recommendations</h3>
            <div 
              className="text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: bmiResult.recommendations }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
