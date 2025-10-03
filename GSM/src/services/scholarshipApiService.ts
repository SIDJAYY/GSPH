import { API_CONFIG, getScholarshipServiceUrl } from '../config/api';

// Types matching the scholarship service
export interface Student {
  id?: number;
  citizen_id: string;
  user_id?: number;
  student_id_number?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  extension_name?: string;
  sex: 'Male' | 'Female';
  civil_status: 'Single' | 'Married' | 'Widowed' | 'Divorced' | 'Separated';
  nationality?: string;
  birth_place?: string;
  birth_date?: string;
  is_pwd?: boolean;
  pwd_specification?: string;
  religion?: string;
  height_cm?: number;
  weight_kg?: number;
  contact_number?: string;
  email_address?: string;
  is_employed?: boolean;
  is_job_seeking?: boolean;
  is_currently_enrolled?: boolean;
  is_graduating?: boolean;
  is_solo_parent?: boolean;
  is_indigenous_group?: boolean;
  is_registered_voter?: boolean;
  voter_nationality?: string;
  has_paymaya_account?: boolean;
  preferred_mobile_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id?: number;
  student_id?: number;
  type: 'present' | 'permanent' | 'school';
  address_line_1?: string;
  address_line_2?: string;
  barangay?: string;
  district?: string;
  city?: string;
  province?: string;
  region?: string;
  zip_code?: string;
}

export interface FamilyMember {
  id?: number;
  student_id?: number;
  relationship: 'father' | 'mother' | 'guardian' | 'sibling' | 'spouse';
  first_name: string;
  last_name: string;
  middle_name?: string;
  extension_name?: string;
  contact_number?: string;
  employer?: string;
  monthly_income?: number;
  is_alive?: boolean;
  is_employed?: boolean;
  is_ofw?: boolean;
  is_pwd?: boolean;
  pwd_specification?: string;
}

export interface FinancialInformation {
  id?: number;
  student_id?: number;
  total_annual_income?: number;
  monthly_income?: number;
  number_of_children?: number;
  number_of_siblings?: number;
  home_ownership_status?: 'owned' | 'rented' | 'borrowed' | 'other';
  is_4ps_beneficiary?: boolean;
}

export interface School {
  id: number;
  name: string;
  campus?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  classification: string;
  address?: string;
  city?: string;
  province?: string;
  region?: string;
  zip_code?: string;
  is_public?: boolean;
  is_partner_school?: boolean;
  is_active?: boolean;
}

export interface AcademicRecord {
  id?: number;
  
  student_id?: number;
  school_id: number;
  educational_level: 'ELEMENTARY' | 'HIGH SCHOOL' | 'SENIOR HIGH SCHOOL' | 'TERTIARY/COLLEGE' | 'GRADUATE SCHOOL';
  program?: string;
  major?: string;
  track_specialization?: string;
  area_of_specialization?: string;
  year_level: string;
  school_year: string;
  school_term: string;
  units_enrolled?: number;
  units_completed?: number;
  gpa?: number;
  general_weighted_average?: number;
  previous_school?: string;
  is_current?: boolean;
  is_graduating?: boolean;
  enrollment_date?: string;
  graduation_date?: string;
}

export interface ScholarshipCategory {
  id: number;
  name: string;
  description?: string;
  type: 'merit' | 'need_based' | 'special' | 'renewal';
  is_active?: boolean;
  subcategories?: ScholarshipSubcategory[];
}

export interface ScholarshipSubcategory {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  amount?: number;
  type: 'merit' | 'need_based' | 'special' | 'renewal';
  requirements?: string[];
  benefits?: string[];
  is_active?: boolean;
}

export interface ScholarshipApplication {
  id?: number;
  application_number?: string;
  student_id: number;
  category_id: number;
  subcategory_id: number;
  school_id: number;
  type: 'new' | 'renewal';
  parent_application_id?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';
  reason_for_renewal?: string;
  financial_need_description: string;
  requested_amount?: number;
  approved_amount?: number;
  rejection_reason?: string;
  notes?: string;
  marginalized_groups?: string[];
  digital_wallets?: string[];
  wallet_account_number?: string;
  how_did_you_know?: string[];
  is_school_at_qc?: boolean;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  reviewed_by?: number;
  approved_by?: number;
  created_at?: string;
  updated_at?: string;
  student?: Student;
  category?: ScholarshipCategory;
  subcategory?: ScholarshipSubcategory;
  school?: School;
}

export interface DocumentType {
  id: number;
  name: string;
  description?: string;
  is_required: boolean;
  category: 'personal' | 'academic' | 'financial' | 'other';
  is_active: boolean;
}

