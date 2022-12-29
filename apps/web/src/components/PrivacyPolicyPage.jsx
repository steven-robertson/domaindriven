import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import ReactMarkdown from "react-markdown";
import {requestPrivacyPolicy} from "../redux/app/actions";

export default function PrivacyPolicyPage() {
    const dispatch = useDispatch();

    const text = useSelector(state => state?.app.privacyPolicy);

    useEffect(() => {
        if (!text) {
            dispatch(requestPrivacyPolicy());
        }
    }, []);

    return (
        <ReactMarkdown>
            {text}
        </ReactMarkdown>
    )
}
