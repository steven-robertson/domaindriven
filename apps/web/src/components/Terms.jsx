import React from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import classNames from "classnames";
import Definition from "./Definition";
import AddTermAction from "./actions/term/AddTermAction";
import EditTermAction from "./actions/term/EditTermAction";
import RemoveTermAction from "./actions/term/RemoveTermAction";
import ActionLink from "./actions/ActionLink";
import AddRelationAction from "./actions/relation/AddRelationAction";
import {setTermsEnabled} from "../redux/actions/context";

Terms.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function Terms({contextId}) {
    const dispatch = useDispatch();

    const terms = useSelector(state => state?.context.terms);
    const termsLookup = useSelector(state => state?.context.termsLookup);

    function handleTermToggle(termId) {
        const term = termsLookup[termId];
        dispatch(setTermsEnabled([termId], !term.enabled));
    }

    function getTerms() {
        const array = [];

        for (let i = 0; i < terms.length; i++) {
            array.push(terms[i].term_id);
        }

        return array;
    }

    function handleSelectAll() {
        dispatch(setTermsEnabled(getTerms(), true));
    }

    function handleSelectNone() {
        dispatch(setTermsEnabled(getTerms(), false));
    }

    return (
        <>
            <AddTermAction contextId={contextId}/>{' '}
            {terms.length > 0 &&
                <>
                    <AddRelationAction contextId={contextId}/>{' '}
                    <ActionLink onClick={handleSelectAll}>Select all</ActionLink>{' '}
                    <ActionLink onClick={handleSelectNone}>Select none</ActionLink>
                </>
            }
            <ul className="term-list">
                {terms.map((term, i) => {
                    const termId = term.term_id;

                    let definition = term.definition;
                    if (term.todo && !definition) {
                        definition = 'TODO';
                    }

                    const enabled = !!term.enabled;

                    // noinspection JSUnresolvedVariable
                    const demoteds = term.demoteds;

                    const demotedTerms = [];
                    for (let i = 0; i < demoteds.length; i++) {
                        demotedTerms.push(demoteds[i].demoted_name);
                    }

                    const terms = demotedTerms.join(', ');

                    return (
                        <li key={i} id={`term-${term.classname}`}
                            className={classNames('term-list-item', {'term-list-item-disabled': !enabled})}>
                            <dl>
                                <dt>
                                    <input type="checkbox" checked={enabled} onChange={() => handleTermToggle(termId)}/>
                                    <b>{term.name}</b>{' '}
                                    <span className="term-list-item-actions">
                                        <EditTermAction termId={termId}/>{' '}
                                        <RemoveTermAction termId={termId}/>
                                    </span>
                                </dt>
                                <dd>
                                    {demoteds.length > 0 &&
                                        <div className="demoted-terms">
                                            <i>Promoted over alternative terms: {terms}</i>
                                        </div>
                                    }
                                    {definition &&
                                        <>
                                            <div>
                                                <Definition todo={term.todo}>{definition}</Definition>
                                            </div>
                                        </>
                                    }
                                </dd>
                            </dl>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}
