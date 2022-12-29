import React, {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {subscribeToUserInfo, unsubscribeFromUserInfo} from "../../redux/user/actions";
import Waiting from "./Waiting";
import Loading from "./Loading";

export default function RequireUserInfo({children}) {
    const dispatch = useDispatch();

    const userId = useSelector(state => state?.user.userId);
    const personalSpaceId = useSelector(state => state?.user.personalSpaceId);

    useEffect(() => {
        dispatch(subscribeToUserInfo(userId));
        return () => { dispatch(unsubscribeFromUserInfo()); }
    }, [dispatch]);

    if (personalSpaceId) {
        return <>{children}</>
    }

    return (
        <>
            <Loading/>
            <Waiting msg="Obtaining account info"/>
        </>
    )
}
