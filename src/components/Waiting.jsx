import React from "react";
import PropTypes from "prop-types";

Waiting.propTypes = {
    msg: PropTypes.string
}

export default function Waiting({msg}) {
    return (
        <div className="ellipsis waiting-msg">
            {msg || 'Waiting'}
            <span className="dot dot1">.</span>
            <span className="dot dot2">.</span>
            <span className="dot dot3">.</span>
        </div>
    )
}