export interface Document {
  id?: number;
  student_id: number;
  application_id?: number;
  document_type_id: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_by?: number;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
  document_type?: DocumentType;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

class ScholarshipApiService {
  constructor() {
    // No need to store baseURL as we use getScholarshipServiceUrl helper
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = getScholarshipServiceUrl(endpoint);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authorization header if token exists
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        // For validation errors, include the detailed errors
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        
        // For server errors, include more details
        if (response.status >= 500) {
          const errorDetails = data.error || data.message || 'Internal server error';
          throw new Error(`Server error (${response.status}): ${errorDetails}`);
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Public endpoints (no authentication required)
  async getSchools(): Promise<School[]> {
    try {
      const response = await this.makeRequest<{ data: { data: School[] } }>(
        API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.PUBLIC_SCHOOLS
      );
      console.log('Schools API response:', response);
      // Handle paginated response
      const schools = response.data?.data || response.data || [];
      console.log('Parsed schools:', schools);
      return Array.isArray(schools) ? schools : [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  }

  async getScholarshipCategories(): Promise<ScholarshipCategory[]> {
    try {
      const response = await this.makeRequest<{ data: ScholarshipCategory[] }>(
        API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.PUBLIC_SCHOLARSHIP_CATEGORIES
      );
      console.log('Categories API response:', response);
      // Handle paginated response
      const categories = response.data?.data || response.data || [];
      console.log('Parsed categories:', categories);
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getDocumentTypes(): Promise<DocumentType[]> {
    const response = await this.makeRequest<{ data: DocumentType[] }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.PUBLIC_DOCUMENT_TYPES
    );
    return response.data?.data || [];
  }

  async getRequiredDocuments(): Promise<DocumentType[]> {
    const response = await this.makeRequest<{ data: DocumentType[] }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.PUBLIC_REQUIRED_DOCUMENTS
    );
    return response.data?.data || [];
  }

  // Student management
  async getStudents(params?: any): Promise<{ data: Student[]; meta?: any }> {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `${API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS}?${queryParams}`
      : API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS;
    
    const response = await this.makeRequest<{ data: Student[]; meta?: any }>(endpoint);
    return response.data!;
  }

  async getStudent(id: number): Promise<Student> {
    const response = await this.makeRequest<{ data: Student }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT(id)
    );
    return response.data!.data!;
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const response = await this.makeRequest<{ data: Student }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENTS,
      {
        method: 'POST',
        body: JSON.stringify(studentData),
      }
    );
    return response.data!.data!;
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student> {
    const response = await this.makeRequest<{ data: Student }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT(id),
      {
        method: 'PUT',
        body: JSON.stringify(studentData),
      }
    );
    return response.data!.data!;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.makeRequest(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STUDENT(id),
      {
        method: 'DELETE',
      }
    );
  }

  // Scholarship applications
  async getApplications(params?: any): Promise<{ data: ScholarshipApplication[]; meta?: any }> {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `${API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATIONS}?${queryParams}`
      : API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATIONS;
    
    const response = await this.makeRequest<{ data: any; meta?: any }>(endpoint);
    // Normalize Laravel paginator shape to a consistent `{ data, meta }`
    const payload = response.data as any;
    if (payload && Array.isArray(payload.data)) {
      // Laravel paginator: `{ data: [...], current_page, last_page, ... }`
      const { data, ...restMeta } = payload;
      return { data, meta: restMeta };
    }
    // Already normalized array
    return { data: (payload as ScholarshipApplication[]) || [], meta: response.meta };
  }

  // Get current user's applications
  async getUserApplications(): Promise<ScholarshipApplication[]> {
    try {
      const response = await this.getApplications();
      // Handle paginated response: response.data contains the actual applications array
      const applications = response.data || [];
      return Array.isArray(applications) ? applications : [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  }

  async getApplication(id: number): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATION(id)
    );
    // Backend returns `{ success, data: application }` (no nested data)
    // but some callers may wrap; support both
    const payload: any = response as any;
    return (payload.data as any)?.data ?? (payload.data as any);
  }

  async createApplication(applicationData: Partial<ScholarshipApplication>): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATIONS,
      {
        method: 'POST',
        body: JSON.stringify(applicationData),
      }
    );
    return response.data!.data!;
  }

