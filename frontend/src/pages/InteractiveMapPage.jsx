import React, { useState } from 'react';
import indiaMap from '@svg-maps/india';
import { Tooltip } from 'react-tooltip';

const stateCapitals = {
  'Andhra Pradesh': 'Amaravati',
  'Arunachal Pradesh': 'Itanagar',
  'Assam': 'Dispur',
  'Bihar': 'Patna',
  'Chhattisgarh': 'Raipur',
  'Goa': 'Panaji',
  'Gujarat': 'Gandhinagar',
  'Haryana': 'Chandigarh',
  'Himachal Pradesh': 'Shimla',
  'Jharkhand': 'Ranchi',
  'Karnataka': 'Bengaluru',
  'Kerala': 'Thiruvananthapuram',
  'Madhya Pradesh': 'Bhopal',
  'Maharashtra': 'Mumbai',
  'Manipur': 'Imphal',
  'Meghalaya': 'Shillong',
  'Mizoram': 'Aizawl',
  'Nagaland': 'Kohima',
  'Odisha': 'Bhubaneswar',
  'Punjab': 'Chandigarh',
  'Rajasthan': 'Jaipur',
  'Sikkim': 'Gangtok',
  'Tamil Nadu': 'Chennai',
  'Telangana': 'Hyderabad',
  'Tripura': 'Agartala',
  'Uttar Pradesh': 'Lucknow',
  'Uttarakhand': 'Dehradun',
  'West Bengal': 'Kolkata',
  'Andaman and Nicobar Islands': 'Port Blair',
  'Chandigarh': 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu': 'Daman',
  'Delhi': 'New Delhi',
  'Jammu and Kashmir': 'Srinagar/Jammu',
  'Ladakh': 'Leh',
  'Lakshadweep': 'Kavaratti',
  'Puducherry': 'Puducherry'
};

export default function InteractiveMapPage() {
  const [hoveredState, setHoveredState] = useState(null);
  
  const handleLocationMouseOver = (event) => {
    const locationName = event.target.getAttribute('name');
    setHoveredState(locationName);
  };
  
  const handleLocationMouseOut = () => {
    setHoveredState(null);
  };

  const mapData = indiaMap.default || indiaMap;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col items-center gap-8 px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">Interactive Map</h1>
        <p className="mt-2 text-slate-400">Hover over any state to discover its capital!</p>
      </div>

      <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10 relative overflow-hidden flex flex-col items-center">
        <style dangerouslySetInnerHTML={{__html: `
          .svg-map {
            width: 100%;
            height: auto;
            stroke: #40e0f0;
            stroke-width: 1;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .svg-map__location {
            fill: rgba(255,255,255,0.05);
            cursor: pointer;
            transition: fill 0.2s, stroke-width 0.2s;
          }
          .svg-map__location:hover, .svg-map__location[aria-checked="true"] {
            fill: rgba(64, 224, 240, 0.4);
            stroke-width: 2;
            outline: 0;
          }
        `}} />
        
        <div data-tooltip-id="map-tooltip" className="w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={mapData.viewBox}
            className="svg-map"
            aria-label={mapData.label}
          >
            {mapData.locations.map((location) => (
              <path
                key={location.id}
                id={location.id}
                name={location.name}
                d={location.path}
                className="svg-map__location"
                onMouseOver={handleLocationMouseOver}
                onMouseOut={handleLocationMouseOut}
                onFocus={handleLocationMouseOver}
                onBlur={handleLocationMouseOut}
                tabIndex="0"
                aria-label={location.name}
              />
            ))}
          </svg>
        </div>

        <Tooltip 
          id="map-tooltip" 
          float={true}
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 100 }}
        >
          {hoveredState ? (
            <div className="text-center">
              <p className="text-lg font-black text-[#40e0f0]">{hoveredState}</p>
              <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest mt-1">
                {stateCapitals[hoveredState] || 'Capital Unknown'}
              </p>
            </div>
          ) : (
            <div className="text-slate-400">Hover over a state</div>
          )}
        </Tooltip>
      </section>
    </main>
  );
}
