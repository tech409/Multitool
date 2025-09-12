import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Orientation {
  x: number;
  y: number;
}

interface Calibration {
  x: number;
  y: number;
}

export function HandLevel() {
  const [orientation, setOrientation] = useState<Orientation>({ x: 0, y: 0 });
  const [calibration, setCalibration] = useState<Calibration>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [permissionGranted, setPermissionGranted] = useState(false);

  const tolerance = 2; // degrees

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const x = (event.beta || 0) - calibration.x;
    const y = (event.gamma || 0) - calibration.y;
    
    // Constrain values
    const constrainedX = Math.max(-90, Math.min(90, x));
    const constrainedY = Math.max(-90, Math.min(90, y));
    
    setOrientation({ x: constrainedX, y: constrainedY });
    
    // Update status
    const isLevel = Math.abs(constrainedX) < tolerance && Math.abs(constrainedY) < tolerance;
    setStatus(isLevel ? "LEVEL" : "Not Level");
  }, [calibration]);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          initializeLevel();
        } else {
          setStatus("Permission denied");
        }
      } catch (error) {
        setStatus("Permission request failed");
      }
    } else {
      // Non-iOS devices or older iOS versions
      setPermissionGranted(true);
      initializeLevel();
    }
  };

  const initializeLevel = () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      setIsActive(true);
      setStatus("Level Active");
    } else {
      setStatus("Gyroscope not supported");
    }
  };

  const calibrateLevel = () => {
    const handleCalibration = (event: DeviceOrientationEvent) => {
      const newCalibration = {
        x: event.beta || 0,
        y: event.gamma || 0
      };
      setCalibration(newCalibration);
      setStatus("Calibrated");
      
      // Store calibration in localStorage
      localStorage.setItem('levelCalibration', JSON.stringify(newCalibration));
      
      window.removeEventListener('deviceorientation', handleCalibration);
    };
    
    window.addEventListener('deviceorientation', handleCalibration);
  };

  useEffect(() => {
    // Load calibration from localStorage
    const savedCalibration = localStorage.getItem('levelCalibration');
    if (savedCalibration) {
      setCalibration(JSON.parse(savedCalibration));
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (!isActive && permissionGranted) {
      initializeLevel();
    }
  }, [permissionGranted]);

  const getBubbleColor = (isLevel: boolean) => {
    return isLevel ? "bg-green-400" : "bg-yellow-400";
  };

  const isLevel = Math.abs(orientation.x) < tolerance && Math.abs(orientation.y) < tolerance;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-md mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Hand Level</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Use device gyroscope for precision leveling</p>
      </div>

      {!permissionGranted && (
        <div className="text-center mb-6">
          <Button onClick={requestPermission} className="mb-4">
            Enable Gyroscope
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Permission required to access device orientation
          </p>
        </div>
      )}

      {permissionGranted && (
        <>
          {/* Level Display */}
          <div className="relative mb-6">
            {/* Horizontal Level */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-20 mx-auto relative overflow-hidden mb-4" style={{width: '300px'}}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-1 bg-gray-400 dark:bg-gray-500"></div>
                <div className="absolute w-1 h-full bg-gray-400 dark:bg-gray-500"></div>
              </div>
              <div 
                className={`level-bubble absolute w-8 h-8 rounded-full top-6 transition-all duration-100 ease-out ${getBubbleColor(isLevel)}`}
                style={{
                  left: `calc(50% + ${(orientation.y / 90) * 120}px)`,
                  transform: 'translateX(-50%)'
                }}
              ></div>
              <div className="absolute inset-x-0 bottom-1 text-center text-xs text-gray-600 dark:text-gray-400">
                {orientation.y.toFixed(1)}°
              </div>
            </div>

            {/* Vertical Level */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-20 mx-auto relative overflow-hidden" style={{height: '300px'}}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-full bg-gray-400 dark:bg-gray-500"></div>
                <div className="absolute w-full h-1 bg-gray-400 dark:bg-gray-500"></div>
              </div>
              <div 
                className={`level-bubble absolute w-8 h-8 rounded-full left-6 transition-all duration-100 ease-out ${getBubbleColor(isLevel)}`}
                style={{
                  top: `calc(50% + ${(orientation.x / 90) * 120}px)`,
                  transform: 'translateY(-50%)'
                }}
              ></div>
              <div className="absolute right-1 inset-y-0 flex items-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 transform rotate-90">
                  {orientation.x.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          {/* Level Status */}
          <div className="text-center mb-6">
            <div className={`text-lg font-semibold mb-2 ${isLevel ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {status}
            </div>
            <div className="flex justify-center space-x-4 text-sm">
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="text-gray-600 dark:text-gray-400">X: </span>
                <span className="font-mono">{orientation.x.toFixed(1)}°</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <span className="text-gray-600 dark:text-gray-400">Y: </span>
                <span className="font-mono">{orientation.y.toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {/* Calibration */}
          <div className="text-center">
            <Button onClick={calibrateLevel} variant="outline">
              Calibrate Level
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Place device on flat surface and calibrate
            </p>
          </div>
        </>
      )}
    </div>
  );
}
