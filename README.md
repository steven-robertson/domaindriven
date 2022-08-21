# DomainDriven

## Development

### GraphQL Configuration

Using the GraphQL JS plugin for WebStorm. Download the schemas for the two endpoints using the GraphQL JS UI.

Create a file named `.graphqlconfig` with the following:

```json
{
  "name": "Hasura GraphQL Schema",
  "schemaPath": "schema.graphql",
  "extensions": {
    "endpoints": {
      "Default GraphQL Endpoint": {
        "url": "https://dev.domaindriven.dev/api/v1/graphql",
        "headers": {
          "user-agent": "JS GraphQL",
          "x-hasura-admin-secret": "<secret>"
        },
        "introspect": false
      }
    }
  }
}
```

### Local services (required)

#### Auth

Local authentication is provided through a ASP.NET Core Auth solution.

#### PlantUML

Run the PlantUML Server locally to generate images from text.

```bash
docker run \
  --publish=8080:8080 \
  --restart=always \
  --detach=true \
  --name=plantuml \
  plantuml/plantuml-server:jetty
```
