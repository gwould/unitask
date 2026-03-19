export interface Category {
  icon: string;
  bg: string;
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
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  large?: boolean;
  list?: string[];
}
