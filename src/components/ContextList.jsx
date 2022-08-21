import React from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import AddContextAction from "./actions/context/AddContextAction";
import AddConnectionAction from "./actions/connections/AddConnectionAction";
import ViewContextAction from "./actions/context/ViewContextAction";
import RemoveContextAction from "./actions/context/RemoveContextAction";

export default function ContextList() {
    const {modelId} = useParams();

    const contexts = useSelector(state => state?.model.contexts);

    return (
        <>
            <AddContextAction modelId={modelId}/>{' '}
            <AddConnectionAction modelId={modelId}/>
            <ul>
                {contexts.map((item, i) => {
                    const contextId = item.context_id;
                    return (
                        <li key={i}>
                            {item.name}{' '}
                            <span>
                                <ViewContextAction contextId={contextId} modelId={modelId}/>{' '}
                                <RemoveContextAction contextId={contextId} name={item.name}/>
                            </span>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}
