import React from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import classNames from "classnames";

Definition.propTypes = {
    todo: PropTypes.bool,
    children: PropTypes.any
}

export default function Definition(props) {
    return (
        <div className={classNames('definition', {'todo': props.todo})}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkRehype]}
                rehypePlugins={[rehypeKatex]}>
                {props.children}
            </ReactMarkdown>
        </div>
    )
}
