import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {addRelation} from "../../../redux/context/actions";
import {getMultipliers} from "../../../multipliers";
import classNames from "classnames";

AddRelationAction.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function AddRelationAction({contextId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [multipliers, setMultipliers] = useState([]);

    const userId = useSelector(state => state?.user.userId);
    const terms = useSelector(state => state?.context.terms);
    const relations = useSelector(state => state?.context.relations);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    useEffect(() => {
        getMultipliers(userId).then(data => setMultipliers(data));
    });

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        if (isDuplicated(relations, data.fromTermId, data.toTermId)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(addRelation(contextId,
            data.fromTermId, data.fromMultiplierId || null,
            data.toTermId, data.toMultiplierId || null));

        reset();
        closeModal();
    }

    function onCancel() {
        reset();
        closeModal();
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Add relation
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add relation</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="fromTermId">From term</label>
                        <select {...register("fromTermId", {required: true})}
                                onChange={() => clearErrors()}>
                            <option/>
                            {terms.map((term, i) => {
                                return (
                                    <option key={i} value={term.term_id} className={
                                        classNames({'list-item-soft-disable': !term.enabled})}>
                                        {term.name}
                                    </option>
                                )
                            })}
                        </select>
                        {errors.fromTermId && <div className="form-error">From term is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="fromMultiplierId">From multiplicity</label>
                        <select {...register("fromMultiplierId")}
                                onChange={() => clearErrors()}>
                            <option/>
                            {multipliers.map((multiplier, i) => {

                                // noinspection JSUnresolvedVariable
                                const id = multiplier.multiplier_id;

                                return (
                                    <option key={i} value={id}>
                                        {multiplier.symbol}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="toTermId">To term</label>
                        <select {...register("toTermId", {required: true})}
                                onChange={() => clearErrors()}>
                            <option/>
                            {terms.map((term, i) => {
                                return (
                                    <option key={i} value={term.term_id} className={
                                        classNames({'list-item-soft-disable': !term.enabled})}>
                                        {term.name}
                                    </option>
                                )
                            })}
                        </select>
                        {errors.toTermId && <div className="form-error">To term is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="toMultiplierId">To multiplicity</label>
                        <select {...register("toMultiplierId")}
                                onChange={() => clearErrors()}>
                            <option/>
                            {multipliers.map((multiplier, i) => {

                                // noinspection JSUnresolvedVariable
                                const id = multiplier.multiplier_id;

                                return (
                                    <option key={i} value={id}>
                                        {multiplier.symbol}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The relation is a duplicate and cannot be added.</div>}
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}

/**
 * @param relations {Object[]}
 * @param fromTermId {string}
 * @param toTermId {string}
 */
export function isDuplicated(relations, fromTermId, toTermId) {

    // Set up lookups for checking for duplicates.
    const from = {};
    const to = {};
    for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        const fromTerm = relation.from_term_id;
        const toTerm = relation.to_term_id;

        if (!from.hasOwnProperty(fromTerm)) {
            from[fromTerm] = {};
        }

        if (!to.hasOwnProperty(fromTerm)) {
            to[fromTerm] = {};
        }

        if (!to.hasOwnProperty(toTerm)) {
            to[toTerm] = {};
        }

        if (!from.hasOwnProperty(toTerm)) {
            from[toTerm] = {};
        }

        if (from[fromTerm].hasOwnProperty(toTerm)) {
            console.log('already contains duplicate');
        } else {
            from[fromTerm][toTerm] = true;
            to[fromTerm][toTerm] = true;
        }

        if (to[toTerm].hasOwnProperty(fromTerm)) {
            console.log('already contains duplicate');
        } else {
            to[toTerm][fromTerm] = true;
            from[toTerm][fromTerm] = true;
        }
    }

    if (from.hasOwnProperty(fromTermId)) {
        if (from[fromTermId].hasOwnProperty(toTermId)) {
            return true;
        }
    }

    if (to.hasOwnProperty(toTermId)) {
        if (to[toTermId].hasOwnProperty(fromTermId)) {
            return true;
        }
    }

    return false;
}