  async updateApplication(id: number, applicationData: Partial<ScholarshipApplication>): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATION(id),
      {
        method: 'PUT',
        body: JSON.stringify(applicationData),
      }
    );
    return response.data!.data!;
  }

  async deleteApplication(id: number): Promise<void> {
    await this.makeRequest(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATION(id),
      {
        method: 'DELETE',
      }
    );
  }

  async submitApplication(id: number): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATION_SUBMIT(id),
      {
        method: 'POST',
      }
    );
    return response.data!.data!;
  }

  async approveApplication(id: number, approvedAmount: number, notes?: string): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATION_APPROVE(id),
      {
        method: 'POST',
        body: JSON.stringify({ approved_amount: approvedAmount, notes }),
      }
    );
    return response.data!.data!;
  }

  async rejectApplication(id: number, rejectionReason: string): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.APPLICATION_REJECT(id),
      {
        method: 'POST',
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      }
    );
    return response.data!.data!;
  }

  // Form integration endpoints
  async submitNewApplication(formData: any): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.FORM_NEW_APPLICATION,
      {
        method: 'POST',
        body: JSON.stringify(formData),
      }
    );
    return response.data!.data!;
  }

  async submitRenewalApplication(formData: any): Promise<ScholarshipApplication> {
    const response = await this.makeRequest<{ data: ScholarshipApplication }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.FORM_RENEWAL_APPLICATION,
      {
        method: 'POST',
        body: JSON.stringify(formData),
      }
    );
    return response.data!.data!;
  }

  async uploadDocument(documentData: FormData): Promise<Document> {
    // Get authentication token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Debug logging
    console.log('Upload token check:', token ? 'Token found' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await fetch(
      getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENTS),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: documentData,
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Upload error response:', errorData);
        
        if (errorData.errors) {
          // Handle validation errors
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation failed: ${validationErrors}`;
        } else {
          errorMessage = errorData.message || errorData.detail || errorMessage;
        }
      } catch (e) {
        // If response is not JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.success && data.message) {
      throw new Error(data.message);
    }
    return data.data;
  }

  // Document management
  async getDocuments(params?: any): Promise<{ data: Document[]; meta?: any }> {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `${API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENTS}?${queryParams}`
      : API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENTS;
    
    const response = await this.makeRequest<{ data: Document[]; meta?: any }>(endpoint);
    return response.data!;
  }

  async getDocumentsChecklist(applicationId: number): Promise<{ checklist: any[]; statistics: any }> {
    const response = await this.makeRequest<{ data: { checklist: any[]; statistics: any } }>(
      `${API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENTS}/checklist?application_id=${applicationId}`
    );
    return response.data!.data!;
  }

  async getDocument(id: number): Promise<Document> {
    const response = await this.makeRequest<{ data: Document }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENT(id)
    );
    return response.data!.data!;
  }

  async deleteDocument(id: number): Promise<void> {
    await this.makeRequest(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENT(id),
      {
        method: 'DELETE',
      }
    );
  }

  async downloadDocument(id: number): Promise<Blob> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(
      getScholarshipServiceUrl(API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENT_DOWNLOAD(id)),
      {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  async verifyDocument(id: number, verificationNotes?: string): Promise<Document> {
    const response = await this.makeRequest<{ data: Document }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENT_VERIFY(id),
      {
        method: 'POST',
        body: JSON.stringify({ verification_notes: verificationNotes }),
      }
    );
    return response.data!.data!;
  }

  async rejectDocument(id: number, verificationNotes: string): Promise<Document> {
    const response = await this.makeRequest<{ data: Document }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.DOCUMENT_REJECT(id),
      {
        method: 'POST',
        body: JSON.stringify({ verification_notes: verificationNotes }),
      }
    );
    return response.data!.data!;
  }

  // Statistics
  async getStatsOverview(): Promise<any> {
    const response = await this.makeRequest<{ data: any }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STATS_OVERVIEW
    );
    return response.data!.data!;
  }

  async getApplicationsByStatus(): Promise<any> {
    const response = await this.makeRequest<{ data: any }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STATS_APPLICATIONS_BY_STATUS
    );
    return response.data!.data!;
  }

  async getApplicationsByType(): Promise<any> {
    const response = await this.makeRequest<{ data: any }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.STATS_APPLICATIONS_BY_TYPE
    );
    return response.data!.data!;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    const response = await this.makeRequest<{ status: string; timestamp: string; service: string }>(
      API_CONFIG.SCHOLARSHIP_SERVICE.ENDPOINTS.HEALTH
    );
    return response.data!;
  }
}

// Export singleton instance
export const scholarshipApiService = new ScholarshipApiService();
export default scholarshipApiService;
