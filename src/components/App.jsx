import React from "react";
import {useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {Titled} from "react-titled";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import RequireAuth from "./common/RequireAuth";
import RequireSubscriber from "./common/RequireSubscriber";
import Error from "./pages/Error";
import ErrorBoundary from "./common/ErrorBoundary";
import ErrorNotFound from "./pages/ErrorNotFound";
import RequireUserInfo from "./common/RequireUserInfo";
import Help from "./pages/Help";
import BackupList from "./pages/BackupList";
import LockScreen from "./common/LockScreen";
import Home from "./pages/Home";
import Space from "./pages/Space";
import Model from "./pages/Model";
import AppBreadcrumbs from "./AppBreadcrumbs";
import Constants from "../constants";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalTerms from "./pages/LegalTerms";

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
