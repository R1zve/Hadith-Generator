import axios from "src/pkg/axios.v1.6.7.js";
import * as cheerio from "src/pkg/cheerio.v1.0.0-rc.12.js";
export async function scrape(url) {
  const response = await axios.get("https://corsproxy.io/?" + url);
  const selector = cheerio.load(response.data);
  return {
    chapter: selector(".englishchapter").text(),
    hadith_narrated: selector(".hadith_narrated").text(),
    hadith: selector(".text_details").text()
  };
};
