import React from "react";
import {useSelector} from "react-redux";
import PropTypes, {string} from "prop-types";

ModelViewers.propTypes = {
    viewerIds: PropTypes.arrayOf(string).isRequired,
    viewerIdLookup: PropTypes.object.isRequired
}

export default function ModelViewers(props) {
    const userId = useSelector(state => state?.user.userId);

    const otherViewerNames = [];
    for (let i = 0; i < props.viewerIds.length; i++) {
        const viewerId = props.viewerIds[i];
        if (viewerId !== userId) {
            otherViewerNames.push(props.viewerIdLookup[viewerId] || '?');
        }
    }

    otherViewerNames.sort();

    if (otherViewerNames.length === 0) {
        return <></>
    }

    return (
        <div className="viewer-count">
            {otherViewerNames.length} other{' '}
            {otherViewerNames.length === 1 ? 'person' : 'people'} viewing:{' '}
            <span>{otherViewerNames.join(', ')}</span>
        </div>
    )
}
