import React from "react";
import {useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {Titled} from "react-titled";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import RequireAuth from "./RequireAuth";
import RequireSubscriber from "./RequireSubscriber";
import Error from "./Error";
import ErrorBoundary from "./ErrorBoundary";
import ErrorNotFound from "./ErrorNotFound";
import RequireUserInfo from "./RequireUserInfo";
import Help from "./Help";
import BackupList from "./BackupList";
import LockScreen from "./LockScreen";
import Home from "./Home";
import Space from "./Space";
import Model from "./Model";
import AppBreadcrumbs from "./AppBreadcrumbs";
import Constants from "../constants";
import LegalPrivacy from "./LegalPrivacy";
import LegalTerms from "./LegalTerms";

export default function App() {
    const err = useSelector(state => state?.error.msg);

    if (err) {
        return (
            <Titled title={() => Constants.siteName}>
                <AppHeader/>
                <div className="page-content">
                    <AppBreadcrumbs/>
                    <Error msg={err}/>
                </div>
                <AppFooter/>
            </Titled>
        )
    }

    return (
        <Titled title={() => Constants.siteName}>
            <LockScreen/>
            <AppHeader/>
            <div className="page-content">
                <RequireAuth>
                    <RequireSubscriber>
                        <RequireUserInfo>
                            <AppBreadcrumbs/>
                            <ErrorBoundary>
                                <Routes>
                                    <Route exact path="/" element={<Home/>}/>
                                    <Route exact path="/spaces/" element={<Home/>}/>
                                    <Route exact path="/spaces/:spaceId" element={<Space/>}/>
                                    <Route exact path="/spaces/:spaceId/members" element={<Space/>}/>
                                    <Route exact path="/spaces/:spaceId/info" element={<Space/>}/>
                                    <Route exact path="/models/:modelId/backups" element={<BackupList/>}/>
                                    <Route path="/models/:modelId/*" element={<Model/>}/>
                                    <Route exact path="/help" element={<Help/>}/>
                                    <Route exact path="/legal/privacy-policy" element={<LegalPrivacy/>}/>
                                    <Route exact path="/legal/terms-of-use" element={<LegalTerms/>}/>
                                    <Route path="*" element={<ErrorNotFound/>}/>
                                </Routes>
                            </ErrorBoundary>
                        </RequireUserInfo>
                    </RequireSubscriber>
                </RequireAuth>
            </div>
            <AppFooter/>
            <Toaster position="bottom-right"/>
        </Titled>
    )
}
