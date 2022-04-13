export async function iterAllCategories(context, createCSVIndex = null) {
    const containers = context.selectorStrings.categories;
    var rowIndex = [];
    var rowLength = [];
    for (var i = 0; i < containers.length; i++) rowIndex.push(0);
    var z = rowIndex.length - 1;
    var y = 0;
    var categorieText;

    while (z >= 0) {
        z = rowIndex.length - 1;
        await iter();
        await context.page.waitForNavigation();
        await context.getCategorie(categorieText);

        rowIndex[z]++;
        while (rowIndex[z] >= rowLength[z]) {
            rowIndex[z] = 0;
            z--;
            if (z < 0) break;
            rowIndex[z]++;
        }
    }

    async function iter() {
        while (y < containers.length) {
            var elements = await context.page.$$(containers[y]);
            rowLength[y] = elements.length;

            var text = await context.page.evaluate((element) => {
                element.click();
                return element.innerText;
            }, elements[rowIndex[y]]);
            console.log("➡", text);

            if (y === createCSVIndex) {
                categorieText = text;
            }

            // Wait for next Element to exist
            if (y < containers.length - 1) {
                await context.page.waitForSelector(containers[y + 1]);
            }
            y++;
        }
        console.log(rowLength);
        y = 0;
    }
    console.log("✔✔ Finished All Categories!");
}
