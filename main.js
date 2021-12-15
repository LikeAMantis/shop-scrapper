import Scrapper from './Scrapper.js'

// Spar
async function startSparScrapper() {
    const sparScrapper = new Scrapper({
        itemWrappers: ".productGrid .productBox:not(.disruptiveProductBox)",
        nextBtn: "li.next:not(.disabled) a",
        name: (itemWrapper) => Array.from(itemWrapper.querySelectorAll(".productInfo a")).map(x => x.innerText).reduce((x, y) => x + " " + y).trimEnd().replaceAll(",", ""),
        price: (itemWrapper) => itemWrapper.querySelector(".priceInteger").innerText + "." + itemWrapper.querySelector(".priceDecimal").innerText,
        imgUrl: (itemWrapper) => itemWrapper.querySelector("img").src,
    });

    sparScrapper.createCSV("spar/spar_test");
    await sparScrapper.openBrowser();
    await sparScrapper.goToPage('https://www.interspar.at/shop/lebensmittel/obst-gemuese/frischobst/c/F1-2/');
    await sparScrapper.getCategorie();
    await sparScrapper.closeBrowser();
}



// Billa
async function startBillaScrapper() {
    const billaScrapper = new Scrapper({
        itemWrappers: "#tile-view-grid--Produktsortiment .tile-view-grid__list > div",
        nextBtn: ".pagination__item--next:not([disabled])",
        name: (itemWrapper) => itemWrapper.querySelector(".product__content-title-text").innerText,
        price: (itemWrapper) => {
            const text = itemWrapper.querySelector(".product__price-big").innerText;
            const reg = /\d+/g
            return (reg.exec(text) + "." + reg.exec(text));
        },
        imgUrl: (itemWrapper) => itemWrapper.querySelector("img").src,
    });

    billaScrapper.createCSV("billa/billa_test");
    await billaScrapper.openBrowser();
    await billaScrapper.goToPage('https://shop.billa.at/warengruppe/getraenke/spirituosen/B2-35');
    await billaScrapper.getCategorie();
    await billaScrapper.closeBrowser();
}



// Matrix Trivia
async function startMatrixScrapper() {
    const matrixScrapper = new Scrapper({
        itemWrappers: 'div[itemprop="mainEntity"]',
        nextBtn: ".pagination .page-item:last-child:not(.disabled) a",
        name: (itemWrapper) => itemWrapper.querySelector('[itemprop="name"]').innerText.replaceAll(",", ";"),
        price: (itemWrapper) => itemWrapper.querySelector('[itemprop="text"]').innerText.replace("\n", "").split("\n")[0].replaceAll(",", ";"),
        imgUrl: (itemWrapper) => {
            try {
                return itemWrapper.querySelector('[itemprop="text"]').innerText.replace("\n", "").split("\n")[1].replaceAll(",", ";")
            } catch (error) {
                return ""
            }
        },
    });

    matrixScrapper.createCSV("matrix");
    await matrixScrapper.openBrowser();
    await matrixScrapper.goToPage('https://www.funtrivia.com/en/Movies/Matrix-The-960_6.html');
    await matrixScrapper.getPage();
    await matrixScrapper.closeBrowser();
}

async function main() {
    await startSparScrapper();
    // await startBillaScrapper();
    // await startMatrixScrapper();
}

main();