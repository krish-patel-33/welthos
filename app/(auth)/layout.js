"use client";

import React, { useEffect } from 'react'

const AuthLayout = ({ children }) => {
  useEffect(() => {
    // Hide header and footer on auth pages
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Cleanup: Show them again when leaving auth pages
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return <div className="fixed inset-0 bg-white z-50">{children}</div>;
};

export default AuthLayout;