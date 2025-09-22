import React from "react";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Main Layout Component
 * Layout for authenticated and main pages
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
