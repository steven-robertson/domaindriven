import React, {useState} from "react";
import {useMatch, useNavigate} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import ModelList from "./pages/ModelList";
import SpaceList from "./pages/SpaceList";

export default function Home() {
    const navigate = useNavigate();

    const [tabIndex, setTabIndex] = useState(0);

    // Determine selected tab index from matching path.
    let index = tabIndex;
    if (useMatch('/')) index = 0;
    if (useMatch('/spaces/')) index = 1;

    function tabSelect(index) {
        setTabIndex(index);
        switch (index) {
            case 0:
                navigate('/');
                break;
            case 1:
                navigate('/spaces/');
                break;
            default:
                throw `unexpected index value: ${index}`;
        }
    }

    return (
        <div className="homepage">
            <Tabs selectedIndex={index} onSelect={tabSelect}>
                <TabList>
                    <Tab>Models</Tab>
                    <Tab>Spaces</Tab>
                </TabList>
                <TabPanel>
                    {/*<h2>Models</h2>*/}
                    <ModelList/>
                </TabPanel>
                <TabPanel>
                    {/*<h2>Spaces</h2>*/}
                    <SpaceList/>
                </TabPanel>
            </Tabs>
        </div>
    )
}
