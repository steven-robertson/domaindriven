import React from "react";
import PropTypes from "prop-types";
import {formatRelative} from "date-fns";
import bn from "date-fns/locale/bn";
import enGB from "date-fns/locale/en-GB";
import enUS from "date-fns/locale/en-US";
import enCA from "date-fns/locale/en-CA";
import enAU from "date-fns/locale/en-AU";
import enIN from "date-fns/locale/en-IN";
import es from "date-fns/locale/es";
import hi from "date-fns/locale/hi";

const localeLookup = {
    'bn': bn, // Bengali (India)
    'en-GB': enGB, // English UK
    'en-US': enUS, // English US
    'en-CA': enCA, // English Canada
    'en-AU': enAU, // English Australia
    'en-IN': enIN, // English India
    'es': es, // Spanish
    'hi': hi, // Hindi (India)
    // TODO: Support more locales
}

export default function FormatRelativeDate({value}) {
    if (!value) {
        return <></>
    }

    const date = Date.parse(value);
    const now = new Date();
    const formatted = formatRelative(date, now, {locale: getLocale()});
    const relative = `${formatted[0].toUpperCase()}${formatted.slice(1)}`;

    return <span>{relative}</span>
}

FormatRelativeDate.propTypes = {
    value: PropTypes.string
}

function getLocale() {
    if (navigator.languages !== undefined) {

        // Use the first supported locale in the list.
        const languages = navigator.languages;
        for (let i = 0; i < languages.length; i++) {
            const lang = languages[i];
            if (localeLookup.hasOwnProperty(lang)) {
                return localeLookup[lang];
            }
        }
    }

    if (localeLookup.hasOwnProperty(navigator.language)) {
        return localeLookup[navigator.language];
    }

    return enGB;
}
