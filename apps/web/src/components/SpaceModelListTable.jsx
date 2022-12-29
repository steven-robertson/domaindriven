import React, {useEffect, useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, useParams} from "react-router-dom";
import {roundUp} from "../maths";
import Table from "./common/Table";
import {
    subscribeToSpaceModels,
    subscribeToSpaceModelsTotal,
    unsubscribeFromSpaceModels,
    unsubscribeFromSpaceModelsTotal
} from "../redux/space/actions";
import FormatRelativeDate from "./FormatRelativeDate";

export default function SpaceModelListTable() {
    const {spaceId} = useParams();

    const dispatch = useDispatch();

    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);
    const [sortBy, setSortBy] = useState(undefined);

    const modelList = useSelector(state => state?.space.modelList);
    const modelListTotal = useSelector(state => state?.space.modelListTotal);

    const pageCount = roundUp(pageSize > 0 ? modelListTotal / pageSize : 0, 0);

    // noinspection JSUnusedGlobalSymbols
    const columns = useMemo(
        () => [
            {
                Header: 'Model',
                accessor: 'name',
                Cell: ({cell: {row: {original}}}) => <ModelLink row={original}/>
            },
            {
                Header: 'Created',
                accessor: 'created_at',
                Cell: ({cell: {value}}) => <FormatRelativeDate value={value}/>
            },
            {
                Header: 'Updated',
                accessor: 'updated_model.updated_at',
                Cell: ({cell: {value}}) => <FormatRelativeDate value={value}/>
            }
        ],
        []
    );

    useEffect(() => {
        dispatch(subscribeToSpaceModelsTotal(spaceId));
        dispatch(subscribeToSpaceModels(spaceId, pageSize, pageSize * pageIndex, sortBy));
        return () => {
            dispatch(unsubscribeFromSpaceModelsTotal());
            dispatch(unsubscribeFromSpaceModels());
        }
    }, [dispatch, spaceId, pageSize, pageIndex, sortBy]);

    if (!modelList || modelList.length === 0) {
        return <></>
    }

    return (
        <Table
            columns={columns}
            data={modelList}
            pageCount={pageCount}
            enableSort={true}
            fetchData={({pageSize, pageIndex, sortBy}) => {
                setPageSize(pageSize);
                setPageIndex(pageIndex);
                setSortBy(sortBy);
            }}
        />
    )
}

function ModelLink({row}) {
    return <Link to={`/models/${row.model_id}`}>{row.name}</Link>
}
