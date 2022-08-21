import React from "react";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import AddMemberAction from "./actions/space/AddMemberAction";
import SpaceUserListTable from "./SpaceUserListTable";

export default function SpaceUserList() {
    const {spaceId} = useParams();

    const isAdmin = useSelector(state => state?.user.isAdmin);

    return (
        <>
            {isAdmin &&
                <div className="page-actions">
                    <AddMemberAction spaceId={spaceId}/>
                </div>
            }
            <SpaceUserListTable/>
        </>
    )
}
