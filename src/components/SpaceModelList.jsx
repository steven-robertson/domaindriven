import React from "react";
import {useParams} from "react-router-dom";
import SpaceModelListTable from "./SpaceModelListTable";
import AddModelAction from "./actions/model/AddModelAction";

export default function SpaceModelList() {
    const {spaceId} = useParams();

    return (
        <>
            <div className="page-actions">
                <AddModelAction spaceId={spaceId}/>
            </div>
            <SpaceModelListTable/>
        </>
    )
}
