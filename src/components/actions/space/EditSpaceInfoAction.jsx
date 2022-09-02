import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import TextareaMarkdownEditor from "react-textarea-markdown-editor";
import ActionLink from "../ActionLink";
import {convertMarkdown} from "../../../markdown";
import {editInfo} from "../../../redux/actions/space";

EditSpaceInfoAction.propTypes = {
    spaceId: PropTypes.string.isRequired
}

export default function EditSpaceInfoAction({spaceId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [info, setInfo] = useState('');

    const modelNotes = useSelector(state => state?.space.info);

    const editorRef = useRef(null);

    function setEditorContent(content) {
        if (editorRef.current) {
            editorRef.current.textareaRef.current.textareaRef.current.value = content;
        }
    }

    function clearEditor() {
        setEditorContent('');
    }

    // Reset the form between viewing spaces.
    useEffect(() => {
        reset();
        clearEditor();
    }, [spaceId]);

    useEffect(() => {
        setInfo(modelNotes);
    }, [modelNotes]);

    const {
        // register,
        handleSubmit,
        formState: {/*errors*/},
        reset,
        // setError,
        clearErrors
    } = useForm();

    // Reset the form between viewing terms.
    useEffect(() => {
        reset();
        clearEditor();
    }, [spaceId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(/*data*/) {
        dispatch(editInfo(spaceId, info));

        reset();
        clearEditor();
        closeModal();
    }

    function onCancel() {
        reset();
        clearEditor();
        closeModal();
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Edit info
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Edit info</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{marginTop: '1em'}}>
                        <TextareaMarkdownEditor
                            ref={editorRef}
                            rows="12" cols="50"
                            defaultValue={info}
                            autoFocus
                            doParse={text => convertMarkdown(text)}
                            onChange={(value) => {
                                clearErrors();
                                setInfo(value);
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
