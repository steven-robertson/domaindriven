import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";

export function screenLock() {
    // NOTE: The following won't have any effect when a modal is involved.
    //       This is due to the modal calling enable/disable which conflicts with this.
    disableBodyScroll(document);
    const elems = document.getElementsByClassName('lock-screen');
    for (let i = 0; i < elems.length; i++) {
        const elem = elems[i];
        // noinspection JSUnresolvedVariable
        elem.style.display = '';
    }
}

export function screenUnlock() {
    enableBodyScroll(document);
    const elems = document.getElementsByClassName('lock-screen');
    for (let i = 0; i < elems.length; i++) {
        const elem = elems[i];
        // noinspection JSUnresolvedVariable
        elem.style.display = 'none';
    }
}
