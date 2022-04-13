import Scrapper from "./lib/scrapper";

async function main() {
    await sparScrapper.scrapSingleCategory(
        "https://www.interspar.at/shop/lebensmittel/obst-gemuese/frischgemuese/salat/c/F1-1-1/",
        "test"
    );
    // await sparScrapper.scrapAllCategories(
    //     "https://www.interspar.at/shop/lebensmittel/", 1
    // );

    // await billaScrapper.scrapAllCategories("https://shop.billa.at/");
}

const sparScrapper = new Scrapper(
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

const billaScrapper = new Scrapper(
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
        name: (wrapper) =>
            wrapper.querySelector(".product__content-title-text").innerText,
        price: (wrapper) => {
            const text = wrapper.querySelector(".product__price-big").innerText;
            const reg = /\d+/g;
            return reg.exec(text) + "." + reg.exec(text);
        },
        imgUrl: (wrapper) => wrapper.querySelector("img").src,
    }
);

main();
