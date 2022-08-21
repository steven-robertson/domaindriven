import React, {useState, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import ActionLink from "../ActionLink";
import {addGroup} from "../../../redux/actions/context";
import TextareaMarkdownEditor from "react-textarea-markdown-editor";
import {convertMarkdown} from "../../../markdown";

AddGroupAction.propTypes = {
    contextId: PropTypes.string.isRequired
}

export default function AddGroupAction({contextId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [description, setDescription] = useState('');

    const allTerms = useSelector(state => state?.context.allTerms);
    const groups = useSelector(state => state?.context.groups);

    const editorRef = useRef(null);

    function clearEditor() {
        if (editorRef.current) {
            editorRef.current.textareaRef.current.textareaRef.current.value = '';
        }
    }

    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
        setError,
        clearErrors,
        setValue,
        getValues
    } = useForm();

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        data.name = data.name.trim();

        if (isDuplicated(groups, data.name)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(addGroup(contextId, data.name, description, getEnabledTermIds(data)));

        reset();
        clearEditor();
        closeModal();
    }

    function onCancel() {
        reset();
        clearEditor();
        closeModal();
    }

    function handleSelectAll() {
        setTermsEnabled(getValues(), setValue, true);
    }

    function handleSelectNone() {
        setTermsEnabled(getValues(), setValue, false);
    }

    return (
        <>
            <ActionLink onClick={openModal}>
                Add group
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Add group</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Group name</label>
                        <input {...register('name', {required: true})} autoFocus
                               onKeyDown={() => clearErrors()}/>
                        {errors.name && <div className="form-error">Group name is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="description">Group description</label>
                        <TextareaMarkdownEditor
                            ref={editorRef}
                            rows="4" cols="50"
                            doParse={text => convertMarkdown(text)}
                            onChange={(value) => {
                                clearErrors();
                                setDescription(value);
                            }}
                        />
                    </div>
                    {allTerms.length > 0 &&
                        <div>
                            <label>Selected terms</label>
                            <ActionLink onClick={handleSelectAll}>Select all</ActionLink>{' '}
                            <ActionLink onClick={handleSelectNone}>Select none</ActionLink>
                            <div className="group-terms">
                                {allTerms.map((term, i) => {
                                    const itemName = `term-${term.term_id}`;
                                    return (
                                        <div key={i}>
                                            <label htmlFor={itemName}>{term.name}</label>
                                            <input type="checkbox" {...register(itemName)}/>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    }
                    {errors.duplicate && <div className="form-error"><br/>
                        The group is a duplicate and cannot be added.</div>}
                    <input type="submit" value="Add"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}

export function isDuplicated(groups, name) {
    const set = new Set();

    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        set.add(normaliseGroup(group.name));
    }

    return set.has(normaliseGroup(name));
}

function normaliseGroup(name) {
    return name.toLowerCase();
}

export function inGroup(termId, group) {
    // noinspection JSUnresolvedVariable
    const terms = group.group_terms;

    for (let i = 0; i < terms.length; i++) {
        // noinspection JSUnresolvedVariable
        const term = terms[i].term;
        if (termId === term.term_id) {
            return true;
        }
    }

    return false;
}

/**
 * @param data {Object}
 * @returns {*[]}
 */
export function getEnabledTermIds(data) {
    const enabledTermIds = [];

    for (const itemName in data) {
        if (itemName.startsWith('term-')) {
            const enabled = data[itemName];
            if (enabled) {
                const id = itemName.slice('term-'.length);
                enabledTermIds.push(id);
            }
        }
    }

    return enabledTermIds;
}

/**
 * @param data {Object}
 * @param setValue {function}
 * @param value {boolean}
 */
export function setTermsEnabled(data, setValue, value) {
    for (const itemName in data) {
        if (itemName.startsWith('term-')) {
            setValue(itemName, value);
        }
    }
}
