class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo';
  }

  async generateResponse(message, conversationHistory = [], databaseContext = null) {
    console.log('🤖 OpenAI Service Called');
    console.log('📊 Database Context:', JSON.stringify(databaseContext, null, 2));
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = 'You are AutoCare Assistant for AutoCare Service Center. Be helpful and professional.';
    
    if (databaseContext && databaseContext.user && databaseContext.user.name) {
      systemPrompt = `You are AutoCare Assistant. You are speaking with ${databaseContext.user.name}, a logged-in customer.

CRITICAL: Use ONLY the exact data provided below. Do NOT make up or assume any dates, times, or services.

CUSTOMER DATA:
- Customer Name: ${databaseContext.user.name}
- Role: ${databaseContext.user.role}
- Customer ID: ${databaseContext.user.id}

CURRENT SERVICES:
- Active Services: ${databaseContext.currentData?.inProgressServices || 0}
- Upcoming Appointments: ${databaseContext.currentData?.upcomingAppointments || 0}

APPOINTMENT DETAILS:
${JSON.stringify(databaseContext.serviceDetails, null, 2)}

INSTRUCTIONS:
1. Address the customer by their first name only
2. Use ONLY the exact dates, times, and services from the database
3. If mentioning appointments, use the exact appointmentDate and appointmentTime provided
4. Convert dates properly (2025-11-11T18:30:00.000Z means November 12th, 2025)
5. Never make up information not in the database
6. Be helpful and professional`;
    } else {
      systemPrompt = 'You are AutoCare Assistant. The user appears to be a guest. Provide general information about AutoCare services.';
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 150,
          temperature: 0.3, // Lower temperature for more factual responses
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content.trim(),
        source: 'openai'
      };
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw error;
    }
  }
}

module.exports = new OpenAIService();
