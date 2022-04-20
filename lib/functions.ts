import { Wait } from "./types";
import Scrapper from "./Scrapper";
import { nextTick } from "process";
import { ElementHandle } from "puppeteer";

export async function iterAllCategories(
    scrapper: Scrapper,
    createCSVIndex = 1,
    wait: Wait
) {
    const containers = scrapper.selectorStrings.categories;
    var cDepthIndexes = Array(containers.length).fill(
        0,
        0,
        containers.length
    );
    var depthCount = [];
    var depth = cDepthIndexes.length - 1;
    var prevText: string;
    var pathLog: string[];
    var y = 0;

    while (depth >= 0) {
        depth = cDepthIndexes.length - 1;

        await menuNavigation();
        await scrapper.page.waitForNetworkIdle({idleTime: 1000, timeout: 300000});

        console.log(
            pathLog
                .map(
                    (x, i) =>
                        x + (depthCount[i + 1] ? `(${depthCount[i + 1]})` : "")
                )
                .join(" ➡  ")
        );

        await scrapper.getCategorie(wait);

        cDepthIndexes[depth]++;
        while (cDepthIndexes[depth] >= depthCount[depth]) {
            cDepthIndexes[depth] = 0;
            depth--;
            if (depth < 0) break;
            cDepthIndexes[depth]++;
        }
    }
    console.log("✔✔ Finished All Categories!");

    async function menuNavigation() {
        pathLog = [];

        while (y < containers.length) {
            var elements = await scrapper.page.$$(containers[y]);
            depthCount[y] = elements.length;

            var categorieText = await scrapper.page.evaluate((element) => {
                element.click();
                return element.innerText;
            }, elements[cDepthIndexes[y]]);

            pathLog.push(categorieText);

            if (y === createCSVIndex && categorieText !== prevText) {
                prevText = categorieText;
                scrapper.writeCSV(categorieText);
            }

            // Wait for next Element to exist
            if (y < containers.length - 1) {
                try {
                    await scrapper.page.waitForTimeout(1000);
                    await scrapper.page.waitForSelector(containers[y + 1], {
                        timeout: 1000,
                    });
                } catch (error) {
                    console.log("element not found");
                    depth = y;
                    y = 0;
                    return;
                }
            }
            y++;
        }
        y = 0;
        return;
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
