import { LOGLEVELS } from './logger.js'
export function printHelp(error) {
    console.log('Algolia GitHub Document scraper - used to scrape the basic information and README.md of top GitHub repositories and store them in an Algolia index for searching.\nUsage:\n\tShort arg\tLong arg\t\tDescription');
    // console.log('\t-a\t\t--app\t\t(Required) The Luid of the Qlik application from the URL');
    // console.log('\t-s\t\t--sheet\t\t(Required) The Luid of the Qlik sheet from the URL');
    // console.log('\t-c\t\t--cookie\t(Required) The value of the authentication (X-Qlik-Session-azuresaml) cookie. This is also a Luid.');
    // console.log('\t-d\t\t--dashboardid\t(Required) The value of the dashboard (BIGipServerdashboard.hcl.com) cookie. This is a number separated by 2 dots.');
    // console.log('\t-t\t\t--chart\t\t(Optional) The name of the chart to get the data of. If a single chart is on the sheet, this is ignored. Otherwise if not provided then the list of possibilities are printed and the app exits.');
    // console.log('\t-o\t\t--output\t(Optional, default: output.csv) The output CSV file.');
    // console.log(`\t-e\t\t--separator\t(Optional, default: |) The CSV separator to use. Use 'TAB' for tab`);

    console.log(`\t-a\t\t--algolia-app-id\t(Required) The Application ID of your Algolia Application`);
    console.log(`\t-k\t\t--algolia-api-key\t(Required) The Admin API key of your Algolia Application`);
    console.log(`\t-i\t\t--algolia-index\t\t(Required) The name of the Algolia index to populate with the repository data`);
    console.log(`\t-c\t\t--record-count\t\t(Optional, default: 5000) The number of records to insert in the Algolia index. GitHub Repos with non-existent README.md file will be ignored`)
    console.log(`\t-l\t\t--loglevel\t\t(Optional, default: info) The minimum log level to display. Values: ${LOGLEVELS.join(', ')}`);
    console.log('\t-h\t\t--help\t\t\tPrints this help')

    if (error) {
        console.log(`\nError: ${error}`);
    }
}
export function parseArgument(shortArg, longArg, defaultValue, extraValidation) {
    const args = process.argv.slice(2);
    let i = args.indexOf(`-${shortArg}`);
    if (i === -1) {
        i = args.indexOf(`--${longArg}`);
    }
    if (i === -1 || args.length <= i + 1) {
        if (defaultValue) {
            return defaultValue;
        } else {
            printHelp(`Argument -${shortArg} (--${longArg}) not found`);
            process.exit(1);
        }
    }
    const val = args[i + 1];
    if (extraValidation) {
        const err = extraValidation(val);
        if (err) {
            printHelp(`Argument -${shortArg} (--${longArg}) invalid: ${err}`);
            process.exit(1);
        }
    }
    return val;
}