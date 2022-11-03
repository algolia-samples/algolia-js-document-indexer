import { printHelp, parseArgument } from './cli.js';
import { enumerateRepositories } from './github-api.js';
import { log } from './logger.js';
import { algolia } from './algolia.js';

if (process.argv.length === 0|| process.argv.includes('-h') || process.argv.includes('--help')) {
    printHelp();
    process.exit(0);
}

// async wrapper around running the app to enable await
(async () => {
    // unhandled error try catch (handled errors exit the app)
    try {
        await algolia.initializeAndTest();
        await algolia.prepareIndex();
        await algolia.clearRecords();
        
        // start retrieving the repo information from GitHub and store it in the current_repos variable.
        // when current_repos reaches a 100 items or we've done getting the repos from github, append them to the Algolia index
        let current_repos = [];
        let insertedIntoAlgolia = 0;
        // define the function which will append the current repos into Algolia
        async function appendCurrentRepos() {
            if (current_repos.length === 0) {
                return;
            }
            await algolia.appendRecords(current_repos);
            insertedIntoAlgolia += current_repos.length;
            log.i(`Inserted ${current_repos.length} into Algolia. Total count: ${insertedIntoAlgolia}`);
            current_repos = [];
        }

        // start enumerating through the GitHub repositories and append them into Algolia 100 at a time
        for await (const repo_info of enumerateRepositories()) {
            current_repos.push(repo_info);
            if (current_repos.length >= 100) {
                await appendCurrentRepos();
            }
        }
        await appendCurrentRepos();

       

    } catch (e) {
        log.f('An unhandled error occured', e);
    }
})();