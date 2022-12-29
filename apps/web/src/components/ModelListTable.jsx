import React, {useEffect, useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {roundUp} from "../maths";
import {
    reset,
    subscribeToModelList,
    subscribeToModelListTotal,
    unsubscribeFromModelList,
    unsubscribeFromModelListTotal
} from "../redux/modelList/actions";
import Table from "./Table";
import FormatRelativeDate from "./FormatRelativeDate";

export default function ModelListTable() {
    const dispatch = useDispatch();

    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);
    const [sortBy, setSortBy] = useState(undefined);

    const modelList = useSelector(state => state?.modelList.modelList);
    const modelListTotal = useSelector(state => state?.modelList.modelListTotal);

    const pageCount = roundUp(pageSize > 0 ? modelListTotal / pageSize : 0, 0);

    const columns = useMemo(
        () => [
            {
                Header: 'Model',
                accessor: 'name',
                Cell: ({cell: {row: {original}}}) => <ModelLink row={original}/>
            },
            {
                Header: 'Space',
                accessor: 'space.name',
                Cell: ({cell: {row: {original}}}) => <SpaceLink row={original}/>
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
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);

    useEffect(() => {
        dispatch(subscribeToModelListTotal());
        dispatch(subscribeToModelList(pageSize, pageSize * pageIndex, sortBy));
        return () => {
            dispatch(unsubscribeFromModelListTotal());
            dispatch(unsubscribeFromModelList());
        }
    }, [dispatch, pageSize, pageIndex, sortBy]);

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
    return (
        <Link to={`/models/${row.model_id}`}>
            {row.name}
        </Link>
    )
}

function SpaceLink({row}) {
    return (
        <Link to={`/spaces/${row.space.space_id}`}>
            {row.space.name}
        </Link>
    )
}
