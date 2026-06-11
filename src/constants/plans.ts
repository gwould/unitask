export interface SubscriptionPlan {
  key: string;
  name: string;
  /** Giá / tháng (VNĐ). 0 = miễn phí */
  priceMonthly: number;
  badge: string;
  highlight: boolean;
  features: string[];
  cta: string;
}

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
    priceMonthly: 299_000,
    badge: 'Linh hoạt',
    highlight: true,
    features: [
      '30 job/tháng',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Nâng cấp Starter',
  },
  {
    key: 'growth',
    name: 'Growth Package',
    priceMonthly: 799_000,
    badge: 'Không giới hạn',
    highlight: false,
    features: [
      'Job không giới hạn',
      'Ưu tiên hiển thị bài đăng',
      'Gợi ý ứng viên phù hợp',
      'Giảm phí giao dịch',
      'Thống kê hiệu quả tuyển dụng',
    ],
    cta: 'Nâng cấp Growth',
  },
];

export function getPlan(key: string | undefined): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.key === key);
}

/** VAT 8% theo ví dụ hóa đơn VN */
export const VAT_RATE = 0.08;
