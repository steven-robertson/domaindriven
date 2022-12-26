import React from "react";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import AddDemotedTermAction from "./actions/demoted/AddDemotedTermAction";
import EditDemotedTermAction from "./actions/demoted/EditDemotedTermAction";
import RemoveDemotedTermAction from "./actions/demoted/RemoveDemotedTermAction";

DemotedTerms.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function DemotedTerms({contextId}) {
    const termsLookup = useSelector(state => state?.context.termsLookup);
    const demotedTerms = useSelector(state => state?.context.demotedTerms);

    return (
        <>
            <AddDemotedTermAction contextId={contextId}/>
            <ul>
                {demotedTerms.map((demotedTerm, i) => {
                    const termId = demotedTerm.term_id;
                    const term = termsLookup[termId];

                    // Hide unavailable terms (not in selected term group)
                    if (term) {
                        const demotedId = demotedTerm.demoted_id;
                        const demotedName = demotedTerm.demoted_name;
                        return (
                            <li key={i}>
                                <b>{demotedName}</b>{' '}
                                <i>is demoted in favour of</i>{' '}
                                <b>{term?.name || '?'}</b>{' '}
                                <EditDemotedTermAction demotedId={demotedId}/>{' '}
                                <RemoveDemotedTermAction demotedId={demotedId}/>
                            </li>
                        )
                    }
                })}
            </ul>
        </>
    )
}
