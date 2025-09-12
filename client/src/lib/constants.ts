export const CURRENCIES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
} as const;

export const UNIT_CONVERSIONS = {
  length: {
    name: "Length",
    units: {
      mm: "Millimeter",
      cm: "Centimeter", 
      m: "Meter",
      km: "Kilometer",
      inch: "Inch",
      ft: "Foot",
      yard: "Yard",
      mile: "Mile"
    },
    conversions: {
      mm: { cm: 0.1, m: 0.001, km: 0.000001, inch: 0.0393701, ft: 0.00328084, yard: 0.00109361, mile: 0.000000621371 },
      cm: { mm: 10, m: 0.01, km: 0.00001, inch: 0.393701, ft: 0.0328084, yard: 0.0109361, mile: 0.00000621371 },
      m: { mm: 1000, cm: 100, km: 0.001, inch: 39.3701, ft: 3.28084, yard: 1.09361, mile: 0.000621371 },
      km: { mm: 1000000, cm: 100000, m: 1000, inch: 39370.1, ft: 3280.84, yard: 1093.61, mile: 0.621371 },
      inch: { mm: 25.4, cm: 2.54, m: 0.0254, km: 0.0000254, ft: 0.0833333, yard: 0.0277778, mile: 0.0000157828 },
      ft: { mm: 304.8, cm: 30.48, m: 0.3048, km: 0.0003048, inch: 12, yard: 0.333333, mile: 0.000189394 },
      yard: { mm: 914.4, cm: 91.44, m: 0.9144, km: 0.0009144, inch: 36, ft: 3, mile: 0.000568182 },
      mile: { mm: 1609344, cm: 160934.4, m: 1609.344, km: 1.609344, inch: 63360, ft: 5280, yard: 1760 }
    }
  },
  weight: {
    name: "Weight",
    units: {
      mg: "Milligram",
      g: "Gram",
      kg: "Kilogram",
      ton: "Metric Ton",
      oz: "Ounce",
      lb: "Pound",
      stone: "Stone"
    },
    conversions: {
      mg: { g: 0.001, kg: 0.000001, ton: 0.000000001, oz: 0.000035274, lb: 0.0000022046, stone: 0.00000015747 },
      g: { mg: 1000, kg: 0.001, ton: 0.000001, oz: 0.035274, lb: 0.0022046, stone: 0.00015747 },
      kg: { mg: 1000000, g: 1000, ton: 0.001, oz: 35.274, lb: 2.2046, stone: 0.15747 },
      ton: { mg: 1000000000, g: 1000000, kg: 1000, oz: 35274, lb: 2204.6, stone: 157.47 },
      oz: { mg: 28349.5, g: 28.3495, kg: 0.0283495, ton: 0.0000283495, lb: 0.0625, stone: 0.00446429 },
      lb: { mg: 453592, g: 453.592, kg: 0.453592, ton: 0.000453592, oz: 16, stone: 0.0714286 },
      stone: { mg: 6350290, g: 6350.29, kg: 6.35029, ton: 0.00635029, oz: 224, lb: 14 }
    }
  },
  temperature: {
    name: "Temperature",
    units: {
      celsius: "Celsius",
      fahrenheit: "Fahrenheit", 
      kelvin: "Kelvin"
    }
  },
  volume: {
    name: "Volume",
    units: {
      ml: "Milliliter",
      l: "Liter",
      m3: "Cubic Meter",
      tsp: "Teaspoon",
      tbsp: "Tablespoon",
      cup: "Cup",
      pint: "Pint",
      quart: "Quart",
      gallon: "Gallon"
    },
    conversions: {
      ml: { l: 0.001, m3: 0.000001, tsp: 0.202884, tbsp: 0.067628, cup: 0.00422675, pint: 0.00211338, quart: 0.00105669, gallon: 0.000264172 },
      l: { ml: 1000, m3: 0.001, tsp: 202.884, tbsp: 67.628, cup: 4.22675, pint: 2.11338, quart: 1.05669, gallon: 0.264172 },
      m3: { ml: 1000000, l: 1000, tsp: 202884, tbsp: 67628, cup: 4226.75, pint: 2113.38, quart: 1056.69, gallon: 264.172 },
      tsp: { ml: 4.92892, l: 0.00492892, m3: 0.00000492892, tbsp: 0.333333, cup: 0.0208333, pint: 0.0104167, quart: 0.00520833, gallon: 0.00130208 },
      tbsp: { ml: 14.7868, l: 0.0147868, m3: 0.0000147868, tsp: 3, cup: 0.0625, pint: 0.03125, quart: 0.015625, gallon: 0.00390625 },
      cup: { ml: 236.588, l: 0.236588, m3: 0.000236588, tsp: 48, tbsp: 16, pint: 0.5, quart: 0.25, gallon: 0.0625 },
      pint: { ml: 473.176, l: 0.473176, m3: 0.000473176, tsp: 96, tbsp: 32, cup: 2, quart: 0.5, gallon: 0.125 },
      quart: { ml: 946.353, l: 0.946353, m3: 0.000946353, tsp: 192, tbsp: 64, cup: 4, pint: 2, gallon: 0.25 },
      gallon: { ml: 3785.41, l: 3.78541, m3: 0.00378541, tsp: 768, tbsp: 256, cup: 16, pint: 8, quart: 4 }
    }
  },
  area: {
    name: "Area",
    units: {
      mm2: "Square Millimeter",
      cm2: "Square Centimeter",
      m2: "Square Meter",
      km2: "Square Kilometer",
      inch2: "Square Inch",
      ft2: "Square Foot",
      yard2: "Square Yard",
      acre: "Acre",
      mile2: "Square Mile"
    },
    conversions: {
      mm2: { cm2: 0.01, m2: 0.000001, km2: 0.000000000001, inch2: 0.00155, ft2: 0.0000107639, yard2: 0.00000119599, acre: 0.000000000247105, mile2: 0.000000000000386102 },
      cm2: { mm2: 100, m2: 0.0001, km2: 0.0000000001, inch2: 0.155, ft2: 0.00107639, yard2: 0.000119599, acre: 0.0000000247105, mile2: 0.0000000000386102 },
      m2: { mm2: 1000000, cm2: 10000, km2: 0.000001, inch2: 1550, ft2: 10.7639, yard2: 1.19599, acre: 0.000247105, mile2: 0.000000386102 },
      km2: { mm2: 1000000000000, cm2: 10000000000, m2: 1000000, inch2: 1550003100, ft2: 10763910.4, yard2: 1195990.05, acre: 247.105, mile2: 0.386102 },
      inch2: { mm2: 645.16, cm2: 6.4516, m2: 0.00064516, km2: 0.00000000064516, ft2: 0.00694444, yard2: 0.000771605, acre: 0.000000159423, mile2: 0.000000000249098 },
      ft2: { mm2: 92903, cm2: 929.03, m2: 0.092903, km2: 0.000000092903, inch2: 144, yard2: 0.111111, acre: 0.0000229568, mile2: 0.0000000358701 },
      yard2: { mm2: 836127, cm2: 8361.27, m2: 0.836127, km2: 0.000000836127, inch2: 1296, ft2: 9, acre: 0.000206612, mile2: 0.00000032283 },
      acre: { mm2: 4046856422.4, cm2: 40468564.224, m2: 4046.86, km2: 0.00404686, inch2: 6272640, ft2: 43560, yard2: 4840, mile2: 0.0015625 },
      mile2: { mm2: 2589988110336, cm2: 25899881103.36, m2: 2589988.11, km2: 2.58999, inch2: 4014489600, ft2: 27878400, yard2: 3097600, acre: 640 }
    }
  }
} as const;

export const BMI_CATEGORIES = {
  UNDERWEIGHT: { min: 0, max: 18.5, label: "Underweight", color: "text-blue-600 dark:text-blue-400" },
  NORMAL: { min: 18.5, max: 25, label: "Normal Weight", color: "text-green-600 dark:text-green-400" },
  OVERWEIGHT: { min: 25, max: 30, label: "Overweight", color: "text-yellow-600 dark:text-yellow-400" },
  OBESE: { min: 30, max: 100, label: "Obese", color: "text-red-600 dark:text-red-400" }
} as const;
