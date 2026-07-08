export interface Category {
  /** Backend category id (Guid) when loaded from API */
  id?: string;
  /** Boxicons class name (vd: 'bx-code-alt') */
  icon: string;
  bg: string;
  /** Màu icon khớp với tint nền bg */
  iconColor?: string;
  name: string;
  count: string;
  slug: string;
}

export interface HowStep {
  num: string;
  icon: string;
  title: string;
  desc: string;
}

export interface Testimonial {
  stars: number;
  text: string;
  avatarLetter: string;
  avatarGradient: string;
  name: string;
  role: string;
}

export interface Feature {
  /** Boxicons class name (vd: 'bx-shield-quarter') */
  icon: string;
  iconBg: string;
  /** Màu icon khớp với tint nền iconBg */
  iconColor?: string;
  title: string;
  desc: string;
  large?: boolean;
  list?: string[];
}
