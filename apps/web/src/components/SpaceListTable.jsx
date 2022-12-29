import React, {useEffect, useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {roundUp} from "../maths";
import {
    reset,
    subscribeToSpaceList,
    subscribeToSpaceListTotal,
    unsubscribeFromSpaceList,
    unsubscribeFromSpaceListTotal
} from "../redux/spaceList/actions";
import Table from "./Table";
import FormatRelativeDate from "./FormatRelativeDate";

export default function SpaceListTable() {
    const dispatch = useDispatch();

    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);
    const [sortBy, setSortBy] = useState(undefined);

    const spaceList = useSelector(state => state?.spaceList.spaceList);
    const spaceListTotal = useSelector(state => state?.spaceList.spaceListTotal);

    const pageCount = roundUp(pageSize > 0 ? spaceListTotal / pageSize : 0, 0);

    const columns = useMemo(
        () => [
            {
                Header: 'Space',
                accessor: 'name',
                Cell: ({cell: {row: {original}}}) => <SpaceLink row={original}/>
            },
            {
                Header: 'Models',
                style: {textAlign: 'center'},
                accessor: 'models_aggregate.aggregate.count'
            },
            {
                Header: 'Members',
                style: {textAlign: 'center'},
                accessor: 'user_spaces_aggregate.aggregate.count'
            },
            {
                Header: 'Created',
                accessor: 'created_at',
                Cell: ({cell: {value}}) => <FormatRelativeDate value={value}/>
            },
            {
                Header: 'Updated',
                accessor: 'updated_space.updated_at',
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
        dispatch(subscribeToSpaceListTotal());
        dispatch(subscribeToSpaceList(pageSize, pageSize * pageIndex, sortBy));
        return () => {
            dispatch(unsubscribeFromSpaceListTotal());
            dispatch(unsubscribeFromSpaceList());
        }
    }, [dispatch, pageSize, pageIndex, sortBy]);

    if (!spaceList || spaceList.length === 0) {
        return <></>
    }

    return (
        <Table
            columns={columns}
            data={spaceList}
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

function SpaceLink({row}) {
    return (
        <Link to={`/spaces/${row.space_id}`}>
            {row.name}
        </Link>
    )
}
