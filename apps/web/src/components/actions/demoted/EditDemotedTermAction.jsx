import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import classNames from "classnames";
import ActionLink from "../ActionLink";
import {editDemotedTerm} from "../../../redux/context/actions";
import {isDuplicated} from "./AddDemotedTermAction";
import {isSameTerm} from "../term/AddTermAction";

EditDemotedTermAction.propTypes = {
    demotedId: PropTypes.string.isRequired
}

export default function EditDemotedTermAction({demotedId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const terms = useSelector(state => state?.context.terms);
    const demotedTerms = useSelector(state => state?.context.demotedTerms);
    const demotedTermsLookup = useSelector(state => state?.context.demotedTermsLookup);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    // Reset the form between viewing terms.
    useEffect(() => reset(), [demotedId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    const demotedTerm = demotedTermsLookup[demotedId];

    function onSubmit(data) {
        data.name = data.name.trim();

        if (!isSameTerm(demotedTerm.demoted_name, data.name) && isDuplicated(demotedTerms, data.name)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(editDemotedTerm(demotedId, data.name, data.termId));
        closeModal();
    }

    function onCancel() {
        reset();
        closeModal();
    }

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
                <h2 style={{marginBottom: 0}}>Edit term</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="termId">Preferred term</label>
                        <select {...register("termId", {required: true})}
                                defaultValue={demotedTerm.term_id}
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
                        <input defaultValue={demotedTerm.demoted_name}
                               {...register('name', {required: true})}
                               autoFocus onKeyDown={() => clearErrors()}/>
                        {errors.name && <div className="form-error">Demoted term name is required.</div>}
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The demoted term would become a duplicate and cannot be saved.</div>}
                    <input type="submit" value="Save"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
