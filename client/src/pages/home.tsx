import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSEO } from "@/hooks/use-seo";
import { StructuredData } from "@/components/structured-data";
import { ScientificCalculator } from "@/components/scientific-calculator";
import { CurrencyConverter } from "@/components/currency-converter";
import { UnitConverterComponent } from "@/components/unit-converter";
import { HandLevel } from "@/components/hand-level";
import { BMICalculatorComponent } from "@/components/bmi-calculator";
import { useLocation, Link } from "wouter";

type ActiveTab = "calculator" | "currency" | "units" | "level" | "bmi";

export default function Home() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  // Determine active tab from URL
  const getActiveTabFromPath = (path: string): ActiveTab => {
    switch (path) {
      case "/calculator":
        return "calculator";
      case "/currency":
        return "currency";
      case "/units":
        return "units";
      case "/level":
        return "level";
      case "/bmi":
        return "bmi";
      default:
        return "calculator"; // Default for root path
    }
  };
  
  const activeTab = getActiveTabFromPath(location);
  
  // Update SEO meta tags when active tool changes
  useSEO(activeTab);

  const tabs = [
    { id: "calculator" as const, label: "Calculator", path: "/calculator" },
    { id: "currency" as const, label: "Currency", path: "/currency" },
    { id: "units" as const, label: "Units", path: "/units" },
    { id: "level" as const, label: "Level", path: "/level" },
    { id: "bmi" as const, label: "BMI", path: "/bmi" },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "calculator":
        return <ScientificCalculator />;
      case "currency":
        return <CurrencyConverter />;
      case "units":
        return <UnitConverterComponent />;
      case "level":
        return <HandLevel />;
      case "bmi":
        return <BMICalculatorComponent />;
      default:
        return <ScientificCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* SEO Structured Data */}
      <StructuredData toolKey={activeTab} />
      
      {/* Header */}
      <header className="gradient-bg shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-primary">MT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MultiTool Pro</h1>
                <p className="text-blue-100 text-sm">Calculator & Converter Suite</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6 text-white" />
              ) : (
                <Sun className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <Link key={tab.id} href={tab.path}>
                <Button
                  variant="ghost"
                  className={`tab-btn px-4 py-3 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                >
                  {tab.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderActiveComponent()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 MultiTool Pro. Built for productivity and precision.</p>
            <p className="text-sm mt-2">Works offline • PWA Ready • Cross-platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
