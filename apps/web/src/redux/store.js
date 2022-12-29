import {configureStore} from "@reduxjs/toolkit";
import {combineReducers} from "redux";
import createSagaMiddleware from "redux-saga";
import {all} from "redux-saga/effects";
import {createRouterReducer, createRouterMiddleware} from "@lagunovsky/redux-react-router";
import {createBrowserHistory} from "history";
import Constants from "../constants";

// Reducers
import appReducer from "./app/reducers";
import backupListReducer from "./backupList/reducers";
import contextReducer from "./context/reducers";
import contextListReducer from "./contextList/reducers";
import errorReducer from "./error/reducers";
import importReducer from "./import/reducers";
import modelReducer from "./model/reducers";
import modelListReducer from "./modelList/reducers";
import spaceReducer from "./space/reducers";
import spaceListReducer from "./spaceList/reducers";
import subscriberReducer from "./subscriber/reducers";
import userReducer from "./user/reducers";

// Sagas
import * as appSagas from "./app/sagas";
import * as backupListSagas from "./backupList/sagas";
import * as contextSagas from "./context/sagas";
import * as contextListSagas from "./contextList/sagas";
import * as importSagas from "./import/sagas";
import * as modelSagas from "./model/sagas";
import * as modelListSagas from "./modelList/sagas";
import * as spaceSagas from "./space/sagas";
import * as spaceListSagas from "./spaceList/sagas";
import * as subscriberSagas from "./subscriber/sagas";
import * as userSagas from "./user/sagas";

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
