import React from "react";
import PropTypes from "prop-types";
import {Titled} from "react-titled";
import {sep} from "../constants";

ErrorPage.propTypes = {
    msg: PropTypes.string.isRequired
}

export default function ErrorPage({msg}) {

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
        <Titled title={(s) => `Error ${sep} ${s}`}>
            <div className="error-page">
                <p>Sorry, an unexpected error occurred.</p>
                <p>Error message is:</p>
                <div className="error-msg">{msg}</div>
                <hr/>
                <div className="button-group">
                    <p>Press one of the following buttons:</p>
                    <button onClick={handleReload} title="Reload this page">Reload</button>
                    <button onClick={handleGoHome} title="Return to home page & models list">Restart</button>
                    <button onClick={handleGoBack} title="Go back to previous page">Go Back</button>
                </div>
            </div>
        </Titled>
    )
}
