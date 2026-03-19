export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function validateContactForm(form: {
  name: string;
  email: string;
  subject: string;
  message: string;
}, maxMessage = 1000): ContactFormErrors {
  const err: ContactFormErrors = {};
  if (!form.name.trim()) err.name = 'Vui lòng nhập họ tên';
  if (!form.email.trim()) err.email = 'Vui lòng nhập email';
  else if (!validateEmail(form.email)) err.email = 'Email không hợp lệ';
  if (!form.subject.trim()) err.subject = 'Vui lòng nhập chủ đề';
  if (!form.message.trim()) err.message = 'Vui lòng nhập nội dung';
  else if (form.message.length > maxMessage) err.message = `Tối đa ${maxMessage} ký tự`;
  return err;
}
