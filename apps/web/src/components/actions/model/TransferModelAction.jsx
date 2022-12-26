import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {transferModel} from "../../../redux/actions/model";

TransferModelAction.propTypes = {
    modelId: PropTypes.string.isRequired
}

export default function TransferModelAction({modelId}) {
    const dispatch = useDispatch();

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

    // Reset the form between viewing models.
    useEffect(() => reset(), [modelId, spaceId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        dispatch(transferModel(modelId, data.spaceId));
        closeModal();
    }

    function onCancel() {
        reset();
        closeModal();
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Transfer
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Transfer model</h2>
                <p>
                    Click the Transfer button to transfer the following model:<br/>
                    <i>{name}</i>
                </p>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                    <input type="submit" value="Transfer"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
