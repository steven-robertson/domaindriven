import React from "react";

export default function AppFooter() {
    const copyYear = 2022;
    const currentYear = new Date().getFullYear();
    const copyRange = currentYear > copyYear ? `${copyYear}-${currentYear}` : `${copyYear}`;

    return (
        <div className="page-footer">
            <div className="copyright-notice">
                Copyright &copy; {copyRange} <a href="mailto:stever@hey.com">Steven Robertson</a>.
                All rights reserved.
            </div>
        </div>
    )
}
