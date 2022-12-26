import React from "react";
import {useSelector} from "react-redux";
import Waiting from "./Waiting";
import Loading from "./Loading";

export default function RequireSubscriber({children}) {
    const received = useSelector(state => state?.subscriber.subscribeFunctionReceived);

    if (received) {
        return <>{children}</>
    }

    return (
        <>
            <Loading/>
            <Waiting msg="Connecting websocket"/>
        </>
    )
}
