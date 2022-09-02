import React from "react";
import {useSelector} from "react-redux";
import {Titled} from "react-titled";
import AddSpaceAction from "../actions/space/AddSpaceAction";
import SpaceListTable from "../SpaceListTable";
import {sep} from "../../constants";

export default function SpaceList() {
    const isAdmin = useSelector(state => state?.user.isAdmin);

    return (
        <Titled title={(s) => `Spaces ${sep} ${s}`}>
            {isAdmin &&
                <div className="page-actions">
                    <AddSpaceAction/>
                </div>
            }
            <SpaceListTable/>
        </Titled>
    )
}
