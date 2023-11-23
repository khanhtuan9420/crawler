const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const crawlAndSaveToJson = async () => {
    try {
        const playerData = [];
        // Lấy số trang tối đa
        const maxPageNumber = await getMaxPageNumber();
        for (let page = 1; page <= maxPageNumber; page++) {
            const response = await axios.get(`https://www.transfermarkt.com/premier-league/marktwerte/wettbewerb/GB1/ajax/yw1/pos//detailpos/0/altersklasse/alle/page/${page}?ajax=yw1`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                },
            });
            const $ = cheerio.load(response.data);

            // Các bước để phân tích dữ liệu
            $('#yw1 > table > tbody > tr').each((index, row) => {
                let playerName = null
                let nation = null
                let age = null
                let club = null
                let marketValue = null

                const secondTd = $(row).children('td').eq(1);

                // Lọc thẻ <a> trong thẻ <td> thứ hai
                const anchor = secondTd.find('a');

                // Lấy nội dung của thẻ <a>
                playerName = anchor.text();

                const thirdTd = $(row).children('td').eq(2);

                // Lọc thẻ <img> trong thẻ <td> thứ ba
                const img = thirdTd.find('img');

                // Lấy giá trị của thuộc tính "title" của thẻ <img>
                nation = img.attr('title');

                const fourTd = $(row).children('td').eq(3);
                const fifthTd = $(row).children('td').eq(4)
                club = fifthTd.children('a').attr('title')
                const sixthTd = $(row).children('td').eq(5)
                marketValue = sixthTd.children('a').text()
                age = fourTd.text()
                playerData.push({
                    playerName,
                    nation,
                    age,
                    club,
                    marketValue
                });
            });

        }



        // Lưu vào tệp JSON
        const jsonData = JSON.stringify(playerData, null, 2);
        fs.writeFileSync('playerData.json', jsonData);

        console.log('Data crawled and saved to playerData.json');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

// Hàm để lấy số trang tối đa
const getMaxPageNumber = async () => {
    try {
        const response = await axios.get('https://www.transfermarkt.com/premier-league/marktwerte/wettbewerb/GB1/ajax/yw1/pos//detailpos/0/altersklasse/alle/page/1?ajax=yw1', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            },
        });
        const $ = cheerio.load(response.data);

        // Lọc các thẻ <a> trong thẻ <li> trong thẻ có class là "tm-pagination"
        const paginationElements = $('.tm-pagination li a');

        let maxPageNumber = 0;

        paginationElements.each((index, element) => {
            const pageNumberText = $(element).text().trim();

            // Kiểm tra xem text có phải là số trang không
            if (/^\d+$/.test(pageNumberText)) {
                const pageNumber = parseInt(pageNumberText, 10);
                maxPageNumber = Math.max(maxPageNumber, pageNumber);
            }
        });

        console.log('Số trang tối đa:', maxPageNumber);

        return maxPageNumber;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return 0;
    }
};


crawlAndSaveToJson();
