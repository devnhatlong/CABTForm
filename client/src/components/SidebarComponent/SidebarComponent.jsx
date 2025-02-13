import React from 'react'

export const SidebarComponent = () => {
    return (
        <div className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            {/* Sidebar - Brand */}
            <a
            className="sidebar-brand d-flex align-items-center justify-content-center"
            href="index.html"
            >
            <div className="sidebar-brand-icon rotate-n-15">
                <i className="fas fa-laugh-wink" />
            </div>
            <div className="sidebar-brand-text mx-3">
                DASHBOARD
            </div>
            </a>
            {/* Divider */}
            <hr className="sidebar-divider my-0" />
            {/* Nav Item - Dashboard */}
            <li className="nav-item active">
            <a className="nav-link" href="index.html">
                <i className="fas fa-fw fa-tachometer-alt" />
                <span>Dashboard</span>
            </a>
            </li>
        </div>
    )
}
