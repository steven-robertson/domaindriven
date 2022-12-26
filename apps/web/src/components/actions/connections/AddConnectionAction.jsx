import React, {useState} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {addConnection} from "../../../redux/actions/model";

AddConnectionAction.propTypes = {
    modelId: PropTypes.string.isRequired
}

export default function AddConnectionAction({modelId}) {
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

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        if (isDuplicated(connections, data.fromContextId, data.toContextId)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(addConnection(modelId, data.fromContextId, data.toContextId));

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
                Add connection
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add connection</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="fromContextId">From context</label>
                        <select {...register("fromContextId", {required: true})}
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
                        The connection is a duplicate and cannot be added.</div>}
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}

/**
 * @param connections {Object[]}
 * @param fromContextId {string}
 * @param toContextId {string}
 */
export function isDuplicated(connections, fromContextId, toContextId) {

    // Set up lookups for checking for duplicates.
    const from = {};
    const to = {};
    for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        const fromContext = connection.from_context_id;
        const toContext = connection.to_context_id;

        if (!from.hasOwnProperty(fromContext)) {
            from[fromContext] = {};
        }

        if (!to.hasOwnProperty(fromContext)) {
            to[fromContext] = {};
        }

        if (!to.hasOwnProperty(toContext)) {
            to[toContext] = {};
        }

        if (!from.hasOwnProperty(toContext)) {
            from[toContext] = {};
        }

        if (from[fromContext].hasOwnProperty(toContext)) {
            console.log('already contains duplicate');
        } else {
            from[fromContext][toContext] = true;
            to[fromContext][toContext] = true;
        }

        if (to[toContext].hasOwnProperty(fromContext)) {
            console.log('already contains duplicate');
        } else {
            to[toContext][fromContext] = true;
            from[toContext][fromContext] = true;
        }
    }

    if (from.hasOwnProperty(fromContextId)) {
        if (from[fromContextId].hasOwnProperty(toContextId)) {
            return true;
        }
    }

    if (to.hasOwnProperty(toContextId)) {
        if (to[toContextId].hasOwnProperty(fromContextId)) {
            return true;
        }
    }

    return false;
}
