import {actionTypes} from "../actions/context";
import {getModelViewers} from "../../model_viewers";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * context: Object,
 * id: string,
 * name: string,
 * allTerms: Object[],
 * terms: Object[],
 * termsLookup: Object,
 * sortedTerms: Object[],
 * relations: Object[],
 * demotedTerms: Object[],
 * demotedTermsLookup: Object,
 * groups: Object[],
 * groupsEnabled: string[],
 * groupsLookup: Object,
 * notes: string
 * }}
 */
const initialState = {
    context: undefined,
    id: undefined,
    name: undefined,
    allTerms: undefined,
    terms: undefined,
    termsLookup: undefined,
    sortedTerms: undefined,
    relations: undefined,
    demotedTerms: undefined,
    demotedTermsLookup: undefined,
    groups: undefined,
    groupsEnabled: undefined,
    groupsLookup: undefined,
    notes: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveContextQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const context = action.result?.context_by_pk;
    console.assert(context != null, 'result is null');

    // noinspection JSUnresolvedVariable
    const viewers = context.model.model_viewers;
    const {viewerIds, viewerIdLookup} = getModelViewers(viewers);

    const {
        allTerms,
        terms,
        termsLookup,
        sortedTerms,
        relations
    } = buildAvailableTerms(context, state.groupsEnabled);

    // Build groups lookup.
    const groups = context.groups;
    const groupsLookup = {};
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        groupsLookup[group.group_id] = group;
    }

    const demotedTerms = [];
    const demotedTermsLookup = {};
    // noinspection JSUnresolvedVariable
    for (let i = 0; i < context.demoteds.length; i++) {
        // noinspection JSUnresolvedVariable
        const demoted = context.demoteds[i];
        demotedTerms.push(demoted);
        demotedTermsLookup[demoted.demoted_id] = demoted;
    }

    return {
        ...state,
        context,
        id: context.context_id,
        name: context.name,
        space: context.model.space.name,
        spaceId: context.model.space.space_id,
        model: context.model.name,
        modelId: context.model.model_id,
        allTerms,
        terms,
        termsLookup,
        sortedTerms,
        relations,
        demotedTerms,
        demotedTermsLookup,
        groups,
        groupsLookup,
        notes: context.notes,
        viewerIds,
        viewerIdLookup
    }
}

function setGroupedTermsEnabled(state, action) {
    // NOTE: Client-side enabling of term groups.

    const groups = [...state.groups];
    const groupIds = action.groupIds;
    const enabled = action.enabled;
    const except = action.except;

    const groupsEnabled = [];
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        if (groupIds.includes(group.group_id)) {
            group.enabled = except === group.group_id ? !enabled : enabled;
        }

        if (group.enabled) {
            groupsEnabled.push(group.group_id);
        }
    }

    // Refresh all state reliant on available terms.
    const context = state.context;

    const {
        allTerms,
        terms,
        termsLookup,
        sortedTerms,
        relations
    } = buildAvailableTerms(context, groupsEnabled);

    return {
        ...state,
        allTerms,
        terms,
        termsLookup,
        sortedTerms,
        relations,
        groups,
        groupsEnabled
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveContextQueryResult]: receiveContextQueryResult,
    [actionTypes.setGroupedTermsEnabled]: setGroupedTermsEnabled,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}

// -----------------------------------------------------------------------------
// Supporting code
// -----------------------------------------------------------------------------

function buildAvailableTerms(context, groupsEnabled) {
    let numGroupsSelected = 0;

    const availableTerms = {};
    for (let i = 0; i < context.groups.length; i++) {
        const group = context.groups[i];

        if (groupsEnabled && groupsEnabled.includes(group.group_id)) {
            group.enabled = true;
        }

        // Terms available only if checked.
        if (!group.enabled) {
            continue;
        }

        numGroupsSelected++;

        // noinspection JSUnresolvedVariable
        const terms = group.group_terms;
        for (let j = 0; j < terms.length; j++) {
            // noinspection JSUnresolvedVariable
            const term = terms[j].term;
            availableTerms[term.term_id] = term;
        }
    }

    // NOTE: If terms are not grouped, or no groups are selected, then all terms are available.
    const termsGrouped = numGroupsSelected > 0;

    // Build terms lookup.
    const terms = [];
    const termNames = [];
    const termNamesLookup = {};
    const termsLookup = {};
    for (let i = 0; i < context.terms.length; i++) {
        const term = context.terms[i];

        // Collect all term names.
        termNames.push(term.name);
        termNamesLookup[term.name] = term;

        // Collect only the available term names.
        if (!termsGrouped || (termsGrouped && availableTerms.hasOwnProperty(term.term_id))) {
            terms.push(term);
            termsLookup[term.term_id] = term;
        }
    }

    // Sort terms.
    termNames.sort();
    const allTerms = [];
    const sortedTerms = [];
    for (let i = 0; i < termNames.length; i++) {
        const name = termNames[i];
        const term = termNamesLookup[name];

        // Sort all term names.
        allTerms.push(term);

        // Collect & sort only the available term names.
        if (!termsGrouped || (termsGrouped && availableTerms.hasOwnProperty(term.term_id))) {
            sortedTerms.push(term);
        }
    }

    // Limit relations to available terms.
    const relations = [];
    for (let i = 0; i < context.relations.length; i++) {
        const relation = context.relations[i];

        if (!termsGrouped) {
            relations.push(relation);
            continue;
        }

        const fromAvailable = availableTerms.hasOwnProperty(relation.from_term_id);
        const toAvailable = availableTerms.hasOwnProperty(relation.to_term_id);

        // Skip unavailable terms.
        if (!fromAvailable || !toAvailable) {
            continue
        }

        relations.push(relation);
    }

    return {
        allTerms,
        terms,
        termsLookup,
        sortedTerms,
        relations
    }
}