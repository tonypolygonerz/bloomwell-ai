# Ollama Cloud API - Quick Reference

## 🚀 Quick Test Commands

### Health Check
```bash
curl http://localhost:3001/api/chat/cloud
```

### List Models
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"what models are available?"}]}'
```

### Chat with Default Model (20B)
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

### Chat with Enterprise Model (671B)
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Analyze this complex issue..."}],"model":"deepseek-v3.1:671b-cloud"}'
```

### Chat with Documentation Model (480B)
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Write documentation for..."}],"model":"qwen3-coder:480b-cloud"}'
```

### Chat with Grant Writing Model (120B)
```bash
curl -X POST http://localhost:3001/api/chat/cloud \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Help me write a grant proposal for..."}],"model":"gpt-oss:120b-cloud"}'
```

## 📊 Your Models

| Use Case | Model | Parameters | Command Suffix |
|----------|-------|------------|----------------|
| **General/Complex** | DeepSeek v3.1 | 671B | `"model":"deepseek-v3.1:671b-cloud"` |
| **Documentation** | Qwen3 Coder | 480B | `"model":"qwen3-coder:480b-cloud"` |
| **Grant Writing** | GPT-OSS Pro | 120B | `"model":"gpt-oss:120b-cloud"` |
| **Default/Standard** | GPT-OSS | 20B | `"model":"gpt-oss:20b-cloud"` or omit |

## 🔧 Configuration Files

- **Environment**: `.env.local` (in project root)
- **API Endpoint**: `app/api/chat/cloud/route.ts`
- **Documentation**: `docs/ollama-cloud-integration.md`
- **Setup Summary**: `docs/OLLAMA_CLOUD_SETUP_SUMMARY.md`

## ⚠️ Current Status

**Configuration**: ✅ Complete  
**Endpoint**: ✅ Working  
**API Connection**: ❌ DNS resolution error for `api.ollama.com`

**Next Action**: Verify correct base URL from Ollama dashboard or support.

## 🔄 Update Base URL

If you get a different base URL, update `.env.local`:

```bash
OLLAMA_CLOUD_BASE_URL=https://your-correct-url.com
```

Server will auto-reload. No code changes needed!

## 📞 Test Direct API Access

```bash
# Test DNS
nslookup api.ollama.com

# Test direct connection
curl -v https://api.ollama.com/api/chat \
  -H "Authorization: Bearer $(grep OLLAMA_CLOUD_API_KEY .env.local | cut -d '=' -f2)" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-oss:20b-cloud","messages":[{"role":"user","content":"test"}]}'
```

