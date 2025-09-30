import Header from '@components/header/Header';
import Sidebar from '@components/sidebar/Sidebar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const layoutStyle = {
  display: 'flex',
  height: '100vh'
};

const mainContentStyle = {
  flexGrow: 1, // Takes up the remaining space
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f7fafc'
};

const contentAreaStyle = {
  flexGrow: 1,
  overflowX: 'hidden', // Prevent horizontal overflow
  overflowY: 'auto' // Make content scrollable
};

const ProtectedLayout = () => {
  return (
    <div className='App'>
      <Sidebar />
      <main className='main-content max-h-screen'>
        <div className='p-2'>
          <Header />
        </div>
        <div style={contentAreaStyle} className='max-h-screen overflow-y-auto'>
          {/* Child routes will be rendered here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedLayout;