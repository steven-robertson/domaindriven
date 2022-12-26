import React from "react";
import {Link} from "react-router-dom";

export default function AppFooter() {
    const copyYear = 2022;
    const currentYear = new Date().getFullYear();
    const copyRange = currentYear > copyYear ? `${copyYear}-${currentYear}` : `${copyYear}`;

    return (
        <div className="page-footer">
            <div className="copyright-notice">
                Copyright &copy; {copyRange} <a href="mailto:stever@hey.com">Steven Robertson</a> |{' '}
                <Link to="/legal/terms-of-use">Terms of Use</Link> |{' '}
                <Link to="/legal/privacy-policy">Privacy Policy</Link>
            </div>
        </div>
    )
}
