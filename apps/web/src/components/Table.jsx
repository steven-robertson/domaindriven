import React, {useEffect} from "react";
import {useTable, usePagination, useSortBy} from "react-table";
import classNames from "classnames";

export default function Table(
    {
        columns,
        data,
        getHeaderProps = defaultGetHeaderProps,
        getColumnProps = defaultGetColumnProps,
        getRowProps = defaultGetRowProps,
        getCellProps = defaultGetCellProps,
        fetchData,
        pageCount,
        enableSort,
        initialPageSize
    }) {

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: {pageIndex, pageSize, sortBy}
    } = useTable({
        columns,
        data,
        initialState: {pageIndex: 0, pageSize: initialPageSize || 10},
        manualPagination: true,
        pageCount,
        manualSortBy: true,
        // disableMultiSort: true,
        disableSortBy: !enableSort
    }, useSortBy, usePagination);

    // Listen for changes in pagination and use the state to fetch our new data
    useEffect(() => {
        fetchData && fetchData({pageIndex, pageSize, sortBy})
    }, [fetchData, pageIndex, pageSize, sortBy]);

    return (
        <div className="styled-table">
            <table {...getTableProps()}>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps([
                                getHeaderProps(column),
                                getColumnProps(column),
                                column.getSortByToggleProps()])}
                                className={classNames('disable-select',
                                    column.isSorted ? column.isSortedDesc ? 'sort-desc' : 'sort-asc' : '')}>
                                {column.render('Header')}
                                <span>
                                    {column.isSorted
                                        ? column.isSortedDesc
                                            ? ' 🔽'
                                            : ' 🔼'
                                        : ''}
                                  </span>
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {rows.map((row, _) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps(getRowProps(row))}>
                            {row.cells.map(cell => {
                                return (
                                    <td {...cell.getCellProps([
                                        getColumnProps(cell.column),
                                        getCellProps(cell)
                                    ])}>
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>
                {' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>
                {' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>
                {' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>
                {' '}
                <span>
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </span>
                <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}>
                    {[5, 10, 20, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

function defaultGetHeaderProps(column) {
    const result = {};

    if (column.className) {
        result['className'] = column.className;
    }

    if (column.style) {
        result['style'] = column.style;
    }

    return result;
}

function defaultGetColumnProps(column) {
    const result = {};

    if (column.className) {
        result['className'] = column.className;
    }

    if (column.style) {
        result['style'] = column.style;
    }

    return result;
}

function defaultGetRowProps(/*row*/) {
    // console.log('Row', row);
    return {};
}

function defaultGetCellProps(/*cellInfo*/) {
    // console.log('Cell', cellInfo);
    return {};
}
