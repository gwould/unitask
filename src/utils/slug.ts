/**
 * slugify — chuẩn hoá chuỗi ngành nghề thành slug nhất quán giữa
 * danh mục (category select) và job, tránh lệch định dạng gây lỗi bộ lọc.
 *
 * "Công nghệ thông tin" → "cong-nghe-thong-tin"
 * "IT / Lập trình"      → "it-lap-trinh"
 */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export function slugify(input?: string | null): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '') // bỏ dấu thanh tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // ký tự không hợp lệ → '-'
    .replace(/^-+|-+$/g, '');     // bỏ '-' thừa ở hai đầu
}
