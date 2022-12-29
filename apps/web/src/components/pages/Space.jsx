import React, {useState, useEffect} from "react";
import {useMatch, useNavigate, useParams} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import {Titled} from "react-titled";
import {useDispatch, useSelector} from "react-redux";
import SpaceUserList from "../SpaceUserList";
import RemoveSpaceAction from "../actions/space/RemoveSpaceAction";
import RenameSpaceAction from "../actions/space/RenameSpaceAction";
import {
    reset,
    subscribeToSpace,
    unsubscribeFromSpace
} from "../../redux/space/actions";
import Waiting from "../common/Waiting";
import SpaceModelList from "../SpaceModelList";
import SpaceInfo from "../SpaceInfo";
import {sep} from "../../constants";

export default function Space() {
    const {spaceId} = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [tabIndex, setTabIndex] = useState(0);

    const spaceName = useSelector(state => state?.space.name);
    const info = useSelector(state => state?.space.info);
    const isAdmin = useSelector(state => state?.user.isAdmin);

    // Determine selected tab index from matching path.
    let index = tabIndex;
    if (useMatch(`/spaces/${spaceId}`)) index = 0;
    if (useMatch(`/spaces/${spaceId}/members`)) index = 1;
    if (useMatch(`/spaces/${spaceId}/info`)) index = 2;

    function tabSelect(index) {
        setTabIndex(index);
        switch (index) {
            case 0:
                navigate(`/spaces/${spaceId}`);
                break;
            case 1:
                navigate(`/spaces/${spaceId}/members`);
                break;
            case 2:
                navigate(`/spaces/${spaceId}/info`);
                break;
            default:
                throw `unexpected index value: ${index}`;
        }
    }

    useEffect(() => {
        dispatch(subscribeToSpace(spaceId));
        return () => {
            dispatch(unsubscribeFromSpace());
            dispatch(reset());
        }
    }, [dispatch, spaceId]);

    if (!spaceName) {
        return <Waiting msg="Loading space"/>
    }

    return (
        <Titled title={(s) => `${spaceName} ${sep} Spaces ${sep} ${s}`}>
            {/*<h1>{name}</h1>*/}
            <div className="page-actions">
                {isAdmin &&
                    <>
                        <RenameSpaceAction spaceId={spaceId}/>{' '}
                        <RemoveSpaceAction spaceId={spaceId}/>{' '}
                    </>
                }
            </div>
            <Tabs selectedIndex={index} onSelect={tabSelect}>
                <TabList>
                    <Tab>Models</Tab>
                    <Tab>Members</Tab>
                    <Tab>About</Tab>
                </TabList>
                <TabPanel>
                    {/*<h2>Models</h2>*/}
                    <Titled title={(s) => `Models ${sep} ${s}`}>
                        <SpaceModelList/>
                    </Titled>
                </TabPanel>
                <TabPanel>
                    {/*<h2>Members</h2>*/}
                    <Titled title={(s) => `Members ${sep} ${s}`}>
                        <SpaceUserList/>
                    </Titled>
                </TabPanel>
                <TabPanel>
                    {/*<h2>Info</h2>*/}
                    <Titled title={(s) => `About ${sep} ${s}`}>
                        <SpaceInfo spaceId={spaceId}>
                            {info}
                        </SpaceInfo>
                    </Titled>
                </TabPanel>
            </Tabs>
        </Titled>
    )
}
