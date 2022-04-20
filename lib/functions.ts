import { Wait } from "./types";
import Scrapper from "./Scrapper";
import { nextTick } from "process";

export async function iterAllCategories(
    scrapper: Scrapper,
    createCSVIndex = 1,
    wait: Wait
) {
    const containers = scrapper.selectorStrings.categories;
    var rowIndex = [];
    var rowLength = [];
    for (var i = 0; i < containers.length; i++) rowIndex.push(0);
    var z = rowIndex.length - 1;
    var y = 0;
    var prevText: string;
    var pathLog: string[];

    while (z >= 0) {
        z = rowIndex.length - 1;

        if (await menuNavigation()) {
            // await scrapper.page.waitForNavigation();
            await scrapper.page.waitForTimeout(3000);
        } else {
            await scrapper.page.waitForNetworkIdle({ idleTime: 1000 });
        }
        console.log(
            pathLog
                .map((x, i) => x + (rowLength[i + 1] ? `(${rowLength[i + 1]})` : ""))
                .join(" ➡  ")
        );

        await scrapper.getCategorie(wait);

        rowIndex[z]++;
        while (rowIndex[z] >= rowLength[z]) {
            rowIndex[z] = 0;
            z--;
            if (z < 0) break;
            rowIndex[z]++;
        }
    }
    console.log("✔✔ Finished All Categories!");

    async function menuNavigation() {
        pathLog = [];

        while (y < containers.length) {
            var elements = await scrapper.page.$$(containers[y]);
            rowLength[y] = elements.length;

            var text = await scrapper.page.evaluate((element) => {
                element.click();
                return element.innerText;
            }, elements[rowIndex[y]]);

            pathLog.push(text);

            if (y === createCSVIndex && text !== prevText) {
                prevText = text;
                scrapper.writeCSV(text);
            }

            // Wait for next Element to exist
            if (y < containers.length - 1) {
                try {
                    await scrapper.page.waitForSelector(containers[y + 1], {
                        timeout: 5000,
                    });
                } catch (error) {
                    console.log("element not found");
                    // continue;
                    y = 0;
                    return false;
                }
            }
            y++;
        }
        y = 0;
        return true;
    }
}

export function logMethods<T extends Object>(
    object: T,
    ...excludeMethods: string[]
): T {
    const handler = {
        get: (target: Object, p: string) => {
            if (typeof target[p] == "function" && !excludeMethods.includes(p)) {
                console.log("->", p);
            }
            return target[p];
        },
    };
    return new Proxy<T>(object, handler);
}
