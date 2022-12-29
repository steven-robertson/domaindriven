import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import classNames from "classnames";
import ActionLink from "../ActionLink";
import {addDemotedTerm} from "../../../redux/context/actions";
import {normaliseTerm} from "../term/AddTermAction";

AddDemotedTermAction.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function AddDemotedTermAction({contextId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const terms = useSelector(state => state?.context.terms);
    const demotedTerms = useSelector(state => state?.context.demotedTerms);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        data.name = data.name.trim();

        if (isDuplicated(demotedTerms, data.name)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(addDemotedTerm(contextId, data.name, data.termId));

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
                Add alternative
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add demoted term</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="termId">Preferred term</label>
                        <select {...register("termId", {required: true})}
                                autoFocus onChange={() => clearErrors()}>
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
                        {errors.termId && <div className="form-error">Preferred term is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="name">Demoted term name</label>
                        <input {...register('name', {required: true})}
                               onKeyDown={() => clearErrors()}/>
                        {errors.name && <div className="form-error">Demoted term name is required.</div>}
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The demoted term would become a duplicate and cannot be saved.</div>}
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}

export function isDuplicated(demotedTerms, name) {
    const set = new Set();

    for (let i = 0; i < demotedTerms.length; i++) {
        const demotedTerm = demotedTerms[i];
        set.add(normaliseTerm(demotedTerm.demoted_name));
    }

    return set.has(normaliseTerm(name));
}
