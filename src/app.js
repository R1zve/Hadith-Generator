import {scrape} from "./scraper.m.js";
var db = false;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const generate_hadith = async function() {
  db = true;
  const chapter = document.querySelector("#chapter");
  const narrated = document.querySelector("#narrated");
  const hadith = document.querySelector("#hadith");
  const bukhari = document.querySelector("#bukhari");
  chapter.textContent = "Loading...";
  narrated.textContent = "Loading...";
  hadith.textContent = "Loading...";
  bukhari.textContent = "Bukhari : [...]";
  let bukhari_number = Math.floor(Math.random() * 7563);
  const halal_stuff = await scrape("https://sunnah.com/bukhari:" + bukhari_number);
  chapter.textContent = halal_stuff.chapter;
  narrated.textContent = halal_stuff.hadith_narrated;
  hadith.textContent = halal_stuff.hadith;
  bukhari.textContent = "Bukhari : " + bukhari_number;
  sleep(7e3);
  db = false;
};
window.onload = () => {
  const button = document.querySelector("#add");
  generate_hadith();
  button?.addEventListener("click", () => {
    if (!db) {
      generate_hadith();
    }
  });
};
