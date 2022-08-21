import React from "react";
import {Link} from "react-router-dom";
import {logout} from "../auth";

export default function AppHeader() {
    return (
        <>
            <div className="page-header">
                <div><Link to="/">Domain-Driven <span style={{color: 'Orange'}}>βeta</span></Link></div>
            </div>
            <div className="page-header-spacer"/>
            <div className="page-header-top-right">
                <a onClick={() => window.scrollTo(0, 0)}>Top</a>{' '}|{' '}
                <Link to="/help">Help</Link>{' '}|{' '}
                <a onClick={() => logout()}>Logout</a>
            </div>
        </>
    )
}
