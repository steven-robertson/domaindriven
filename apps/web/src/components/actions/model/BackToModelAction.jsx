import React from "react";
import {useNavigate} from "react-router-dom";
import ActionLink from "../ActionLink";
import PropTypes from "prop-types";

BackToModelAction.propTypes = {
    modelId: PropTypes.string.isRequired
}

export default function BackToModelAction({modelId}) {
    const navigate = useNavigate();

    function action() {
        navigate(`/models/${modelId}`);
    }

    return <ActionLink onClick={action}>Back To Model</ActionLink>
}
