import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  Caloocan City Hall<br />
                  A. Mabini Street, Poblacion<br />
                  Caloocan City, Metro Manila
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <p className="text-sm text-gray-300">(02) 8961-1111</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-400 flex-shrink-0" />
                <p className="text-sm text-gray-300">scholarship@caloocan.gov.ph</p>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Office Hours
            </h3>
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p>Monday - Friday</p>
                <p>8:00 AM - 5:00 PM</p>
                <p className="mt-2">Saturday</p>
                <p>8:00 AM - 12:00 PM</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Application Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Important Notice */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">
              Important Notice
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                Application deadline varies by scholarship type.
              </p>
              <p>
                Ensure all information is accurate before submission.
              </p>
              <p className="text-orange-400 font-medium">
                No processing fees required.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} City Government of Caloocan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};