import React from 'react';
// Assuming Tailwind CSS is set up in your project

// --- BillBook+ Logo Component ---

function BillBookLogo({ className = "w-auto h-10" }) { // Default size, adjust as needed
  return (
    // Container div to apply color and potentially other styles
    <div className={`text-teal-700 font-bold ${className}`}>
      {/* SVG container ensures the text scales well */}
      <svg
        viewBox="0 0 150 30" // Adjust viewBox based on desired text aspect ratio
        preserveAspectRatio="xMidYMid meet" // Adjust aspect ratio handling if needed
        className="w-full h-full" // Make SVG fill the container
      >
        {/* Text element */}
        <text
          x="50%" // Center horizontally
          y="50%" // Center vertically
          dy=".3em" // Fine-tune vertical alignment
          textAnchor="middle" // Ensure text is centered from its middle point
          className="text-2xl" // Tailwind class for font size (adjust as needed)
          fill="currentColor" // Inherit color from parent div (text-teal-700)
        >
          BillBook+
        </text>
      </svg>
    </div>
  );
}

// Export the component
export default BillBookLogo;