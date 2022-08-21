import React, {useState} from "react";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import {useMatch, useNavigate} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import {Titled} from "react-titled";
import classNames from "classnames";
import ContextList from "./ContextList";
import ConnectionList from "./ConnectionList";
import ContextMap from "./ContextMap";
import ModelViewers from "./ModelViewers";
import RemoveModelAction from "./actions/model/RemoveModelAction";
import CloneModelAction from "./actions/model/CloneModelAction";
import RenameModelAction from "./actions/model/RenameModelAction";
import TransferModelAction from "./actions/model/TransferModelAction";
import ViewModelBackupsAction from "./actions/model/ViewModelBackupsAction";
import {sep} from "../constants";

ContextMapping.propTypes = {
    modelId: PropTypes.string.isRequired
}

export default function ContextMapping({modelId}) {

    const navigate = useNavigate();

    const [tabIndex, setTabIndex] = useState(0);

    const connections = useSelector(state => state?.model.connections);
    const viewerIds = useSelector(state => state?.model.viewerIds);
    const viewerIdLookup = useSelector(state => state?.model.viewerIdLookup);

    // Determine selected tab index from matching path.
    let index = tabIndex;
    if (useMatch('/models/:modelId')) index = 0;
    if (useMatch('/models/:modelId/connections')) index = 1;

    function tabSelect(index) {
        setTabIndex(index);
        switch (index) {
            case 0:
                navigate(`/models/${modelId}`);
                break;
            case 1:
                navigate(`/models/${modelId}/connections`);
                break;
            default:
                throw `unexpected index value: ${index}`;
        }
    }

    // Only show context map when there is links between contexts.
    const showContextMap = connections && connections.length > 0;

    return (
        <>
            <div className={classNames({"grid": showContextMap})}>
                <div className={classNames({"col-6": showContextMap})}>
                    <div className="page-actions">
                        <RenameModelAction modelId={modelId}/>{' '}
                        <CloneModelAction modelId={modelId}/>{' '}
                        <TransferModelAction modelId={modelId}/>{' '}
                        <RemoveModelAction modelId={modelId}/>{' '}
                        <ViewModelBackupsAction modelId={modelId}/>
                    </div>
                    <Tabs selectedIndex={index} onSelect={tabSelect}>
                        <TabList>
                            <Tab>Contexts</Tab>
                            <Tab>Connections</Tab>
                        </TabList>
                        <TabPanel>
                            {/*<h2>Contexts</h2>*/}
                            <Titled title={(s) => `Contexts ${sep} ${s}`}>
                                <ContextList/>
                            </Titled>
                        </TabPanel>
                        <TabPanel>
                            {/*<h2>Contexts</h2>*/}
                            <Titled title={(s) => `Connections ${sep} ${s}`}>
                                <ConnectionList/>
                            </Titled>
                        </TabPanel>
                    </Tabs>
                </div>
                {showContextMap &&
                    <div className="col-6">
                        <div className="domain-model">
                            {/*<h2>Context Map</h2>*/}
                            <div className="domain-model-frame">
                                <ContextMap/>
                            </div>
                            <ModelViewers
                                viewerIds={viewerIds}
                                viewerIdLookup={viewerIdLookup}
                            />
                        </div>
                    </div>
                }
            </div>
        </>
    )
}
