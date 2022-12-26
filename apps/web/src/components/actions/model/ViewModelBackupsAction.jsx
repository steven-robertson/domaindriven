import React from "react";
import {useNavigate} from "react-router-dom";
import ActionLink from "../ActionLink";

export default function ViewModelBackupsAction({modelId}) {
    const navigate = useNavigate();

    return (
        <>
            <ActionLink onClick={() => navigate(`/models/${modelId}/backups`)}>
                View Backups
            </ActionLink>
        </>
    )
}
