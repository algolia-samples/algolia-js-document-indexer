import { parseArgument } from './cli.js';
import { log } from './logger.js';
import fetch from 'node-fetch';
import showdown from 'showdown';

// This file contains the logic which is used to enumerate the top GitHub repositories with their data
const REPO_COUNT = parseArgument('c', 'repo-count', 5000);

// This is an async generator function that will enumerate the details of each GitHub repo. This is called from our main code
export async function* enumerateRepositories() {
    log.i(`Starting to enumerate the top GitHub repositories`);
    
    const converter = new showdown.Converter();
    // the number of repositories that we have returned
    let returned_count = 0;

    // we have to do the search in 2 loops: iteration and pagination
    // iteration: a single search query for GitHub supports 1000 search results
    // pagination: a single returned page for GitHub supports 100 items per page
    // Therefore: we will construct a new GitHub query for every 1000 records, with every query searching for repositories with less stars then the lowest star count repository from the previous iteration
    // For every query, we will iterate through all the pages
    const per_page = 100;
    const max_pages_per_interation = 10;

    let starsParameter = '>1';
    while (returned_count < REPO_COUNT) {
        let current_page = 1;
        let lowestStarCount = undefined;
        while (current_page <= max_pages_per_interation && returned_count < REPO_COUNT) {
            // perform the api request to retrieve the current page of results
            const api_result = await gitHubRequest(starsParameter, per_page, current_page);
            let repo_infos = api_result.items.map(repo => ({
                objectID: repo.id,
                name: repo.name,
                full_name: repo.name,
                private: repo.private,
                description: repo.description,
                url: repo.html_url,
                ownerId: repo.owner?.id,
                ownerLogin: repo.owner?.login,
                ownerUrl: repo.owner?.url,
                homePage: repo.homepage,
                watchers: repo.watchers,
                forks: repo.forks,
                language: repo.language,
                license: repo.license,
                topics: repo.topics,
                score: repo.score,
                default_branch: repo.default_branch
            }));
            // filter out the repositories that miss an owner
            const missingOwner = repo_infos.filter(e => !e.ownerLogin);
            if (missingOwner.length > 0) {
                log.v(`Skipping the following repositories as they have no owner: ${missingOwner.map(e => e.name).join(', ')}`);
                repo_infos = repo_infos.filter(e => e.ownerLogin);
            }
            const possibleReadMeFileNames = ['README.md', 'Readme.md', 'ReadMe.md', 'readme.md'];
            // get the promises to retrieve the README.md for each repository. We will try all the names in the possibleReadMeFileNames -> the name is case sensitive.
            // we go for a trial-error approach, because enumerating the file names in the repository to get the correct name would cause us to hit GitHub repo rate limits
            const readmePromises = repo_infos.map(async repo => {
                for (const readmeFileName of possibleReadMeFileNames) {
                    const content = await readmeMdRequest(repo, readmeFileName);
                    if (content) {
                        // convert markdown to html
                        const html = converter.makeHtml(content);
                        repo.readme_content = [];
                        let cur = 0;
                        let sliceSize = 50000;
                        while (true) {
                            if (cur >= html.length) {
                                break;
                            }
                            const slice = html.substring(cur, cur + sliceSize);
                            repo.readme_content.push(slice);
                            cur += sliceSize;
                        }
                        // shorten the readme content for simplicity
                        // if (repo.readme_content.length > 50000) {
                        //     repo.readme_content = repo.readme_content.substring(0, 50000);
                        // }
                        return;
                    }
                }
            });
            // wait for all readmes to download for all repositories
            await Promise.all(readmePromises);
    
            const missingReadmes = repo_infos.filter(e => !e.readme_content || e.readme_content.length === 0);
            if (missingReadmes.length > 0) {
                log.v(`The following repositories are missing README.md files, skipping them: ${missingReadmes.map(e => e.name).join(', ')}`);
                repo_infos = repo_infos.filter(e => e.readme_content);
            }
            for (const repo of repo_infos) {
                if (returned_count >= REPO_COUNT) {
                    break;
                }
                for (let i = 0; i < repo.readme_content.length; i++) {
                    const repoObject = {
                        ...repo
                    };
                    delete repoObject.readme_content;
                    repoObject.readme = repo.readme_content[i];
                    repoObject.order = i;
                    repoObject.objectID = `${repo.objectID}_${i}`;
                    repoObject.topicsList = (repo.topics || []).join(', ');
                    repoObject.ownerUrl = (repo.ownerUrl || '').replace('api.github.com', 'github.com');
                    repoObject.totalCount = Math.max(0, repo.readme_content.length);
                    yield repoObject;
                    returned_count++;
                    if (returned_count >= REPO_COUNT) {
                        break;
                    }
                }
            }
            current_page++;
            lowestStarCount = Math.min(...repo_infos.map(e => e.watchers));
        }
        starsParameter = `<${lowestStarCount}`;
    }


}

async function gitHubApiBaseRequest(url) {
    let response;
    try {
        response = await fetch(url);
    } catch (e) {
        log.f(`GitHub API request failed`, e);
    }
    if (response.status === 403) {
        log.v('Hit GiHub API rate limit - waiting 10 seconds and trying again');
        await new Promise(r => setTimeout(() => r(), 10000));
        return await gitHubApiBaseRequest(url);
    }
    try {
        return await response.json();
    } catch (e) {
        log.f('Failed to parse GitHub API response to JSON', e);
    }
}
// performs a GitHub API request to retrieve repository data. Exits the application if the API request fails
async function gitHubRequest(starsQuery, per_page, current_page) {
    const url = `https://api.github.com/search/repositories?q=stars:${encodeURI(starsQuery)}&sort=stars&per_page=${per_page}&page=${current_page}`;
    log.v(`Requesting GitHub Repositories on URL: ${url}`);
    return await gitHubApiBaseRequest(url);
}
async function readmeMdRequest(repo, readmeFileName) {
    const markdownUrl = `https://raw.githubusercontent.com/${repo.ownerLogin}/${repo.name}/${repo.default_branch}/${readmeFileName}`;
    log.v(`Requesting README.md for repository: ${repo.name} on URL: ${markdownUrl}`);
    return await fetch(markdownUrl).then(async res => {
        switch (res.status) {
            case 200:
                return await res.text();
            case 404:
                log.v(`${readmeFileName} not found for repository: ${repo.name}`);
                return undefined;
            default: log.f(`Failed to parse the README.md file for repo: ${repo.name}. Code: ${res.status}`);
                return;
        }
    });
}
