# Algolia MongoDB Listings Application

This repository contains the local files for the sample Algolia Document indexer application that is explained as part of a blogpost series.
It implements a document indexer & search application that can be used search in project documentation, essentially finding projects that were done in a specific technology, topic or containis specific domain knowledge that we might be looking for.
This demo implementation scrapes the top GitHub repositories, stores their README.md in Algolia and makes them searchable.

## Features

- A [NodeJS script](indexer/index.js) to scrape the top GitHub repositories and store their basic information and documentation in an Algolia index. The relevant Algolia code is contained in the [algolia.js](indexer/algolia.js).
- A [Web application frontend](frontend/) to query the Algolia index directly and display search results

## Algolia Index loading

To try the loading of the Algolia index based on the sample dataset, you need an Algolia API key, which you can obtain by:
1. [Registering](https://www.algolia.com/users/sign_up) for a free Algolia account, or [Logging in](https://www.algolia.com/users/sign_in) to your existing account
2. After signing in, an Algolia Application will automatically be created for you. You can either use the default (unnamed) application, or create a new application
3. Go to your [API Keys](https://www.algolia.com/account/api-keys/all) section of your application and retrieve your **Application ID** and **Admin API Key**
You will need to use both the **Application ID** and **Admin API Key** in when connecting your Algolia account from the Python code below
4. Clone this repo
5. Navigate into the indexer folder and run `npm install`
6. Run the script by calling `node index.js -a [Algolia AppId] -k [Algolia ApiKey] -i [Algolia index name]`. The full list of command line options can be displayed either by calling the app with no arguments (`node index.js`) or calling it with the `-h` or `--help` switches.


The script will: 
1. Connect to Algolia index using your credentials and validate the connection
2. Start enumerating the top GitHub repositories using the GitHub API
3. Prepare the Algolia index
3. Load the dataset into Algolia from GitHub and replace the existing index

## Testing the demo application

You can also easily try out the Search Web Application by either:
- opening the [StackBlitz]() hosted version of the application on the cloud. This contains both the source and the created application and allows you to make modifications and see the changes real-time.
- opening the [local](frontend/) files for the web application. You will need to run **npm install** and **npm start** from the *frontend* directory to run the app.

