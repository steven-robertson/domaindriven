import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import TextareaMarkdownEditor from "react-textarea-markdown-editor";
import ActionLink from "../ActionLink";
import {editTerm} from "../../../redux/actions/context";
import {getClassName, isDuplicated, isSameTerm} from "./AddTermAction";
import {convertMarkdown} from "../../../markdown";

EditTermAction.propTypes = {
    termId: PropTypes.string.isRequired
}

export default function EditTermAction({termId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [definition, setDefinition] = useState('');

    const allTerms = useSelector(state => state?.context.allTerms);
    const termsLookup = useSelector(state => state?.context.termsLookup);

    const editorRef = useRef(null);

    function setEditorContent(value) {
        if (editorRef.current) {
            editorRef.current.textareaRef.current.textareaRef.current.value = value;
        }
    }

    function clearEditor() {
        setEditorContent('');
    }

    const term = termsLookup[termId];

    useEffect(() => {
        setDefinition(term.definition);
    }, [term]);

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    // Reset the form between viewing terms.
    useEffect(() => {
        reset();
        clearEditor();
    }, [termId]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        const name = data.name.trim();

        if (!isSameTerm(term.name, name) && isDuplicated(allTerms, name)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(editTerm(termId, name, getClassName(name), data.todo, definition));

        reset();
        clearEditor();
        closeModal();
    }

    function onCancel() {
        setDefinition(term.definition);

        reset();
        clearEditor();
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
                <h2 style={{marginBottom: 0}}>Edit term</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Term name</label>
                        <input defaultValue={term.name} {...register('name', {required: true})}
                               autoFocus onKeyDown={() => clearErrors()}/>
                        {errors.name && <div className="form-error">Term name is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="definition">Term definition</label>
                        <TextareaMarkdownEditor
                            ref={editorRef}
                            rows="4" cols="50"
                            defaultValue={definition}
                            doParse={text => convertMarkdown(text)}
                            onChange={(value) => {
                                clearErrors();
                                setDefinition(value);
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="todo">To be completed?</label>
                        <input type="checkbox" defaultChecked={term.todo} {...register('todo')}/>
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The term would become a duplicate and cannot be saved.</div>}
                    <input type="submit" value="Save"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
