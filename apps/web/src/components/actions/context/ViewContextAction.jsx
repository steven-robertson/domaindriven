import React from "react";
import {useNavigate} from "react-router-dom";
import ActionLink from "../ActionLink";
import PropTypes from "prop-types";

ViewContextAction.propTypes = {
    contextId: PropTypes.string.isRequired,
    modelId: PropTypes.string.isRequired
}

export default function ViewContextAction(props) {
    const navigate = useNavigate();

    function action() {
        navigate(`/models/${props.modelId}/contexts/${props.contextId}`);
    }

    return (
        <ActionLink onClick={action}>
            View
        </ActionLink>
    )
}
