// noinspection JSAssignmentUsedAsCondition

import React from "react";
import {Link, matchPath, useLocation} from "react-router-dom";
import {useSelector} from "react-redux";

export default function AppBreadcrumbs() {
    const location = useLocation();

    const stateSpaceId = useSelector(state => state?.space.id);
    const stateSpaceName = useSelector(state => state?.space.name);
    if (stateSpaceId && stateSpaceName) {
        setSpace(stateSpaceId, {
            name: stateSpaceName
        });
    }

    const stateModelSpaceId = useSelector(state => state?.model.spaceId);
    const stateModelSpace = useSelector(state => state?.model.space);
    const stateModelId = useSelector(state => state?.model.id);
    const stateModelName = useSelector(state => state?.model.name);
    if (stateModelSpaceId && stateModelSpace &&
        stateModelId && stateModelName) {
        setModel(stateModelId, {
            name: stateModelName,
            spaceId: stateModelSpaceId,
            space: stateModelSpace
        });
        setSpace(stateModelSpaceId, {
            name: stateModelSpace
        });
    }

    const stateContextSpaceId = useSelector(state => state?.context.spaceId);
    const stateContextSpace = useSelector(state => state?.context.space);
    const stateContextModelId = useSelector(state => state?.context.modelId);
    const stateContextModel = useSelector(state => state?.context.model);
    const stateContextId = useSelector(state => state?.context.id);
    const stateContextName = useSelector(state => state?.context.name);
    if (stateContextSpaceId && stateContextSpace &&
        stateContextModelId && stateContextModel &&
        stateContextId && stateContextName) {
        setContext(stateContextId, {
            name: stateContextName,
            modelId: stateContextModelId,
            modelName: stateContextModel,
            spaceId: stateContextSpaceId,
            space: stateContextSpace
        });
        setModel(stateContextModelId, {
            name: stateContextModel,
            spaceId: stateContextSpaceId,
            space: stateContextSpace
        });
        setSpace(stateContextSpaceId, {
            name: stateContextSpace
        });
    }

    const match = (pathname) => matchPath(pathname, location.pathname);

    const items = [];

    function addSpaceItems(spaceId) {
        const space = getSpace(spaceId);
        const spaceName = stateSpaceName || space?.name;
        items.push({label: 'Spaces', to: '/spaces/'});
        items.push({label: spaceName, to: `/spaces/${spaceId}`});
    }

    function addModelItems(modelId) {
        const model = getModel(modelId);
        const modelName = stateModelName || model?.name;
        const space = getSpace(model?.spaceId);
        const spaceId = stateModelSpaceId;
        const spaceName = stateModelSpace || space?.name || model?.space;
        items.push({label: 'Spaces', to: '/spaces/'});
        items.push({label: spaceName, to: `/spaces/${spaceId}`});
        items.push({label: modelName, to: `/models/${modelId}`});
    }

    function addContextItems(modelId, contextId) {
        const context = getContext(contextId);
        const contextName = stateContextName || context?.name;
        const model = getModel(modelId);
        const modelName = stateContextModel || model?.name || context?.model;
        const space = getSpace(context?.spaceId);
        const spaceId = stateContextSpaceId;
        const spaceName = stateContextSpace || space?.name || model?.space;
        items.push({label: 'Spaces', to: '/spaces/'});
        items.push({label: spaceName, to: `/spaces/${spaceId}`});
        items.push({label: modelName, to: `/models/${modelId}`});
        items.push({label: contextName, to: `/models/${modelId}/contexts/${contextId}`});
    }

    let m;
    if (match('/')) {
        items.push({label: 'Home', to: '/'});
    } else {
        items.push({label: 'Home', to: '/'});
        if (match('/help')) {
            items.push({label: 'Help', to: '/help'});
        } else if (match('/spaces/')) {
            items.push({label: 'Spaces', to: '/spaces/'});
        } else if (m = match('/spaces/:spaceId')) {
            const spaceId = m.params.spaceId;
            addSpaceItems(spaceId);
        } else if (m = match('/spaces/:spaceId/members')) {
            const spaceId = m.params.spaceId;
            addSpaceItems(spaceId);
            items.push({label: 'Members', to: `/spaces/${spaceId}/members`});
        } else if (m = match('/spaces/:spaceId/info')) {
            const spaceId = m.params.spaceId;
            addSpaceItems(spaceId);
            items.push({label: 'About', to: `/spaces/${spaceId}/info`});
        } else if (m = match('/models/:modelId')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
        } else if (m = match('/models/:modelId/connections')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
            items.push({label: 'Connections', to: `/models/${modelId}/connections`});
        } else if (m = match('/models/:modelId/groups')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
            items.push({label: 'Groups', to: `/models/${modelId}/groups`});
        } else if (m = match('/models/:modelId/relations')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
            items.push({label: 'Relations', to: `/models/${modelId}/relations`});
        } else if (m = match('/models/:modelId/alternatives')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
            items.push({label: 'Alternatives', to: `/models/${modelId}/alternatives`});
        } else if (m = match('/models/:modelId/notes')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
            items.push({label: 'Notes', to: `/models/${modelId}/notes`});
        } else if (m = match('/models/:modelId/backups')) {
            const modelId = m.params.modelId;
            addModelItems(modelId);
            items.push({label: 'Backups', to: `/models/${modelId}/backups`});
        } else if (m = match('/models/:modelId/contexts/:contextId')) {
            const modelId = m.params.modelId;
            const contextId = m.params.contextId;
            addContextItems(modelId, contextId);
        } else if (m = match('/models/:modelId/contexts/:contextId/groups')) {
            const modelId = m.params.modelId;
            const contextId = m.params.contextId;
            addContextItems(modelId, contextId);
            items.push({label: 'Groups', to: `/models/${modelId}/contexts/${contextId}/groups`});
        } else if (m = match('/models/:modelId/contexts/:contextId/relations')) {
            const modelId = m.params.modelId;
            const contextId = m.params.contextId;
            addContextItems(modelId, contextId);
            items.push({label: 'Relations', to: `/models/${modelId}/contexts/${contextId}/relations`});
        } else if (m = match('/models/:modelId/contexts/:contextId/alternatives')) {
            const modelId = m.params.modelId;
            const contextId = m.params.contextId;
            addContextItems(modelId, contextId);
            items.push({label: 'Alternatives', to: `/models/${modelId}/contexts/${contextId}/alternatives`});
        } else if (m = match('/models/:modelId/contexts/:contextId/notes')) {
            const modelId = m.params.modelId;
            const contextId = m.params.contextId;
            addContextItems(modelId, contextId);
            items.push({label: 'Notes', to: `/models/${modelId}/contexts/${contextId}/notes`});
        }
    }

    return (
        <List>
            {items.map(({to, label}, i) => {
                if (to) {
                    return (
                        <Link key={i} to={to}>
                            {label}
                        </Link>
                    )
                } else {
                    return (
                        <span key={i}>
                            {label}
                        </span>
                    )
                }
            })}
        </List>
    )
}

