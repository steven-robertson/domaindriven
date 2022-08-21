import React from "react";
import PropTypes from "prop-types";
import {useSelector} from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import EditSpaceInfoAction from "./actions/space/EditSpaceInfoAction";

SpaceInfo.propTypes = {
    spaceId: PropTypes.string.isRequired,
    children: PropTypes.any
}

export default function SpaceInfo(props) {
    const isAdmin = useSelector(state => state?.user.isAdmin);
    const info = useSelector(state => state?.space.info);

    return (
        <>
            {isAdmin &&
                <EditSpaceInfoAction spaceId={props.spaceId}/>
            }
            {info &&
                <div className="model-notes">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath, remarkRehype]}
                        rehypePlugins={[rehypeKatex]}>
                        {props.children}
                    </ReactMarkdown>
                </div>
            }
            {!info &&
                <div style={{marginTop: "0.5em"}}>
                    <i>There is currently no available info about this space.</i>
                </div>
            }
        </>
    )
}
