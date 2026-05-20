using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Unitask.Api.Models;

namespace Unitask.Api.Services;

/// <summary>
/// Service quản lý Qdrant Vector Database
/// </summary>
public interface IQdrantService
{
    Task InitializeCollectionAsync();
    Task<string> UpsertDocumentAsync(RagDocument doc, float[] vector);
    Task<List<RagSearchResult>> SearchAsync(float[] vector, int limit = 5, string? documentType = null);
    Task DeleteDocumentAsync(string docId);
    Task DeleteCollectionAsync();
    Task<bool> HealthCheckAsync();
}

public class QdrantService : IQdrantService
{
    private readonly HttpClient _httpClient;
    private readonly QdrantConfig _config;
    private readonly ILogger<QdrantService> _logger;

    public QdrantService(HttpClient httpClient, IConfiguration config, ILogger<QdrantService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        var ragConfig = config.GetSection("RAG").Get<RagConfig>();
        _config = ragConfig?.Qdrant ?? throw new InvalidOperationException("Qdrant config not found");
        
        // Set API key if available
        if (!string.IsNullOrEmpty(_config.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("api-key", _config.ApiKey);
        }
    }

    public async Task InitializeCollectionAsync()
    {
        try
        {
            var baseUrl = GetBaseUrl();
            
            // Kiểm tra collection đã tồn tại chưa
            var checkResponse = await _httpClient.GetAsync($"{baseUrl}/collections/{_config.CollectionName}");
            if (checkResponse.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Collection {_config.CollectionName} already exists");
                return;
            }

            // Tạo collection mới
            var createRequest = new
            {
                vectors = new
                {
                    size = _config.VectorSize,
                    distance = "Cosine"
                }
            };

            var response = await _httpClient.PutAsJsonAsync(
                $"{baseUrl}/collections/{_config.CollectionName}",
                createRequest
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to create collection: {error}");
                throw new Exception($"Failed to create Qdrant collection: {error}");
            }

            _logger.LogInformation($"Collection {_config.CollectionName} created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Qdrant collection");
            throw;
        }
    }

    public async Task<string> UpsertDocumentAsync(RagDocument doc, float[] vector)
    {
        try
        {
            await InitializeCollectionAsync();

            var baseUrl = GetBaseUrl();
            var pointId = HashToId(doc.Id);

            var payload = new
            {
                points = new[]
                {
                    new
                    {
                        id = pointId,
                        vector = vector,
                        payload = new
                        {
                            document_id = doc.Id,
                            type = doc.Type,
                            title = doc.Title,
                            content = doc.Content,
                            metadata = doc.Metadata,
                            created_at = doc.CreatedAt.ToString("O")
                        }
                    }
                }
            };

            var response = await _httpClient.PutAsJsonAsync(
                $"{baseUrl}/collections/{_config.CollectionName}/points?wait=true",
                payload
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to upsert document: {error}");
                throw new Exception($"Failed to upsert document to Qdrant: {error}");
            }

            _logger.LogInformation($"Document {doc.Id} upserted successfully");
            return doc.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error upserting document {doc.Id}");
            throw;
        }
    }

    public async Task<List<RagSearchResult>> SearchAsync(float[] vector, int limit = 5, string? documentType = null)
    {
        try
        {
            await InitializeCollectionAsync();

            var baseUrl = GetBaseUrl();

            var searchRequest = new
            {
                vector = vector,
                limit = limit,
                with_payload = true,
                with_vectors = false,
                filter = documentType != null ? new
                {
                    must = new[]
                    {
                        new
                        {
                            key = "type",
                            match = new { value = documentType }
                        }
                    }
                } : null
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{baseUrl}/collections/{_config.CollectionName}/points/search",
                searchRequest
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to search: {error}");
                throw new Exception($"Failed to search in Qdrant: {error}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonSerializer.Deserialize<JsonElement>(content);
            var results = new List<RagSearchResult>();

            foreach (var result in json.GetProperty("result").EnumerateArray())
            {
                var payload = result.GetProperty("payload");
                var metadata = payload.GetProperty("metadata");
                var metadataDict = new Dictionary<string, string>();

                foreach (var prop in metadata.EnumerateObject())
                {
                    metadataDict[prop.Name] = prop.Value.GetString() ?? string.Empty;
                }

                results.Add(new RagSearchResult
                {
                    DocumentId = payload.GetProperty("document_id").GetString() ?? string.Empty,
                    Type = payload.GetProperty("type").GetString() ?? string.Empty,
                    Title = payload.GetProperty("title").GetString() ?? string.Empty,
                    Content = payload.GetProperty("content").GetString() ?? string.Empty,
                    Score = (float)result.GetProperty("score").GetDouble(),
                    Metadata = metadataDict
                });
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Qdrant");
            throw;
        }
    }

    public async Task DeleteDocumentAsync(string docId)
    {
        try
        {
            var baseUrl = GetBaseUrl();
            var pointId = HashToId(docId);

            var deleteRequest = new
            {
                points = new[] { pointId }
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{baseUrl}/collections/{_config.CollectionName}/points/delete?wait=true",
                deleteRequest
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to delete document: {error}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting document {docId}");
        }
    }

    public async Task DeleteCollectionAsync()
    {
        try
        {
            var baseUrl = GetBaseUrl();
            var response = await _httpClient.DeleteAsync($"{baseUrl}/collections/{_config.CollectionName}");
            
            if (response.IsSuccessStatusCode)
                _logger.LogInformation($"Collection {_config.CollectionName} deleted");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting collection");
        }
    }

    public async Task<bool> HealthCheckAsync()
    {
        try
        {
            var baseUrl = GetBaseUrl();
            var response = await _httpClient.GetAsync($"{baseUrl}/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private string GetBaseUrl()
    {
        if (!string.IsNullOrEmpty(_config.Url))
            return _config.Url;
        
        return $"http://{_config.Host}:{_config.Port}";
    }

    private static ulong HashToId(string text)
    {
        // Chuyển text thành ulong ID consistent
        unchecked
        {
            ulong hash = 14695981039346656037UL;
            const ulong prime = 1099511628211UL;
            
            foreach (var c in text)
            {
                hash ^= c;
                hash *= prime;
            }
            
            return hash;
        }
    }
}
