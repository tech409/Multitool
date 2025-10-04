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
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Hand Level</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
          Professional digital level using your device's gyroscope for precise measurements
        </p>
        
        {/* Features List */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Features:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Gyroscope-based precision leveling
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Calibration for accurate readings
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Visual bubble level interface
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Real-time orientation feedback
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Works on mobile devices
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Persistent calibration settings
            </div>
          </div>
        </div>
        
        {/* Usage Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>How to use:</strong> Grant permission, calibrate for accuracy, then use for leveling surfaces. 
          Perfect for construction, furniture assembly, and home improvement projects.</p>
        </div>
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

      {/* Comprehensive Content Section */}
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Professional Digital Spirit Level</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our digital spirit level transforms your smartphone or tablet into a professional-grade leveling tool using advanced gyroscope sensor technology. Whether you're hanging pictures, installing shelves, building furniture, laying tiles, or working on major construction projects, this tool provides accurate level measurements comparable to traditional bubble levels but with the convenience of a device you already carry. The digital display shows precise angle measurements in real-time, making it easier than ever to achieve perfectly level surfaces and straight lines in any DIY or professional application.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">How Gyroscope Technology Works</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Modern smartphones and tablets contain sophisticated gyroscope sensors (also called accelerometers and orientation sensors) that detect device position and tilt with remarkable precision. These micro-electromechanical systems (MEMS) measure angular velocity and orientation changes, providing data that our level tool interprets to show whether surfaces are truly horizontal or vertical. The technology is similar to what enables screen rotation, gaming motion controls, and navigation systems. Our digital level reads these sensor values continuously, processing them to display accurate tilt measurements in degrees along both X and Y axes. This provides more precise feedback than traditional bubble levels, where the bubble position can be subjective and difficult to read accurately.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Calibration for Perfect Accuracy</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Calibration ensures your digital level provides accurate measurements by establishing a reference point for true level. To calibrate, place your device on a known flat, level surface - a machinist's level table, precisely leveled workbench, or other verified flat surface. Then press the Calibrate button in the app. This process records any inherent tilt in your device's sensor mounting and adjusts all future measurements accordingly. Calibration compensates for manufacturing variations in sensor placement and any protective case thickness that might affect readings. We recommend calibrating before beginning each project, especially when high precision matters. Store your calibration data locally so it persists between uses. If you notice inconsistent readings, recalibrate on a known level surface to restore accuracy.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Applications and Use Cases</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This digital level serves countless applications in construction, renovation, and everyday tasks. Home improvers use it to hang picture frames, mirrors, and artwork perfectly straight. Carpenters check deck posts, framing members, and fence lines for proper vertical alignment. Tile installers verify floor and wall surfaces before laying tile to prevent lippage and ensure proper drainage. Cabinet installers level base and upper cabinets for professional appearance and proper door operation. RV owners level their vehicles for comfort and appliance operation. Furniture builders ensure table and desk surfaces are perfectly flat. Landscapers grade patios and walkways for proper water runoff. Solar panel installers optimize panel angles for maximum energy production. Machinists verify machine bed levelness for precision work. Pool table owners check playing surface levelness for accurate ball roll.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Advantages Over Traditional Levels</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Digital levels offer several advantages compared to traditional bubble levels. Precise numerical readouts show exact tilt in degrees rather than approximate bubble positions. You always have this tool available since you carry your smartphone everywhere. No need to purchase multiple length levels for different applications - one device serves all needs. The digital display works equally well in any lighting condition, unlike bubble levels that can be hard to read in dim or bright light. You can measure surfaces at any angle, not just horizontal and vertical. The tool stores calibration settings automatically. Share measurements digitally with team members or clients. No risk of bubbles becoming sluggish or levels getting out of calibration from dropping. The tool costs nothing beyond your existing device, compared to professional levels costing $50-500 depending on length and quality.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Tips for Best Results</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          For optimal accuracy, always calibrate before beginning work. Place your device flat on the surface being measured - using it at an angle or holding it can introduce errors. Remove thick phone cases during critical measurements as they can affect sensor readings. Allow a moment for readings to stabilize after placing the device, as sensors need brief settling time. For long surfaces, take multiple measurements at different points rather than relying on a single reading. Be aware that very precise work (like machinist applications requiring 0.001" accuracy) may exceed smartphone sensor capabilities - use professional precision levels for such applications. Protect your device from damage on job sites using appropriate cases. For outdoor use in bright sunlight, increase screen brightness for better visibility. The tolerance setting (default ±2 degrees) can be mentally adjusted for different applications - picture hanging might accept ±1 degree while rough construction work might accept ±3 degrees.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Complete Your Tool Collection</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Enhance your project planning with our other professional tools. Need to calculate angles, dimensions, or material quantities? Use our <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Scientific Calculator</a> for construction math including rise/run calculations, board feet, and material estimates. Working with international materials or specifications? Try our <a href="/units" className="text-blue-600 dark:text-blue-400 hover:underline">Unit Converter</a> for seamless conversion between metric and imperial measurements used in different countries' building codes and materials. Ordering materials from international suppliers? Check our <a href="/currency" className="text-blue-600 dark:text-blue-400 hover:underline">Currency Converter</a> for accurate cost comparisons. Monitoring physical demands of construction work? Our <a href="/bmi" className="text-blue-600 dark:text-blue-400 hover:underline">BMI Calculator</a> helps maintain health during physically demanding projects.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Safety and Practical Considerations</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          While extremely useful, remember that smartphones aren't designed as primary tools for professional construction environments. Protect your device from impacts, dust, moisture, and extreme temperatures common on job sites. Use protective cases and screen protectors. Consider dedicated rugged devices for harsh environment work. Don't place expensive devices on unstable surfaces where they might fall. For critical structural work where safety is paramount, verify digital level readings with professional grade mechanical levels - use the digital tool as a quick check and the professional level for final verification. Remember that level surfaces may not always be appropriate - roofs need slope for drainage, ramps require specific angles for accessibility, and some designs intentionally use unlevel surfaces for aesthetic or functional purposes. Always follow building codes and engineering specifications rather than assuming everything should be perfectly level.
        </p>
      </div>
    </div>
  );
}
