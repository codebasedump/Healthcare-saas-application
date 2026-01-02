import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import './DashboardLayout.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="layout-wrapper">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
}