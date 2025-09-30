/**
 * Login page features data
 */
import analyticsImg from '../assets/images/analytics.jpeg';
import marketingImg from '../assets/images/marketing.jpeg';
import staffImg from '../assets/images/staff.jpeg';
import inventoryImg from '../assets/images/inventory.jpeg';
import billingImg from '../assets/images/billing.jpeg';
import bookingImg from '../assets/images/booking.jpeg';

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

export default features;
