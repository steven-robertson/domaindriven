import React from "react";
import PropTypes from "prop-types";

ActionLink.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.string.isRequired
}

export default function ActionLink(props) {
    return <span className="action-link" onClick={props.onClick}>{props.children}</span>
}
