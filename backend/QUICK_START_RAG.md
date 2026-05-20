# RAG Quick Start Guide

## 1. Chuẩn Bị Môi Trường

### A. Thiết Lập Embedding Service (Chọn 1)

#### Option 1: Sentence Transformer (Khuyên dùng)
```bash
# Cài đặt Python packages
pip install sentence-transformers

# Chạy server
python -m sentence_transformers.server --model all-MiniLM-L6-v2 --port 8000
```

#### Option 2: Ollama
```bash
# Tải Ollama từ: https://ollama.ai
ollama pull llama3.1:8b
ollama serve
```

### B. Thiết Lập Qdrant

#### Option 1: Cloud Qdrant (Đã cấu hình)
- Sử dụng URL cloud trong appsettings.json
- Không cần cài đặt gì thêm

#### Option 2: Local Qdrant (Docker)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### C. Lấy Groq API Key

1. Truy cập: https://console.groq.com
2. Đăng ký và tạo API key
3. Thêm vào appsettings.json

## 2. Cấu Hình Backend

### Cập nhật appsettings.json

```json
{
  "RAG": {
    "Qdrant": {
      "Url": "https://your-qdrant-url.com",
      "ApiKey": "your-api-key",
      "CollectionName": "unitask_knowledge",
      "VectorSize": 384
    },
    "Groq": {
      "ApiKey": "your-groq-key",
      "Model": "llama-3.3-70b-versatile",
      "Endpoint": "https://api.groq.com/openai/v1/chat/completions"
    },
    "Embedding": {
      "ModelPath": "sentence-transformer",
      "Dimension": 384
    },
    "UseLLM": "Groq"
  }
}
```

### Chạy Backend

```bash
cd backend/Unitask.Api
dotnet run
```

## 3. Khởi Tạo Hệ Thống

### A. Kiểm Tra Sức Khỏe
```bash
curl http://localhost:5000/api/rag/health
```

### B. Đánh Chỉ Mục Dữ Liệu
```bash
# Tất cả dữ liệu
curl -X POST http://localhost:5000/api/rag/index/refresh

# Hoặc riêng lẻ
curl -X POST http://localhost:5000/api/rag/index/jobs
curl -X POST http://localhost:5000/api/rag/index/users
curl -X POST http://localhost:5000/api/rag/index/applications
```

## 4. Sử Dụng API

### Truy Vấn RAG
```bash
curl -X POST http://localhost:5000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Công việc backend có phù hợp cho sinh viên không?",
    "topK": 5
  }'
```

### Tìm Kiếm Giống Nhau
```bash
curl -X POST http://localhost:5000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python Django developers",
    "topK": 10,
    "documentType": "job"
  }'
```

## 5. Frontend Integration (React)

### Tạo RAG Service

```typescript
// src/services/ragService.ts
const queryRAG = async (query: string, topK: number = 5) => {
  const response = await fetch('http://localhost:5000/api/rag/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK })
  });
  return response.json();
};

export { queryRAG };
```

### Sử Dụng trong Component

```typescript
import { queryRAG } from '@/services/ragService';

export default function SearchComponent() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const response = await queryRAG(query);
      setResults(response.results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Hỏi gì đó..."
      />
      {results.map(result => (
        <div key={result.documentId}>
          <h3>{result.title}</h3>
          <p>{result.content}</p>
          <small>Độ phù hợp: {(result.score * 100).toFixed(1)}%</small>
        </div>
      ))}
    </div>
  );
}
```

## 6. Ví Dụ Sử Dụng

### Ví Dụ 1: Tìm Công Việc Phù Hợp
```json
POST /api/rag/query
{
  "query": "Tôi muốn tìm công việc backend sử dụng C# tại Hà Nội",
  "topK": 5,
  "documentType": "job"
}
```

**Kết quả**: Trả về 5 công việc phù hợp nhất + phản hồi từ LLM

### Ví Dụ 2: Tìm Ứng Viên Phù Hợp
```json
POST /api/rag/query
{
  "query": "Ứng viên nào có kinh nghiệm với React?",
  "topK": 5,
  "documentType": "application"
}
```

### Ví Dụ 3: Tìm Công Ty
```json
POST /api/rag/search
{
  "query": "Công ty tech startup ở Việt Nam",
  "topK": 10,
  "documentType": "job"
}
```

## 7. Monitoring

### Kiểm Tra Logs
```bash
# Backend
cd backend/Unitask.Api
dotnet run --configuration Debug
```

### Kiểm Tra Qdrant Collection
```bash
curl http://localhost:6333/collections
```

### Performance Metrics
- Thời gian query: 200-500ms
- Tốc độ indexing: 50-100 docs/sec
- Vector dimension: 384

## 8. Troubleshooting

| Vấn đề | Giải Pháp |
|--------|----------|
| Embedding service không kết nối | Chạy Sentence Transformer hoặc Ollama server |
| Qdrant connection failed | Kiểm tra URL, API key, firewall |
| Kết quả tìm kiếm không chính xác | Đánh chỉ mục lại (`POST /api/rag/index/refresh`) |
| Tốc độ slow | Tăng topK, kiểm tra internet connection |

## 9. Tiếp Theo

1. ✅ Đánh chỉ mục dữ liệu
2. ✅ Thử nghiệm API
3. ✅ Tích hợp frontend
4. 📊 Monitoring & analytics
5. 🚀 Production deployment

## 10. Resources

- [Qdrant Documentation](https://qdrant.tech/documentation)
- [Groq API Docs](https://console.groq.com/docs)
- [Sentence Transformers](https://www.sbert.net/)
- [Ollama](https://ollama.ai)

---

**Ghi chú**: Nếu gặp bất kỳ vấn đề, hãy check logs và xem `RAG_DOCUMENTATION.md` để biết thêm chi tiết.
