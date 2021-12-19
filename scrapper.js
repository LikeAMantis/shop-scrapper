import pkg from 'puppeteer';
import { appendFile } from 'fs';
import myFunc from './test.js';

export default class Scrapper {
    constructor(selectorStrings, selectors) {
      this.selectors = selectors;
      this.selectorStrings = selectorStrings;
      this.properties = Object.keys(selectors);
      this.funcPrefix = "getProp_";
      this.id = 0;
    }

    createCSV(categorie) { 
        this.categorie = categorie; 
        appendFile(`./data/${this.categorie}.csv`, "Id," + this.properties.map(x => x[0].toUpperCase() + x.substr(1)).join(","), function (err) {
            if (err) console.log(err);
        });
    }

    async openBrowser() {
        this.browser = await pkg.launch({ headless: false, devtools: true, args: [`--window-size=1920,1080`], defaultViewport: false });
        this.page = await this.browser.newPage();
    }

    async goToPage(url) {
        await this.page.goto(url);

        // Setup Functions
        for (var key in this.selectors) {
            this.selectors[key] = this.selectors[key].toString();
        }

        await this.page.evaluate((selectors, prefix) => {
            for (var key in selectors) {
                var funcStr = "return " + selectors[key];
                window[(prefix + key)] = new Function(funcStr)();
            }
        }, this.selectors, this.funcPrefix);
    }

    async getMultipleCategories() {
        await myFunc(this.selectorStrings.categories, this);
    }

    async getCategorie() {
        var counter = 0;
        while (true) {
            console.log("Page " + (++counter));
            await this.getPage(this.categorie);
            
            try {
                await Promise.all([
                    this.page.waitForNavigation(),
                    this.page.evaluate((nextBtn) => document.querySelector(nextBtn).click(), this.selectorStrings.nextBtn),
                ]);
            } catch (error) {
                break;
            }
        }
        console.log("Finished!");
    };
    
    async getPage() {
        console.log("Scroll");
        await this.page.evaluate(async () => {
            const distance = 250;
            const delay = 100;
            while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
                document.scrollingElement.scrollBy(0, distance);
                await new Promise(resolve => { setTimeout(resolve, delay); });
            }
        })
        await this.page.waitForTimeout(500);
        
        console.log("scrapping Page...");
        var itemWrappers = await this.page.$$(this.selectorStrings.itemWrappers);
    
        for (let wrapper of itemWrappers) {
            var item = await this.getItem(wrapper);
      
            appendFile(`./data/${this.categorie}.csv`, `\n${++this.id},${this.properties.map(prop => item[prop]).join(",")}`, function (err) {
                if (err) console.log(err);
            });
        }
    }
    
    async getItem(wrapper) {
        let item = await this.page.evaluate((wrapper, properties, prefix) => {
            var item = {}
          
            for (var prop of properties) {
                item[prop] = window[(prefix + prop)](wrapper);
            }

            return item;
        }, wrapper, this.properties, this.funcPrefix);
    
        return item;
    }

    async closeBrowser() {
        await this.browser.close();
    }
}