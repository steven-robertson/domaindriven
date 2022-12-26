import React from "react";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import classNames from "classnames";
import AddRelationAction from "./actions/relation/AddRelationAction";
import EditRelationAction from "./actions/relation/EditRelationAction";
import RemoveRelationAction from "./actions/relation/RemoveRelationAction";
import AddTermAction from "./actions/term/AddTermAction";

Relations.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function Relations({contextId}) {
    const relations = useSelector(state => state?.context.relations);
    const termsLookup = useSelector(state => state?.context.termsLookup);

    // Collect the list items in a lookup to be sorted alphabetically.
    const keys = [];
    const itemLookup = {};
    relations.map((relation, i) => {
        const relationId = relation.relation_id;

        const from = termsLookup[relation.from_term_id];
        const to = termsLookup[relation.to_term_id];
        const disabled = !from.enabled || !to.enabled;
        const key = `${disabled ? 'zzzzz' : ''}${from.classname} ${to.classname}`;

        if (keys.hasOwnProperty(key)) {
            console.warn('duplicate key', key);
        } else {
            keys.push(key);
        }

        if (itemLookup.hasOwnProperty(key)) {
            console.warn('duplicate key for item lookup', key);
        } else {
            itemLookup[key] = (
                <li key={i} className={classNames({'relation-disabled': disabled})}>
                    <span className="relations-list-item-name">
                        {from.classname} {String.fromCharCode(8594)} {to.classname}
                    </span>{' '}
                    <span className="relations-list-item-actions">
                        <EditRelationAction relationId={relationId}/>{' '}
                        <RemoveRelationAction relationId={relationId}/>
                    </span>
                </li>
            )
        }
    });

    // Sort keys then sort items.
    keys.sort();
    const sortedItems = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        sortedItems.push(itemLookup[key]);
    }

    return (
        <>
            <AddRelationAction contextId={contextId}/>{' '}
            <AddTermAction contextId={contextId}/>
            <ul>{sortedItems.map(item => item)}</ul>
        </>
    )
}
