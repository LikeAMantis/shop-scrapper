import pkg, { Browser, ElementHandle, Page } from "puppeteer";
import { appendFile, writeFile } from "fs";
import { PropSelectors, SelectorStrings } from "..";
const { iterAllCategories } = require("./Functions.js");

export default class Scrapper {
    name: string;
    selectorStrings: SelectorStrings;
    propSelectors: PropSelectors;

    props: string[];
    browser: Browser;
    page: Page;
    funcPrefix: string = "getProp_";
    id: number = 0;
    category: string;

    // Constructor
    constructor(
        name: string,
        selectorStrings: SelectorStrings,
        propSelectors: PropSelectors
    ) {
        this.name = name;
        this.selectorStrings = selectorStrings;
        this.propSelectors = propSelectors;
        this.props = Object.keys(propSelectors);
    }

    // Public Methods
    public async scrapAllCategories(url: string, createCSVIndex: number) {
        await this.openBrowser();
        await this.goToPage(url);
        await this.getMultipleCategories(createCSVIndex);
        await this.closeBrowser();
    }

    public async scrapSingleCategory(url: string, category: string) {
        await this.openBrowser();
        await this.goToPage(url);
        await this.getCategorie(category);
        await this.closeBrowser();
    }

    // Private Methods
    private createCSV(category: string) {
        if (category === this.category) return;

        this.category = category;
        writeFile(
            `./data/${this.category}.csv`,
            "Id," +
                this.props
                    .map((x) => x[0].toUpperCase() + x.substr(1))
                    .join(","),
            function (err) {
                if (err) console.log(err);
            }
        );
    }

    private async openBrowser() {
        this.browser = await pkg.launch({
            headless: false,
            devtools: false,
            args: [`--window-size=1280,720`],
            defaultViewport: null,
        });
        this.page = await this.browser.newPage();
    }

    private async goToPage(url: string) {
        await this.page.goto(url);
    }

    private async getMultipleCategories(createCSVIndex) {
        await iterAllCategories(this, createCSVIndex);
    }

    private async getCategorie(categorie: string) {
        this.createCSV(`${this.name}/${categorie}`);
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

    private async getPage() {
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
        var itemWrappers: ElementHandle[] = await this.page.$$(
            this.selectorStrings.itemWrappers
        );

        for (let wrapper of itemWrappers) {
            try {
                var item = await this.getItem(wrapper);

                appendFile(
                    `./data/${this.category}.csv`,
                    `\n${++this.id},${this.props
                        .map((prop) => item[prop])
                        .join(",")}`,
                    function (err) {
                        if (err) console.log("Append File Error", err);
                    }
                );
            } catch (err) {
                console.log("Proplem with get Item!", err);
            }
        }
    }

    private async setUpFunctions() {
        for (var key in this.propSelectors) {
            this.propSelectors[key] = this.propSelectors[key].toString();
        }

        const propSelectors: any = this.propSelectors;
        await this.page.evaluate(
            (propSelectors, prefix) => {
                for (var key in propSelectors) {
                    var funcStr = "return " + propSelectors[key];
                    window[prefix + key] = new Function(funcStr)();
                }
            },
            propSelectors,
            this.funcPrefix
        );
    }

    private async getItem(wrapper: ElementHandle) {
        let item = await this.page.evaluate(
            (wrapper, props, prefix) => {
                const window: any = globalThis.window;

                var item = {};

                for (var prop of props) {
                    item[prop] = window[prefix + prop](wrapper);
                }

                return item;
            },
            wrapper,
            this.props,
            this.funcPrefix
        );

        return item;
    }

    private async closeBrowser() {
        await this.browser.close();
    }
}
