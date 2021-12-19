import Scrapper from './Scrapper.js'


main();
async function main() {
    // await sparScrapper();
    await billaScrapper();
    // await matrixScrapper();
}


// Spar
async function sparScrapper() {
    const scrapper = new Scrapper(
        {
            itemWrappers: ".productGrid .productBox:not(.disruptiveProductBox)",
            nextBtn: "li.next:not(.disabled) a",
        },
        {
            name: (itemWrapper) => Array.from(itemWrapper.querySelectorAll(".productInfo a")).map(x => x.innerText).reduce((x, y) => x + " " + y).trimEnd().replaceAll(",", ""),
            price: (itemWrapper) => itemWrapper.querySelector(".priceInteger").innerText + "." + itemWrapper.querySelector(".priceDecimal").innerText,
            imgUrl: (itemWrapper) => itemWrapper.querySelector("img").src,
        },
    );

    startScrapper(scrapper, "spar/spar_test", 'https://www.interspar.at/shop/lebensmittel/obst-gemuese/c/F1/');
}


// Billa
async function billaScrapper() {
    const scrapper = new Scrapper(
        {
            categories: [
                ".header__dropdown",
                "assortment-navigation:nth-child(2) > div > div > ul > li:nth-child(2) button",
                "nav.assortment-nav.assortment-nav--sub > assortment-navigation > div > div > ul:not(:nth-child(1)) button",
                "#navigation > div > div.assortment-nav__subimg-container.flex.bgi.-no-r > nav.assortment-nav.ng-scope > assortment-navigation > div > div > ul > li:nth-child(1) > a",
            ],
            itemWrappers: "#tile-view-grid--Produktsortiment .tile-view-grid__list > div",
            nextBtn: ".pagination__item--next:not([disabled])",
        },
        {
            name: (itemWrapper) => itemWrapper.querySelector(".product__content-title-text").innerText,
            price: (itemWrapper) => {
                const text = itemWrapper.querySelector(".product__price-big").innerText;
                const reg = /\d+/g
                return (reg.exec(text) + "." + reg.exec(text));
            },
            imgUrl: (itemWrapper) => itemWrapper.querySelector("img").src,
        },
    );

    await startScrapper(scrapper, "billa/billa_test", 'https://shop.billa.at/warengruppe/getraenke/spirituosen/B2-35')
}


// Matrix Trivia
async function matrixScrapper() {
    const scrapper = new Scrapper(
        {
            itemWrappers: 'div[itemprop="mainEntity"]',
            nextBtn: ".pagination .page-item:last-child:not(.disabled) a",
        },
        {
            name: (itemWrapper) => itemWrapper.querySelector('[itemprop="name"]').innerText.replaceAll(",", ";"),
            price: (itemWrapper) => itemWrapper.querySelector('[itemprop="text"]').innerText.replace("\n", "").split("\n")[0].replaceAll(",", ";"),
            imgUrl: (itemWrapper) => {
                try {
                    return itemWrapper.querySelector('[itemprop="text"]').innerText.replace("\n", "").split("\n")[1].replaceAll(",", ";");
                } catch (error) {
                    return "";
                }
            },
        }
    );

    await startScrapper(scrapper, "matrix", 'https://www.funtrivia.com/en/Movies/Matrix-The-960_6.html')
}


// Functions
async function startScrapper(scrapper, filePath, url) {
    scrapper.createCSV(filePath);
    await scrapper.openBrowser();
    await scrapper.goToPage(url);
    // await scrapper.getMultipleCategories();
    await scrapper.getCategorie();
    // await scrapper.closeBrowser();
}