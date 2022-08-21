import React from "react";
import renderer from "react-test-renderer";
import ActionLink from "../components/actions/ActionLink";

it('matches snapshot', () => {
    const component = renderer.create(
        <ActionLink onClick={() => {}}>
            Name
        </ActionLink>
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
