// noinspection JSUnresolvedVariable
const isDev = DEBUG || false;
const devLogging = false;

const domain = 'domaindriven.dev';
const hasuraBase = `${domain}/api`;
const authBase = isDev ? 'http://localhost:5003' : `https://${domain}/auth`;

// NOTE: The following dev URL requires the plantuml-cors-proxy npm task to be running.
//       This is used to work around the issue with CORS for PlantUML map (when using URLS)
const plantUMLBase = isDev ? 'http://localhost:8081' : `https://${domain}/plantuml`;

const props =  {
    authBase,
    graphQlEndpoint: `https://${hasuraBase}/v1/graphql`,
    graphQlSubscriptionEndpoint: `wss://${hasuraBase}/v1/graphql`,
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
