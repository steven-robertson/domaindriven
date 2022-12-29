import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {removeDemotedTerm} from "../../../redux/context/actions";

RemoveDemotedTermAction.propTypes = {
    demotedId: PropTypes.string.isRequired
}

export default function RemoveDemotedTermAction({demotedId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const demotedTermsLookup = useSelector(state => state?.context.demotedTermsLookup);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit() {
        dispatch(removeDemotedTerm(demotedId));
        closeModal();
    }

    function onCancel() {
        closeModal();
    }

    const term = demotedTermsLookup[demotedId];

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
                <h2 style={{marginBottom: 0}}>Remove demoted term</h2>
                <p>
                    Click the Yes button to remove the following demoted term:<br/>
                    <i>{term.demoted_name}</i>
                </p>
                <p>Are you sure?</p>
                <input type="button" value="Yes" onClick={onSubmit}/>
                <input type="button" value="Cancel" onClick={onCancel}/>
            </Modal>
        </>
    )
}
