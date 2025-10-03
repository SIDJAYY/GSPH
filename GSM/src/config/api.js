// API Configuration
export const API_CONFIG = {
    AUTH_SERVICE: {
        BASE_URL: 'http://localhost:8000',
        ENDPOINTS: {
            LOGIN: '/api/login',
            LOGOUT: '/api/logout',
            USER: '/api/user',
            HEALTH: '/api/health'
        }
    },
    SCHOLARSHIP_SERVICE: {
        BASE_URL: 'http://localhost:8001',
        ENDPOINTS: {
            // Health check
            HEALTH: '/api/health',
            
            // Public endpoints
            PUBLIC_SCHOOLS: '/api/public/schools',
            PUBLIC_SCHOLARSHIP_CATEGORIES: '/api/public/scholarship-categories',
            PUBLIC_DOCUMENT_TYPES: '/api/public/document-types',
            PUBLIC_REQUIRED_DOCUMENTS: '/api/public/required-documents',
            
            // Student management
            STUDENTS: '/api/students',
            STUDENT: (id) => `/api/students/${id}`,
            STUDENT_RESTORE: (id) => `/api/students/${id}/restore`,
            STUDENT_FORCE_DELETE: (id) => `/api/students/${id}/force-delete`,
            
            // Scholarship applications
            APPLICATIONS: '/api/applications',
            APPLICATION: (id) => `/api/applications/${id}`,
            APPLICATION_SUBMIT: (id) => `/api/applications/${id}/submit`,
            APPLICATION_APPROVE: (id) => `/api/applications/${id}/approve`,
            APPLICATION_REJECT: (id) => `/api/applications/${id}/reject`,
            
            // Document management
            DOCUMENTS: '/api/documents',
            DOCUMENT: (id) => `/api/documents/${id}`,
            DOCUMENT_DOWNLOAD: (id) => `/api/documents/${id}/download`,
            DOCUMENT_VERIFY: (id) => `/api/documents/${id}/verify`,
            DOCUMENT_REJECT: (id) => `/api/documents/${id}/reject`,
            
            // School management
            SCHOOLS: '/api/schools',
            SCHOOL: (id) => `/api/schools/${id}`,
            
            // Scholarship categories
            SCHOLARSHIP_CATEGORIES: '/api/scholarship-categories',
            SCHOLARSHIP_CATEGORY: (id) => `/api/scholarship-categories/${id}`,
            
            // Form integration
            FORM_NEW_APPLICATION: '/api/forms/new-application',
            FORM_RENEWAL_APPLICATION: '/api/forms/renewal-application',
            FORM_UPLOAD_DOCUMENT: '/api/forms/upload-document',
            FORM_APPLICATION_DATA: (id) => `/api/forms/application/${id}/data`,
            FORM_STUDENT_DATA: (id) => `/api/forms/student/${id}/data`,
            
            // Statistics
            STATS_OVERVIEW: '/api/stats/overview',
            STATS_APPLICATIONS_BY_STATUS: '/api/stats/applications/by-status',
            STATS_APPLICATIONS_BY_TYPE: '/api/stats/applications/by-type'
        }
    }
};

// Helper function to get full API URL for auth service
export const getAuthServiceUrl = (endpoint) => {
    return `${API_CONFIG.AUTH_SERVICE.BASE_URL}${endpoint}`;
};

// Helper function to get full API URL for scholarship service
export const getScholarshipServiceUrl = (endpoint) => {
    return `${API_CONFIG.SCHOLARSHIP_SERVICE.BASE_URL}${endpoint}`;
};

// Helper function to get full API URL for any service
export const getServiceUrl = (service, endpoint) => {
    const serviceConfig = API_CONFIG[service];
    if (!serviceConfig) {
        throw new Error(`Unknown service: ${service}`);
    }
    return `${serviceConfig.BASE_URL}${endpoint}`;
};

// Helper function to check if a service is available
export const isServiceAvailable = (service) => {
    return !!API_CONFIG[service];
};

// Legacy helper function for backward compatibility
export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.AUTH_SERVICE.BASE_URL}${endpoint}`;
};