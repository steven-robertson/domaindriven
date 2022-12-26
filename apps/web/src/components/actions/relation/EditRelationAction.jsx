import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import classNames from "classnames";
import ActionLink from "../ActionLink";
import {getMultipliers} from "../../../multipliers";
import {editRelation} from "../../../redux/actions/context";
import {isDuplicated} from "./AddRelationAction";

EditRelationAction.propTypes = {
    relationId: PropTypes.string.isRequired
}

export default function EditRelationAction({relationId}) {
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

    // Reset the form between viewing relations.
    useEffect(() => reset(), [relationId]);

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

    const relation = findRelation();

    function onSubmit(data) {
        const sameFrom = relation.from_term_id === data.fromTermId;
        const sameTo = relation.to_term_id === data.toTermId;
        const switchedFrom = relation.to_term_id === data.fromTermId;
        const switchedTo = relation.from_term_id === data.toTermId;
        const same = sameFrom && sameTo || switchedFrom && switchedTo;

        if (!same && isDuplicated(relations, data.fromTermId, data.toTermId)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(editRelation(relationId,
            data.fromTermId, data.fromMultiplierId || null,
            data.toTermId, data.toMultiplierId || null));

        closeModal();
    }

    function onCancel() {
        reset();
        closeModal();
    }

    function findRelation() {
        for (let i = 0; i < relations.length; i++) {
            if (relations[i].relation_id === relationId) {
                return relations[i]
            }
        }
    }

    const fromMultiplierId = relation.from_multiplier_id || undefined;
    const toMultiplierId = relation.to_multiplier_id || undefined;

    return (
        <>
            <ActionLink onClick={openModal}>
                Edit
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2>Edit relation</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="fromTermId">From term</label>
                        <select {...register("fromTermId", {required: true})}
                                defaultValue={relation.from_term_id}
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
                                defaultValue={fromMultiplierId}
                                onChange={() => clearErrors()}>
                            <option/>
                            {multipliers.map((multiplier, i) => {

                                // noinspection JSUnresolvedVariable
                                const id = multiplier.multiplier_id;

                                // noinspection JSUnresolvedVariable
                                const selected = relation.from_multiplier_id === id;

                                return (
                                    <option key={i} value={id} defaultChecked={selected}>
                                        {multiplier.symbol}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="toTermId">To term</label>
                        <select {...register("toTermId", {required: true})}
                                defaultValue={relation.to_term_id}
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
                                defaultValue={toMultiplierId}
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
                        The relation would become a duplicate and cannot be saved.</div>}
                    <input type="submit" value="Save"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
