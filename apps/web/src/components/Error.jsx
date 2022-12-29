import React from "react";
import PropTypes from "prop-types";

Error.propTypes = {
    msg: PropTypes.string.isRequired
}

export default function Error({msg}) {

    function handleReload() {
        window.location.reload();
    }

    function handleGoHome() {
        window.location.href = '/';
    }

    function handleGoBack() {
        history.back();
    }

    return (
        <div className="error-page">
            <p>Sorry, an unexpected error occurred.</p>
            <p>
                Error message is:
                <div className="error-msg">{msg}</div>
            </p>
            <hr/>
            <div className="button-group">
                <p>Press one of the following buttons:</p>
                <button onClick={handleReload} title="Reload this page">Reload</button>
                <button onClick={handleGoHome} title="Return to home page & models list">Restart</button>
                <button onClick={handleGoBack} title="Go back to previous page">Go Back</button>
            </div>
        </div>
    )
}
