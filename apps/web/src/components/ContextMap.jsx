import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import PlantUML from "plantuml-encoder";
import axios from "axios";
import Constants from "../constants";

export default function ContextMap() {
    const [mapHtml, setMapHtml] = useState(undefined);

    const modelId = useSelector(state => state?.model.id);
    const contexts = useSelector(state => state?.model.contexts);
    const contextsLookup = useSelector(state => state?.model.contextsLookup);
    const connections = useSelector(state => state?.model.connections);

    const encoded = PlantUML.encode(buildPlantUML(modelId, contexts, contextsLookup, connections));
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
            <img src={imgSrc} alt="Domain Model Diagram" useMap="src/components/ContextMap#plantuml_map"/>
            <div dangerouslySetInnerHTML={{__html: mapHtml}}/>
        </>
    )
}

/**
 * Builds the text required for generating a PlantUML diagram.
 * @param modelId {string}
 * @param contexts {Object[]}
 * @param contextsLookup {Object}
 * @param connections {Object[]}
 * @returns {string}
 */
function buildPlantUML(modelId, contexts, contextsLookup, connections) {

    // Header
    let result = '';
    result += '@startuml\n';
    result += `
'-------------------------------------------------------------------------------
'Contexts
'-------------------------------------------------------------------------------\n`;
    for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        context.id = `context${i + 1}`;
        result += `storage \"${context.name}\" as ${context.id}`;
        result += '\n';
    }

    // URLs
    result += `
'-------------------------------------------------------------------------------
'URLs
'-------------------------------------------------------------------------------\n`;
    for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        const url = `/models/${modelId}/contexts/${context.context_id}`;
        result += `url of ${context.id} is [[#context-${encodeURIComponent(url)}]]`;
        result += '\n';
    }

    // Connections
    result += `
'-------------------------------------------------------------------------------
'Connections
'-------------------------------------------------------------------------------\n`;
    for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        const from = contextsLookup[connection.from_context_id];
        const to = contextsLookup[connection.to_context_id];
        result += `${from.id} -[#RoyalBlue]-|> ${to.id}\n`;
    }

    // Configuration options
    result += `
'-------------------------------------------------------------------------------
'Configuration
'-------------------------------------------------------------------------------
left to right direction

skinparam storage {
    backgroundColor White
    fontColor RoyalBlue
    borderColor RoyalBlue
}

skinparam arrowColor SeaGreen

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
