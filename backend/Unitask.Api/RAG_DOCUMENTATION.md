# RAG (Retrieval-Augmented Generation) System - Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống RAG kết hợp ba thành phần chính:

1. **Data Normalization** - Chuẩn hóa dữ liệu từ database
2. **Vector Embeddings** - Chuyển text thành vectors (384 chiều)
3. **Qdrant Vector Database** - Lưu trữ và tìm kiếm vectors
4. **LLM Integration** - Sử dụng Groq hoặc Ollama để tạo phản hồi

## Kiến Trúc

```
Database (SQL Server)
    ↓
Data Normalization Service
    ↓
Embedding Service (tạo vectors)
    ↓
Qdrant Vector Database (lưu trữ)
    ↓
RAG Service (orchestration)
    ↓
RAG Controller (API endpoints)
    ↓
Frontend / Client
```

## Cấu Hình

### 1. appsettings.json

```json
{
  "RAG": {
    "Qdrant": {
      "Url": "https://fec65e37-50f7-461b-a9da-e129b5490f2c.europe-west3-0.gcp.cloud.qdrant.io",
      "ApiKey": "your-api-key",
      "Host": "localhost",
      "Port": 6333,
      "CollectionName": "unitask_knowledge",
      "VectorSize": 384
    },
    "Groq": {
      "ApiKey": "your-groq-api-key",
      "Model": "llama-3.3-70b-versatile",
      "Endpoint": "https://api.groq.com/openai/v1/chat/completions"
    },
    "Ollama": {
      "Endpoint": "http://localhost:11434",
      "Model": "llama3.1:8b"
    },
    "Embedding": {
      "ModelPath": "./Models/all-MiniLM-L6-v2",
      "Dimension": 384
    },
    "UseLLM": "Groq"
  }
}
```

## API Endpoints

### 1. Truy Vấn RAG

**POST** `/api/rag/query`

```json
Request:
{
  "query": "Công việc backend nào phù hợp cho sinh viên?",
  "topK": 5,
  "documentType": null
}

Response:
{
  "query": "Công việc backend nào phù hợp cho sinh viên?",
  "results": [
    {
      "documentId": "job_1",
      "type": "job",
      "title": "Senior Backend Developer",
      "content": "...",
      "score": 0.85,
      "metadata": {
        "job_id": "1",
        "company": "Tech Company",
        "category": "backend",
        "location": "Remote"
      }
    }
  ],
  "llmResponse": "Dựa trên thông tin, có 2 công việc backend phù hợp...",
  "executionTimeMs": 245
}
```

### 2. Tìm Kiếm Giống Nhau

**POST** `/api/rag/search`

```json
Request:
{
  "query": "Python Django developers",
  "topK": 10,
  "documentType": "job"
}

Response:
[
  {
    "documentId": "job_5",
    "type": "job",
    "title": "Django Developer",
    "score": 0.92,
    ...
  }
]
```

### 3. Cập Nhật Index

**POST** `/api/rag/index/refresh`

Đánh chỉ mục lại toàn bộ dữ liệu (Jobs, Users, Applications)

### 4. Đánh Chỉ Mục Riêng Lẻ

**POST** `/api/rag/index/jobs` - Đánh chỉ mục Jobs
**POST** `/api/rag/index/users` - Đánh chỉ mục Users
**POST** `/api/rag/index/applications` - Đánh chỉ mục Applications

### 5. Kiểm Tra Sức Khỏe

**GET** `/api/rag/health`

```json
Response:
{
  "status": "healthy",
  "message": "RAG system is operational"
}
```

## Dữ Liệu Được Chuẩn Hóa

### Jobs

Các trường được trích xuất:
- Title (Tiêu đề)
- Description (Mô tả)
- Company (Công ty)
- Skills (Kỹ năng)
- Requirements (Yêu cầu)
- Category (Loại)
- Location (Địa điểm)
- Salary Range (Mức lương)

### Users

Các trường được trích xuất:
- Full Name (Tên đầy đủ)
- Email
- Role (Vai trò: student/business)
- Company/University
- Phone

