import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import TextareaMarkdownEditor from "react-textarea-markdown-editor";
import ActionLink from "../ActionLink";
import {convertMarkdown} from "../../../markdown";
import {editNotes} from "../../../redux/context/actions";

EditContextNotesAction.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function EditContextNotesAction({contextId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [notes, setNotes] = useState('');

    const modelNotes = useSelector(state => state?.context.notes);

    const editorRef = useRef(null);

    function setEditorContent(value) {
        if (editorRef.current) {
            editorRef.current.textareaRef.current.textareaRef.current.value = value;
        }
    }

    useEffect(() => {
        setNotes(modelNotes);
    }, [modelNotes]);

    const {
        // register,
        handleSubmit,
        formState: {/*errors*/},
        reset,
        // setError,
        clearErrors
    } = useForm();

    function resetForm() {
        reset();
        setEditorContent('');
    }

    // Reset the form between viewing contexts.
    useEffect(() => {
        resetForm();
    }, [contextId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(/*data*/) {
        dispatch(editNotes(contextId, notes));

        resetForm();
        closeModal();
    }

    function onCancel() {
        resetForm();
        closeModal();
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Edit notes
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Edit notes</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{marginTop: '1em'}}>
                        <TextareaMarkdownEditor
                            ref={editorRef}
                            rows="12" cols="50"
                            defaultValue={notes}
                            autoFocus
                            doParse={text => convertMarkdown(text)}
                            onChange={(value) => {
                                clearErrors();
                                setNotes(value);
                            }}
                        />
                    </div>
                    <input type="submit" value="Save"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
