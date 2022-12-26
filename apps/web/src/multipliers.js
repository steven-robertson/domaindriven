import gql from "graphql-tag";
import {gqlFetch} from "./graphql_fetch";

/**
 * @type {Object[]|undefined}
 */
let multipliers = undefined;

/**
 * @param userId {string}
 * @return {Promise<Object[]>}
 */
export async function getMultipliers(userId) {

    // Return cached result when available.
    if (multipliers) {
        return multipliers;
    }

    const query = gql`
        query {
            multiplier(order_by: {symbol: asc}) {
                multiplier_id
                symbol
            }
        }
    `;

    const response = await gqlFetch(userId, query, undefined, undefined);

    // noinspection JSUnresolvedVariable
    console.assert(response.data?.multiplier, response);

    // noinspection JSUnresolvedVariable
    if (response.data?.multiplier) {

        // Cache the result of the query for next calls to this function.
        // noinspection JSUnresolvedVariable
        multipliers = response.data.multiplier;
    }

    return multipliers;
}
