import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Routes, Route, useParams} from "react-router-dom";
import {Titled} from "react-titled";
import {
    reset,
    subscribeToModel,
    unsubscribeFromModel,
    viewRemove,
    viewUpsert
} from "../redux/model/actions";
import Waiting from "./Waiting";
import ContextMapping from "./ContextMapping";
import PropTypes from "prop-types";
import BackupListPage from "./BackupListPage";
import Context from "./Context";
import ErrorNotFoundPage from "./ErrorNotFoundPage";
import {sep} from "../constants";

export default function ModelPage() {
    const {modelId} = useParams();

    const dispatch = useDispatch();

    const modelName = useSelector(state => state?.model.name);
    const spaceName = useSelector(state => state?.model.space);
    const contexts = useSelector(state => state?.model.contexts);

    useEffect(() => {
        dispatch(viewUpsert(modelId));
        dispatch(subscribeToModel(modelId));
        return () => {
            dispatch(viewRemove(modelId));
            dispatch(unsubscribeFromModel());
            dispatch(reset());
        }
    }, [dispatch, modelId]);

    if (!contexts) {
        return <Waiting msg="Loading model"/>
    }

    return (
        <Titled title={(s) => `${modelName} ${sep} ${spaceName} ${sep} Spaces ${sep} ${s}`}>
            <Routes>
                <Route exact path="/" element={<SwitchContext modelId={modelId}/>}/>
                <Route exact path="/connections" element={<SwitchContext modelId={modelId}/>}/>
                <Route exact path="/groups" element={<SwitchContext modelId={modelId}/>}/>
                <Route exact path="/relations" element={<SwitchContext modelId={modelId}/>}/>
                <Route exact path="/alternatives" element={<SwitchContext modelId={modelId}/>}/>
                <Route exact path="/notes" element={<SwitchContext modelId={modelId}/>}/>
                <Route exact path="/backups" element={<BackupListPage/>}/>
                <Route exact path="/contexts/:contextId" element={<Context/>}/>
                <Route exact path="/contexts/:contextId/groups" element={<Context/>}/>
                <Route exact path="/contexts/:contextId/relations" element={<Context/>}/>
                <Route exact path="/contexts/:contextId/alternatives" element={<Context/>}/>
                <Route exact path="/contexts/:contextId/notes" element={<Context/>}/>
                <Route path="*" element={<ErrorNotFoundPage/>}/>
            </Routes>
        </Titled>
    )
}

SwitchContext.propTypes = {
    modelId: PropTypes.string.isRequired
}

function SwitchContext({modelId}) {
    const contexts = useSelector(state => state?.model.contexts);

    const singleContext = contexts.length === 1;

    return (
        <>
            {singleContext &&
                <Context contextId={contexts[0].context_id}/>
            }
            {!singleContext &&
                <ContextMapping modelId={modelId}/>
            }
        </>
    )
}
