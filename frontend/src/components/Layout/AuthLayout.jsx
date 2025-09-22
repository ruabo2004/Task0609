import React from "react";

/**
 * Auth Layout Component
 * Simple layout for authentication pages
 */
const AuthLayout = ({ children }) => {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default AuthLayout;
