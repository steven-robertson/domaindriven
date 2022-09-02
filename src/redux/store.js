import {configureStore} from "@reduxjs/toolkit";
import {combineReducers} from "redux";
import createSagaMiddleware from "redux-saga";
import {all} from "redux-saga/effects";
import {createRouterReducer, createRouterMiddleware} from "@lagunovsky/redux-react-router";
import {createBrowserHistory} from "history";
import Constants from "../constants";

// Reducers
import appReducer from "./reducers/app";
import backupListReducer from "./reducers/backupList";
import contextReducer from "./reducers/context";
import contextListReducer from "./reducers/contextList";
import errorReducer from "./reducers/error";
import importReducer from "./reducers/import";
import modelReducer from "./reducers/model";
import modelListReducer from "./reducers/modelList";
import spaceReducer from "./reducers/space";
import spaceListReducer from "./reducers/spaceList";
import subscriberReducer from "./reducers/subscriber";
import userReducer from "./reducers/user";

// Sagas
import * as appSagas from "./sagas/app";
import * as backupListSagas from "./sagas/backupList";
import * as contextSagas from "./sagas/context";
import * as contextListSagas from "./sagas/contextList";
import * as importSagas from "./sagas/import";
import * as modelSagas from "./sagas/model";
import * as modelListSagas from "./sagas/modelList";
import * as spaceSagas from "./sagas/space";
import * as spaceListSagas from "./sagas/spaceList";
import * as subscriberSagas from "./sagas/subscriber";
import * as userSagas from "./sagas/user";

const loggingMiddleware = (store) => {
    return (next) => {
        return (action) => {
            if (Constants.logActions) {
                const collapsed = false;
                const msg = `Action: ${action.type}`;
                if (collapsed) console.groupCollapsed(msg); else console.group(msg);
                console.log('Action:', action);
                console.log('Previous state:', store.getState());
            }

            const result = next(action);

            if (Constants.logActions) {
                console.log('New state:', store.getState());
                console.groupEnd();
            }

            return result;
        }
    }
};

export const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
    router: createRouterReducer(history),
    app: appReducer,
    backupList: backupListReducer,
    context: contextReducer,
    contextList: contextListReducer,
    error: errorReducer,
    import: importReducer,
    model: modelReducer,
    modelList: modelListReducer,
    space: spaceReducer,
    spaceList: spaceListReducer,
    subscriber: subscriberReducer,
    user: userReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: [
        createRouterMiddleware(history),
        loggingMiddleware,
        sagaMiddleware
    ]
});

const sagas = [];

function collectSagas(file) {
    for (const name in file) {
        if (file.hasOwnProperty(name)) {
            sagas.push(file[name]());
        }
    }
}

collectSagas(appSagas);
collectSagas(backupListSagas);
collectSagas(contextSagas);
collectSagas(contextListSagas);
collectSagas(importSagas);
collectSagas(modelSagas);
collectSagas(modelListSagas);
collectSagas(spaceSagas);
collectSagas(spaceListSagas);
collectSagas(subscriberSagas);
collectSagas(userSagas);

function* rootSaga() {
    yield all(sagas);
}

sagaMiddleware.run(rootSaga);
