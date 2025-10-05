import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, CreditCard, Megaphone, Users, Package, Star, Menu, X, Phone, Mail, BarChart3, Loader2, Instagram, Facebook, Youtube, Linkedin, MessageCircle } from 'lucide-react';
import icon from '../assets/images/bb_icon.png'
import marketingPage from '../assets/images/MarketingPage.png';
import { salesQueriesApi } from '../apis/salesQueriesApi';

// SEO Component for dynamic meta updates
const SEOHead = () => {
  useEffect(() => {
    // Update page title dynamically if needed
    document.title = "BillBookPlus - All-in-One Business Management Software for Salons, Spas & Service Centers";

    // Add any additional meta tags dynamically if needed
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Streamline your salon, spa, or service center with BillBookPlus. Complete appointment booking, billing, inventory, staff management, and marketing automation in one powerful platform. Start your 14-day free trial today!');
    }
  }, []);

  return null;
};

// UI Components
const Button = ({ children, className = '', variant = 'primary', size = 'md', onClick, ...props }) => {
  const baseClasses = 'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-8 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children }) => <div className="p-6 pb-4">{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-gray-600 mt-2 ${className}`}>{children}</p>;

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 ${className}`}>
    {children}
  </span>
);

const Avatar = ({ children }) => (
  <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
    {children}
  </div>
);

const AvatarFallback = ({ children }) => (
  <span className="text-sm font-medium text-teal-700">{children}</span>
);

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-opacity-50" onClick={() => onOpenChange(false)} />
      <div className="bg-white border rounded-lg shadow-xl max-w-md w-full mx-4 relative z-10">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => <div className="p-6">{children}</div>;
const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-gray-600 text-sm mt-1">{children}</p>;

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${className}`}
    {...props}
  />
);

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    query: ''
  });
  const featuresSectionRef = useRef(null);
  const revertTimerRef = useRef(null);

  // Data arrays
  const features = [
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Smart scheduling system with automated reminders and calendar integration",
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
      icon: CreditCard,
      title: "Billing & Invoicing",
      description: "Professional invoices, payment tracking, and automated billing cycles",
      detailedDescription: {
        overview: "Streamline your financial operations with comprehensive billing and invoicing tools designed for modern businesses.",
        keyFeatures: [
          "Customizable invoice templates with your branding",
          "Share bills over WhatsApp and SMS",
          "Late payment reminders and follow-up automation",
          "Tax calculation and compliance support",
          "Detailed payment analytics and reporting",
          "Expense tracking and categorization",
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
      icon: Megaphone,
      title: "Marketing Tools",
      description: "WhatsApp campaigns, SMS marketing, and customer engagement analytics",
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
      icon: Users,
      title: "Staff Management",
      description: "Complete HR management with payroll, attendance, and employee records",
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
      icon: Package,
      title: "Inventory Management",
      description: "Real-time stock tracking, automated reordering, and supplier management",
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
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Advanced business intelligence with real-time dashboards and insights",
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

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹10000",
      period: "per year",
      description: "Perfect for small businesses getting started",
      features: [
        "Up to 1000 appointments/month",
        "Billing & invoicing",
        "Email support",
        "5 Staff accounts",
        "250 sms per month",
        "250 whatsapp messages per month",
        "Inventory tracking"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "₹15000",
      period: "per year",
      description: "Ideal for growing businesses",
      features: [
        "website for your business",
        "Up to 2000 appointments/month",
        "Billing & invoicing",
        "Email support",
        "10 Staff accounts",
        "500 sms per month",
        "500 whatsapp messages per month",
        "Inventory tracking",
        "Advanced reporting & analytics"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "₹20000",
      period: "per year",
      description: "For large organizations with complex needs",
      features: [
        "website for your business",
        "Unlimited appointments/month",
        "Billing & invoicing",
        "Email support",
        "20 Staff accounts",
        "1000 sms per month",
        "1000 whatsapp messages per month",
        "Inventory tracking",
        "Advanced reporting & analytics",
        "Dedicated 24X7 support"
      ],
      popular: false
    }
  ];

  const reviews = [
    {
      name: "Shailendra",
      role: "Salon Owner",
      company: "",
      rating: 5,
      comment: "I have 2 salons in different places and both the salons can be easily managed with BillbookPlus software. Its service and support system is very good.",
      avatar: "SJ"
    },
    {
      name: "Urmila",
      role: "Salon Owner",
      rating: 5,
      comment: "One of the best software it has many features which helps us to do our work easily… Also the team is very helpful… Thanks a lot for guiding us.",
      avatar: "UD"
    },
    {
      name: "Mas Studio",
      role: "Salon Owner",
      company: "Mas Studio Ranchi",
      rating: 5,
      comment: "BillBookPlus Salon Software is very simple and easy to use.",
      avatar: "MS"
    }
  ];

  // Auto-revert maximized view when Features section leaves viewport
  useEffect(() => {
    const sectionEl = featuresSectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (selectedFeature === null) return;
        // Debounce revert to avoid flicker during smooth scroll or minor header overlaps
        if (!entry.isIntersecting) {
          if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
          revertTimerRef.current = setTimeout(() => {
            // Double-check still not intersecting before reverting
            if (!entry.isIntersecting) {
              setSelectedFeature(null);
            }
          }, 600);
        } else {
          if (revertTimerRef.current) {
            clearTimeout(revertTimerRef.current);
            revertTimerRef.current = null;
          }
        }
      },
      { root: null, threshold: 0.05 }
    );

    observer.observe(sectionEl);
    return () => {
      observer.unobserve(sectionEl);
      if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    };
  }, [selectedFeature]);

  // Navigation functions
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContactSales = () => {
    setIsContactModalOpen(true);
  };

  const handleFreeTrial = () => {
    setIsFreeTrialModalOpen(true);
  };

  const isSectionMostlyInView = () => {
    const el = featuresSectionRef.current;
    if (!el) return true;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const verticallyVisible = rect.top < vh * 0.9 && rect.bottom > vh * 0.1;
    const horizontallyVisible = rect.left < vw && rect.right > 0;
    return verticallyVisible && horizontallyVisible;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Prepare data for API call
      const queryData = {
        name: formData.name.trim(),
        query: formData.query.trim() || `Customer inquiry from ${formData.name}. Contact details: ${formData.contactNumber}${formData.email ? `, ${formData.email}` : ''}`,
        phoneNumber: formData.contactNumber.trim(),
        email: formData.email.trim()
      };

      // Call the sales queries API
      const response = await salesQueriesApi.createQuery(queryData);

      if (response.success) {
        // Success feedback
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your query has been submitted successfully. Our sales team will contact you soon.'
        });

        // Clear form after successful submission
        setTimeout(() => {
          setFormData({ name: '', contactNumber: '', email: '', query: '' });
          setSubmitStatus({ type: '', message: '' });
          setIsContactModalOpen(false);
        }, 2000);
      } else {
        throw new Error('Failed to submit query');
      }
    } catch (error) {
      console.error('Error submitting sales query:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit your query. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Any other startup logic can remain; removed nav debug logger
    }
  }, []);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Social media link handlers
  const handleWhatsApp = () => {
    const phoneNumber = '919608163637';
    const message = 'Hi! I am interested in BillBookPlus. Can you please provide more information?';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/billbookplus/', '_blank');
  };

  const handleFacebook = () => {
    window.open('https://www.facebook.com/billbookplus', '_blank');
  };

  const handleYoutube = () => {
    window.open('https://www.youtube.com/@billbookplus', '_blank');
  };

  const handleLinkedIn = () => {
    window.open('https://www.linkedin.com/company/billbookplusofficial/posts/?feedView=all', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center">
                <img src={icon} />
              </div>
              <span className="text-xl text-teal-700 font-semibold" style={{fontFamily: 'Crete Round, serif'}}>BillBookPlus</span>
            </div>
            
            {isDesktop && (
              <nav className="flex items-center space-x-8">
                <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
                <button onClick={() => scrollToSection('reviews')} className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</button>
                <Button variant="outline" size="sm" onClick={handleContactSales}>Contact Sales</Button>
                <Button size="sm" onClick={handleLogin}>Login</Button>
              </nav>
            )}

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block text-gray-600 hover:text-gray-900 transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="block text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('reviews')} className="block text-gray-600 hover:text-gray-900 transition-colors">Reviews</button>
              <Button variant="outline" size="sm" className="w-full mb-2" onClick={handleContactSales}>Contact Sales</Button>
              <Button size="sm" className="w-full" onClick={handleLogin}>Login</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className='flex flex-row justify-center items-center'>
                  <span className='w-24 h-24'>
                    <img
                      src={icon}
                      alt="BillBookPlus Logo - Business Management Software for Salons and Spas"
                      title="BillBookPlus - All-in-One Business Management Solution"
                      loading="eager"
                    />
                  </span>
                  <h1 className=" pl-8 text-4xl lg:text-6xl font-bold leading-tight text-teal-700" style={{fontFamily: 'Crete Round, serif'}}>BillBookPlus</h1>
                </div>
                <h2 className=" text-4xl lg:text-6xl font-bold leading-tight">
                  All-in-One Business Management Solution for Salons, Spas & Service Centers
                </h2>
                <p className="text-xl text-gray-600">
                  Streamline appointments, billing, marketing, HR, and inventory management in one powerful platform. Built for service oriented businesses specializing in Salons, Spas and Service Centers. Trusted by thousands of businesses across India.
                </p>
              </div>
              
              <div className="flex sm:flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleFreeTrial}>Start Free Trial</Button>
                <Button variant="outline" size="lg" onClick={handleContactSales}>Contact Sales</Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500 justify-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

              <div className="relative">
                <img
                  src={marketingPage}
                  alt="BillBookPlus Dashboard Screenshot - Salon management software showing appointment booking, billing, and business analytics interface for beauty salons and spas"
                  title="BillBookPlus Software Dashboard - Complete Business Management Solution"
                  className="rounded-lg shadow-2xl w-full"
                  loading="eager"
                />
              </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresSectionRef} className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold">Everything Your Business Needs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From appointment scheduling to Marketing, BillBookPlus provides all the tools you need to run your business efficiently.
            </p>
          </div>

          {/* Stacked mini-list + Maximized feature view */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Mini list (titles only) */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-2">
                {features.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFeature(idx)}
                    className={`w-full text-left border rounded-md px-3 py-2 text-sm transition-colors ${
                      selectedFeature === idx ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium truncate">{f.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Maximized detail view */}
            <div className="lg:col-span-4">
              <Card className="relative">
                <CardHeader className="pb-6">
                  <div className="flex items-stretch space-x-4">
                    <div className="h-auto w-16 rounded-lg flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const FeatureIcon = features[selectedFeature]?.icon;
                        return FeatureIcon ? <FeatureIcon className="h-8 w-8 text-teal-600" /> : null;
                      })()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{features[selectedFeature]?.title}</CardTitle>
                      <CardDescription className="text-lg">
                        {features[selectedFeature]?.detailedDescription?.overview}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Key Features</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedFeature==null? setSelectedFeature(0) : selectedFeature >= features.length ? setSelectedFeature(features.length - 1) : null}
                      {features[selectedFeature]?.detailedDescription?.keyFeatures?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold mb-4">Business Benefits</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {features[selectedFeature]?.detailedDescription?.benefits?.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      )) || []}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
         
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 mx-auto">
              Choose the plan that fits your business needs. All plans include core features with no hidden fees.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative flex flex-col h-full ${plan.popular ? 'border-teal-500 shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">{plan.price}</div>
                    <div className="text-sm text-gray-500">{plan.period}</div>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-grow">
                  <ul className="space-y-3 flex-grow mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full mt-auto" 
                    variant={"primary"}
                    size="lg"
                    onClick={handleContactSales}
                  >
                    {"Contact Sales"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of businesses that trust BillBookPlus to manage their operations.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{review.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-gray-600">{review.role}</p>
                      <p className="text-sm text-gray-600">{review.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{review.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-8 mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold">Ready to Transform Your Business?</h2>
            <p className="text-xl text-gray-600">
              Join thousands of businesses using BillBookPlus to streamline operations and boost productivity.
            </p>
            <div className="flex sm:flex-col md:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleFreeTrial}>Start Free Trial</Button>
              <Button variant="outline" size="lg" onClick={handleContactSales}>Contact Sales</Button>
            </div>

            {/* Social Media Icons */}
            <div className="pt-8">
              <p className="text-lg text-gray-600 mb-6">Connect with us on social media</p>
              <div className="flex justify-center items-center space-x-6">
                {/* WhatsApp */}
                <button
                  onClick={handleWhatsApp}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                  aria-label="Contact us on WhatsApp"
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </button>

                {/* Instagram */}
                <button
                  onClick={handleInstagram}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-6 w-6 text-white" />
                </button>

                {/* Facebook */}
                <button
                  onClick={handleFacebook}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-6 w-6 text-white" />
                </button>

                {/* YouTube */}
                <button
                  onClick={handleYoutube}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube className="h-6 w-6 text-white" />
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleLinkedIn}
                  className="w-12 h-12 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                  aria-label="Connect with us on LinkedIn"
                >
                  <Linkedin className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent>
          <button
            onClick={() => setIsContactModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <DialogHeader>
            <DialogTitle>Contact Sales</DialogTitle>
            <DialogDescription>Get in touch with our sales team to learn more about BillBookPlus.</DialogDescription>
          </DialogHeader>

          {/* Support Contact Information */}
          <div className="py-4">
            <h4 className="font-semibold mb-3">Contact Our Sales Team At</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">sales@billbookplus.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">+919608163637</p>
                </div>
              </div>
            </div>
          </div>
          <p className='text-sm text-gray'>Or submit your details and our team will contact you</p>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <div className='text-left'>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div >
                <div className='text-left'>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div className='text-left'>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email address"
                    required
                  />
                </div>
                <div className='text-left'>
                  <Label htmlFor="query">Query Description</Label>
                  <Textarea
                    id="query"
                    value={formData.query}
                    onChange={(e) => handleInputChange('query', e.target.value)}
                    placeholder="Tell us about your business needs and how we can help you"
                    rows={4}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Query'}
              </Button>
              {submitStatus.message && (
                <p className={`mt-4 text-sm ${submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {submitStatus.message}
                </p>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Free Trial Modal */}
      <Dialog open={isFreeTrialModalOpen} onOpenChange={setIsFreeTrialModalOpen}>
        <DialogContent>
          <button
            onClick={() => setIsFreeTrialModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <DialogHeader>
            <DialogTitle>Start Your Free Trial</DialogTitle>
            <DialogDescription>Contact our sales team to get started with your 14-day free trial of BillBookPlus.</DialogDescription>
          </DialogHeader>
          
          {/* Sales Contact Information */}
          <div className="py-4 border-t">
            <h4 className="font-semibold mb-3">Contact Our Sales Team</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-left">Sales Email</p>
                  <p className="text-sm text-gray-600 text-left">support@billbookplus.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-left">Sales Phone</p>
                  <p className="text-sm text-gray-600 text-left">+9919608163637</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setIsFreeTrialModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => {
                setIsFreeTrialModalOpen(false);
                setIsContactModalOpen(true);
              }}
            >
              Contact Sales
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t">
        <div className="container mx-auto px-4 lg:px-8">
          {isDesktop ? (
            // Desktop Layout - Single Row
            <div className="flex justify-between items-center">
              {/* Logo and Brand Name */}
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 flex items-center justify-center">
                  <img src={icon} className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold" style={{fontFamily: 'Crete Round, serif'}}>BillBookPlus</span>
              </div>

              {/* Contact Information */}
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">support@billbookplus.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">+919608163637</span>
                </div>
              </div>

              {/* Copyright */}
              <div>
                <p className="text-sm text-gray-600">
                  © 2024 BillBookPlus. All rights reserved.
                </p>
              </div>
            </div>
          ) : (
            // Mobile Layout - Stacked Rows
            <div className="flex flex-col space-y-4 text-center">
              {/* Logo and Brand Name */}
              <div className="flex items-center justify-center space-x-2">
                <div className="h-6 w-6 flex items-center justify-center">
                  <img src={icon} className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold" style={{fontFamily: 'Crete Round, serif'}}>BillBookPlus</span>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">support@billbookplus.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <span className="text-sm text-gray-600">+919608163637</span>
                </div>
              </div>

              {/* Copyright */}
              <div>
                <p className="text-sm text-gray-600">
                  © 2024 BillBookPlus. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
