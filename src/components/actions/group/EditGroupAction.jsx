import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import {useDispatch, useSelector} from "react-redux";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";
import {useForm} from "react-hook-form";
import Modal from "react-modal";
import TextareaMarkdownEditor from "react-textarea-markdown-editor";
import ActionLink from "../ActionLink";
import {convertMarkdown} from "../../../markdown";
import {editGroup} from "../../../redux/actions/context";
import {getEnabledTermIds, isDuplicated, inGroup, setTermsEnabled} from "./AddGroupAction";

EditGroupAction.propTypes = {
    groupId: PropTypes.string.isRequired
}

export default function EditGroupAction({groupId}) {
    const dispatch = useDispatch();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [description, setDescription] = useState('');

    const allTerms = useSelector(state => state?.context.allTerms);
    const groups = useSelector(state => state?.context.groups);
    const groupsLookup = useSelector(state => state?.context.groupsLookup);

    const editorRef = useRef(null);

    function setEditorContent(content) {
        if (editorRef.current) {
            editorRef.current.textareaRef.current.textareaRef.current.value = content;
        }
    }

    function clearEditor() {
        setEditorContent('');
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

    // Reset the form between viewing groups.
    useEffect(() => {
        reset();
        clearEditor();
    }, [groupId]);

    const group = groupsLookup[groupId];

    useEffect(() => {
        setDescription(group.description);
    }, [group]);

    modalIsOpen ? disableBodyScroll(document, {reserveScrollBarGap: true}) : enableBodyScroll(document);

    function openModal() {
        setModalIsOpen(true);
    }

    function closeModal() {
        setModalIsOpen(false);
    }

    function onSubmit(data) {
        data.name = data.name.trim();

        if (group.name !== data.name && isDuplicated(groups, data.name)) {
            setError('duplicate', {type: 'custom'});
            return false;
        }

        dispatch(editGroup(groupId, data.name, description, getEnabledTermIds(data)));

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
                Edit
            </ActionLink>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal"
                overlayClassName="modal-overlay">
                <h2 style={{marginBottom: 0}}>Edit group</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name">Group name</label>
                        <input defaultValue={group.name} {...register('name', {required: true})}
                               autoFocus onKeyDown={() => clearErrors()}/>
                        {errors.name && <div className="form-error">Group name is required.</div>}
                    </div>
                    <div>
                        <label htmlFor="description">Group description</label>
                        <TextareaMarkdownEditor
                            ref={editorRef}
                            rows="4" cols="50"
                            defaultValue={group.description || ''}
                            doParse={text => convertMarkdown(text)}
                            onChange={(value) => {
                                clearErrors();
                                setDescription(value);
                            }}
                        />
                    </div>
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
                                        <input type="checkbox" {...register(itemName)}
                                               defaultChecked={inGroup(term.term_id, group)}/>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    {errors.duplicate && <div className="form-error"><br/>
                        The group would become a duplicate and cannot be saved.</div>}
                    <input type="submit" value="Save"/>
                    <input type="button" value="Cancel" onClick={onCancel}/>
                </form>
            </Modal>
        </>
    )
}
