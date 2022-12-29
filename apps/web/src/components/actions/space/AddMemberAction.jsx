import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {addMember} from "../../../redux/space/actions";

AddMemberAction.propTypes = {
    spaceId: PropTypes.string.isRequired
}

export default function AddMemberAction({spaceId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
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
        // noinspection JSUnresolvedVariable
        dispatch(addMember(spaceId, data.member.trim()));
        reset();
        closeModal();
    }

    function onCancel() {
        reset();
        closeModal();
    }

    // TODO: This action should be able to search for a user to add, by email address perhaps.

    return (
        <>
            <ActionLink onClick={openModal}>
                Add member
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add member</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="member">Member ID</label>
                        <input {...register('member', {required: true})} autoFocus
                               onKeyDown={() => clearErrors()}/>
                        {errors.member && <div className="form-error">Member user ID is required.</div>}
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The member is a duplicate and cannot be added.</div>}
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
