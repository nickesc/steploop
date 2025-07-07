import * as fs from 'fs';
import * as path from "path";

// Get command line arguments
const args = process.argv.slice(2);

// Check if we have the required arguments
if (args.length < 2) {
    console.error('Usage: node script.js <api_links.json> <documentation.md>');
    console.error('Example: node script.js docs/api_links.json docs/documentation.md');
    process.exit(1);
}

const apiLinksPath = path.resolve(args[0]);
const docPath = path.resolve(args[1]);

// Validate that files exist
if (!fs.existsSync(apiLinksPath)) {
    console.error(`Error: API links file not found: ${apiLinksPath}`);
    process.exit(1);
}
if (!fs.existsSync(docPath)) {
    console.error(`Error: Documentation file not found: ${docPath}`);
    process.exit(1);
}

try {
    // Read the files
    const apiLinksStr = fs.readFileSync(apiLinksPath, 'utf-8');
    let docContent = fs.readFileSync(docPath, 'utf-8');

    // Parse the JSON
    const apiLinks = JSON.parse(apiLinksStr);
    const replacements = apiLinks.replace;

    if (!replacements || !Array.isArray(replacements)) {
        console.error('Error: Invalid JSON structure. Expected "replace" array in JSON file.');
        process.exit(1);
    }

    let totalReplacements = 0;

    // Perform the replacements
    for (const replacement of replacements) {
        for (const [key, value] of Object.entries(replacement)) {
            // Use a regular expression with the 'g' flag to replace all instances
            // Escape special regex characters from the key
            const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedKey, 'g');

            // Count occurrences before replacement
            const matches = docContent.match(regex);
            const count = matches ? matches.length : 0;

            if (count > 0) {
                docContent = docContent.replace(regex, value);
                console.log(`Replaced ${count} occurrence(s) of "${key}" with "${value}"`);
                totalReplacements += count;
            }
        }
    }

    // Write the updated content back to the documentation file
    fs.writeFileSync(docPath, docContent, 'utf-8');
    console.log(`\nDocumentation updated successfully!`);
    console.log(`Total replacements made: ${totalReplacements}`);
    console.log(`Updated file: ${docPath}`);

} catch (error) {
    console.error('Error updating documentation:', error.message);
    process.exit(1);
}
