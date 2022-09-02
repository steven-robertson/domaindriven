import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import {Titled} from "react-titled";
import {sep} from "../../constants";

export default function Help() {
    return (
        <Titled title={(s) => `Help ${sep} ${s}`}>
            <Overview/>
            <DomainDrivenDesign/>
            <Markdown/>
        </Titled>
    )
}

function Overview() {
    return (
        <>
            <h1>Quick Overview</h1>
            <p>
                This web-application supports collaborative Domain Models.
            </p>
            <OverviewModels/>
            <OverviewTerms/>
            <OverviewRelations/>
            <OverviewSpaces/>
            <OverviewGroupedTerms/>
        </>
    )
}

function OverviewModels() {
    return (
        <ReactMarkdown>
            {`
## Models

Each model is a Domain Model, with defined terms, and the relation of those terms to each other.
                `}
        </ReactMarkdown>
    )
}

function OverviewTerms() {
    return (
        <ReactMarkdown>
            {`
## Terms

Terms describe concepts that are relevant to the Domain Model.
Together, terms define a *Ubiquitous Language*.

### Special features to support terms

* Incomplete/undefined terms can be highlighted.
* Terms can be disabled, so that they are removed from the diagram.
  * Note that disabled terms are listed below enabled terms.
  * Definitions for disabled terms are hidden.
  * Disabled terms are faded, but the action links are still available.
                `}
        </ReactMarkdown>
    )
}

function OverviewRelations() {
    return (
        <ReactMarkdown>
            {`
## Relations

Terms are related using relations. A relation connects one term to another term.

Each end of a relation can [optionally] show a symbol for multiplicity of the term/concept on that end
of the relationship.
                `}
        </ReactMarkdown>
    )
}

function OverviewSpaces() {
    return (
        <ReactMarkdown>
            {`
## Spaces

To support collaboration, models are owned by spaces - not people.

Every person has a Personal space which is the default space when creating new models.

You can move models between spaces, so long as you are a member of the spaces involved.
                `}
        </ReactMarkdown>
    )
}

function OverviewGroupedTerms() {
    return (
        <ReactMarkdown>
            {`
## Grouped Terms

Term groups allow for terms to be completely hidden from view.

Note that group selection is not saved to the database, and not shared between viewers.

### Special features to support grouped terms

* If no term groups are enabled, then all terms are available.
* If any term groups are enabled, then:
  * Only the combined set of terms in those groups are available.
  * Any new terms added will also be added to the enabled groups.
* Selecting the checkbox with the middle mouse-button, or clicked while pressing the Control key will
disable other term groups except the one selected. This is useful for switching between groups.
                `}
        </ReactMarkdown>
    )
}

function DomainDrivenDesign() {
    return (
        <ReactMarkdown>
            {`
# Domain-Driven Design

## Ubiquitous Language

[Developing the ubiquitous language](https://thedomaindrivendesign.io/developing-the-ubiquitous-language/):
> *Ubiquitous Language* is the term that Eric Evans uses 
> in *“Domain-Driven Design – Tackling Complexity in the Heart of Software”* in order to build a language 
> shared by the team, developers, domain experts, and other participants.

> Characteristics of the *Ubiquitous Language*:
> 
> * *Ubiquitous Language* must be expressed in the Domain Model.
> * *Ubiquitous Language* unites the people of the project team.
> * *Ubiquitous Language* eliminates inaccuracies and contradictions from domain experts.
> * *Ubiquitous Language* is not a business language imposed by domain experts.
> * *Ubiquitous Language* is not a language used in industries.
> * *Ubiquitous Language* evolves over time, it is not defined entirely in a single meeting.
> * Concepts that are not part of the *Ubiquitous Language* should be rejected.
                `}
        </ReactMarkdown>
    )
}

function Markdown() {
    return (
        <>
            <ReactMarkdown>
                {`
# Markdown

You can use markdown syntax when entering definitions for terms.

See [CommonMark Help](https://commonmark.org/help/) for a quick introduction!

## GitHub flavoured markdown

This is a popular variant of markdown used by GitHub which is also generally supported here.

See the guide "[Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)"
for extensive help with GitHub-flavoured markdown.
                `}
            </ReactMarkdown>
            <h3>KaTeX</h3>
            <p>
                This is useful when you want to use <span className="latex">L<sup>a</sup>T<sub>e</sub>X</span> maths.
            </p>
            <p>
                The following markdown text is used to enter maths formula:
            </p>
            <div className="code-block">
                <code>{katexExample}</code>
            </div>
            <p>
                This is how it will look when viewed on the page:
            </p>
            <div className="code-block-example-output">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath, remarkRehype]}
                    rehypePlugins={[rehypeKatex]}>
                    {katexExample}
                </ReactMarkdown>
            </div>
        </>
    )
}

const katexExample = `Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following
equation.

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$`;
