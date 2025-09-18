import { useEffect } from 'react';

interface StructuredDataProps {
  toolKey: string;
}

const structuredDataMap: Record<string, object> = {
  calculator: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Scientific Calculator",
    "description": "Free online scientific calculator with trigonometry, logarithms, and advanced mathematical functions.",
    "url": "https://toolsuitpro.vercel.app/?tool=calculator",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "MultiTool Pro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Trigonometric functions",
      "Logarithmic calculations",
      "Scientific notation",
      "Memory functions",
      "History tracking"
    ]
  },
  currency: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Currency Converter",
    "description": "Real-time currency converter with live exchange rates for 160+ currencies worldwide.",
    "url": "https://toolsuitpro.vercel.app/?tool=currency",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "MultiTool Pro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Live exchange rates",
      "160+ currencies supported",
      "Real-time updates",
      "Historical data",
      "Mobile responsive"
    ]
  },
  units: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Unit Converter",
    "description": "Comprehensive unit converter for length, weight, temperature, and volume measurements.",
    "url": "https://toolsuitpro.vercel.app/?tool=units",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "MultiTool Pro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Length conversion",
      "Weight conversion",
      "Temperature conversion",
      "Volume conversion",
      "Metric and Imperial units"
    ]
  },
  level: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Digital Spirit Level",
    "description": "Professional spirit level tool using phone gyroscope sensor for accurate measurements.",
    "url": "https://toolsuitpro.vercel.app/?tool=level",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "MultiTool Pro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Gyroscope sensor integration",
      "Real-time bubble level",
      "Calibration support",
      "Professional accuracy",
      "Construction grade"
    ]
  },
  bmi: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "BMI Calculator",
    "description": "Body Mass Index calculator with health recommendations and personalized insights.",
    "url": "https://toolsuitpro.vercel.app/?tool=bmi",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Any",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "MultiTool Pro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "BMI calculation",
      "Health recommendations",
      "Weight categories",
      "Metric and Imperial units",
      "Health insights"
    ]
  },
  home: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MultiTool Pro",
    "description": "Comprehensive online toolkit with 5 essential tools: calculator, converters, BMI calculator, and spirit level.",
    "url": "https://toolsuitpro.vercel.app/",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "softwareVersion": "1.0",
    "author": {
      "@type": "Organization",
      "name": "MultiTool Pro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Scientific Calculator",
      "Currency Converter", 
      "Unit Converter",
      "Digital Spirit Level",
      "BMI Calculator"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Tools Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Scientific Calculator"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Currency Converter"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Unit Converter"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Digital Spirit Level"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "BMI Calculator"
          }
        }
      ]
    }
  }
};

export function StructuredData({ toolKey }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const structuredData = structuredDataMap[toolKey] || structuredDataMap.home;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup when component unmounts
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [toolKey]);

  return null; // This component doesn't render anything visible
}
