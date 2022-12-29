import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {editConnection} from "../../../redux/model/actions";
import {isDuplicated} from "./AddConnectionAction";

EditConnectionAction.propTypes = {
    connectionId: PropTypes.string.isRequired
}

export default function EditConnectionAction({connectionId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const contexts = useSelector(state => state?.model.contexts);
    const connections = useSelector(state => state?.model.connections);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    // Reset the form between viewing connections.
    useEffect(() => reset(), [connectionId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function findConnection() {
        for (let i = 0; i < connections.length; i++) {
            if (connections[i].connection_id === connectionId) {
                return connections[i]
            }
        }
    }

    const connection = findConnection();

    function onSubmit(data) {
        const sameFrom = connection.from_context_id === data.fromContextId;
        const sameTo = connection.to_context_id === data.toContextId;
        const switchedFrom = connection.to_context_id === data.fromContextId;
        const switchedTo = connection.from_context_id === data.toContextId;
        const same = sameFrom && sameTo || switchedFrom && switchedTo;

        if (!same && isDuplicated(connections, data.fromContextId, data.toContextId)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(editConnection(connectionId, data.fromContextId, data.toContextId));

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
                <h2>Edit connection</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="fromContextId">From context</label>
                        <select {...register("fromContextId", {required: true})}
                                defaultValue={connection.from_context_id}
                                onChange={() => clearErrors()}>
                            <option/>
                            {contexts.map((context, i) => {
                                return (
                                    <option key={i} value={context.context_id}>
                                        {context.name}
                                    </option>
                                )
                            })}
                        </select>
                        {errors.fromContextId && <div className="form-error">From context is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="toContextId">To context</label>
                        <select {...register("toContextId", {required: true})}
                                defaultValue={connection.to_context_id}
                                onChange={() => clearErrors()}>
                            <option/>
                            {contexts.map((context, i) => {
                                return (
                                    <option key={i} value={context.context_id}>
                                        {context.name}
                                    </option>
                                )
                            })}
                        </select>
                        {errors.toContextId && <div className="form-error">To context is required.</div>}
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The connection would become a duplicate and cannot be saved.</div>}
                    <input type="submit" value="Save"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
