# Visp Chat Interface for n8n

A modern, responsive ChatGPT-style interface built with React, TypeScript, and Tailwind CSS that connects to your n8n backend for real-time AI interactions.

## 🌟 Features

- **Modern Chat UI**: Clean, minimal interface similar to ChatGPT
- **Conversation Management**: Left sidebar with conversation history and organization by date
- **Real-time Messaging**: Send messages and receive AI responses with typing effects
- **Markdown Support**: Full markdown rendering including code blocks with syntax highlighting
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Local Storage**: Conversation history persisted locally
- **Error Handling**: Graceful handling of API errors and timeouts
- **TypeScript**: Fully typed for better development experience

## 🚀 Quick Start

### 1. Installation

Clone this repository and install dependencies:

```bash
git clone <your-repo-url>
cd ai-chat-interface
npm install
```

### 2. Configuration

The project is already configured with your n8n webhook URL:

```env
REACT_APP_N8N_API_URL=https://ammarahmad.app.n8n.cloud/webhook-test/test
```

If you need to change the webhook URL, create a `.env` file in the root directory:

```env
REACT_APP_N8N_API_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### 3. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## 🔧 n8n Backend Integration

### API Endpoint Configuration

The chat interface expects your n8n workflow to:

1. **Accept POST requests** with the following JSON structure:
```json
{
  "message": "User's message text",
  "conversationId": "optional-conversation-id",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

2. **Return responses** in one of these formats:
```json
{
  "message": "AI response text"
}
// OR
{
  "response": "AI response text"
}
// OR
{
  "text": "AI response text"
}
```

### n8n Workflow Setup

Here's a basic n8n workflow structure:

1. **Webhook Node**: Configure to accept POST requests
2. **HTTP Request Node**: Send user message to your AI service (OpenAI, Claude, etc.)
3. **Response Node**: Return the AI response

Example n8n workflow configuration:

```yaml
Webhook Trigger:
  - Method: POST
  - Response Mode: Respond to Webhook
  
HTTP Request (to AI service):
  - URL: https://api.openai.com/v1/chat/completions
  - Method: POST
  - Headers: 
    - Authorization: Bearer YOUR_API_KEY
    - Content-Type: application/json
  - Body:
    {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": "{{$json.message}}"}]
    }

Respond to Webhook:
  - Response Body: 
    {
      "message": "{{$json.choices[0].message.content}}"
    }
```

### Streaming Support (Optional)

For real-time streaming responses, configure your n8n workflow to:

1. Accept a `stream: true` parameter
2. Return server-sent events or chunked responses
3. Each chunk should be formatted as:
```json
{"chunk": "partial response text"}
```

## 🛠️ Customization

### Styling

The app uses a design system defined in `src/index.css` and `tailwind.config.ts`. You can customize:

- **Colors**: Modify the CSS custom properties in `src/index.css`
- **Themes**: Adjust light/dark mode colors
- **Layout**: Update component styles using Tailwind classes

### API Configuration

Modify `src/config/api.ts` to customize:

- Request timeout
- Retry attempts
- Headers
- Error handling

### Features

The modular component structure makes it easy to:

- Add new message types
- Customize the sidebar
- Modify the input area
- Add file upload capabilities
- Implement user authentication

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatArea.tsx       # Main chat display area
│   │   ├── ChatInput.tsx      # Message input component
│   │   ├── ChatMessage.tsx    # Individual message bubbles
│   │   └── ChatSidebar.tsx    # Conversation history sidebar
│   ├── providers/
│   │   └── ThemeProvider.tsx  # Theme management
│   └── ui/                    # Reusable UI components
├── contexts/
│   └── ChatContext.tsx        # Chat state management
├── config/
│   └── api.ts                 # API configuration and service
├── pages/
│   ├── Chat.tsx              # Main chat page
│   └── NotFound.tsx          # 404 page
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
└── index.css                  # Design system and styles
```

## 🎨 Design System

The application uses a comprehensive design system with:

- **Semantic Color Tokens**: Consistent theming across light/dark modes
- **Chat-Specific Colors**: Dedicated color scheme for chat interface
- **Responsive Typography**: Optimized text sizing and spacing
- **Component Variants**: Pre-built component variations

## 🔧 Technical Details

### Built With

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Markdown**: Markdown rendering with syntax highlighting
- **Next Themes**: Theme management
- **React Router**: Client-side routing
- **UUID**: Unique identifier generation

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_N8N_API_URL` | Your n8n webhook URL | `YOUR_N8N_WEBHOOK_URL` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help setting up the integration with your n8n backend:

1. Check the configuration in `src/config/api.ts`
2. Verify your n8n webhook is correctly configured
3. Test your n8n endpoint directly first
4. Check the browser console for any error messages

## 🔄 Updates

The application automatically checks for API configuration and provides helpful feedback when the n8n endpoint is not configured. Demo responses are shown until you configure your actual API endpoint.