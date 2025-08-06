/**
 * API Configuration for n8n Backend Integration
 * 
 * To configure your n8n webhook URL:
 * 1. Set the REACT_APP_N8N_API_URL environment variable in your .env file
 * 2. Or directly modify the N8N_API_URL constant below
 * 
 * Example .env configuration:
 * REACT_APP_N8N_API_URL=https://your-n8n-instance.com/webhook/your-webhook-id
 */

export const API_CONFIG = {
  // n8n webhook URL - replace with your actual endpoint
  N8N_API_URL: process.env.REACT_APP_N8N_API_URL || 'YOUR_N8N_WEBHOOK_URL',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // API request headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

/**
 * API service for communicating with n8n backend
 */
export class ApiService {
  private static async makeRequest(url: string, options: RequestInit) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Send a message to the n8n AI agent
   * @param message - The user message to send
   * @param conversationId - Optional conversation ID for context
   * @returns Promise with AI response
   */
  static async sendMessage(message: string, conversationId?: string) {
    const payload = {
      message,
      conversationId,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await this.makeRequest(API_CONFIG.N8N_API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }

  /**
   * Send a message with streaming response (if supported by your n8n setup)
   * @param message - The user message
   * @param onChunk - Callback for each chunk of data
   * @param conversationId - Optional conversation ID
   */
  static async sendMessageStream(
    message: string, 
    onChunk: (chunk: string) => void,
    conversationId?: string
  ) {
    const payload = {
      message,
      conversationId,
      stream: true,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(API_CONFIG.N8N_API_URL, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.chunk) {
                onChunk(data.chunk);
              }
            } catch (e) {
              // Ignore invalid JSON lines
              console.warn('Invalid JSON in stream:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming API Error:', error);
      throw new Error('Failed to establish streaming connection');
    }
  }
}

/**
 * Utility function to check if API is configured
 */
export const isApiConfigured = (): boolean => {
  return API_CONFIG.N8N_API_URL !== 'YOUR_N8N_WEBHOOK_URL' && 
         API_CONFIG.N8N_API_URL.startsWith('http');
};