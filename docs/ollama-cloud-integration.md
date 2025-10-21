# Ollama Cloud Integration

## Overview
This document describes the Ollama Cloud API integration that has been set up for the nonprofit AI assistant project.

## Setup

### 1. Environment Variables
The following environment variables have been added to `.env.local`:

```env
# Ollama Cloud Configuration
OLLAMA_CLOUD_API_KEY=c8942d7f93a54cd498fe9dfff71b92fa.LF2FvwzqgqwWJv-BDtbcwwCZOL
OLLAMA_WEB_SEARCH_KEY=6bcae8a3d4094c1da1c7311cedfe626c.697y733CfiC1xRm3BhgA_0Im
OLLAMA_CLOUD_BASE_URL=https://api.ollama.com

# Your Available Models (from your dashboard)
OLLAMA_ENTERPRISE_MODEL=deepseek-v3.1:671b-cloud
OLLAMA_PROFESSIONAL_MODEL_DOCS=qwen3-coder:480b-cloud
OLLAMA_PROFESSIONAL_MODEL_GRANTS=gpt-oss:120b-cloud
OLLAMA_STANDARD_MODEL=gpt-oss:20b-cloud
```

⚠️ **Note**: Keep these API keys confidential and never commit them to version control.

### 2. API Endpoint
A new API endpoint has been created at `/app/api/chat/cloud/route.ts` that handles interactions with the Ollama Cloud service.

## Features

### Health Check (GET)
You can check the endpoint configuration and available models:

```bash
curl http://localhost:3001/api/chat/cloud
```

**Response:**
```json
{
  "status": "configured",
  "hasApiKey": true,
  "baseUrl": "https://api.ollama.com",
  "models": [...],
  "note": "POST to this endpoint with messages to interact with Ollama Cloud"
}
```

### Model Listing (POST)
The endpoint can return a list of available models when queried with a specific message format:

```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Quick test - what models are available?"}]}'
```

**Response:**
```json
{
  "models": [
    {
      "id": "deepseek-v3.1:671b-cloud",
      "name": "DeepSeek v3.1 Enterprise",
      "description": "Enterprise-grade model with 671B parameters",
      "tier": "enterprise"
    },
    {
      "id": "qwen3-coder:480b-cloud",
      "name": "Qwen3 Coder Professional",
      "description": "Professional coding model with 480B parameters",
      "tier": "professional",
      "specialty": "documentation"
    },
    {
      "id": "gpt-oss:120b-cloud",
      "name": "GPT-OSS Professional",
      "description": "Professional model for grant writing with 120B parameters",
      "tier": "professional",
      "specialty": "grants"
    },
    {
      "id": "gpt-oss:20b-cloud",
      "name": "GPT-OSS Standard",
      "description": "Standard model with 20B parameters",
      "tier": "standard"
    }
  ],
  "timestamp": "2025-10-19T19:13:24.212Z"
}
```

### Chat Completions
The endpoint can send chat messages to the Ollama Cloud API:

```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello, can you help me?"}],"model":"gpt-oss:20b-cloud"}'
```

**Request Format:**
- `messages`: Array of message objects with `role` and `content` fields
- `model`: (Optional) The model to use for generation (defaults to "gpt-oss:20b-cloud")

**Available Models:**
- `deepseek-v3.1:671b-cloud` - Enterprise tier (671B parameters)
- `qwen3-coder:480b-cloud` - Professional tier for documentation (480B parameters)
- `gpt-oss:120b-cloud` - Professional tier for grant writing (120B parameters)
- `gpt-oss:20b-cloud` - Standard tier (20B parameters) **[Default]**

**Response Format:**
```json
{
  "response": "AI generated response text",
  "model": "llama3:8b",
  "timestamp": "2025-10-19T19:08:34.585Z",
  "usage": {},
  "raw": {}
}
```

## Implementation Details

### Error Handling
The endpoint includes comprehensive error handling:
- Validates that messages array is provided
- Checks for API key configuration
- Logs detailed error information to the console
- Returns appropriate HTTP status codes

### Response Format Compatibility
The implementation handles multiple response formats:
- OpenAI-style responses (`choices[0].message.content`)
- Ollama-style responses (`message.content` or `response`)
- Includes raw response for debugging purposes

### Logging
The endpoint logs the following information:
- API call parameters (base URL, model, message count)
- Success responses
- Error responses with status codes and error text

## Current Status

### ✅ Completed
- ✅ Environment variables configured in `.env.local` with corrected API key
- ✅ API endpoint created at `/app/api/chat/cloud/route.ts`
- ✅ Custom model configuration from dashboard:
  - DeepSeek v3.1 Enterprise (671B)
  - Qwen3 Coder Professional (480B) for documentation
  - GPT-OSS Professional (120B) for grant writing
  - GPT-OSS Standard (20B) as default
- ✅ Model listing functionality working
- ✅ GET endpoint for health check and configuration
- ✅ Error handling implemented
- ✅ Request/response logging added
- ✅ Support for multiple response formats (OpenAI-style and Ollama-style)

### ⚠️ Known Issues
1. **Network Connectivity**: The Ollama Cloud API endpoint (`https://api.ollama.com`) appears to be unreachable. Error: `ENOTFOUND api.ollama.com`. This could indicate:
   - The service is not yet publicly available at this domain
   - The base URL provided may need to be different
   - DNS resolution issues
   - The service may require VPN or special network configuration

2. **Error Response**: Current requests to the chat endpoint return:
   ```json
   {"error":"Internal server error","details":"fetch failed"}
   ```
   This is a network-level failure indicating the hostname cannot be resolved.

## Next Steps

To resolve the connectivity issue, consider:

1. **Verify the Base URL**: Confirm the correct Ollama Cloud API endpoint
2. **Check API Documentation**: Review official Ollama Cloud documentation for the correct endpoint structure
3. **Test Authentication**: Verify the API key format and authentication method
4. **Network Testing**: Use `curl` or similar tools to test direct connectivity to the API
5. **Contact Support**: Reach out to Ollama support to verify the API endpoint and authentication

## Alternative Approaches

If Ollama Cloud is not yet available, consider:
- Using a local Ollama instance (already implemented in `/src/app/api/chat/route.ts`)
- Using the hybrid approach in `/src/app/api/chat-hybrid/route.ts`
- Integrating with other cloud AI services (OpenAI, Anthropic, etc.)

## Testing

### Test Model Listing
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Quick test - what models are available?"}]}'
```

### Test Chat (when service is available)
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me about nonprofit management"}],"model":"llama3:8b"}'
```

## Files Modified/Created

1. **Created**: `.env.local` - Environment variables configuration
2. **Created**: `/app/api/chat/cloud/route.ts` - Ollama Cloud API endpoint
3. **Created**: `/src/app/api/chat/cloud/route.ts` - (duplicate, can be removed)
4. **Created**: `docs/ollama-cloud-integration.md` - This documentation

## Related Files

- `/src/app/api/chat/route.ts` - Local Ollama integration
- `/src/app/api/chat-hybrid/route.ts` - Hybrid local/online approach

