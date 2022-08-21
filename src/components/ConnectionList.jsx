import React from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import AddConnectionAction from "./actions/connections/AddConnectionAction";
import AddContextAction from "./actions/context/AddContextAction";
import RemoveConnectionAction from "./actions/connections/RemoveConnectionAction";
import EditConnectionAction from "./actions/connections/EditConnectionAction";

export default function ConnectionList() {
    const {modelId} = useParams();

    const connections = useSelector(state => state?.model.connections);
    const contextsLookup = useSelector(state => state?.model.contextsLookup);

    // Collect the list items in a lookup to be sorted alphabetically.
    const keys = [];
    const itemLookup = {};
    connections.map((connection, i) => {
        const modelId = connection.model_id;

        // noinspection JSUnresolvedVariable
        const connectionId = connection.connection_id;

        const from = contextsLookup[connection.from_context_id];
        const to = contextsLookup[connection.to_context_id];
        const key = `${from.name} ${to.name}`;

        if (keys.hasOwnProperty(key)) {
            console.warn('duplicate key', key);
        } else {
            keys.push(key);
        }

        if (itemLookup.hasOwnProperty(key)) {
            console.warn('duplicate key for item lookup', key);
        } else {
            itemLookup[key] = (
                <li key={i}>
                    <span>{from.name} {String.fromCharCode(8594)} {to.name}</span>{' '}
                    <span>
                        <EditConnectionAction connectionId={connectionId}/>{' '}
                        <RemoveConnectionAction connectionId={connectionId}/>
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
            <AddConnectionAction modelId={modelId}/>{' '}
            <AddContextAction modelId={modelId}/>
            <ul>{sortedItems.map(item => item)}</ul>
        </>
    )
}
