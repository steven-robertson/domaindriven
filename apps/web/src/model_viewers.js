/**
 * Gather info about people currently viewing the model.
 * @param viewers {Object[]}
 * @return {{viewerIdLookup: Object, viewerIds: string[]}}
 */
export function getModelViewers(viewers) {
    const viewerIds = [];
    const viewerIdLookup = {};

    for (let i = 0; i < viewers.length; i++) {
        const viewer = viewers[i].user;
        if (viewer) {
            viewerIds.push(viewer.user_id);
            viewerIdLookup[viewer.user_id] = viewer.name;
        }
    }

    return {viewerIds, viewerIdLookup};
}
