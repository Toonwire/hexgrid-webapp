import '../styles/Sidebar.css';
import React from 'react';
import { ReactComponent as Logo } from '../assets/hexgrid-logo.svg';

type SidebarProps = {
  children?: React.ReactNode;
};

export function Sidebar({ children }: SidebarProps): React.ReactNode {
  return (
    <div className="sidebar">
      <div style={{ margin: '20px' }}>
        <Logo style={{ width: '100%', height: '100%', fill: '#66bb6a' }} />
      </div>
      {children}
    </div>
  );
}

type WithSidebarProps = {
  sidebarElements: React.ReactNode;
  content: React.ReactNode;
};

function WithSidebar({ sidebarElements, content }: WithSidebarProps) {
  return (
    <div className="with-sidebar">
      <div className="sidebar-wrapper">
        <Sidebar>{sidebarElements}</Sidebar>
      </div>
      <div className="with-sidebar-content">{content}</div>
    </div>
  );
}

export default WithSidebar;
