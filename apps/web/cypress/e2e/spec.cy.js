describe('My First Test', () => {
    it('Log in using Auth0', () => {
        cy.visit('http://localhost:8008/');

        // TODO: Login via Auth0?
        // NOTE: Workaround has been to bypass SAML in Auth service when running in DEBUG.
        // cy.origin('https://domaindriven.eu.auth0.com/', () => {
        //     cy.get('#username').type('<username>');
        //     cy.get('#password').type('<password>');
        //     cy.get('button[type="submit"]').click();
        // });

        // Add model.
        cy.get('.action-link').contains('Add new model').click();
        cy.get('div.ReactModalPortal input[name="name"]').type('Test');
        cy.get('div.ReactModalPortal input[type="submit"]').click();

        // Add term A to model.
        cy/*.get('.action-link')*/.contains('Add term').click();
        cy.get('div.ReactModalPortal input[name="name"]').type('A');
        cy.get('div.ReactModalPortal input[type="submit"]').click();

        // Add term B to model.
        cy/*.get('.action-link')*/.contains('Add term').click();
        cy.get('div.ReactModalPortal input[name="name"]').type('B');
        cy.get('div.ReactModalPortal input[type="submit"]').click();

        // Add relation between term A and term B.
        cy/*.get('.action-link')*/.contains('Add relation').click();
        // cy.get('div.ReactModalPortal input[name="name"]').type('B');
        // cy.get('div.ReactModalPortal input[type="submit"]').click();

    })
})