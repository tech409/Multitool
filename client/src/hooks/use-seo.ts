import { useEffect } from 'react';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  canonical?: string;
}

// SEO data for each tool with trending keywords for 2025
export const toolSEOData: Record<string, SEOData> = {
  calculator: {
    title: "Free Scientific Calculator Online - Advanced Math Calculator 2025",
    description: "Free online scientific calculator with trigonometry, logarithms, and advanced functions. Perfect for students, engineers, and professionals. Works on mobile and desktop.",
    keywords: "scientific calculator, online calculator, math calculator, free calculator, advanced calculator, trigonometry calculator, logarithm calculator, engineering calculator, mobile calculator",
    ogTitle: "Free Scientific Calculator - Advanced Online Math Tool",
    ogDescription: "Professional scientific calculator with all advanced functions. Free, fast, and works on any device. Perfect for students and professionals.",
    twitterTitle: "Scientific Calculator Online - Free Math Tool",
    twitterDescription: "Advanced scientific calculator with trigonometry, logs, and more. Free and mobile-friendly."
  },
  currency: {
    title: "Live Currency Converter - Real-Time Exchange Rates 2025",
    description: "Convert currencies instantly with live exchange rates. Support for 160+ currencies including USD, EUR, GBP, JPY. Free real-time currency conversion tool.",
    keywords: "currency converter, exchange rates, live exchange rates, currency calculator, money converter, forex converter, real-time rates, currency exchange tool, international currency",
    ogTitle: "Currency Converter - Live Exchange Rates",
    ogDescription: "Convert between 160+ currencies with real-time exchange rates. Free, accurate, and updated every minute.",
    twitterTitle: "Live Currency Converter Tool",
    twitterDescription: "Real-time currency conversion for 160+ currencies. Always up-to-date exchange rates."
  },
  units: {
    title: "Unit Converter - Length, Weight, Temperature & Volume Calculator",
    description: "Convert units instantly: length (meters, feet), weight (kg, lbs), temperature (°C, °F), volume (liters, gallons). Free unit conversion calculator.",
    keywords: "unit converter, measurement converter, length converter, weight converter, temperature converter, volume converter, metric converter, imperial converter, conversion calculator",
    ogTitle: "Unit Converter - All Measurement Conversions",
    ogDescription: "Convert between metric and imperial units. Length, weight, temperature, volume conversions in one tool.",
    twitterTitle: "Free Unit Converter Tool",
    twitterDescription: "Convert length, weight, temperature, volume units instantly. Metric to imperial and vice versa."
  },
  level: {
    title: "Digital Spirit Level - Gyroscope Phone Level Tool 2025",
    description: "Turn your phone into a professional spirit level using gyroscope sensor. Accurate bubble level app for construction, DIY, and professional use.",
    keywords: "spirit level, bubble level, phone level, gyroscope level, digital level, construction level, DIY level tool, mobile level, inclinometer, angle measurement",
    ogTitle: "Digital Spirit Level - Phone Gyroscope Tool",
    ogDescription: "Professional spirit level using your phone's gyroscope. Perfect for construction, hanging pictures, and DIY projects.",
    twitterTitle: "Phone Spirit Level Tool",
    twitterDescription: "Turn your phone into a professional spirit level. Uses gyroscope for accurate measurements."
  },
  bmi: {
    title: "BMI Calculator - Body Mass Index Calculator with Health Tips 2025",
    description: "Calculate your BMI (Body Mass Index) instantly. Get personalized health recommendations based on your results. Free BMI calculator with metric and imperial units.",
    keywords: "BMI calculator, body mass index, BMI chart, weight calculator, health calculator, obesity calculator, fitness calculator, body weight index, health assessment tool",
    ogTitle: "BMI Calculator - Check Your Body Mass Index",
    ogDescription: "Calculate your BMI instantly and get personalized health recommendations. Supports metric and imperial units.",
    twitterTitle: "Free BMI Calculator Tool",
    twitterDescription: "Calculate your Body Mass Index and get health recommendations. Fast, accurate, and free."
  },
  home: {
    title: "MultiTool Pro - 5 Essential Online Tools in One App",
    description: "Free online toolkit with 5 essential tools: scientific calculator, currency converter, unit converter, BMI calculator, and spirit level. All tools work on mobile and desktop.",
    keywords: "online tools, free calculator, currency converter, unit converter, BMI calculator, spirit level, utility tools, mobile tools, web tools, productivity tools",
    ogTitle: "MultiTool Pro - Free Online Utility Tools",
    ogDescription: "5 essential tools in one place: calculator, converters, BMI calculator, and level. Free, fast, and mobile-friendly.",
    twitterTitle: "MultiTool Pro - Free Online Tools",
    twitterDescription: "5 essential tools in one app: calculator, converters, BMI calculator, and level tool. All free!"
  }
};

export function useSEO(toolKey: string = 'home') {
  useEffect(() => {
    const seoData = toolSEOData[toolKey] || toolSEOData.home;
    
    // Update title
    document.title = seoData.title;
    
    // Update meta tags
    updateMetaTag('name', 'description', seoData.description);
    updateMetaTag('name', 'keywords', seoData.keywords);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', seoData.ogTitle);
    updateMetaTag('property', 'og:description', seoData.ogDescription);
    updateMetaTag('property', 'og:url', `${window.location.origin}${window.location.pathname}`);
    
    // Update Twitter tags
    updateMetaTag('property', 'twitter:title', seoData.twitterTitle);
    updateMetaTag('property', 'twitter:description', seoData.twitterDescription);
    updateMetaTag('property', 'twitter:url', `${window.location.origin}${window.location.pathname}`);
    
    // Update canonical URL
    updateCanonicalLink(`${window.location.origin}${window.location.pathname}`);
    
  }, [toolKey]);
}

function updateMetaTag(attribute: string, name: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', url);
}
