import { logMethods } from "./lib/functions";
import Scrapper from "./lib/Scrapper";

async function main() {
    // await logMethods(sparScrapper).scrapCategory(
    //     "https://www.interspar.at/shop/lebensmittel/wurst-fleisch-fisch/c/F3/",
    //     "test",
    //     (page) => page.waitForTimeout(3000)
    // );

    // await billaScrapper.scrapAllCategories("https://shop.billa.at/", 1);

    await logMethods(billaScrapper).scrapCategory(
        "https://shop.billa.at/warengruppe/getraenke/alkoholfreie-getraenke/B2-31",
        "test",
    );
}

Scrapper.launchOptions = {
    headless: false,
    devtools: false,
    args: [`--window-size=1920,1080`],
    defaultViewport: null,
};

const sparScrapper = new Scrapper(
    "spar",
    {
        categories: [
            "a[title='Alle Kategorien']",
            ".simplebar-content > li > a",
            "#header > div.js-bottom-header__wrapper > div > div.flyout-categories__wrapper.js-flyout-categories__wrapper > ul:nth-child(2) > div.simplebar-scroll-content > div > li:nth-child(2) a",
        ],
        itemWrappers: ".productGrid .productBox:not(.disruptiveProductBox)",
        nextBtn: "li.next:not(.disabled) a",
    },
    {
        name: (wrapper) =>
            Array.from(wrapper.querySelectorAll(".productInfo a"))
                .map((x: any) => x.innerText)
                .reduce((x, y) => x + " " + y)
                .trimEnd()
                .replaceAll(",", ""),
        price: (wrapper) =>
            wrapper.querySelector(".priceInteger").innerText +
            "." +
            wrapper.querySelector(".priceDecimal").innerText,
        imgUrl: (wrapper) => wrapper.querySelector("img").src,
        productUrl: (wrapper) => wrapper.dataset.url,
    }
);

var billaScrapper = new Scrapper(
    "billa",
    {
        categories: [
            ".header__dropdown",
            "assortment-navigation:nth-child(2) > div > div > ul > li button",
            "nav.assortment-nav.assortment-nav--sub > assortment-navigation > div > div > ul:not(:nth-child(1)) button",
            "#navigation > div > div.assortment-nav__subimg-container.flex.bgi.-no-r > nav.assortment-nav.ng-scope > assortment-navigation > div > div > ul > li:nth-child(1) > a",
        ],
        itemWrappers:
            "#tile-view-grid--Produktsortiment .tile-view-grid__list > div",
        nextBtn: ".pagination__item--next:not([disabled])",
    },
    {
        name: (wrapper) =>
            wrapper.querySelector(".product__content-title-text").innerText,
        price: (wrapper) => {
            const text = wrapper.querySelector(".product__price-big").innerText;
            const reg = /\d+/g;
            return reg.exec(text) + "." + reg.exec(text);
        },
        imgUrl: (wrapper) => wrapper.querySelector("img").src,
        productUrl: (wrapper) => {const href = wrapper.querySelector("a").href; return href.substr(21, href.length);
},
    }
);

main();
