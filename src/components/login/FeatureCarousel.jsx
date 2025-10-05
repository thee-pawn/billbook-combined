/**
 * Feature carousel for the login page
 */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Star } from 'lucide-react';
import PropTypes from 'prop-types';
import icon from '../../assets/images/bb_icon.png';
import analyticsImg from "../../assets/images/analytics.jpeg";
import marketingImg from "../../assets/images/marketing.jpeg";
import staffImg from "../../assets/images/staff.jpeg";
import inventoryImg from "../../assets/images/inventory.jpeg";
import billingImg from "../../assets/images/billing.jpeg";
import bookingImg from "../../assets/images/booking.jpeg";

// Features data matching LandingPage with detailed descriptions
const features = [
  {
    title: "Appointment Booking",
    description: "Smart scheduling system with automated reminders and calendar integration",
    image: bookingImg,
    detailedDescription: {
      overview: "Transform your appointment scheduling with our intelligent booking system that adapts to your business needs.",
      keyFeatures: [
        "Appointment Scheduling",
        "Availability management with custom working hours",
        "Multi appointment bookings for events",
        "Automated SMS and WhatsApp reminders",
        "Advance payments and deposits",
        "Multi-staff scheduling with availability management",
        "Mini Website for online bookings",
        "Waitlist management for popular time slots"
      ],
      benefits: [
        "Reduce no-shows by up to 80% with automated reminders",
        "Save 5+ hours per week on scheduling tasks",
        "Improve customer satisfaction with 24/7 online booking",
        "Eliminate double-bookings and scheduling conflicts"
      ]
    }
  },
  {
    title: "Billing & Invoicing",
    description: "Professional invoices, payment tracking, and automated billing cycles",
    image: billingImg,
    detailedDescription: {
      overview: "Streamline your financial operations with comprehensive billing and invoicing tools designed for modern businesses.",
      keyFeatures: [
        "Customizable invoice templates with your branding",
        "Share bills over WhatsApp and SMS",
        "Late payment reminders and follow-up automation",
        "Tax calculation and compliance support",
        "Detailed payment analytics and reporting",
        "Expense tracking and categorization"
      ],
      benefits: [
        "Reduce cost with WhatsApp and SMS bill sharing",
        "Easily manage Staff revenue sharing with automated calculations",
        "Reduce accounting errors with automated calculations",
        "Improve cash flow with real-time payment tracking",
        "Save 10+ hours monthly on invoice management"
      ]
    }
  },
  {
    title: "Marketing Tools",
    description: "WhatsApp campaigns, SMS marketing, and customer engagement analytics",
    image: marketingImg,
    detailedDescription: {
      overview: "Grow your business with powerful marketing automation tools that help you reach the right customers at the right time.",
      keyFeatures: [
        "Customizable templates for marketing",
        "WhatsApp marketing with reports",
        "Customer segmentation based on behavior and preferences",
        "A/B testing for campaigns and subject lines",
        "Social media scheduling and management",
        "Automated Notifications and follow-ups",
        "Loyalty program management"
      ],
      benefits: [
        "Increase customer retention by 40% with targeted campaigns",
        "Boost revenue with personalized marketing messages",
        "Save 15+ hours weekly on marketing tasks",
        "Improve conversion rates with data-driven insights"
      ]
    }
  },
  {
    title: "Staff Management",
    description: "Complete HR management with payroll, attendance, and employee records",
    image: staffImg,
    detailedDescription: {
      overview: "Manage your entire workforce efficiently with our comprehensive Human Resource Management System.",
      keyFeatures: [
        "Employee onboarding and document management",
        "Time tracking and attendance monitoring",
        "Payroll processing with tax calculations",
        "Performance review and goal tracking",
        "Leave management with approval workflows",
        "Employee self-service portal",
        "Compliance tracking and reporting",
        "Revenue sharing and commission management"
      ],
      benefits: [
        "Reduce HR administrative tasks by 70%",
        "Ensure 100% payroll accuracy with automated calculations",
        "Improve employee satisfaction with self-service features",
        "Stay compliant with automated reporting and alerts"
      ]
    }
  },
  {
    title: "Inventory Management",
    description: "Real-time stock tracking, automated reordering, and supplier management",
    image: inventoryImg,
    detailedDescription: {
      overview: "Take control of your inventory with intelligent tracking and management tools that prevent stockouts and reduce waste.",
      keyFeatures: [
        "Real-time inventory tracking",
        "Automated low-stock alerts and reorder points",
        "Supplier management",
        "Inventory valuation with FIFO/LIFO methods",
        "Product lifecycle tracking and analytics",
        "Integration with sales and billing systems",
        "Waste tracking and loss prevention tools"
      ],
      benefits: [
        "Reduce inventory costs by 25% with optimized stock levels",
        "Eliminate stockouts with automated reordering",
        "Save 20+ hours weekly on inventory management",
        "Improve profit margins with better cost tracking"
      ]
    }
  },
  {
    title: "Analytics & Reporting",
    description: "Advanced business intelligence with real-time dashboards and insights",
    image: analyticsImg,
    detailedDescription: {
      overview: "Make data-driven decisions with comprehensive analytics that provide deep insights into your business performance.",
      keyFeatures: [
        "Real-time dashboard with key performance indicators",
        "Customizable reports for all business areas",
        "Revenue and profit analysis with trends",
        "Customer behavior and lifetime value analytics",
        "Staff performance and productivity metrics",
        "Inventory turnover and profitability analysis",
        "Marketing campaign ROI tracking",
        "Automated report scheduling and delivery"
      ],
      benefits: [
        "Increase revenue by 30% with data-driven insights",
        "Identify profitable trends and opportunities",
        "Make informed decisions with real-time data",
        "Reduce costs with performance optimization"
      ]
    }
  }
];

const FeatureCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevFeature = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const nextFeature = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const currentFeature = features[currentIndex];

  return (
    <div className="flex flex-col h-full p-6">
      {/* BillBookPlus Logo and Name - Larger */}
      <div className="p-6 mb-3 text-center">
        <div className="flex items-center justify-center space-x-4">
          <img
            src={icon}
            alt="BillBookPlus Logo"
            className="h-12 w-12"
          />
          <h1 className="text-3xl font-bold text-teal-700" style={{fontFamily: 'Crete Round, serif'}}>
            BillBookPlus
          </h1>
        </div>
      </div>

      {/* Feature Title and Subtitle */}
      <div className="p-4 mb-2 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {currentFeature.title}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
            {currentFeature.detailedDescription.overview}
        </p>
      </div>

      {/* Feature Image with Navigation - Buttons aligned with image */}
      <div className="relative mb-6 flex-1">
        <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
          <img
            src={currentFeature.image}
            alt={currentFeature.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Buttons - Aligned vertically with image */}
        <button
          onClick={prevFeature}
          aria-label="Previous feature"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-teal-600 p-2 rounded-full shadow-lg transition-colors border border-teal-200"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextFeature}
          aria-label="Next feature"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-teal-600 p-2 rounded-full shadow-lg transition-colors border border-teal-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Feature Description with Key Features and Benefits */}
      <div className="p-4 mb-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          {/* Overview */}


          {/* Key Features */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Key Features</h4>
            <div className="grid grid-cols-1 gap-2">
              {currentFeature.detailedDescription.keyFeatures.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Benefits</h4>
            <div className="grid grid-cols-1 gap-2">
              {currentFeature.detailedDescription.benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dots showing feature index */}
      <div className="p-3 text-center border border-gray-200 rounded-lg">
        <div className="flex justify-center space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-teal-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-2 font-medium">
          {currentIndex + 1} of {features.length}
        </p>
      </div>
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
  )
};

export default FeatureCarousel;
