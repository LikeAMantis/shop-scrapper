import { logMethods } from "./lib/functions";
import Scrapper from "./lib/Scrapper";

async function main() {
    // billaScrapper.scrapAllCategories("https://shop.billa.at/", 1);
    hoferScrapper.scrapAllCategories(
        "https://www.roksh.at/hofer/anfangsseite",
        1,
    );

    // for (const url of unimarktCategories) {
    //     await unimarktScrapper.scrapCategory(url, /[a-z-]+$/.exec(url)[0])
    // }

}

Scrapper.launchOptions = {
    headless: false,
    devtools: false,
    args: [`--window-size=1920,1080`],
    defaultViewport: null,
};


const unimarktCategories = [
    "https://shop.unimarkt.at/tiefkuehl",
    "https://shop.unimarkt.at/haushalt",
    "https://shop.unimarkt.at/suesses-snacks",
    "https://shop.unimarkt.at/lebensmittel",
    "https://shop.unimarkt.at/getraenke",
    "https://shop.unimarkt.at/brot-gebaeck",
    "https://shop.unimarkt.at/fleisch-wurst",
    "https://shop.unimarkt.at/kuehlprodukte",
    "https://shop.unimarkt.at/obst-gemuese",
]

var unimarktScrapper = new Scrapper(
    "unimarkt",
    {
        itemCard: ".articleListItem",
    },
    {
        name: (wrapper) => wrapper.querySelector(".desc").innerText.replace("\n", " "),
        price: (wrapper) => /\d+[.]\d+/.exec(wrapper.querySelector(".price").innerText)[0],
        imgUrl: (wrapper) => wrapper.querySelector("img.lacyLoad").src,
        productUrl: (wrapper) => wrapper.querySelector("a").href.substr(24),
    }
);



var hoferScrapper = new Scrapper(
    "hofer",
    {
        categories: [
            "app-root > app-header > nav > div.navbar-content.m-auto > div.row.category-row.provider-header .navbar-category-item-container.provider-header > a",
            ".category-card a",
            "body > app-root > div > app-product-list-new > div > app-product-list-header > div.header-text-container.position-relative.text-white.pt-4.pt-lg-5.mb-lg-5.mb-2 > div.row.container-magrgin.d-none.d-lg-flex.ng-star-inserted > app-category-card a",
            "body > app-root > div > app-product-list-new > div > app-product-list-header > div.header-text-container.position-relative.text-white.pt-4.pt-lg-5.mb-lg-5.mb-2 > div.row.container-magrgin.d-none.d-lg-flex.ng-star-inserted > app-category-card a",
        ],
        itemCard: "app-product-list-new > div > div > div.ng-star-inserted",
        nextBtn: "",
    },
    {
        name: (wrapper) =>
            wrapper
                .querySelector('span[itemprop="name"]')
                .textContent.replaceAll(",", "")
                .trim(),
        price: (wrapper) =>
            wrapper
                .querySelector('span[itemprop="price"]')
                .textContent.trim()
                .replace(",", "."),
        imgUrl: (wrapper) => wrapper.querySelector("img.ng-star-inserted").src,
        productUrl: (wrapper) =>
            wrapper
                .querySelector("a[href]")
                .href.replaceAll(",", "/")
                .substring(20),
    }
);

const sparScrapper = new Scrapper(
    "spar",
    {
        categories: [
            "a[title='Alle Kategorien']",
            ".simplebar-content > li > a",
            "#header > div.js-bottom-header__wrapper > div > div.flyout-categories__wrapper.js-flyout-categories__wrapper > ul:nth-child(2) > div.simplebar-scroll-content > div > li:nth-child(2) a",
        ],
        itemCard: ".productGrid .productBox:not(.disruptiveProductBox)",
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
            "nav.assortment-nav.assortment-nav--sub > assortment-navigation > div > div > ul  li:not(:nth-child(1)) > *",
            "#navigation > div > div.assortment-nav__subimg-container.flex.bgi.-no-r > nav.assortment-nav.ng-scope > assortment-navigation > div > div > ul > li:nth-child(1) > a",
        ],
        itemCard:
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
        productUrl: (wrapper) => {
            const href = wrapper.querySelector("a").href;
            return href.substr(21, href.length);
        },
    }
);

main();
