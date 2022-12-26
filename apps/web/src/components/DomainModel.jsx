import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import axios from "axios";
import PlantUML from "plantuml-encoder";
import Constants from "../constants";

export default function DomainModel() {
    const [mapHtml, setMapHtml] = useState(undefined);

    const terms = useSelector(state => state?.context.terms);
    const termsLookup = useSelector(state => state?.context.termsLookup);
    const relations = useSelector(state => state?.context.relations);

    const encoded = PlantUML.encode(buildPlantUML(terms, termsLookup, relations));
    const imgSrc = `${Constants.plantUMLBase}/svg/${encoded}`;
    const mapSrc = `${Constants.plantUMLBase}/map/${encoded}`;

    useEffect(() => {
        axios.get(mapSrc).then((response) => {
            setMapHtml(response.data);
        });
    }, [mapSrc]);

    if (!mapHtml) {
        return <></>
    }

    // noinspection HtmlUnknownAnchorTarget,JSValidateTypes
    return (
        <>
            <img src={imgSrc} alt="Domain Model Diagram" useMap="src/components/DomainModel#plantuml_map"/>
            <div dangerouslySetInnerHTML={{__html: mapHtml}}/>
        </>
    )
}

/**
 * Builds the text required for generating a PlantUML diagram.
 * @param terms {Object[]}
 * @param termsLookup {Object}
 * @param relations {Object[]}
 * @returns {string}
 */
function buildPlantUML(terms, termsLookup, relations) {
    const enableStereotypes = true;
    const showLegend = false;

    const stereotypes = [
        {
            name: 'todo',
            back_colour: 'LightYellow/LightGoldenRodYellow',
            description: 'To be completed'
        }
    ];

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (term.todo) {
            term.stereotype = {name: 'todo'};
        }
    }

    // Header
    let result = '';
    result += '@startuml\n';
    result += `
'-------------------------------------------------------------------------------
'Terms
'-------------------------------------------------------------------------------\n`;

    // Ungrouped items
    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (!term.enabled) continue; // Skip disabled terms
        result += `rectangle ${term.classname}`;
        const name = term.stereotype?.name;
        if (name) result += ` <<${name}>>`;
        result += '\n';
    }

    // URLs
    result += `
'-------------------------------------------------------------------------------
'URLs
'-------------------------------------------------------------------------------\n`;
    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (!term.enabled) continue; // Skip disabled terms
        result += `url of ${term.classname} is [[#term-${term.classname}]]`;
        result += '\n';
    }

    // Connections
    result += `
'-------------------------------------------------------------------------------
'Connections
'-------------------------------------------------------------------------------\n`;
    for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        const from = termsLookup[relation.from_term_id];
        const to = termsLookup[relation.to_term_id];
        if (from.enabled && to.enabled) {
            result += buildConnection(relation, termsLookup);
        }
    }

    // Colours
    if (enableStereotypes) {
        result += `
'-------------------------------------------------------------------------------
'Stereotype colour style
'-------------------------------------------------------------------------------\n`;

        result += '<style>\n';

        for (const name in stereotypes) {
            const stereotype = stereotypes[name];
            // noinspection JSUnresolvedVariable
            result += `    .${stereotype.name} {
        BackgroundColor ${stereotype.back_colour}
    }\n`;
        }

        result += '</style>\n';

        // Legend
        if (showLegend) {
            result += `
'-------------------------------------------------------------------------------
'Colour legend
'-------------------------------------------------------------------------------\n`;
            result += 'legend\n';
            result += '    |= Colour |= Description |\n';

            for (const name in stereotypes) {
                const stereotype = stereotypes[name];
                // noinspection JSUnresolvedVariable
                const colour = stereotype.back_colour;
                const description = stereotype.description;
                result += `    | <#${colour}> | ${description} |\n`;
            }

            result += 'endlegend\n';
        }
    }

    // Configuration options
    result += `
'-------------------------------------------------------------------------------
'Configuration
'-------------------------------------------------------------------------------
left to right direction

skinparam rectangle {
    backgroundColor #fff/#eee
}

hide stereotype

skinparam defaultFontName DejaVu Sans\n`;

    // Footer
    result += '\n';
    result += '@enduml\n';

    if (Constants.logPlantUML) {
        console.log(result);
    }

    // NOTE: The following can be used to display fonts available.
    // result = '@startuml\nlistfonts\n@enduml';

    return result;
}

/**
 * Builds definition for a connection/relation between two terms.
 * @param relation {object}
 * @param termsLookup {object}
 * @returns {string}
 */
export function buildConnection(relation, termsLookup) {
    const from = termsLookup[relation.from_term_id];
    const to = termsLookup[relation.to_term_id];

    let conn = '--';

    // noinspection JSUnresolvedVariable
    const fromLabel = relation.multiplierByFromMultiplierId?.symbol;
    if (fromLabel) {
        conn = `\"${fromLabel}\" ${conn}`;
    }

    // noinspection JSUnresolvedVariable
    const toLabel = relation.multiplierByToMultiplierId?.symbol;
    if (toLabel) {
        conn = `${conn} \"${toLabel}\"`;
    }

    return `${from.classname} ${conn} ${to.classname}\n`;
}
