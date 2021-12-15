import pkg from 'puppeteer';
import { appendFile } from 'fs';

export default class Scrapper {
    constructor(selectors) {
      this.selectors = {
          name: () => "",
          price: () => "",
          imgUrl: () => "",
          ...selectors,
        };
      this.id = 0;
    }

    createCSV(categorie) { 
        this.categorie = categorie; 
        appendFile(`./data/${this.categorie}.csv`, `Id,Name,Price,ImgUrl`, function (err) {
            if (err) console.log(err);
        });
    }

    async openBrowser() {
        this.browser = await pkg.launch({ headless: true, devtools: false, args: [`--window-size=1920,1080`], defaultViewport: false });
        this.page = await this.browser.newPage();
        
    }

    async goToPage(url) {
        await this.page.goto(url);

        // Setup Functions
        this.selectors = {
            ...this.selectors,
            name: this.selectors.name.toString(),
            price: this.selectors.price.toString(),
            imgUrl: this.selectors.imgUrl.toString(),
        }
        await this.page.evaluate((selectors) => {
            window.selectName = new Function(`return ${selectors.name}`)();
            window.selectPrice = new Function(`return ${selectors.price}`)();
            window.selectImgUrl = new Function(`return ${selectors.imgUrl}`)();
        }, this.selectors)
    }

    async getCategorie() {
        var counter = 0;
        while (true) {
            console.log("Page " + (++counter));
            await this.getPage(this.categorie);
            
            try {
                await Promise.all([
                    this.page.waitForNavigation(),
                    this.page.evaluate((nextBtn) => document.querySelector(nextBtn).click(), this.selectors.nextBtn),
                ]);
            } catch (error) {
                // console.log(error);
                break;
            }
        }
        console.log("Finished");
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
        var itemWrappers = await this.page.$$(this.selectors.itemWrappers);
    
        for (let wrapper of itemWrappers) {
            var item = await this.getItem(wrapper);
      
            appendFile(`./data/${this.categorie}.csv`, `\n${++this.id},${item.name},${item.price},${item.imgUrl}`, function (err) {
                if (err) console.log(err);
            });
        }
    }
    
    async getItem(wrapper) {
        let item = await this.page.evaluate((wrapper) => {
            var item = {}
    
            item.name = window.selectName(wrapper);
            item.price = window.selectPrice(wrapper);
            item.imgUrl = window.selectImgUrl(wrapper);
    
            return item;
        }, wrapper);
    
        return item;
    }

    async closeBrowser() {
        await this.browser.close();
    }
}