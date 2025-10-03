# API Usage Examples

This document shows how to use the integrated API configuration for all microservices.

## 🏗️ **Architecture Overview**

The API configuration is centralized in `api.js` and provides:

- **Auth Service** - User authentication and management
- **Scholarship Service** - Scholarship applications, students, documents, and statistics

**Note:** Aid Service and Monitoring Service are not yet implemented.

## 🔌 **School Aid Distribution API Usage**

### **Import the API Service**

```javascript
import schoolAidService from "./schoolAidService.js";
import { API_CONFIG, getAidServiceUrl } from "./api.js";
```

### **Basic Usage Examples**

#### **1. Get Fund Allocations**

```javascript
// Get all fund allocations
const allocations = await schoolAidService.getFundAllocations();

// Get allocations with filters
const filteredAllocations = await schoolAidService.getFundAllocations({
  status: "active",
  school_id: "school-uuid-here",
});
```

#### **2. Create Fund Allocation**

```javascript
const newAllocation = await schoolAidService.createFundAllocation({
  school_id: "school-uuid-here",
  aid_program_id: "program-uuid-here",
  total_amount: 100000.0,
  currency: "PHP",
  allocation_period: "annual",
  start_date: "2024-01-01",
  status: "active",
});
```

#### **3. Process Payments**

```javascript
const payment = await schoolAidService.processPayment({
  aid_transaction_id: "transaction-uuid-here",
  payment_method: "direct_deposit",
  amount: 5000.0,
  currency: "PHP",
  scheduled_date: "2024-01-20",
});
```

#### **4. Get Analytics**

```javascript
// Get overview analytics
const overview = await schoolAidService.getAnalyticsOverview();

// Get distribution patterns
const patterns = await schoolAidService.getDistributionPatterns({
  period: "monthly",
  year: 2024,
});
```

## 🎯 **Direct API Configuration Usage**

### **Get Endpoint URLs**

```javascript
import { API_CONFIG, getAidServiceUrl } from "./config/api.js";

// Get specific endpoint
const analyticsUrl = getAidServiceUrl(
  API_CONFIG.AID_SERVICE.ENDPOINTS.ANALYTICS_OVERVIEW
);

// Get endpoint with parameters
const studentTransactionsUrl = getAidServiceUrl(
  API_CONFIG.AID_SERVICE.ENDPOINTS.AID_TRANSACTIONS_BY_STUDENT(
    "student-uuid-here"
  )
);
```

### **Service Availability Check**

```javascript
import { isServiceAvailable } from "./config/api.js";

if (isServiceAvailable("AID_SERVICE")) {
  console.log("Aid Service is available");
}
```

## 🔄 **Integration with React Components**

### **Component Example**

```javascript
import React, { useState, useEffect } from "react";
import schoolAidService from "./schoolAidService.js";

function FundAllocationList() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const data = await schoolAidService.getFundAllocations();
        setAllocations(data);
      } catch (error) {
        console.error("Failed to fetch allocations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {allocations.map((allocation) => (
        <div key={allocation.allocation_id}>
          <h3>{allocation.school_name}</h3>
          <p>Amount: ₱{allocation.total_amount}</p>
          <p>Status: {allocation.status}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🚀 **Advanced Usage Patterns**

### **Bulk Operations**

```javascript
// Process multiple payments
const bulkPayments = await schoolAidService.processBulkPayments({
  payments: [
    { aid_transaction_id: "uuid1", amount: 5000 },
    { aid_transaction_id: "uuid2", amount: 3000 },
  ],
  payment_method: "direct_deposit",
  scheduled_date: "2024-01-20",
});
```

### **Error Handling**

```javascript
try {
  const result = await schoolAidService.getFundAllocation("invalid-uuid");
} catch (error) {
  if (error.message.includes("HTTP error! status: 404")) {
    console.log("Fund allocation not found");
  } else if (error.message.includes("HTTP error! status: 500")) {
    console.log("Server error occurred");
  } else {
    console.log("Network or other error:", error.message);
  }
}
```

### **Custom Headers**

```javascript
// Add authentication headers
const authenticatedRequest = async (endpoint, data) => {
  const token = localStorage.getItem("auth_token");

  return schoolAidService.request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${token}`,
      "Custom-Header": "custom-value",
    },
  });
};
```

## 🔧 **Configuration Management**

### **Environment-Based Configuration**

```javascript
// The API automatically uses environment variables
// REACT_APP_AID_SERVICE_API_URL=http://localhost:8002/api

// Or use the centralized config
const baseUrl = API_CONFIG.AID_SERVICE.BASE_URL;
```

### **Service Discovery**

```javascript
// Check all available services
Object.keys(API_CONFIG).forEach((service) => {
  console.log(`${service}: ${API_CONFIG[service].BASE_URL}`);
});
```

## 📱 **Mobile and Responsive Considerations**

### **Network Error Handling**

```javascript
const fetchWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};

// Usage
const allocations = await fetchWithRetry(() =>
  schoolAidService.getFundAllocations()
);
```

## 🧪 **Testing**

### **Mock API for Testing**

```javascript
// In your test files
jest.mock("./schoolAidService.js", () => ({
  getFundAllocations: jest
    .fn()
    .mockResolvedValue([{ allocation_id: "test-1", total_amount: 10000 }]),
  createFundAllocation: jest.fn().mockResolvedValue({ success: true }),
}));
```

### **Integration Testing**

```javascript
// Test the actual API integration
describe("School Aid API Integration", () => {
  it("should fetch fund allocations", async () => {
    const allocations = await schoolAidService.getFundAllocations();
    expect(Array.isArray(allocations)).toBe(true);
  });
});
```

## 🔒 **Security Considerations**

### **Input Validation**

```javascript
const validateAllocationData = (data) => {
  if (!data.school_id || !data.aid_program_id) {
    throw new Error("Missing required fields");
  }

  if (data.total_amount <= 0) {
    throw new Error("Total amount must be positive");
  }

  return data;
};

// Usage
const validatedData = validateAllocationData(allocationData);
const result = await schoolAidService.createFundAllocation(validatedData);
```

### **Rate Limiting**

```javascript
class RateLimitedAPI {
  constructor(api, maxRequests = 10, timeWindow = 60000) {
    this.api = api;
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async request(endpoint, options) {
    this.cleanup();

    if (this.requests.length >= this.maxRequests) {
      throw new Error("Rate limit exceeded");
    }

    this.requests.push(Date.now());
    return this.api.request(endpoint, options);
  }

  cleanup() {
    const now = Date.now();
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );
  }
}

const rateLimitedAPI = new RateLimitedAPI(schoolAidService);
```

---

**This configuration provides a clean, maintainable way to manage all your microservice APIs from a single location.**
