import Scrapper from "./lib/Scrapper";

interface HMTL {
    innerText: string;
}

main();

async function main() {
    await sparScrapper();
}
async function startScrapper(scrapper, categorie, url) {
    await scrapper.openBrowser();
    await scrapper.goToPage(url);
    // await scrapper.getMultipleCategories(1);
    // await scrapper.closeBrowser();
}

// Spar
async function sparScrapper() {
    const scrapper = new Scrapper(
        "spar",
        {
            categories: [
                "a[title='Alle Kategorien']",
                ".simplebar-content > li:is(:not(:nth-child(1), :nth-child(8))) > a",
                "#header > div.js-bottom-header__wrapper > div > div.flyout-categories__wrapper.js-flyout-categories__wrapper > ul:nth-child(2) > div.simplebar-scroll-content > div > li:nth-child(2)",
            ],
            itemWrappers: ".productGrid .productBox:not(.disruptiveProductBox)",
            nextBtn: "li.next:not(.disabled) a",
        },
        {
            name: (itemWrapper) =>
                Array.from(itemWrapper.querySelectorAll(".productInfo a"))
                    .map((x: any) => x.innerText)
                    .reduce((x, y) => x + " " + y)
                    .trimEnd()
                    .replaceAll(",", ""),
            price: (itemWrapper) =>
                itemWrapper.querySelector(".priceInteger").innerText +
                "." +
                itemWrapper.querySelector(".priceDecimal").innerText,
            imgUrl: (itemWrapper) => itemWrapper.querySelector("img").src,
        }
    );

    startScrapper(
        scrapper,
        "spar/spar_test",
        "https://www.interspar.at/shop/lebensmittel/"
    );
}

// Billa
async function billaScrapper() {
    const scrapper = new Scrapper(
        "billa",
        {
            categories: [
                ".header__dropdown",
                "assortment-navigation:nth-child(2) > div > div > ul > li:nth-child(n+5):nth-child(-n+11) button",
                "nav.assortment-nav.assortment-nav--sub > assortment-navigation > div > div > ul:not(:nth-child(1)) button",
                "#navigation > div > div.assortment-nav__subimg-container.flex.bgi.-no-r > nav.assortment-nav.ng-scope > assortment-navigation > div > div > ul > li:nth-child(1) > a",
            ],
            itemWrappers:
                "#tile-view-grid--Produktsortiment .tile-view-grid__list > div",
            nextBtn: ".pagination__item--next:not([disabled])",
        },
        {
            name: (itemWrapper) =>
                itemWrapper.querySelector(".product__content-title-text")
                    .innerText,
            price: (itemWrapper) => {
                const text = itemWrapper.querySelector(
                    ".product__price-big"
                ).innerText;
                const reg = /\d+/g;
                return reg.exec(text) + "." + reg.exec(text);
            },
            imgUrl: (itemWrapper) => itemWrapper.querySelector("img").src,
        }
    );

    await startScrapper(scrapper, "billa/test", "https://shop.billa.at/");
}

// Matrix Trivia
async function matrixScrapper() {
    const scrapper = new Scrapper(
        "matrix",
        {
            itemWrappers: 'div[itemprop="mainEntity"]',
            nextBtn: ".pagination .page-item:last-child:not(.disabled) a",
        },
        {
            name: (itemWrapper) =>
                itemWrapper
                    .querySelector('[itemprop="name"]')
                    .innerText.replaceAll(",", ";"),
            price: (itemWrapper) =>
                itemWrapper
                    .querySelector('[itemprop="text"]')
                    .innerText.replace("\n", "")
                    .split("\n")[0]
                    .replaceAll(",", ";"),
            imgUrl: (itemWrapper) => {
                try {
                    return itemWrapper
                        .querySelector('[itemprop="text"]')
                        .innerText.replace("\n", "")
                        .split("\n")[1]
                        .replaceAll(",", ";");
                } catch (error) {
                    return "";
                }
            },
        }
    );

    await startScrapper(
        scrapper,
        "matrix",
        "https://www.funtrivia.com/en/Movies/Matrix-The-960_6.html"
    );
}
