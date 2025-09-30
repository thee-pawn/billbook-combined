import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import analyticsImg from "../../assets/images/analytics.jpeg";
import marketingImg from "../../assets/images/marketing.jpeg";
import staffImg from "../../assets/images/staff.jpeg";
import inventoryImg from "../../assets/images/inventory.jpeg";
import billingImg from "../../assets/images/billing.jpeg";
import bookingImg from "../../assets/images/booking.jpeg";

const features = [
  {
    title: "Track Bookings",
    description: "Schedule and manage customer appointments or reservations.",
    image: bookingImg,
  },
  {
    title: "Monitor Inventory",
    description: "Keep real-time stock updates and receive alerts for low inventory.",
    image: inventoryImg,
  },
  {
    title: "Automate Billing",
    description: "Generate invoices, process payments, and track expenses seamlessly.",
    image: billingImg,
  },
  {
    title: "Gain Insights",
    description: "Access powerful analytics to understand sales trends and business performance.",
    image: analyticsImg,
  },
  {
    title: "Enhance Marketing",
    description: "Run promotions, send reminders, and engage with customers.",
    image: marketingImg,
  },
  {
    title: "Manage Staff",
    description: "Assign roles, track attendance, and optimize workforce productivity.",
    image: staffImg,
  },
];

export default function ScrollableFeatures() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevFeature = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  };

  const nextFeature = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
  };

  return (
    <div className="relative  h-full mx-auto p-4">
     <div
  className="h-full p-6 bg-white rounded-2xl shadow-lg flex flex-col justify-between text-center"
  style={{
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(13, 148, 136, 1)), url(${features[currentIndex].image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Title at the top */}
  <p className="text-teal-700 text-md text-2xl font-semibold bg-opacity-80 p-2 rounded break-words">
  {features[currentIndex].title}
  </p>

  {/* Description at the bottom */}
  <p className="text-white text-md font-semibold bg-opacity-80 p-2 rounded break-words">
    {features[currentIndex].description}
  </p>
</div>
      <button
        onClick={prevFeature}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white-800 text-white p-2 rounded-full"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextFeature}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white-800 text-white p-2 rounded-full"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