// Based on example "Build a Stunning Breadcrumb Component in React with Plain CSS"
// https://jsmanifest.com/build-a-stunning-breadcrumb-component-in-react-with-plain-css/

function List(props) {
    let children = React.Children.toArray(props.children)

    children = children.map((child, i) => (
        <Item key={`breadcrumb_item${i}`}>
            {child}
        </Item>
    ))

    const lastIndex = children.length - 1;

    children = children.reduce((acc, child, index) => {
        const notLast = index < lastIndex;

        if (notLast) {
            // noinspection JSUnresolvedFunction
            acc.push(child, <Sep key={`breadcrumb_sep${index}`}>/</Sep>);
        } else {
            // noinspection JSUnresolvedFunction
            acc.push(child);
        }

        return acc;
    }, []);

    return (
        <ol className="breadcrumbs">
            {children}
        </ol>
    )
}

function Item({children, ...props}) {
    return (
        <li className="breadcrumb-item" {...props}>
            {children}
        </li>
    )
}

function Sep({children, ...props}) {
    return (
        <li className="breadcrumb-separator" {...props}>
            {children}
        </li>
    )
}

const spaces = {};
const models = {};
const contexts = {};

export function setSpace(spaceId, data) {
    spaces[spaceId] = data;
}

export function getSpace(spaceId) {
    return spaces.hasOwnProperty(spaceId) ? spaces[spaceId] : undefined;
}

export function setModel(modelId, data) {
    models[modelId] = data;
}

export function getModel(modelId) {
    return models.hasOwnProperty(modelId) ? models[modelId] : undefined;
}

export function setContext(contextId, data) {
    contexts[contextId] = data;
}

export function getContext(contextId) {
    return contexts.hasOwnProperty(contextId) ? contexts[contextId] : undefined;
}
