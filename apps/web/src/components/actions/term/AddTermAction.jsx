import React, {useState, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import TextareaMarkdownEditor from "react-textarea-markdown-editor";
import ActionLink from "../ActionLink";
import {addTerm} from "../../../redux/actions/context";
import {convertMarkdown} from "../../../markdown";

AddTermAction.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function AddTermAction({contextId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [definition, setDefinition] = useState('');

    const allTerms = useSelector(state => state?.context.allTerms);

    const editorRef = useRef(null);

    function setEditorContent(value) {
        setDefinition('');
        if (editorRef.current) {
            editorRef.current.textareaRef.current.textareaRef.current.value = value;
        }
    }

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors
    } = useForm();

    function resetForm() {
        reset();
        setEditorContent('');
    }

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        const name = data.name.trim();

        if (isDuplicated(allTerms, name)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(addTerm(contextId, name, getClassName(name), data.todo, definition));

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
                Add term
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add term</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Term name</label>
                        <input {...register('name', {required: true})} autoFocus
                               onKeyDown={() => clearErrors()}/>
                        {errors.name && <div className="form-error">Term name is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="definition">Term definition</label>
                        <TextareaMarkdownEditor
                            ref={editorRef}
                            rows="4" cols="50"
                            doParse={text => convertMarkdown(text)}
                            onChange={(value) => {
                                clearErrors();
                                setDefinition(value);
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="todo">To be completed?</label>
                        <input type="checkbox" defaultChecked={true} {...register('todo')}/>
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The term is a duplicate and cannot be added.</div>}
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}

export function getClassName(name) {

    // Only allow alphanumeric and space.
    name = name.replace(/[^A-Za-z\d ]/g, ' ');

    // Remove duplicate spaces.
    name = name.replace(/\s+/g, ' ');

    // Split on space to prepare to title case words.
    const split = name.split(' ');

    // Build the result using title case.
    let result = '';
    for (let i = 0; i < split.length; i++) {
        const str = split[i];
        result += `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
    }

    return result;
}

export function isDuplicated(terms, name) {
    const set = new Set();

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        set.add(normaliseTerm(term.name));
    }

    return set.has(normaliseTerm(name));
}

export function isSameTerm(term1, term2) {
    return normaliseTerm(term1) === normaliseTerm(term2);
}

export function normaliseTerm(term) {
    return getClassName(term.trim()).toLowerCase();
}
