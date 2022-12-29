import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import ReactMarkdown from "react-markdown";
import {requestTermsOfUse} from "../redux/app/actions";

export default function TermsOfUsePage() {
    const dispatch = useDispatch();

    const text = useSelector(state => state?.app.termsOfUse);

    useEffect(() => {
        if (!text) {
            dispatch(requestTermsOfUse());
        }
    }, []);

    return (
        <ReactMarkdown>
            {text}
        </ReactMarkdown>
    )
}
