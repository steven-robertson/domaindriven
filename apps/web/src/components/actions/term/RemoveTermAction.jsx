import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {removeTerm} from "../../../redux/actions/context";

RemoveTermAction.propTypes = {
    termId: PropTypes.string.isRequired
}

export default function RemoveTermAction({termId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const termsLookup = useSelector(state => state?.context.termsLookup);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit() {
        dispatch(removeTerm(termId));
        closeModal();
    }

    function onCancel() {
        closeModal();
    }

    const term = termsLookup[termId];

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
                <h2 style={{marginBottom: 0}}>Remove term</h2>
                <p>
                    Click the Yes button to remove the following term:<br/>
                    <i>{term.name}</i>
                </p>
                <p>Are you sure?</p>
                <input type="button" value="Yes" onClick={onSubmit}/>
                <input type="button" value="Cancel" onClick={onCancel}/>
            </Modal>
        </>
    )
}
