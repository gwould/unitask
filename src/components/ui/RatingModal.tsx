import { useState } from 'react';

interface RatingModalProps {
  jobTitle: string;
  onSubmit: (rating: number, review: string) => void;
  onCancel: () => void;
}

export default function RatingModal({ jobTitle, onSubmit, onCancel }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>⭐ Đánh giá trải nghiệm</h3>
        <p className="modal-sub">{jobTitle}</p>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`rating-star${star <= (hovered || rating) ? ' active' : ''}`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              type="button"
            >
              ★
            </button>
          ))}
          {rating > 0 && <span className="rating-text">{rating}/5</span>}
        </div>
        <textarea
          className="rating-review"
          placeholder="Chia sẻ trải nghiệm của bạn... (không bắt buộc)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Bỏ qua</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={rating === 0}
            onClick={() => onSubmit(rating, review)}
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
