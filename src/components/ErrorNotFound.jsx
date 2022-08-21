import React from "react";
import {useNavigate} from "react-router-dom";

export default function ErrorNotFound() {
    const navigate = useNavigate();

    function handleGoHome() {
        navigate('/');
    }

    function handleGoBack() {
        history.back();
    }

    return (
        <div className="error-page">
            <p>Page not found.</p>
            <hr/>
            <div className="button-group">
                <p>Press one of the following buttons:</p>
                <button onClick={handleGoHome} title="Return to home page & models list">Home</button>
                <button onClick={handleGoBack} title="Go back to previous page">Go Back</button>
            </div>
        </div>
    )
}