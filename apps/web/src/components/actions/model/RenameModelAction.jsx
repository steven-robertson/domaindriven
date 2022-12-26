import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {renameModel} from "../../../redux/actions/model";

RenameModelAction.propTypes = {
    modelId: PropTypes.string.isRequired
}

export default function RenameModelAction({modelId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const name = useSelector(state => state?.model.name);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm();

    // Reset the form between viewing models.
    useEffect(() => reset(), [modelId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        dispatch(renameModel(modelId, data.name));
        closeModal();
    }

    function onCancel() {
        reset();
        closeModal();
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Rename
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Rename model</h2>
                <p>
                    Click the Rename button to rename the following model:<br/>
                    <i>{name}</i>
                </p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Model name</label>
                        <input {...register('name', {required: true})} autoFocus
                               defaultValue={name} size={35}/>
                        {errors.name && <div className="form-error">Model name is required.</div>}
                    </div>
                    <input type="submit" value="Rename"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
