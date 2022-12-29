import React from "react";
import {store} from "../../redux/store";
import {actions} from "../../redux/error/actions";

export default class ErrorBoundary extends React.Component {

    state = {hasError: false};

    static getDerivedStateFromError(_) {
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            store.dispatch(actions('There was a problem in rendering this content.'));
            return <></>
        }

        return this.props.children;
    }
}
