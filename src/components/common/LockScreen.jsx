import React from "react";
import Loading from "./Loading";

export default function LockScreen() {
    return (
        <>
            <div className="lock-screen" style={styles.fullPage}/>
            <div className="lock-screen" style={styles.contentBlanker}/>
            <div className="lock-screen" style={styles.container}>
                <div className="center-screen">
                    <Loading/>
                </div>
            </div>
        </>
    )
}

const styles = {
    fullPage: {
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        zIndex: 99999,
        overflow: 'none',
        width: '100vw',
        height: '100vh',
        opacity: 0.5,
        display: 'none'
    },
    contentBlanker: {
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        zIndex: 99999,
        overflow: 'none',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(240, 240, 240, 0.9)',
        opacity: 0.9,
        display: 'none'
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        zIndex: 99999,
        overflow: 'none',
        width: '100vw',
        height: '100vh',
        display: 'none'
    }
};
