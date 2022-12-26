import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {addContext} from "../../../redux/actions/context";

AddContextAction.propTypes = {
    modelId: PropTypes.string
}

export default function AddContextAction(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm();

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        dispatch(addContext(data.name, props.modelId, navigate));
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
                Add context
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add context</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Context name</label>
                        <input {...register('name', {required: true})} autoFocus size={35}/>
                        {errors.name && <div className="form-error">Model name is required.</div>}
                    </div>
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
