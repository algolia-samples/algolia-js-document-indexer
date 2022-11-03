import { log } from './logger.js';
import { parseArgument } from './cli.js';
import algoliasearch from 'algoliasearch';


export const algolia = function() {

    let client;
    let index;
    async function initializeAndTest() {
        const appId = parseArgument('a', 'algolia-app-id');
        const apiKey = parseArgument('k', 'algolia-api-key');
        const indexName = parseArgument('i', 'algolia-index');
        log.i(`Initializing Algolia client with AppId: ${appId} for index: '${indexName}'`);

        log.v('Initializing client')
        const c = algoliasearch(appId, apiKey);
       
        log.v('Initializing index')
        const i = c.initIndex(indexName);

        log.v('Clearing index');
        await algoliaOp(i.clearObjects(), 'Failed to initialize Algolia index. Deleting current records failed');
      
        log.i('Algolia connection successful');
        client = c;
        index = i;
    }


    async function prepareIndex() {
        log.i('Configuring the Algolia index');
        const settingsObj = {
            searchableAttributes: [
                'name,full_name',
                'description,ownerLogin,ownerUrl', 
                'url,homePage',
                'language,topicsList',
                'readme'
            ],
            attributesForFaceting: [
                'private', 'watchers', 'forks', 'score', 'default_branch', 'topics', 'language'
            ],
            attributesToRetrieve: [
                'id', 'order', 'totalCount', 'topicsList', 'name', 'full_name', 'readme', 'private', 'description', 'url', 'ownerId', 'ownerLogin', 'ownerUrl', 'homePage', 'watchers', 'forks', 'language', 'license', 'topics', 'score', 'default_branch' 
            ],
            ranking: [
                'desc(watchers)',
                'typo',
                'words',
                'filters',
                'proximity',
                'attribute',
                'exact',
                'custom'
            ],
            ignorePlurals: true,
            attributeForDistinct: 'name',
            distinct: true
        };
        log.v(`Algolia index settings: ${JSON.stringify(settingsObj)}`);
        await algoliaOp(index.setSettings(settingsObj), 'Failed to configure Algolia index');
    }


    async function clearRecords() {
        log.i('Clearing existing records from the Algolia index');
        await algoliaOp(index.clearObjects(), 'Failed to clear records from index');
    }

    async function appendRecords(records) {
        log.v('Appending into Algolia');
        await algoliaOp(index.saveObjects(records), 'Failed to insert records into Algolia');

    }


    async function algoliaOp(promise, errorMessage) {
        try {
            return await promise;
        } catch (e) {
            if (e.name === 'ApiError') {
                log.f(errorMessage, new Error(e.message));
            } else {
                log.f(errorMessage, JSON.stringify(e));
            }
        }
    }



    return {
        initializeAndTest,
        prepareIndex,
        clearRecords,
        appendRecords
    }

}();