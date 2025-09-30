/**
 * Feature carousel for the login page
 */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const FeatureCarousel = ({ features }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  const prevFeature = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const nextFeature = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  return (
    <div 
      className="relative text-white sm:hidden md:flex flex-col justify-between items-center p-6 md:p-8 transition-all duration-1000 ease-in-out"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${features[currentIndex].image})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center" 
      }}
    >
      <div className="text-6xl font-bold">BillBook+</div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full w-full">
        <div className="bg-opacity-10 p-4 rounded-lg max-w-md">
          <h2 className="text-2xl lg:text-3xl font-semibold mb-2 text-shadow-md text-white">
            {features[currentIndex].title}
          </h2>
          <p className="text-sm lg:text-base text-white">
            {features[currentIndex].description}
          </p>
        </div>
      </div>
      <button 
        onClick={prevFeature} 
        aria-label="Previous" 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 p-2 rounded-full z-20"
      >
        <ChevronLeft size={28} />
      </button>
      <button 
        onClick={nextFeature} 
        aria-label="Next" 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 p-2 rounded-full z-20"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

FeatureCarousel.propTypes = {
  features: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired
    })
  ).isRequired
};

export default FeatureCarousel;
