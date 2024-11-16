import ky from 'ky';
import * as cheerio from "cheerio";

const cookie = process.env.ETHGLOBAL_COOKIE
const ORIGIN = "https://ethglobal.com";

// Function to transpile a webpage and extract user data
async function transpilePage(apiUrl: string) {
  let extractedUser = null;

  try {
    // Fetch the webpage content
    const responseHtml = await ky.get(apiUrl, {
      headers: {
        Cookie: cookie,
        Origin: ORIGIN,
      },
    }).text();

    // Parse the HTML using Cheerio
    const $ = cheerio.load(responseHtml);

    // Iterate through all <script> tags to find relevant JSON data
    const scriptTags = $("script").toArray();
    console.log("Number of <script> tags:", scriptTags.length);

    for (const scriptTag of scriptTags) {
      const scriptContent = $(scriptTag).html();

      if (scriptContent && scriptContent.includes("uuid")) {
        extractedUser = await extractJson(scriptContent);
        if (extractedUser) break;
      }
    }
  } catch (error) {
    console.error("Error while processing the page:", error);
  }

  return extractedUser;
}

// Function to extract and parse JSON from a string
async function extractJson(scriptContent: string) {
  const UUID_REGEX = /\/connect\/([\w-]+)/;

  try {
    // Clean up the string for parsing
    const sanitizedContent = scriptContent.replace(/\\\\"/g, '"').replace(/\\\\/g, "\\");

    // Find the UUID using regex
    const match = sanitizedContent.match(UUID_REGEX);
    if (!match || !match[1]) throw new Error("UUID not found in the script content.");

    // Fetch the connected page using the extracted UUID
    const connectedPageHtml = await ky.get(`https://ethglobal.com/connect/${match[1]}`, {
      headers: {
        Cookie: cookie,
        Origin: ORIGIN,
      },
    }).text();

    // Parse the connected page HTML
    const $ = cheerio.load(connectedPageHtml);
    const scriptTags = $("script").toArray();

    for (const scriptTag of scriptTags) {
      const scriptContent = $(scriptTag).html();

      if (scriptContent && scriptContent.includes("bio")) {
        // Extract JSON object from the script content
        const jsonStartIndex = scriptContent.indexOf("{");
        const jsonEndIndex = scriptContent.lastIndexOf("}");

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          throw new Error("JSON object not found in the script content.");
        }

        const jsonString = scriptContent.slice(jsonStartIndex, jsonEndIndex + 1);

        // Parse the JSON data
        let parsedJson;
        try {
          parsedJson = JSON.parse(JSON.parse(`"${jsonString}"`));
        } catch (error) {
          throw new Error("Failed to parse JSON data.");
        }

        return parsedJson["user"];
      }
    }
  } catch (error) {
    console.error("Error extracting JSON:", error);
  }

  return {};
}

export { transpilePage };
