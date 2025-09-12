import { UNIT_CONVERSIONS } from "./constants";

export class Calculator {
  static evaluate(expression: string): number {
    // Replace display operators with JavaScript operators
    const cleanExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');
    
    try {
      // Use Function constructor for safer evaluation than eval
      return Function(`"use strict"; return (${cleanExpression})`)();
    } catch (error) {
      throw new Error("Invalid expression");
    }
  }

  static sin(value: number): number {
    return Math.sin(value * Math.PI / 180);
  }

  static cos(value: number): number {
    return Math.cos(value * Math.PI / 180);
  }

  static tan(value: number): number {
    return Math.tan(value * Math.PI / 180);
  }

  static log(value: number): number {
    return Math.log10(value);
  }

  static ln(value: number): number {
    return Math.log(value);
  }

  static sqrt(value: number): number {
    return Math.sqrt(value);
  }

  static pow(value: number, exponent: number = 2): number {
    return Math.pow(value, exponent);
  }

  static formatResult(value: number): string {
    if (isNaN(value) || !isFinite(value)) {
      return "Error";
    }
    
    // Format to avoid scientific notation for reasonable numbers
    if (Math.abs(value) < 1e-6 && value !== 0) {
      return value.toExponential(6);
    }
    
    if (Math.abs(value) > 1e12) {
      return value.toExponential(6);
    }
    
    // Remove unnecessary decimals
    const formatted = parseFloat(value.toPrecision(12)).toString();
    return formatted.length > 12 ? parseFloat(value.toPrecision(8)).toString() : formatted;
  }
}

export class UnitConverter {
  static convert(value: number, fromUnit: string, toUnit: string, category: keyof typeof UNIT_CONVERSIONS): number {
    if (fromUnit === toUnit) return value;
    
    if (category === "temperature") {
      return this.convertTemperature(value, fromUnit, toUnit);
    }
    
    const conversions = UNIT_CONVERSIONS[category].conversions as any;
    const conversionRate = conversions[fromUnit]?.[toUnit];
    
    if (!conversionRate) {
      throw new Error(`Conversion not available from ${fromUnit} to ${toUnit}`);
    }
    
    return value * conversionRate;
  }

  private static convertTemperature(value: number, from: string, to: string): number {
    // Convert to Celsius first
    let celsius = value;
    if (from === "fahrenheit") {
      celsius = (value - 32) * 5/9;
    } else if (from === "kelvin") {
      celsius = value - 273.15;
    }
    
    // Convert from Celsius to target
    if (to === "fahrenheit") {
      return celsius * 9/5 + 32;
    } else if (to === "kelvin") {
      return celsius + 273.15;
    }
    
    return celsius;
  }
}

export class BMICalculator {
  static calculate(height: number, weight: number, heightUnit: string, weightUnit: string): number {
    // Convert to metric units
    let heightInM = height;
    let weightInKg = weight;
    
    // Convert height to meters
    if (heightUnit === "cm") {
      heightInM = height / 100;
    } else if (heightUnit === "ft") {
      // This should be handled differently in the component for feet/inches
      heightInM = height * 0.3048;
    }
    
    // Convert weight to kg
    if (weightUnit === "lbs") {
      weightInKg = weight * 0.453592;
    }
    
    if (heightInM <= 0 || weightInKg <= 0) {
      throw new Error("Height and weight must be positive values");
    }
    
    return weightInKg / (heightInM * heightInM);
  }

  static calculateFromFeetInches(feet: number, inches: number, weight: number, weightUnit: string): number {
    const totalInches = feet * 12 + inches;
    const heightInM = totalInches * 0.0254;
    
    let weightInKg = weight;
    if (weightUnit === "lbs") {
      weightInKg = weight * 0.453592;
    }
    
    if (heightInM <= 0 || weightInKg <= 0) {
      throw new Error("Height and weight must be positive values");
    }
    
    return weightInKg / (heightInM * heightInM);
  }

  static getCategory(bmi: number): { category: string; color: string } {
    if (bmi < 18.5) {
      return { category: "Underweight", color: "text-blue-600 dark:text-blue-400" };
    } else if (bmi < 25) {
      return { category: "Normal Weight", color: "text-green-600 dark:text-green-400" };
    } else if (bmi < 30) {
      return { category: "Overweight", color: "text-yellow-600 dark:text-yellow-400" };
    } else {
      return { category: "Obese", color: "text-red-600 dark:text-red-400" };
    }
  }

  static getRecommendations(bmi: number): string {
    if (bmi < 18.5) {
      return `
        <h4 class="font-semibold text-blue-600 dark:text-blue-400 mb-2">Underweight</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Consult with a healthcare provider about healthy weight gain</li>
          <li>Focus on nutrient-rich, calorie-dense foods</li>
          <li>Consider strength training to build muscle mass</li>
          <li>Monitor for underlying health conditions</li>
        </ul>
      `;
    } else if (bmi < 25) {
      return `
        <h4 class="font-semibold text-green-600 dark:text-green-400 mb-2">Normal Weight</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Maintain your current healthy weight</li>
          <li>Continue regular physical activity (150+ minutes per week)</li>
          <li>Eat a balanced diet rich in fruits, vegetables, and whole grains</li>
          <li>Stay hydrated and get adequate sleep</li>
        </ul>
      `;
    } else if (bmi < 30) {
      return `
        <h4 class="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Overweight</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Aim for gradual weight loss (1-2 lbs per week)</li>
          <li>Increase physical activity to 300+ minutes per week</li>
          <li>Focus on portion control and mindful eating</li>
          <li>Consider consulting a nutritionist or healthcare provider</li>
        </ul>
      `;
    } else {
      return `
        <h4 class="font-semibold text-red-600 dark:text-red-400 mb-2">Obese</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Consult with healthcare providers for a comprehensive plan</li>
          <li>Start with low-impact exercises and gradually increase intensity</li>
          <li>Consider working with a registered dietitian</li>
          <li>Monitor for obesity-related health conditions</li>
          <li>Set realistic, achievable weight loss goals</li>
        </ul>
      `;
    }
  }

  static getBMIIndicatorPosition(bmi: number): number {
    if (bmi < 18.5) {
      return (bmi / 18.5) * 25;
    } else if (bmi < 25) {
      return 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
    } else if (bmi < 30) {
      return 50 + ((bmi - 25) / (30 - 25)) * 25;
    } else {
      return 75 + Math.min(((bmi - 30) / 10) * 25, 25);
    }
  }
}
