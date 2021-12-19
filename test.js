var containers = [
    ["a1", "a2"],
    ["b1", "b2"],
    ["c1", "c2", "c3"],
];

async function myFunc(containers, context) {
    var xIndex = [];
    for (var i = 0; i < containers.length; i++) xIndex.push(0);
    var z = xIndex.length - 1;
    var y = 0;

    while (z >= 0) {
        z = xIndex.length - 1;
        await iter();
        // return;
        await context.page.waitForNavigation();
        await context.getCategorie();
        

        xIndex[z]++;
        while (xIndex[z] >= containers[z].length) {
            xIndex[z] = 0;
            z--;

            if (z < 0) break;
            xIndex[z]++;
        }
    }

    async function iter() {
        while (y < containers.length) {
            
            var elements = await context.page.$$(containers[y]);

            // console.log(y, elements[xIndex[y]]);
            await context.page.evaluate((element) => {
                element.click();
            }, elements[xIndex[y]]);

            // Wait for next Element to exist
            if (y < containers.length - 1) {
                // await context.page.waitForSelector(containers[y+1])
                await context.page.waitForTimeout(500);
            }

            y++;

        }
        y = 0;
    } 
}

export default myFunc;