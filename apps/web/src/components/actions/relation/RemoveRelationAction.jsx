import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {buildConnection} from "../../DomainModel";
import {removeRelation} from "../../../redux/actions/context";

RemoveRelationAction.propTypes = {
    relationId: PropTypes.string.isRequired
}

export default function RemoveRelationAction({relationId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const termsLookup = useSelector(state => state?.context.termsLookup);
    const relations = useSelector(state => state?.context.relations);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit() {
        dispatch(removeRelation(relationId));
        closeModal();
    }

    function onCancel() {
        closeModal();
    }

    function findRelation() {
        for (let i = 0; i < relations.length; i++) {
            if (relations[i].relation_id === relationId) {
                return relations[i]
            }
        }
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
                <h2 style={{marginBottom: 0}}>Remove relation</h2>
                <p>
                    Click the Yes button to remove the following relation:<br/>
                    <i>{buildConnection(findRelation(), termsLookup)}</i>
                </p>
                <p>Are you sure?</p>
                <input type="button" value="Yes" onClick={onSubmit}/>
                <input type="button" value="Cancel" onClick={onCancel}/>
            </Modal>
        </>
    )
}
