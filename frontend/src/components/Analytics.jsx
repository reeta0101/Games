import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    // Only initialize and track if the Measurement ID is provided in .env
    if (measurementId) {
      if (!ReactGA.isInitialized) {
        ReactGA.initialize(measurementId);
      }
      
      // Send a pageview on route change
      ReactGA.send({ 
        hitType: "pageview", 
        page: location.pathname + location.search 
      });
    }
  }, [location]);

  return null;
}
