import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {removeConnection} from "../../../redux/actions/model";

RemoveConnectionAction.propTypes = {
    connectionId: PropTypes.string.isRequired
}

export default function RemoveConnectionAction({connectionId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const contextsLookup = useSelector(state => state?.model.contextsLookup);
    const connections = useSelector(state => state?.model.connections);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit() {
        dispatch(removeConnection(connectionId));
        closeModal();
    }

    function onCancel() {
        closeModal();
    }

    function findConnection() {
        for (let i = 0; i < connections.length; i++) {
            if (connections[i].connection_id === connectionId) {
                return connections[i]
            }
        }
    }

    const connection = findConnection();
    const from = connection && contextsLookup[connection.from_context_id];
    const to = connection && contextsLookup[connection.to_context_id];

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
                <h2 style={{marginBottom: 0}}>Remove connection</h2>
                <p>
                    Click the Yes button to remove the following connection:<br/>
                    <i>{from.name} {String.fromCharCode(8594)} {to.name}</i>
                </p>
                <p>Are you sure?</p>
                <input type="button" value="Yes" onClick={onSubmit}/>
                <input type="button" value="Cancel" onClick={onCancel}/>
            </Modal>
        </>
    )
}
