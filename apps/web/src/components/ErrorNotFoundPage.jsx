import React from "react";
import {useNavigate} from "react-router-dom";
import {Titled} from "react-titled";
import {sep} from "../constants";

export default function ErrorNotFoundPage() {
    const navigate = useNavigate();

    function handleGoHome() {
        navigate('/');
    }

    function handleGoBack() {
        history.back();
    }

    return (
        <Titled title={(s) => `Not Found ${sep} ${s}`}>
            <div className="error-page">
                <p>Page not found.</p>
                <hr/>
                <div className="button-group">
                    <p>Press one of the following buttons:</p>
                    <button onClick={handleGoHome} title="Return to home page & models list">Home</button>
                    <button onClick={handleGoBack} title="Go back to previous page">Go Back</button>
                </div>
            </div>
        </Titled>
    )
}
