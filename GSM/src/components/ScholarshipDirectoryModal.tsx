import React from 'react';
import { X, Calendar, Phone, Mail, MapPin, Clock, Users, Award } from 'lucide-react';
import { Button } from './ui/Button';

interface ScholarshipDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScholarshipDirectoryModal: React.FC<ScholarshipDirectoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const announcements = [
    {
      id: 1,
      title: "Academic Year 2024-2025 Applications Now Open",
      date: "January 15, 2024",
      content: "The Caloocan City Scholarship Program is now accepting applications for the Academic Year 2024-2025. Submit your applications before the deadline."
    },
    {
      id: 2,
      title: "New Scholarship Categories Available",
      date: "January 10, 2024",
      content: "We have added new scholarship categories for Technical and Vocational courses. Check the updated guidelines for eligibility requirements."
    },
    {
      id: 3,
      title: "Document Submission Guidelines Updated",
      date: "January 5, 2024",
      content: "Please review the updated document requirements. Some documents now require notarization. Check the application form for details."
    }
  ];

  const deadlines = [
    {
      program: "Undergraduate Scholarship",
      deadline: "March 31, 2024",
      status: "Open"
    },
    {
      program: "Graduate Scholarship",
      deadline: "April 15, 2024",
      status: "Open"
    },
    {
      program: "Technical/Vocational",
      deadline: "May 30, 2024",
      status: "Open"
    },
    {
      program: "Special Programs",
      deadline: "June 15, 2024",
      status: "Open"
    }
  ];

  const coordinators = [
    {
      name: "Dr. Maria Santos",
      position: "Scholarship Program Director",
      phone: "(02) 8961-1111",
      email: "maria.santos@caloocan.gov.ph",
      office: "Room 201, City Hall Building"
    },
    {
      name: "Mr. Juan Dela Cruz",
      position: "Senior Scholarship Coordinator",
      phone: "(02) 8961-1112",
      email: "juan.delacruz@caloocan.gov.ph",
      office: "Room 203, City Hall Building"
    },
    {
      name: "Ms. Ana Rodriguez",
      position: "Application Processing Coordinator",
      phone: "(02) 8961-1113",
      email: "ana.rodriguez@caloocan.gov.ph",
      office: "Room 205, City Hall Building"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Caloocan Scholarship Program Directory</h2>
              <p className="text-orange-100">Important announcements, deadlines, and contact information</p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-orange-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Announcements */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-6 w-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">Latest Announcements</h3>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">{announcement.date}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{announcement.title}</h4>
                    <p className="text-sm text-gray-600">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadlines */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-6 w-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">Application Deadlines</h3>
              </div>
              <div className="space-y-3">
                {deadlines.map((deadline, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{deadline.program}</h4>
                        <p className="text-sm text-gray-600 mt-1">Deadline: {deadline.deadline}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {deadline.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-6 w-6 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-900">Scholarship Coordinators</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coordinators.map((coordinator, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{coordinator.name}</h4>
                  <p className="text-sm text-orange-600 font-medium mb-3">{coordinator.position}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{coordinator.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{coordinator.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{coordinator.office}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office Hours */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Office Hours</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Monday - Friday</p>
                <p className="text-gray-600">8:00 AM - 5:00 PM</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Saturday</p>
                <p className="text-gray-600">8:00 AM - 12:00 PM</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium text-gray-900">Location</p>
              <p className="text-gray-600">Caloocan City Hall, A. Mabini Street, Poblacion, Caloocan City, Metro Manila</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              For more information, visit our office or contact the coordinators above.
            </p>
            <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white">
              Close Directory
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
