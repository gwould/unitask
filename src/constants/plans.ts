export interface SubscriptionPlan {
  key: string;
  name: string;
  /** Giá / tháng (VNĐ) — giá ưu đãi ra mắt. 0 = miễn phí */
  priceMonthly: number;
  /** Giá gốc trước ưu đãi (để hiển thị gạch ngang). Bỏ trống nếu không giảm. */
  originalPriceMonthly?: number;
  /** Số ngày dùng thử miễn phí đầy đủ tính năng. */
  trialDays?: number;
  badge: string;
  highlight: boolean;
  features: string[];
  cta: string;
}

/**
 * Bảng giá giai đoạn ra mắt: hạ rào cản tài chính ~50% so với giá gốc
 * và tặng 30 ngày dùng thử đầy đủ tính năng để kích cầu người dùng đầu tiên.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    key: 'free-starter',
    name: 'Free Starter',
    priceMonthly: 0,
    badge: 'Khởi động',
    highlight: false,
    features: [
      '5 job/tháng',
      'Hiển thị cơ bản',
      'Gợi ý việc làm phù hợp',
      'Hỗ trợ email',
    ],
    cta: 'Bắt đầu miễn phí',
  },
  {
    key: 'starter',
    name: 'Starter Package',
    priceMonthly: 149_000,
    originalPriceMonthly: 299_000,
    trialDays: 30,
    badge: 'Linh hoạt',
    highlight: true,
    features: [
      '30 job/tháng',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Dùng thử 30 ngày',
  },
  {
    key: 'growth',
    name: 'Growth Package',
    priceMonthly: 449_000,
    originalPriceMonthly: 799_000,
    trialDays: 30,
    badge: 'Không giới hạn',
    highlight: false,
    features: [
      'Job không giới hạn',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Dùng thử 30 ngày',
  },
];

export function getPlan(key: string | undefined): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.key === key);
}

/** VAT 8% theo ví dụ hóa đơn VN */
export const VAT_RATE = 0.08;
