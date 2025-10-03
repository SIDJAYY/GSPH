export class FallbackHandler {
  static getResponse(message) {
    const lowerMessage = (message || '').toLowerCase();
    
    // Identity questions
    if (lowerMessage.includes('name') || lowerMessage.includes('who are you') || lowerMessage.includes('pangalan')) {
      return 'Hi! I\'m JironAI, your smart assistant. I\'m here to help you with information about scholarships, applications, and more!';
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hullo') || lowerMessage.includes('kamusta')) {
      return 'Hello! I\'m JironAI. How can I help you today?';
    }
    
    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('tulong')) {
      return 'I can help you with:\n• Scholarship information\n• Application status\n• General questions\n\nWhat would you like to know?';
    }
    
    // Default fallback
    return 'I\'m here to help! How can I assist you today?';
  }

  static getCapabilities() {
    return [
      'Scholarship information and applications',
      'Application status checking',
      'General questions about the program',
      'Multi-language support (English and Filipino)'
    ];
  }
} 