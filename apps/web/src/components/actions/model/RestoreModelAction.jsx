import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {restoreModel} from "../../../redux/model/actions";

RestoreModelAction.propTypes = {
    backupId: PropTypes.string.isRequired
}

export default function RestoreModelAction({backupId}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const name = useSelector(state => state?.model.name);
    const spaceId = useSelector(state => state?.model.spaceId);
    const spaces = useSelector(state => state?.user.spaces);

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
        dispatch(restoreModel(backupId, data.spaceId, data.name, navigate));
        // reset();
        // closeModal();
        // NOTE: Navigate will be used, which closes the modal.
    }

    function onCancel() {
        reset();
        closeModal();
    }

    const copyName = `${name} - Restored`;

    return (
        <>
            <ActionLink onClick={openModal}>
                Restore
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Restore model</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Model name</label>
                        <input {...register('name', {required: true})} autoFocus
                               defaultValue={copyName} size={35}/>
                        {errors.name && <div className="form-error">Model name is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="spaceId">Space</label>
                        <select {...register("spaceId", {required: true})}
                                defaultValue={spaceId}>
                            {spaces.map((space, i) => {
                                return (
                                    <option key={i} value={space.space_id}>
                                        {space.name}
                                    </option>
                                )
                            })}
                        </select>
                        {errors.spaceId && <div className="form-error">Space is required.</div>}
                    </div>
                    <input type="submit" value="Restore"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
