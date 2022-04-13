import pkg, { Browser, Page } from "puppeteer";
import { appendFile } from "fs";
const { myFunc } = require("./Functions.js");

interface SelectorStrings {
    categories?: string[];
    itemWrappers: string;
    nextBtn: string;
}

export default class Scrapper {
    name: string;
    selectorStrings: SelectorStrings;
    selectors;
    properties: string[];
    browser: Browser;
    page: Page;

    funcPrefix = "getProp_";
    id = 0;
    categorie = null;

    constructor(
        name: string,
        selectorStrings: SelectorStrings,
        selectors: object
    ) {
        this.name = name;
        this.selectorStrings = selectorStrings;
        this.selectors = selectors;
        this.properties = Object.keys(selectors);
    }

    #createCSV(categorie) {
        if (categorie === this.categorie) return;

        this.categorie = categorie;
        appendFile(
            `./data/${this.categorie}.csv`,
            "Id," +
                this.properties
                    .map((x) => x[0].toUpperCase() + x.substr(1))
                    .join(","),
            function (err) {
                if (err) console.log(err);
            }
        );
    }

    async openBrowser() {
        this.browser = await pkg.launch({
            headless: false,
            devtools: false,
            args: [`--window-size=1920,1080`],
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
        });
        this.page = await this.browser.newPage();
    }

    async goToPage(url) {
        await this.page.goto(url);
    }

    async getMultipleCategories(createCSVIndex) {
        await myFunc(this, createCSVIndex);
    }

    async getCategorie(categorie) {
        this.#createCSV(`${this.name}/${categorie}`);
        var counter = 0;
        while (true) {
            console.log("Page " + ++counter);
            await this.getPage();

            try {
                await Promise.all([
                    this.page.waitForNavigation(),
                    this.page.evaluate(
                        (nextBtn) => document.querySelector(nextBtn).click(),
                        this.selectorStrings.nextBtn
                    ),
                ]);
            } catch (error) {
                break;
            }
        }
        console.log("✔ Finished!\n");
    }

    async getPage() {
        await this.setUpFunctions();

        console.log("Scroll");
        await this.page.evaluate(async () => {
            // Scroll down
            const distance = 200;
            const delay = 200;
            while (
                document.scrollingElement.scrollTop + window.innerHeight <
                document.scrollingElement.scrollHeight
            ) {
                document.scrollingElement.scrollBy(0, distance);
                await new Promise((resolve) => {
                    setTimeout(resolve, delay);
                });
            }

            // Await all Image loaded
            await Promise.all(
                Array.from(document.querySelectorAll("img"), (img) => {
                    if (img.complete) return;

                    return new Promise((resolve, reject) => {
                        img.addEventListener("load", resolve);
                        img.addEventListener("error", reject);
                    });
                })
            );
        });
        await this.page.waitForNetworkIdle({ idleTime: 1000 });

        console.log("scrapping Page..");
        var itemWrappers = await this.page.$$(
            this.selectorStrings.itemWrappers
        );

        for (let wrapper of itemWrappers) {
            try {
                var item = await this.getItem(wrapper);

                appendFile(
                    `./data/${this.categorie}.csv`,
                    `\n${++this.id},${this.properties
                        .map((prop) => item[prop])
                        .join(",")}`,
                    function (err) {
                        if (err) console.log(err);
                    }
                );
            } catch (err) {
                console.log("Proplem with get Item!");
            }
        }
    }

    async setUpFunctions() {
        for (var key in this.selectors) {
            this.selectors[key] = this.selectors[key].toString();
        }

        await this.page.evaluate(
            (selectors, prefix) => {
                for (var key in selectors) {
                    var funcStr = "return " + selectors[key];
                    window[prefix + key] = new Function(funcStr)();
                }
            },
            this.selectors,
            this.funcPrefix
        );
    }

    async getItem(wrapper) {
        let item = await this.page.evaluate(
            (wrapper, properties, prefix) => {
                var window: any;
                var item = {};

                for (var prop of properties) {
                    item[prop] = window[prefix + prop](wrapper);
                }

                return item;
            },
            wrapper,
            this.properties,
            this.funcPrefix
        );

        return item;
    }

    async closeBrowser() {
        await this.browser.close();
    }
}
