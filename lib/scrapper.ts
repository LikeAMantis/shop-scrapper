import pkg, {
    Browser,
    BrowserConnectOptions,
    BrowserLaunchArgumentOptions,
    ElementHandle,
    LaunchOptions,
    Page,
} from "puppeteer";
import { appendFile, writeFile } from "fs";
import { PropSelectors, SelectorStrings, Wait } from "./types";
import { iterAllCategories } from "./functions";





export default class Scrapper {
    static launchOptions: LaunchOptions &
        BrowserLaunchArgumentOptions &
        BrowserConnectOptions;

    props: string[];
    selectorStrings: SelectorStrings;
    page: Page;

    private browser: Browser;
    private name: string;
    private propSelectors: PropSelectors;
    private funcPrefix: string = "getProp_";
    private id: number = 0;
    private _category: string;
    private set category(value: string) {
        this._category = value.toLowerCase();
    }
    private get category() {
        return this._category;
    }

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
    public async scrapAllCategories(
        url: string,
        createCSVIndex: number,
        wait?: Wait
    ) {
        await this.openBrowser();
        await this.goToPage(url);
        await this.getMultipleCategories(createCSVIndex, wait);
        await this.closeBrowser();
    }

    public async scrapCategory(
        url: string,
        category: string,
        wait?: Wait
    ) {
        await this.openBrowser();
        await this.goToPage(url);
        await this.page.waitForSelector(this.selectorStrings.itemWrappers);
        await this.getCategorie(category, wait);
        await this.closeBrowser();
    }

    public async scrapPage(url: string, fileName: string) {
        this.createCSV(fileName);
        await this.openBrowser();
        await this.goToPage(url);
        await this.page.waitForSelector(this.selectorStrings.itemWrappers);
        await this.getPage();
    }

    // Private Methods
    private createCSV(category: string) {
        if (category === this.category) return;

        this.category = category;
        writeFile(
            `./data/${this.name}/${this.category}.csv`,
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
        this.browser = await pkg.launch(Scrapper.launchOptions);
        this.page = await this.browser.newPage();
    }

    private async goToPage(url: string) {
        await this.page.goto(url);
    }

    private async getMultipleCategories(createCSVIndex: number, wait: Wait) {
        await iterAllCategories(this, createCSVIndex, wait);
    }

    async getCategorie(categorie: string, wait?: Wait) {
        wait = wait ? wait : (page) => page.waitForNavigation();

        this.createCSV(categorie);
        var counter = 1;
        while (true) {
            console.log("Page " + counter++);
            await this.getPage();

            try {
                await Promise.all([
                    wait(this.page),
                    this.page.waitForSelector(this.selectorStrings.itemWrappers),
                    this.page.evaluate(
                        (nextBtn) => document.querySelector(nextBtn).click(),
                        this.selectorStrings.nextBtn
                    ),
                ]);
            } catch (error) {
                // console.log("error");
                break;
            }
        }
        this.id = 0;
        console.log("✔ Finished!\n");
    }

    private async getPage() {
        await this.setUpFunctions();

        console.log("scroll");
        await this.page.evaluate(async (itemWrappers) => {
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
                Array.from(
                    document.querySelectorAll(`${itemWrappers} img`),
                    (img: any) => {
                        if (img.complete && img.naturalHeight !== 0) return;

                        return new Promise((resolve, reject) => {
                            img.addEventListener("load", resolve);
                            img.addEventListener("error", reject);
                        });
                    }
                )
            );
        }, this.selectorStrings.itemWrappers);

        await this.scrapping();
    }

    private async scrapping() {
        console.log("scrapping");

        var itemWrappers: ElementHandle[] = await this.page.$$(
            this.selectorStrings.itemWrappers
        );

        for (let wrapper of itemWrappers) {
            try {
                var item = await this.getItem(wrapper);

                appendFile(
                    `./data/${this.name}/${this.category}.csv`,
                    `\n${++this.id},${this.props
                        .map((prop) => item[prop])
                        .join(",")}`,
                    function (err) {
                        if (err)
                            console.log("Append File Error", err);
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
