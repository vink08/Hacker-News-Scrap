// const axios = require('axios');
// const cheerio = require('cheerio');
// const connection = require('../config/db');

// let isScraping = false;

// async function scrapeHackerNews() {
//     if (isScraping) {
//         console.log('Scraping is already in progress.');
//         return [];
//     }
//     isScraping = true;
//     console.log(`Starting scrape at ${new Date()}`);

//     try {
//         const response = await axios.get('https://news.ycombinator.com/', {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//             }
//         });

//         const $ = cheerio.load(response.data);
//         const stories = [];
//         $('tr.athing').each((i, element) => {
//             try {
//                 const titleElement = $(element).find('td.title > span.titleline > a').first();
//                 const title = titleElement.text().trim();
//                 const url = titleElement.attr('href');

//                 if (title && url) {
//                     const story = {
//                         title,
//                         url,
//                         posted_at: new Date()
//                     };
//                     stories.push(story);

//                     const query = 'INSERT IGNORE INTO stories (title, url, posted_at) VALUES (?, ?, ?)';
//                     connection.query(query, [story.title, story.url, story.posted_at], (err) => {
//                         if (err) {
//                             console.error('Error saving to DB:', err);
//                         } else {
//                             console.log('Saved story:', story.title);
//                         }
//                     });
//                 }
//             } catch (err) {
//                 console.error('Error processing story:', err);
//             }
//         });

//         console.log(`Scraping completed. Found ${stories.length} stories.`);
//         isScraping = false;
//         return stories;
//     } catch (error) {
//         console.error('Error scraping Hacker News:', error);
//         isScraping = false;
//         return [];
//     }
// }



const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/db');

let isScraping = false;

async function scrapeHackerNews() {
    if (isScraping) {
        console.log('Scraping is already in progress.');
        return [];
    }
    
    isScraping = true;
    console.log(`Starting scrape at ${new Date()}`);

    try {
        const response = await axios.get('https://news.ycombinator.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const stories = [];
        const connection = await pool.getConnection();

        try {
            $('tr.athing').each((i, element) => {
                const titleElement = $(element).find('td.title > span.titleline > a').first();
                const subtext = $(element).next();
                const points = parseInt(subtext.find('span.score').text()) || 0;
                const title = titleElement.text().trim();
                const url = titleElement.attr('href');

                if (title && url) {
                    stories.push({
                        title,
                        url,
                        points,
                        posted_at: new Date()
                    });
                }
            });

            // Batch insert stories
            if (stories.length > 0) {
                const query = 'INSERT IGNORE INTO stories (title, url, points, posted_at) VALUES ?';
                const values = stories.map(s => [s.title, s.url, s.points, s.posted_at]);
                await connection.query(query, [values]);
                console.log(`Saved ${stories.length} stories to database`);
                stories.forEach((story, index) => {
                    console.log(`${index + 1}. Title: ${story.title}, URL: ${story.url}, Points: ${story.points}`);
                });
            }

            return stories;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error scraping Hacker News:', error);
        return [];
    } finally {
        isScraping = false;
    }
}

module.exports = scrapeHackerNews;