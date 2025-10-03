import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ScholarshipDirectoryModal } from '../components/ScholarshipDirectoryModal';
import { scholarshipApiService } from '../services/scholarshipApiService';
import { useAuthStore } from '../store/v1authStore';

// Add custom CSS for world-class animations
const customStyles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  /* Text Gradient Animation (brand colors) */
  .animated-text {
    /* Rotate through primary (#4CAF50) and secondary (#4A90E2) hues */
    background: linear-gradient(45deg, #2E7D32, #4CAF50, #4A90E2, #305C90);
    background-size: 300% 300%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-shift 4s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  @keyframes gradient-shift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  /* Smooth Transitions */
  .smooth-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  
  .animate-fade-in {
    animation: fade-in 1s ease-out forwards;
  }
  
  .delay-300 {
    animation-delay: 300ms;
  }
  
  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

export const Portal: React.FC = () => {
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [isCheckingApplications, setIsCheckingApplications] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const currentUser = useAuthStore(s => s.currentUser);

  // Check for existing applications on component mount
  useEffect(() => {
    const checkExistingApplications = async () => {
      if (!currentUser) {
        setIsCheckingApplications(false);
        return;
      }

      try {
        setIsCheckingApplications(true);
        const applications = await scholarshipApiService.getUserApplications();
        
        // Check if user has any pending or active applications
        // Pending/Active statuses: draft, submitted, reviewed, approved, processing, released, on_hold
        // Only rejected and cancelled applications allow new applications
        const activeStatuses = ['draft', 'submitted', 'reviewed', 'approved', 'processing', 'released', 'on_hold'];
        const hasActive = applications.some(app => activeStatuses.includes(app.status?.toLowerCase()));
        
        setHasActiveApplication(hasActive);
        console.log('User applications:', applications);
        console.log('Has active application:', hasActive);
      } catch (error) {
        console.error('Error checking existing applications:', error);
        // If there's an error, allow access (fail open)
        setHasActiveApplication(false);
      } finally {
        setIsCheckingApplications(false);
      }
    };

    checkExistingApplications();
  }, [currentUser]);

  // Show modal after component mounts (after login)
  useEffect(() => {
    console.log('Portal component mounted, checking for directory modal...');
    const hasSeenDirectory = localStorage.getItem('hasSeenDirectory');
    console.log('hasSeenDirectory:', hasSeenDirectory);
    
    // For now, always show the modal for testing
    // You can change this back to check localStorage later
    setShowDirectoryModal(true);
    
    // Original logic (commented out for testing):
    // if (!hasSeenDirectory) {
    //   setShowDirectoryModal(true);
    // }
  }, []);

  const handleCloseModal = () => {
    setShowDirectoryModal(false);
    localStorage.setItem('hasSeenDirectory', 'true');
  };

  const handleNewApplicationClick = () => {
    if (hasActiveApplication) {
      setShowToast(true);
      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    }
  };


  console.log('Portal render - showDirectoryModal:', showDirectoryModal);

  return (
    <div>
      {/* Scholarship Directory Modal */}
      <ScholarshipDirectoryModal 
        isOpen={showDirectoryModal} 
        onClose={handleCloseModal} 
      />
      
      {/* Hero Section - World-Class Design */}
      <section 
        className="relative h-96 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/ll.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Clean minimal design - no animations or effects */}
      </section>

      {/* Action Buttons Section - Optimized for viewport */}
      <section className="py-12 bg-gradient-to-br from-background via-white to-primary-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent-200 rounded-full blur-3xl opacity-10"></div>
        </div>

                 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center space-y-6">
             {/* Enhanced heading with animated gradient and better contrast */}
             <div className="space-y-3 -mt-4">
                               <h3 className="text-3xl lg:text-5xl font-bold animated-text drop-shadow-lg uppercase">
                  Ready to Begin Your Journey?
                </h3>
               <p className="text-lg text-gray-600 max-w-2xl mx-auto smooth-transition hover:text-gray-800">
                 Take the first step towards your educational dreams with our comprehensive scholarship program
               </p>
             </div>

            {/* Responsive card-style buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 justify-center items-center max-w-6xl mx-auto">
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-lg">
                <Link to="/scholarship-dashboard" className="block w-full">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold w-full h-10 sm:h-11 lg:h-12 flex items-center justify-center whitespace-nowrap uppercase tracking-wide"
                  >
                    Scholar Dashboard
                  </Button>
                </Link>
              </div>
                
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-lg">
                {isCheckingApplications ? (
                  <Button 
                    size="lg" 
                    disabled
                    className="bg-gray-400 text-white border-0 shadow-md px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold w-full h-12 sm:h-14 lg:h-16 flex items-center justify-center whitespace-nowrap uppercase tracking-wide cursor-not-allowed"
                  >
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Checking...
                  </Button>
                ) : hasActiveApplication ? (
                  <Button 
                    size="lg" 
                    onClick={handleNewApplicationClick}
                    className="bg-gray-400 text-white border-0 shadow-md hover:bg-gray-500 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold w-full h-12 sm:h-14 lg:h-16 flex items-center justify-center whitespace-nowrap uppercase tracking-wide transition-colors"
                  >
                    New Application
                  </Button>
                ) : (
                  <Link to="/new-application" className="block w-full">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold w-full h-10 sm:h-11 lg:h-12 flex items-center justify-center whitespace-nowrap uppercase tracking-wide"
                    >
                      New Application
                    </Button>
                  </Link>
                )}
              </div>
                
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-lg">
                <Link to="/renewal" className="block w-full">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold w-full h-10 sm:h-11 lg:h-12 flex items-center justify-center whitespace-nowrap uppercase tracking-wide"
                  >
                    Renewal Application
                  </Button>
                </Link>
              </div>
                
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 shadow-lg">
                <Button 
                  size="lg" 
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold w-full h-10 sm:h-11 lg:h-12 flex items-center justify-center whitespace-nowrap uppercase tracking-wide"
                >
                  Tartiary Portal
                </Button>
              </div>
            </div>

            {/* Additional info cards with smooth transitions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 smooth-transition hover:text-orange-600">Quick Application</h4>
                <p className="text-gray-600 smooth-transition hover:text-gray-800">Complete your application in just a few minutes</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="text-4xl mb-4">🔍</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 smooth-transition hover:text-orange-600">Track Progress</h4>
                <p className="text-gray-600 smooth-transition hover:text-gray-800">Monitor your application status in real-time</p>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 smooth-transition hover:text-orange-600">Get Support</h4>
                <p className="text-gray-600 smooth-transition hover:text-gray-800">Access our comprehensive directory and support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg border border-red-600 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">New Application Restricted</h4>
                <p className="text-sm mt-1">
                  You have a pending or active scholarship application. Please complete or wait for the current application to be processed before submitting a new one.
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 text-white hover:text-red-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};