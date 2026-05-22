import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Applicant } from '../types/application';
import { useAuth } from '../contexts/AuthContext';
import { serviceRegistry, type AutomationSuggestion } from '../services';

const { insights: insightsService } = serviceRegistry;

interface AutomationSuggestionsProps {
  applicants: Applicant[];
  onApplySuggestion?: (suggestion: string) => void;
}

export function AutomationSuggestions({ applicants }: AutomationSuggestionsProps) {
  const { user } = useAuth();
  const [apiSuggestions, setApiSuggestions] = useState<AutomationSuggestion[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setApiSuggestions(null);
      return () => {
        cancelled = true;
      };
    }

    insightsService.getAutomationSuggestions(user.id)
      .then((response) => {
        if (!cancelled) {
          setApiSuggestions(response.suggestions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiSuggestions(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const suggestions = useMemo(() => {
    if (apiSuggestions && apiSuggestions.length > 0) {
      return apiSuggestions;
    }

    const result: AutomationSuggestion[] = [];

    // Calculate stats
    const pending = applicants.filter(a => a.status === 'pending').length;
    const highRating = applicants.filter(a => a.rating && a.rating >= 4.5).length;
    const lowRating = applicants.filter(a => a.rating && a.rating < 3.5 && a.status === 'pending').length;
    const avgRating = applicants.length > 0
      ? (applicants.reduce((sum, a) => sum + (a.rating || 0), 0) / applicants.length)
      : 0;

    // Suggestion 1: Auto-accept high ratings
    if (highRating > 0 && pending > 0) {
      result.push({
        id: 'auto-accept-high',
        icon: '✅',
        title: 'Tự động chấp nhận rating cao',
        description: `${highRating} ứng viên có rating 4.5+ đang chờ duyệt`,
        benefit: 'Tiết kiệm thời gian, xử lý nhanh các ứng viên tốt',
        action: 'Setup auto-accept rule',
        actionLink: '/automation-rules',
        priority: 'high',
      });
    }

    // Suggestion 2: Auto-reject low ratings
    if (lowRating > 0) {
      result.push({
        id: 'auto-reject-low',
        icon: '❌',
        title: 'Tự động từ chối rating thấp',
        description: `${lowRating} ứng viên có rating <3.5 có thể từ chối tự động`,
        benefit: 'Loại bỏ tự động những ứng viên không phù hợp',
        action: 'Setup auto-reject rule',
        actionLink: '/automation-rules',
        priority: 'normal',
      });
    }

    // Suggestion 3: Bulk process pending
    if (pending > 3) {
      result.push({
        id: 'bulk-pending',
        icon: '📋',
        title: 'Duyệt hàng loạt ứng viên',
        description: `${pending} ứng viên đang chờ xử lý`,
        benefit: 'Duyệt một lúc nhiều ứng viên thay vì từng cái một',
        action: 'Sử dụng bulk actions ở trang này',
        priority: 'high',
      });
    }

    // Suggestion 4: Auto-notify new applicants
    if (applicants.length > 0) {
      result.push({
        id: 'auto-notify',
        icon: '🔔',
        title: 'Tự động thông báo ứng viên',
        description: 'Gửi thông báo tự động cho tất cả ứng viên mới',
        benefit: 'Giữ liên lạc tự động, nâng cao trải nghiệm ứng viên',
        action: 'Setup auto-notify rule',
        actionLink: '/automation-rules',
        priority: 'normal',
      });
    }

    // Suggestion 5: High average rating
    if (avgRating >= 4.5) {
      result.push({
        id: 'quality-high',
        icon: '⭐',
        title: 'Chất lượng ứng viên rất tốt',
        description: `Average rating: ${avgRating.toFixed(1)} - Hay ho!`,
        benefit: 'Tỷ lệ hoàn thành cao, bạn có thể tăng giá hoặc quy mô',
        action: 'Xem Business Automation',
        actionLink: '/business-automation',
        priority: 'low',
      });
    }

    return result;
  }, [applicants, apiSuggestions]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="automation-suggestions">
      <div className="suggestions-title">
        💡 <strong>Gợi ý tự động hóa</strong>
      </div>
      <div className="suggestions-grid">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="suggestion-card">
            <div className="suggestion-icon">{suggestion.icon}</div>
            <div className="suggestion-content">
              <div className="suggestion-title">{suggestion.title}</div>
              <div className="suggestion-desc">{suggestion.description}</div>
              <div className="suggestion-benefit">💪 {suggestion.benefit}</div>
            </div>
            {suggestion.actionLink ? (
              <Link to={suggestion.actionLink} className="suggestion-action-link">
                {suggestion.action} →
              </Link>
            ) : (
              <div className="suggestion-action-text">{suggestion.action}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
