import React from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import Definition from "./Definition";
import AddGroupAction from "./actions/group/AddGroupAction";
import EditGroupAction from "./actions/group/EditGroupAction";
import RemoveGroupAction from "./actions/group/RemoveGroupAction";
import {setGroupedTermsEnabled} from "../redux/context/actions";
import ActionLink from "./actions/ActionLink";
import AddTermAction from "./actions/term/AddTermAction";
import AddRelationAction from "./actions/relation/AddRelationAction";

GroupedTerms.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function GroupedTerms({contextId}) {
    const dispatch = useDispatch();

    const groups = useSelector(state => state?.context.groups);
    const groupsLookup = useSelector(state => state?.context.groupsLookup);

    function handleGroupedTermsToggle(groupId) {
        const group = groupsLookup[groupId];
        dispatch(setGroupedTermsEnabled([groupId], !group.enabled, undefined));
    }

    function getGroups() {
        const array = [];

        for (let i = 0; i < groups.length; i++) {
            array.push(groups[i].group_id);
        }

        return array;
    }

    function handleSelectAll() {
        dispatch(setGroupedTermsEnabled(getGroups(), true, undefined));
    }

    function handleSelectNone() {
        dispatch(setGroupedTermsEnabled(getGroups(), false, undefined));
    }

    /**
     * Handle mouse button up event to detect middle mouse button clicks.
     * @param groupId {string} UUID for the group selected.
     * @param e {Object} Mouse event object.
     */
    function handleMouseUp(groupId, e) {
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            e.preventDefault();
            dispatch(setGroupedTermsEnabled(getGroups(), false, groupId));
            return false;
        } else if (e.button === 0) {
            e.preventDefault();
            handleGroupedTermsToggle(groupId);
            return false;
        }
    }

    function handleMouseDown(e) {
        if (e.button === 1) {
            e.preventDefault();
            return false;
        }
    }

    return (
        <>
            <AddGroupAction contextId={contextId}/>{' '}
            <AddTermAction contextId={contextId}/>{' '}
            <AddRelationAction contextId={contextId}/>{' '}
            {groups.length > 0 &&
                <>
                    <ActionLink onClick={handleSelectAll}>Select all</ActionLink>{' '}
                    <ActionLink onClick={handleSelectNone}>Select none</ActionLink>
                </>
            }
            <ul className="group-list">
                {groups.map((group, i) => {
                    const groupId = group.group_id;
                    const enabled = !!group.enabled;
                    return (
                        <li key={i} className="group-list-item">
                            <dl>
                                <dt>
                                    <input type="checkbox" checked={enabled}
                                           onChange={() => {}}
                                           onMouseDown={handleMouseDown}
                                           onMouseUp={(e) =>
                                               handleMouseUp(groupId, e)}/>
                                    <b>{group.name}</b>{' '}
                                    <span className="group-list-item-actions">
                                        <EditGroupAction groupId={groupId}/>{' '}
                                        <RemoveGroupAction groupId={groupId}/>
                                    </span>
                                </dt>
                                <dd>
                                    {group.description && <Definition>{group.description}</Definition>}
                                </dd>
                            </dl>
                        </li>
                    )
                })}
            </ul>
        </>
    )
}
