'use client';

import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast show" id="appToast" role="alert" aria-live="polite">
      {message}
    </div>
  );
};
