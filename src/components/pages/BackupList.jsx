import React, {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Titled} from "react-titled";
import {
    reset as resetRestore,
    subscribeToBackupList,
    subscribeToBackupListTotal,
    unsubscribeFromBackupList,
    unsubscribeFromBackupListTotal
} from "../../redux/actions/backupList";
import {
    reset as resetModel,
    subscribeToModel,
    unsubscribeFromModel
} from "../../redux/actions/model";
import {roundUp} from "../../maths";
import Waiting from "../Waiting";
import Table from "../Table";
import FormatRelativeDate from "../FormatRelativeDate";
import RestoreModelAction from "../actions/model/RestoreModelAction";
import BackToModelAction from "../actions/model/BackToModelAction";
import {sep} from "../../constants";

export default function BackupList() {
    const {modelId} = useParams();

    const dispatch = useDispatch();

    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

    const modelName = useSelector(state => state?.model.name);
    const spaceName = useSelector(state => state?.model.space);
    const backupList = useSelector(state => state?.backupList.backupList);
    const backupListTotal = useSelector(state => state?.backupList.backupListTotal);

    const pageCount = roundUp(pageSize > 0 ? backupListTotal / pageSize : 0, 0);

    const columns = useMemo(
        () => [
            {
                Header: 'When',
                accessor: 'created_at',
                className: 'backup-age',
                Cell: ({cell: {value}}) => <FormatRelativeDate value={value}/>
            },
            {
                Header: 'Who',
                accessor: 'user.name',
                className: 'backup-by',
                Cell: ({cell: {row: {original}}}) => <CreatedBy row={original}/>
            },
            {
                Header: 'Action',
                className: 'backup-actions',
                Cell: ({cell: {row: {original}}}) => <Actions row={original}/>
            }
        ],
        []
    );

    useEffect(() => {
        dispatch(subscribeToModel(modelId));
        return () => {
            dispatch(unsubscribeFromModel());
            dispatch(resetModel());
            dispatch(resetRestore());
        }
    }, [dispatch, modelId]);

    useEffect(() => {
        dispatch(subscribeToBackupListTotal(modelId));
        dispatch(subscribeToBackupList(modelId, pageSize, pageSize * pageIndex));
        return () => {
            dispatch(unsubscribeFromBackupListTotal());
            dispatch(unsubscribeFromBackupList());
        }
    }, [dispatch, modelId, pageSize, pageIndex]);

    if (!modelName) {
        return <Waiting msg="Loading list of backups"/>
    }

    return (
        <Titled title={(s) => `Backups ${sep} ${modelName} ${sep} ${spaceName} ${sep} ${s}`}>
            <div className="page-actions">
                <BackToModelAction modelId={modelId}/>
            </div>
            {backupList && backupList.length > 0 &&
                <Table
                    columns={columns}
                    data={backupList}
                    pageCount={pageCount}
                    fetchData={({pageSize, pageIndex}) => {
                        setPageSize(pageSize);
                        setPageIndex(pageIndex);
                    }}
                />
            }
        </Titled>
    )
}

function CreatedBy({row}) {
    const name = row.user?.name ? row.user.name : row.user_id;
    return <span>{name}</span>
}

function Actions({row}) {
    // noinspection JSUnresolvedVariable
    const backupId = row.backup_id;
    return <RestoreModelAction backupId={backupId}/>
}
