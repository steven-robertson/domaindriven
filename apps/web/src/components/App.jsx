import React from "react";
import {useSelector} from "react-redux";
import {Route, Routes} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {Titled} from "react-titled";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import RequireAuth from "./RequireAuth";
import RequireSubscriber from "./RequireSubscriber";
import ErrorPage from "./ErrorPage";
import ErrorBoundary from "./ErrorBoundary";
import ErrorNotFoundPage from "./ErrorNotFoundPage";
import RequireUserInfo from "./RequireUserInfo";
import HelpPage from "./HelpPage";
import BackupListPage from "./BackupListPage";
import LockScreen from "./LockScreen";
import HomePage from "./HomePage";
import SpacePage from "./SpacePage";
import ModelPage from "./ModelPage";
import AppBreadcrumbs from "./AppBreadcrumbs";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsOfUsePage from "./TermsOfUsePage";
import Constants from "../constants";

export default function App() {
    const err = useSelector(state => state?.error.msg);

    if (err) {
        return (
            <Titled title={() => Constants.siteName}>
                <AppHeader/>
                <div className="page-content">
                    <AppBreadcrumbs/>
                    <ErrorPage msg={err}/>
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
                                    <Route exact path="/" element={<HomePage/>}/>
                                    <Route exact path="/spaces/" element={<HomePage/>}/>
                                    <Route exact path="/spaces/:spaceId" element={<SpacePage/>}/>
                                    <Route exact path="/spaces/:spaceId/members" element={<SpacePage/>}/>
                                    <Route exact path="/spaces/:spaceId/info" element={<SpacePage/>}/>
                                    <Route exact path="/models/:modelId/backups" element={<BackupListPage/>}/>
                                    <Route path="/models/:modelId/*" element={<ModelPage/>}/>
                                    <Route exact path="/help" element={<HelpPage/>}/>
                                    <Route exact path="/legal/privacy-policy" element={<PrivacyPolicyPage/>}/>
                                    <Route exact path="/legal/terms-of-use" element={<TermsOfUsePage/>}/>
                                    <Route path="*" element={<ErrorNotFoundPage/>}/>
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