### Applications

Các trường được trích xuất:
- Job Title
- Company
- Cover Letter
- Status
- Applied Date

## Chuẩn Hóa Text

Quá trình chuẩn hóa:

1. **Xóa HTML tags** - Loại bỏ các thẻ HTML
2. **Xóa ký tự đặc biệt** - Giữ lại chỉ chữ, số, dấu chấm
3. **Xóa khoảng trắng dư** - Chuyển multiple spaces thành single space
4. **Trim** - Xóa khoảng trắng ở đầu cuối

Ví dụ:
```
Input: "   <p>Senior C# Developer</p>;; Position in Vietnam  "
Output: "Senior C. Developer Position in Vietnam"
```

## Embedding Models

### Option 1: Sentence Transformer (Khuyên dùng)

Model: `all-MiniLM-L6-v2`
- Chiều: 384
- Kích thước: ~22 MB
- Tốc độ: Nhanh
- Độ chính xác: Tốt

Cài đặt:
```bash
pip install sentence-transformers
python -m sentence_transformers.server --model all-MiniLM-L6-v2 --port 8000
```

### Option 2: Ollama (Local LLM)

Model: `llama3.1:8b`
- Chạy locally
- Không cần API key
- Yêu cầu GPU để nhanh

Cài đặt:
```bash
ollama pull llama3.1:8b
ollama serve
```

### Option 3: Mock Service (Development)

Sử dụng cho testing - tạo vectors ngẫu nhiên nhưng consistent

## Workflow Sử Dụng

### 1. Khởi Tạo Hệ Thống

```csharp
// Trong Program.cs - đã được thêm vào
builder.Services.AddRagServices(builder.Configuration);
```

### 2. Đánh Chỉ Mục Dữ Liệu Ban Đầu

Khi ứng dụng khởi động, gọi:
```bash
POST /api/rag/index/refresh
```

### 3. Truy Vấn

```bash
POST /api/rag/query
{
  "query": "Tôi muốn tìm công việc frontend",
  "topK": 5
}
```

### 4. Cập Nhật Index Khi Có Dữ Liệu Mới

Khi có Job mới được tạo:
```csharp
// Trong JobsController
await _ragService.IndexJobsAsync();
```

## Tối Ưu Hóa

### 1. Batch Indexing

Hệ thống sử dụng batch size = 10 để tối ưu:
- Giảm số lượng API calls
- Cải thiện hiệu suất
- Tránh timeout

### 2. Caching

Nên cache kết quả tìm kiếm phổ biến:
```csharp
private static readonly Dictionary<string, RagQueryResponse> Cache = new();
```

### 3. Async Operations

Tất cả các operations là async để không blocking thread pool

## Troubleshooting

### Lỗi: "Qdrant connection failed"

1. Kiểm tra URL và API key trong appsettings.json
2. Đảm bảo Qdrant server đang chạy
3. Kiểm tra firewall rules

### Lỗi: "Embedding service unavailable"

1. Nếu dùng Sentence Transformer: `python -m sentence_transformers.server`
2. Nếu dùng Ollama: `ollama serve`
3. Kiểm tra endpoint trong config

### Kết Quả Tìm Kiếm Không Chính Xác

1. Kiểm tra text normalization
2. Thử với topK cao hơn (10-20)
3. Đánh chỉ mục lại toàn bộ dữ liệu

## Mở Rộng

### Thêm Document Type Mới

1. Tạo model mới
2. Thêm normalization method trong `DataNormalizationService`
3. Gọi trong `RagService.IndexAsync()`

### Thay Đổi LLM

1. Cập nhật `UseLLM` trong appsettings.json
2. Thêm config cho LLM mới
3. Implement generate method trong `RagService`

## Performance Metrics

- Query latency: ~200-500ms
- Indexing speed: ~50-100 docs/sec (tùy embedding service)
- Storage: ~1MB per 1000 documents (tùy dimension)

## Liên Hệ

Cho bất kỳ câu hỏi hoặc vấn đề, vui lòng liên hệ development team.
