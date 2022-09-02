import React, {useEffect, useState, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {roundUp} from "../maths";
import Table from "./common/Table";
import {
    subscribeToSpaceUsers,
    subscribeToSpaceUsersTotal,
    unsubscribeFromSpaceUsers,
    unsubscribeFromSpaceUsersTotal
} from "../redux/actions/space";
import FormatRelativeDate from "./FormatRelativeDate";

export default function SpaceUserListTable() {
    const {spaceId} = useParams();

    const dispatch = useDispatch();

    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);
    const [sortBy, setSortBy] = useState(undefined);

    const userList = useSelector(state => state?.space.userList);
    const userListTotal = useSelector(state => state?.space.userListTotal);

    const pageCount = roundUp(pageSize > 0 ? userListTotal / pageSize : 0, 0);

    // noinspection JSUnusedGlobalSymbols
    const columns = useMemo(
        () => [
            {
                Header: 'Member',
                accessor: 'user.name',
                Cell: ({cell: {row: {original}}}) => original.user.name || original.user.user_id
            },
            {
                Header: 'Added',
                accessor: 'created_at',
                Cell: ({cell: {value}}) => <FormatRelativeDate value={value}/>
            }
        ],
        []
    );

    useEffect(() => {
        dispatch(subscribeToSpaceUsersTotal(spaceId));
        dispatch(subscribeToSpaceUsers(spaceId, pageSize, pageSize * pageIndex, sortBy));
        return () => {
            dispatch(unsubscribeFromSpaceUsersTotal());
            dispatch(unsubscribeFromSpaceUsers());
        }
    }, [dispatch, spaceId, pageSize, pageIndex, sortBy]);

    if (!userList || userList.length === 0) {
        return <></>
    }

    return (
        <Table
            columns={columns}
            data={userList}
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
