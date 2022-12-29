import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {getAuthInfo} from "../../redux/user/actions";
import Waiting from "./Waiting";
import Loading from "./Loading";

export default function RequireAuth({children}) {
    const dispatch = useDispatch();

    const userId = useSelector(state => state?.user.userId);

    useEffect(() => {
        if (!userId) {
            dispatch(getAuthInfo());
        }
    }, [dispatch])

    if (userId) {
        return <>{children}</>
    }

    return (
        <>
            <Loading/>
            <Waiting msg="Authenticating"/>
        </>
    )
}
