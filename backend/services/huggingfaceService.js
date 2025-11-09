class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    // Using a more stable and faster model for chat
    this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
    
    // AutoCare business context for the AI
    this.systemContext = `You are AutoCare Assistant, a helpful AI assistant for AutoCare, a professional vehicle maintenance and repair service center.

Business Information:
- Name: AutoCare Service Center
- Services: Oil changes, brake inspections, tire rotations, engine diagnostics, major tune-ups, transmission services, AC repair, battery replacement
- Hours: Monday-Friday 8AM-6PM, Saturday 9AM-4PM, Closed Sundays
- Pricing: Oil changes from $50, brake inspections $75, major tune-ups up to $500
- Location: Professional auto service center with certified mechanics
- Online booking available through the website

Your role:
- Help customers with service inquiries
- Provide information about services and pricing
- Assist with appointment booking questions
- Answer questions about vehicle maintenance
- Be friendly, professional, and concise
- If you don't know specific details, offer to connect them with a service advisor

Keep responses helpful but brief (2-4 sentences max unless detailed explanation needed).`;
  }

  async generateResponse(message, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Prepare conversation history for the API
      const pastUserInputs = conversationHistory
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.text)
        .slice(-3); // Last 3 user messages
      
      const generatedResponses = conversationHistory
        .filter(msg => msg.sender === 'bot')
        .map(msg => msg.text)
        .slice(-3); // Last 3 bot responses

      const requestBody = {
        inputs: {
          past_user_inputs: pastUserInputs,
          generated_responses: generatedResponses,
          text: message
        },
        parameters: {
          max_length: 150,
          temperature: 0.8,
          repetition_penalty: 1.2
        }
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle model loading case
        if (response.status === 503 && errorData.error?.includes('loading')) {
          return {
            text: "I'm warming up right now! Please try again in a few seconds. In the meantime, you can book an appointment or call us at our service center.",
            isLoading: true
          };
        }
        
        throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract the generated text
      let generatedText = '';
      if (data.generated_text) {
        generatedText = data.generated_text;
      } else if (data.conversation && data.conversation.generated_responses) {
        generatedText = data.conversation.generated_responses[data.conversation.generated_responses.length - 1];
      }

      // Clean up the response
      generatedText = generatedText.trim();

      // Fallback if response is too short or empty
      if (!generatedText || generatedText.length < 5) {
        generatedText = this.getFallbackResponse(message);
      }

      return {
        text: generatedText,
        isLoading: false
      };

    } catch (error) {
      console.error('Hugging Face API Error:', error);
      
      // Provide graceful fallback with context-aware responses
      return {
        text: this.getFallbackResponse(message),
        error: false // Don't show as error, just use fallback
      };
    }
  }

  // Smart fallback responses based on keywords
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      return 'I can help you book an appointment! We have availability Monday-Saturday. What service do you need?';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return 'Our services range from $50 for oil changes to $500 for major tune-ups. What service are you interested in?';
    }
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('when')) {
      return "We're open Monday-Friday 8AM-6PM, Saturday 9AM-4PM. Closed Sundays.";
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('what do you')) {
      return 'We offer oil changes, brake inspections, tire rotations, engine diagnostics, AC repair, and more. What can we help you with?';
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! Welcome to AutoCare. How can I assist you with your vehicle today?';
    }
    
    return "I'd be happy to help you! We offer full automotive services. Would you like to know about our services, pricing, or book an appointment?";
  }

  async generateResponseOld(message, conversationHistory = []) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      // Build the conversation prompt
      let prompt = `${this.systemContext}\n\n`;
      
      // Add conversation history (last 5 messages for context)
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        prompt += `${msg.sender === 'user' ? 'Customer' : 'Assistant'}: ${msg.text}\n`;
      });
      
      // Add current message
      prompt += `Customer: ${message}\nAssistant:`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle model loading case
        if (response.status === 503 && errorData.error?.includes('loading')) {
          return {
            text: "I'm warming up right now! Please try again in a few seconds. In the meantime, you can book an appointment or call us at our service center.",
            isLoading: true
          };
        }
        
        throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract the generated text
      let generatedText = '';
      if (Array.isArray(data) && data.length > 0) {
        generatedText = data[0].generated_text || '';
      } else if (data.generated_text) {
        generatedText = data.generated_text;
      }

      // Clean up the response
      generatedText = generatedText.trim();
      
      // Remove any remaining prompt text if it leaked through
      if (generatedText.includes('Customer:')) {
        generatedText = generatedText.split('Customer:')[0].trim();
      }
      if (generatedText.includes('Assistant:')) {
        generatedText = generatedText.split('Assistant:').pop().trim();
      }

      // Fallback if response is too short or empty
      if (!generatedText || generatedText.length < 10) {
        generatedText = "I'd be happy to help you with that! Could you provide a bit more detail about what you need?";
      }

      return {
        text: generatedText,
        isLoading: false
      };

    } catch (error) {
      console.error('Hugging Face API Error:', error);
      
      // Provide graceful fallback
      return {
        text: "I'm having trouble connecting right now. For immediate assistance, please call our service center or use the appointment booking form. Our team is ready to help!",
        error: true
      };
    }
  }

  // Alternative method using different models
  async generateResponseWithModel(message, model = 'microsoft/DialoGPT-medium', conversationHistory = []) {
    const modelUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    try {
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: conversationHistory
              .filter(msg => msg.sender === 'user')
              .map(msg => msg.text),
            generated_responses: conversationHistory
              .filter(msg => msg.sender === 'bot')
              .map(msg => msg.text),
            text: message,
          },
          parameters: {
            max_length: 100,
            temperature: 0.8,
          },
        }),
      });

      const data = await response.json();
      return {
        text: data.generated_text || "I'm here to help! What can I assist you with?",
        isLoading: false
      };

    } catch (error) {
      console.error('Model API Error:', error);
      throw error;
    }
  }
}

module.exports = new HuggingFaceService();
