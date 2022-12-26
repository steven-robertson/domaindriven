import React from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import EditContextNotesAction from "./actions/context/EditContextNotesAction";

ContextNotes.propTypes = {
    contextId: PropTypes.string.isRequired,
    children: PropTypes.any
}

export default function ContextNotes(props) {
    return (
        <>
            <EditContextNotesAction contextId={props.contextId}/>
            <div className="model-notes">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath, remarkRehype]}
                    rehypePlugins={[rehypeKatex]}>
                    {props.children}
                </ReactMarkdown>
            </div>
        </>
    )
}
