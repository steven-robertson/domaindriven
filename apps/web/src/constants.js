// noinspection JSUnresolvedVariable
const isDev = DEBUG || false;
const devLogging = false;

let hostname;
let protocol;
if (!isDev) {
    hostname = "domaindriven.dev";
    protocol = "https";
} else if (CODESPACE_NAME && GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    hostname = `${CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
    protocol = "https";
} else {
    hostname = "localhost:8080";
    protocol = "http";
}

const hasuraBase = `${hostname}/api`;
const authBase = `${protocol}://${hostname}/auth`;

// NOTE: The following dev URL requires the plantuml-cors-proxy npm task to be running.
//       This is used to work around the issue with CORS for PlantUML map (when using URLS)
const plantUMLBase = `${protocol}://${hostname}/plantuml`;

const props =  {
    authBase,
    graphQlEndpoint: `${protocol}://${hasuraBase}/v1/graphql`,
    graphQlSubscriptionEndpoint: `${protocol === 'https' ? 'wss' : 'ws'}://${hasuraBase}/v1/graphql`,
    isDev,
    logActions: isDev && devLogging,
    logPlantUML: isDev && devLogging,
    logSubs: isDev && devLogging,
    plantUMLBase,
    siteName: 'Domain-Driven',
    titleSep: '|'
}

export default props;

export const sep = '|';
