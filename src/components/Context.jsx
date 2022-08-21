import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {useMatch, useNavigate, useLocation, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";
import {Titled} from "react-titled";
import classNames from "classnames";
import {
    reset,
    subscribeToContext,
    unsubscribeFromContext
} from "../redux/actions/context";
import Waiting from "./Waiting";
import DomainModel from "./DomainModel";
import Terms from "./Terms";
import Relations from "./Relations";
import DemotedTerms from "./DemotedTerms";
import GroupedTerms from "./GroupedTerms";
import ContextNotes from "./ContextNotes";
import ModelViewers from "./ModelViewers";
import ImportTermsAction from "./actions/context/ImportTermsAction";
import RenameContextAction from "./actions/context/RenameContextAction";
import RenameModelAction from "./actions/model/RenameModelAction";
import CloneModelAction from "./actions/model/CloneModelAction";
import TransferModelAction from "./actions/model/TransferModelAction";
import RemoveModelAction from "./actions/model/RemoveModelAction";
import ViewModelBackupsAction from "./actions/model/ViewModelBackupsAction";
import AddContextAction from "./actions/context/AddContextAction";
import {sep} from "../constants";

Context.propTypes = {
    contextId: PropTypes.string
}

export default function Context(props) {
    const params = useParams();

    const contextId = props.contextId || params.contextId;
    console.assert(contextId, 'contextId must either be provided as a param or a prop!');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [tabIndex, setTabIndex] = useState(0);

    const contexts = useSelector(state => state?.model.contexts);
    const modelId = useSelector(state => state?.context.modelId);
    const contextName = useSelector(state => state?.context.name);
    const notes = useSelector(state => state?.context.notes);
    const terms = useSelector(state => state?.context.terms);
    const termsLookup = useSelector(state => state?.context.termsLookup);
    const relations = useSelector(state => state?.context.relations);
    const viewerIds = useSelector(state => state?.context.viewerIds);
    const viewerIdLookup = useSelector(state => state?.context.viewerIdLookup);

    const singleContext = contexts.length === 1;
    const matchPath = singleContext ? ':modelId' : ':modelId/contexts/:contextId';
    const contextPath = singleContext ? modelId : `${modelId}/contexts/${contextId}`;

    // Determine selected tab index from matching path.
    let index = tabIndex;
    if (useMatch(`/models/${matchPath}`)) index = 0;
    if (useMatch(`/models/${matchPath}/groups`)) index = 1;
    if (useMatch(`/models/${matchPath}/relations`)) index = 2;
    if (useMatch(`/models/${matchPath}/alternatives`)) index = 3;
    if (useMatch(`/models/${matchPath}/notes`)) index = 4;

    // Navigate URL with term hash to terms tab.
    // TODO: How to navigate to term on page once the content is loaded?
    useEffect(() => {
        if (index !== 0 && location.hash && location.hash.startsWith('#term-')) {
            navigate(`/models/${contextPath}${location.hash}`);
        }
    }, [location]);

    useEffect(() => {
        dispatch(subscribeToContext(contextId));
        return () => {
            dispatch(unsubscribeFromContext());
            dispatch(reset());
        }
    }, [dispatch, contextId]);

    if (!contextName || !contextId || !modelId) {
        return <Waiting msg="Loading context"/>
    }

    function tabSelect(index) {
        setTabIndex(index);
        switch (index) {
            case 0:
                navigate(`/models/${contextPath}`);
                break;
            case 1:
                navigate(`/models/${contextPath}/groups`);
                break;
            case 2:
                navigate(`/models/${contextPath}/relations`);
                break;
            case 3:
                navigate(`/models/${contextPath}/alternatives`);
                break;
            case 4:
                navigate(`/models/${contextPath}/notes`);
                break;
            default:
                throw `unexpected index value: ${index}`;
        }
    }

    let enabledTermsCount = 0;
    for (let i = 0; i < terms.length; i++) {
        if (terms[i].enabled) {
            enabledTermsCount++;
        }
    }

    let enabledRelationsCount = 0;
    for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        if (termsLookup[relation.from_term_id].enabled &&
            termsLookup[relation.to_term_id].enabled) {
            enabledRelationsCount++;
        }
    }

    const showDomainModel = enabledTermsCount > 0 && enabledRelationsCount > 0;

    let actions;
    if (singleContext) {
        actions = (
            <>
                <RenameModelAction modelId={modelId}/>{' '}
                <CloneModelAction modelId={modelId}/>{' '}
                <TransferModelAction modelId={modelId}/>{' '}
                <RemoveModelAction modelId={modelId}/>{' '}
                <ViewModelBackupsAction modelId={modelId}/>{' '}
                <ImportTermsAction contextId={contextId}/>{' '}
                <AddContextAction modelId={modelId}/>{' '}
            </>
        )
    } else {
        actions = (
            <>
                <RenameContextAction contextId={contextId}/>{' '}
                <ImportTermsAction contextId={contextId}/>{' '}
            </>
        )
    }

    return (
        <Titled title={(s) => singleContext ? s : `${contextName} ${sep} ${s}`}>
            <div className={classNames({"grid": showDomainModel})}>
                <div className={classNames({"col-6": showDomainModel})}>
                    <div className="page-actions">{actions}</div>
                    <Tabs selectedIndex={index} onSelect={tabSelect}>
                        <TabList>
                            <Tab>Terms</Tab>
                            <Tab>Groups</Tab>
                            <Tab>Relations</Tab>
                            <Tab>Alternatives</Tab>
                            <Tab>Notes</Tab>
                        </TabList>
                        <TabPanel>
                            {/*<h2>Terms</h2>*/}
                            <div>
                                <div className="tab-hint">
                                    Deselected terms are removed from the diagram, and listed last.
                                </div>
                            </div>
                            <Titled title={(s) => `Terms ${sep} ${s}`}>
                                <Terms contextId={contextId}/>
                            </Titled>
                        </TabPanel>
                        <TabPanel>
                            {/*<h2>Grouped Terms</h2>*/}
                            <div>
                                <div className="tab-hint">
                                    Hold the <i>control</i> key when selecting a group, to switch between groups.
                                </div>
                            </div>
                            <Titled title={(s) => `Groups ${sep} ${s}`}>
                                <GroupedTerms contextId={contextId}/>
                            </Titled>
                        </TabPanel>
                        <TabPanel>
                            {/*<h2>Relations</h2>*/}
                            <div>
                                <div className="tab-hint">
                                    Relations link terms together.
                                </div>
                            </div>
                            <Titled title={(s) => `Relations ${sep} ${s}`}>
                                {terms.length > 1 && <Relations contextId={contextId}/>}
                            </Titled>
                        </TabPanel>
                        <TabPanel>
                            {/*<h2>Demoted Terms</h2>*/}
                            <div>
                                <div className="tab-hint">
                                    Alternatives are demoted terms that should not be used.
                                </div>
                            </div>
                            <Titled title={(s) => `Alternatives ${sep} ${s}`}>
                                {terms.length > 0 && <DemotedTerms contextId={contextId}/>}
                            </Titled>
                        </TabPanel>
                        <TabPanel>
                            {/*<h2>Notes</h2>*/}
                            <div>
                                <div className="tab-hint">
                                    Use the markdown syntax for rich formatted notes.
                                </div>
                            </div>
                            <Titled title={(s) => `Notes ${sep} ${s}`}>
                                <ContextNotes contextId={contextId}>
                                    {notes}
                                </ContextNotes>
                            </Titled>
                        </TabPanel>
                    </Tabs>
                </div>
                {showDomainModel &&
                    <div className="col-6">
                        <div className="domain-model">
                            {/*<h2>Domain Model</h2>*/}
                            <div className="domain-model-frame">
                                <DomainModel/>
                            </div>
                            <ModelViewers
                                viewerIds={viewerIds}
                                viewerIdLookup={viewerIdLookup}
                            />
                        </div>
                    </div>
                }
            </div>
        </Titled>
    )
}
