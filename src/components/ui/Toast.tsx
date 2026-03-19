import { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({ message, duration = 2500, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast-msg${visible ? ' show' : ''}`}>
      {message}
    </div>
  );
}
