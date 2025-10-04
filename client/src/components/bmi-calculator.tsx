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
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">BMI Calculator</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Calculate your Body Mass Index and receive personalized health insights and recommendations
        </p>
        
        {/* Features List */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Features:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Multiple unit support (metric/imperial)
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Instant BMI calculation
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Health category classification
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Visual BMI scale indicator
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Personalized health recommendations
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Scientific WHO standards
            </div>
          </div>
        </div>
        
        {/* Usage Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>How to use:</strong> Enter your height and weight, get instant BMI calculation with health insights. 
          Consult healthcare professionals for personalized medical advice.</p>
        </div>
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

      {/* Comprehensive Content Section */}
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Understanding Body Mass Index (BMI)</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Body Mass Index (BMI) is a widely used health screening tool that estimates body fat based on height and weight measurements. Developed by Belgian mathematician Adolphe Quetelet in the 1830s, BMI provides a simple numerical measure helping individuals and healthcare professionals assess whether someone's weight falls within healthy ranges. Our BMI calculator offers instant results with personalized health recommendations, supporting both metric (centimeters and kilograms) and imperial (feet, inches, and pounds) measurement systems for universal accessibility.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">How BMI Calculation Works</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          BMI is calculated using a straightforward formula: weight in kilograms divided by height in meters squared (kg/m²). For imperial measurements, the formula is: (weight in pounds × 703) / (height in inches squared). Our calculator handles these conversions automatically regardless of which measurement system you use. The resulting number is then compared against standard BMI categories established by the World Health Organization: Underweight (below 18.5), Normal weight (18.5-24.9), Overweight (25-29.9), and Obese (30 and above). These categories help identify potential health risks associated with being significantly above or below healthy weight ranges for your height.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Why BMI Matters for Health</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Research shows strong correlations between BMI categories and various health outcomes. Higher BMI values are associated with increased risks of cardiovascular disease, type 2 diabetes, high blood pressure, certain cancers, sleep apnea, osteoarthritis, and reduced life expectancy. Lower BMI values can indicate malnutrition, weakened immune function, osteoporosis risk, and other health concerns. However, BMI is a screening tool, not a diagnostic instrument. It doesn't directly measure body fat percentage, muscle mass, bone density, or overall body composition. Athletes with high muscle mass may have high BMIs despite low body fat. Elderly individuals may have normal BMIs despite reduced muscle mass. Healthcare providers consider BMI alongside other factors including waist circumference, blood pressure, blood sugar levels, cholesterol, and family history for comprehensive health assessments.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Interpreting Your BMI Results</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our calculator provides your BMI value, category classification, visual scale indicator, and personalized health recommendations. If your BMI falls in the underweight category, consider consulting a healthcare provider about nutritional needs and potential underlying health issues. Normal weight BMI suggests you're maintaining healthy body weight relative to height - continue healthy eating and regular exercise. Overweight BMI indicates modest health risks that may be reduced through lifestyle modifications including balanced nutrition and increased physical activity. Obese BMI suggests significant health risks requiring medical guidance for safe, sustainable weight loss strategies. Remember that BMI is one health indicator among many - muscle mass, age, gender, ethnicity, and overall fitness levels all influence healthy weight ranges.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">BMI Limitations and Considerations</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          While BMI is useful for population-level health assessments and individual screening, it has important limitations. It doesn't distinguish between muscle and fat mass, potentially misclassifying muscular athletes as overweight or obese. It doesn't account for fat distribution - abdominal fat poses greater health risks than hip or thigh fat, yet BMI treats all fat equally. Age affects body composition, with older adults naturally losing muscle mass. Gender differences exist, with women typically having more body fat than men at the same BMI. Ethnic variations matter, with some populations experiencing health risks at lower BMI thresholds. Pregnancy, growth spurts in children, and certain medical conditions also affect appropriate BMI interpretation. For comprehensive health assessment, combine BMI with waist circumference measurements, body composition analysis, and medical evaluation.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Achieving and Maintaining Healthy Weight</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          If your BMI suggests weight management would benefit your health, focus on sustainable lifestyle changes rather than crash diets. Balanced nutrition emphasizing whole foods, vegetables, fruits, lean proteins, and whole grains supports healthy weight. Regular physical activity including both cardiovascular exercise and strength training builds muscle, burns calories, and improves overall health. Adequate sleep affects hunger hormones and metabolism. Stress management prevents emotional eating. Stay hydrated and limit sugary drinks. Set realistic goals - losing 1-2 pounds per week is sustainable. Track progress through measurements beyond just weight, including energy levels, fitness improvements, and how clothes fit. Consult registered dietitians for personalized nutrition plans and healthcare providers before starting significant diet or exercise programs, especially if you have existing health conditions.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Additional Health Tools</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Complement your health monitoring with our other professional tools. Track fitness calculations using our <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Scientific Calculator</a> for calorie computations, macro ratios, and exercise metrics. Converting international nutrition labels? Use our <a href="/units" className="text-blue-600 dark:text-blue-400 hover:underline">Unit Converter</a> for accurate weight, volume, and temperature conversions when following recipes from different countries. Planning health-focused travel? Check our <a href="/currency" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Converter</a> for budgeting international wellness retreats or gym memberships. Need precise measurements for home workouts? Our <a href="/level" className="text-blue-600 dark:text-blue-400 hover:underline">Digital Spirit Level</a> helps set up exercise equipment correctly.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">When to Seek Professional Guidance</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Consult healthcare professionals if your BMI indicates underweight or obesity categories, if you're experiencing unexplained weight changes, if you have existing health conditions affected by weight, or if you're planning significant dietary or exercise changes. Registered dietitians provide personalized nutrition counseling. Personal trainers design safe, effective exercise programs. Physicians identify underlying medical issues affecting weight. Mental health professionals help address emotional eating and body image concerns. Medical weight loss programs offer comprehensive support including medication or surgical options when appropriate. Children's BMI requires pediatric evaluation using age and sex-specific growth charts. Pregnant women need specialized guidance as BMI calculations don't apply during pregnancy. Senior citizens benefit from geriatric assessment considering age-related body composition changes. Remember: sustainable health improvements come from long-term lifestyle changes, not quick fixes.
        </p>
      </div>
    </div>
  );
}
