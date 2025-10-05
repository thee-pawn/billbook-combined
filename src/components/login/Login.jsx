import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "./useAuth";
import { useStore } from "./StoreContext";
import { authApi } from "../../apis";
import features from "../../data/featuresData";
import icon from '../../assets/images/bb_icon.png';

// Import components
import { 
  FeatureCarousel,
  LoginForm,
  SignupForm,
  OtpVerificationForm,
  PasswordForm,
  ForgotPasswordForm
} from "./index";
import StoreSelection from "./StoreSelection";

// --- MAIN COMPONENT ---
const Login = () => {
  const { login, user, isAuthenticated } = useAuth();
  const { loadUserStores } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(
    location.state?.showStoreSelection ? 9 : 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

  // State for API data
  const [userId, setUserId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  
  // Timer reference for error clearing
  const errorTimerRef = useRef(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      // Clear any existing timer
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }

      // Set new timer to clear error after 5 seconds
      errorTimerRef.current = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }

    // Cleanup timer on component unmount or when errorMessage changes
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [errorMessage]);

  // --- HELPER FUNCTIONS ---
  const handleApiError = (error) => {
    const message = error.message || "An unexpected error occurred";
    console.error("API Error:", message, error);
    setErrorMessage(message);
    setIsLoading(false);
  };

  const resetFormState = () => {
    setErrorMessage("");
    // Clear timer when manually resetting
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    // We don't clear phoneNumber here as we need it for the OTP verification flow
  };

  // Clear error messages when user interacts with form
  const clearError = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // --- API HANDLERS ---

  // LOGIN FLOW (Step 1 -> 2 -> Logged In)
  const handleLoginSubmit = async (loginData) => {
    setIsLoading(true);
    resetFormState();
    
    try {
      // Use authApi to attempt regular password login first
      const response = await authApi.login(loginData);
      
      if (response.success) {
        // Check login response status
        if (response.data.status === "OTP_GENERATED") {
          // OTP flow needed
          setUserId(response.data.userId);
          setPhoneNumber(loginData.phoneNumber || loginData.phone); // Store the phone number
          setStep(2); // Move to OTP verification
          setOtpMessage('OTP sent successfully! Please verify to continue.');
        } else {
          // Direct login success, no OTP needed
          setUserId(response.data.userId);
          await login(response.data.authToken);
          // No need to set step as login will handle navigation directly to /home
        }
      } else {
        setErrorMessage(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };  // SIGNUP FLOW (Step 3 -> 4 -> 5 -> Logged In)
  const handleSignupDetailsSubmit = async (userData) => {
    setIsLoading(true);
    resetFormState();
    
    try {
      const response = await authApi.register(userData);
      
      setUserId(response.data.userId);
      setPhoneNumber(response.data.phoneNumber); // Store the phone number
      setOtpMessage(`OTP sent to ${response.data.phoneNumber}.`);
      setStep(4); // Move to OTP verification
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // FORGOT PASSWORD FLOW (Step 6 -> 7 -> 8 -> 1)
  const handleRequestPasswordReset = async (phoneData) => {
    setIsLoading(true);
    resetFormState();
    
    try {
      const response = await authApi.forgotPassword(phoneData);
      
      if (response.success) {
        // Store the phone number for OTP verification
        setPhoneNumber(phoneData.phone);
        // Set userId if provided, otherwise we'll handle OTP verification without it initially
        if (response.data.userId) {
          setUserId(response.data.userId);
        }
        setOtpMessage(`Password reset OTP sent to ${phoneData.phone}.`);
        setStep(7); // Move to reset OTP verification
      } else {
        // Server won't confirm if the user exists or not for security
        setErrorMessage(response.message || "If your number is registered, you will receive an OTP.");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // SHARED OTP verification for ALL flows
  const handleOtpVerification = async (otp) => {
    setIsLoading(true);
    resetFormState();
    
    try {
      const otpData = { otp, phoneNumber }; // Include phone number in OTP verification
      let response;
      
      if (step === 4) { // Signup OTP verification uses different endpoint
        response = await authApi.verifyRegistrationOtp(otpData);
      } else {
        response = await authApi.verifyOtp(otpData);
      }

      if (step === 2) { 
        setUserId(response.data.userId);
        await login(response.data.authToken, null, response.data.user);
      }
      else if (step === 4) { // Signup OTP success -> go to set password
        setUserId(response.data.userId); // Update userId from the response
        setAuthToken(response.data.authToken);
        setStep(5);
      }
      else if (step === 7) { // Reset OTP success -> go to reset password
        setUserId(response.data.userId); // Update userId from the response
        setAuthToken(response.data.authToken);
        setStep(8);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      // This will only run for steps 4 and 7, or if the API call fails
      setIsLoading(false);
    }
  };

  // Handle OTP resend request
  const handleResendOtp = async () => {
    setIsLoading(true);
    
    try {
      // Get attempts from local storage or default to 1
      const attempts = parseInt(localStorage.getItem(`otp_attempts_${userId || phoneNumber}`) || '0') + 1;
      localStorage.setItem(`otp_attempts_${userId || phoneNumber}`, attempts.toString());
      
      const resendData = { 
        phoneNumber, // Include phone number in resend OTP request
        attempts 
      };
      
      // Include userId if we have it
      if (userId) {
        resendData.userId = userId;
      }
      
      await authApi.resendOtp(resendData);
      
      setOtpMessage("A new OTP has been sent to your phone number.");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // SHARED Password set/reset logic
  const handlePasswordSetOrReset = async (passwordData) => {
    if (passwordData.password !== passwordData.repassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    resetFormState();
    
    try {
      const isReset = step === 8;
      
      // if (isReset) {
        // Use resetPassword API for password reset flow
      //   const resetData = { 
      //     userId,
      //     password: passwordData.password 
      //   };
      //   await authApi.setPassword(data, authToken); // Pass the auth token for bearer authentication
      //   alert("Password successfully reset. Please log in with your new password.");
      //   setStep(1);
      // } else {
        // Use setPassword API for initial password setup
        const data = { userId, password: passwordData.password };
        const response = await authApi.setPassword(data, authToken); // Pass the auth token for bearer authentication
        // The login function should be called with the stored authToken since response may not contain token
        await login(authToken);
        // No need to set step as login will handle navigation directly to /home
//      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- MAIN RENDER FUNCTION ---
  return (
    <div className={`h-screen bg-gray-100 font-sans ${isDesktop ? 'grid md:grid-cols-2' : 'flex flex-col'} overflow-hidden`}>
      {/* Left Panel - Feature Carousel - Only show on desktop */}
      {isDesktop && <FeatureCarousel features={features} />}

      {/* Right Panel - Auth Forms */}
      <div className={`bg-teal-500 flex justify-center items-center ${isDesktop ? 'py-4 px-4' : 'py-2'} relative flex-1 overflow-y-auto`}>

        <div className={`bg-white ${isDesktop ? 'p-4 sm:p-6 rounded-lg shadow-xl' : 'p-4 w-full'} w-full max-w-md my-auto`}>
             {!isDesktop &&
                          <div className="mb-4 text-center">
                              <div className="flex items-center justify-center space-x-3">
                                  <img
                                      src={icon}
                                      alt="BillBookPlus Logo"
                                      className="h-10 w-10"
                                  />
                                  <h1 className="text-2xl font-bold text-teal-700" style={{fontFamily: 'Crete Round, serif'}}>
                                      BillBookPlus
                                  </h1>
                              </div>
                          </div>
                      }
          {step === 1 && (
            <LoginForm 
              onSubmit={handleLoginSubmit}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onForgotPassword={() => setStep(6)}
              onSignUp={() => setStep(3)}
            />
          )}

          {(step === 2 || step === 4 || step === 7) && (
            <OtpVerificationForm
              onSubmit={handleOtpVerification}
              isLoading={isLoading}
              errorMessage={errorMessage}
              otpMessage={otpMessage}
              onBack={() => setStep(step === 2 || step === 7 ? 1 : 3)}
              onResendOtp={handleResendOtp}
            />
          )}

          {step === 3 && (
            <SignupForm
              onSubmit={handleSignupDetailsSubmit}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onBack={() => setStep(1)}
            />
          )}

          {(step === 5 || step === 8) && (
            <PasswordForm
              onSubmit={handlePasswordSetOrReset}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onBack={() => setStep(1)}
              isReset={step === 8}
            />
          )}

          {step === 6 && (
            <ForgotPasswordForm
              onSubmit={handleRequestPasswordReset}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onBack={() => setStep(1)}
            />
          )}

          {/* Removed store selection step since we're navigating directly to home */}
        </div>
        <p className="absolute bottom-1 text-sm md:text-sm text-center text-white w-full">
          Contact Support : +919608163637 | support@billbookplus.com
        </p>
      </div>
    </div>
  );
};

export default Login;
