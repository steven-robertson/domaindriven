import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {removeContext} from "../../../redux/context/actions";

RemoveContextAction.propTypes = {
    contextId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}

export default function RemoveContextAction({contextId, name}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit() {
        dispatch(removeContext(contextId, navigate));
        closeModal();
    }

    function onCancel() {
        closeModal();
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Remove
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Remove context</h2>
                <p>
                    Click the Yes button to remove the following context:<br/>
                    <i>{name}</i>
                </p>
                <p>Are you sure?</p>
                <input type="button" value="Yes" onClick={onSubmit}/>
                <input type="button" value="Cancel" onClick={onCancel}/>
            </Modal>
        </>
    )
}
