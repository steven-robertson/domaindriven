import React from "react";
import {Titled} from "react-titled";
import AddModelAction from "../actions/model/AddModelAction";
import ModelListTable from "../ModelListTable";
import {sep} from "../../constants";

export default function ModelList() {
    return (
        <Titled title={(s) => `Home ${sep} ${s}`}>
            <div className="page-actions">
                <AddModelAction/>
            </div>
            <ModelListTable/>
        </Titled>
    )
}
