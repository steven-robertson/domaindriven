import React from "react";
import ReactDOM from "react-dom/client";
import {Provider as ReduxProvider} from "react-redux";
import {ReduxRouter as Router} from "@lagunovsky/redux-react-router";
import Modal from 'react-modal';
import {store, history} from "./redux/store";
import App from "./components/App";

const container = document.getElementById('app');

// noinspection JSUnresolvedFunction
Modal.setAppElement(container);

const element = (
    <ReduxProvider store={store}>
        <Router history={history}>
            <App/>
        </Router>
    </ReduxProvider>
);

const root = ReactDOM.createRoot(container);
root.render(element);
