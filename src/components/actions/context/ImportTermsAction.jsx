import React, {useEffect, useState, useMemo} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import Table from "../../common/Table";
import FormatRelativeDate from "../../FormatRelativeDate";
import {roundUp} from "../../../maths";
import {getEnabledTermIds, setTermsEnabled} from "../group/AddGroupAction";
import {
    reset as resetContextTerms,
    subscribeToContextTerms,
    unsubscribeFromContextTerms
} from "../../../redux/actions/import";
import {importTerms} from "../../../redux/actions/context";
import {
    reset,
    subscribeToContextList,
    subscribeToContextListTotal,
    unsubscribeFromContextList,
    unsubscribeFromContextListTotal
} from "../../../redux/actions/contextList";

ImportTermsAction.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function ImportTermsAction({contextId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [importContextId, setImportContextId] = useState(undefined);

    const terms = useSelector(state => state?.import.terms);
    const relations = useSelector(state => state?.import.relations);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        getValues
    } = useForm();

    useEffect(() => {
        reset();
        if (importContextId && importContextId !== contextId) {
            dispatch(subscribeToContextTerms(importContextId));
        }
        return () => {
            dispatch(unsubscribeFromContextTerms());
            dispatch(resetContextTerms());
        }
    }, [dispatch, importContextId, contextId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        const enabledTermsIds = getEnabledTermIds(data);
        const enabledTerms = [];

        for (let i = 0; i < terms.length; i++) {
            const term = terms[i];
            if (enabledTermsIds.includes(term.term_id)) {
                enabledTerms.push(term);
            }
        }

        const enabledRelations = [];

        // noinspection JSUnresolvedVariable
        if (data.importRelations) {
            for (let i = 0; i < relations.length; i++) {
                const relation = relations[i];
                if (enabledTermsIds.includes(relation.from_term_id) &&
                    enabledTermsIds.includes(relation.to_term_id)) {
                    enabledRelations.push(relation);
                }
            }
        }

        dispatch(importTerms(contextId, enabledTerms, enabledRelations));

        closeModal();
        reset();
        setImportContextId(undefined);
    }

    function onCancel() {
        closeModal();
        reset();
        setImportContextId(undefined);
    }

    function handleSelectAll() {
        setTermsEnabled(getValues(), setValue, true);
    }

    function handleSelectNone() {
        setTermsEnabled(getValues(), setValue, false);
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Import
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Import terms</h2>
                <div style={{marginTop: "1em"}}>
                    <ContextListTable onSelect={setImportContextId}/>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {terms && terms.length > 0 &&
                        <>
                            <div>
                                <label>Selected terms</label>
                                <ActionLink onClick={handleSelectAll}>Select all</ActionLink>{' '}
                                <ActionLink onClick={handleSelectNone}>Select none</ActionLink>
                                <div className="group-terms">
                                    {terms.map((term, i) => {
                                        const itemName = `term-${term.term_id}`;
                                        return (
                                            <div key={i}>
                                                <label htmlFor={itemName}>{term.name}</label>
                                                <input type="checkbox" {...register(itemName)}/>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="importRelations">Import relations?</label>
                                <input type="checkbox" defaultChecked={true} {...register('importRelations')}/>
                            </div>
                        </>
                    }
                    <input type="submit" value="Import" disabled={!terms || terms.length === 0}/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}

ContextListTable.propTypes = {
    onSelect: PropTypes.func.isRequired
}

function ContextListTable(props) {
    const dispatch = useDispatch();

    const [pageSize, setPageSize] = useState(5);
    const [pageIndex, setPageIndex] = useState(0);
    const [sortBy, setSortBy] = useState(undefined);

    const contextList = useSelector(state => state?.contextList.contextList);
    const contextListTotal = useSelector(state => state?.contextList.contextListTotal);

    const pageCount = roundUp(pageSize > 0 ? contextListTotal / pageSize : 0, 0);

    const callback = props.onSelect ? props.onSelect : () => {}

    const columns = useMemo(
        () => [
            {
                Header: 'Context',
                accessor: 'name',
                Cell: ({cell: {row: {original}}}) => (
                    <span className="link" onClick={() => callback(original.context_id)}>
                        {original.name}
                    </span>
                )
            },
            {
                Header: 'Model',
                accessor: 'model.name'
            },
            {
                Header: 'Space',
                accessor: 'model.space.name'
            },
            {
                Header: "Updated",
                accessor: 'model.updated_model.updated_at',
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
        dispatch(subscribeToContextListTotal());
        dispatch(subscribeToContextList(pageSize, pageSize * pageIndex, sortBy));
        return () => {
            dispatch(unsubscribeFromContextListTotal());
            dispatch(unsubscribeFromContextList());
        }
    }, [dispatch, pageSize, pageIndex, sortBy]);

    if (!contextList) {
        return <></>
    }

    return (
        <Table
            columns={columns}
            data={contextList}
            pageCount={pageCount}
            initialPageSize={5}
            enableSort={true}
            fetchData={({pageSize, pageIndex, sortBy}) => {
                setPageSize(pageSize);
                setPageIndex(pageIndex);
                setSortBy(sortBy);
            }}
        />
    )
}
