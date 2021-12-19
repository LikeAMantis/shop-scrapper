async function myFunc() {
    const containers = this.selectorStrings.categories;
    var rowIndex = [];
    var rowLength = [];
    for (var i = 0; i < containers.length; i++) rowIndex.push(0);
    var z = rowIndex.length - 1;
    var y = 0;

    while (z >= 0) {
        z = rowIndex.length - 1;
        await iter();
        await this.page.waitForNavigation();
        await this.getCategorie();
        
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
            var elements = await this.page.$$(containers[y]);
            rowLength[y] = elements.length;

            var text = await this.page.evaluate((element) => {
                element.click();
                return element.innerText;
            }, elements[rowIndex[y]]);
            console.log("➡", text);

            // Wait for next Element to exist
            if (y < containers.length - 1) {
                await this.page.waitForSelector(containers[y+1]);
            }
            y++;
        }
        console.log(rowLength);
        y = 0;
    }
    console.log("✔✔ Finished All Categories!"); 
}

export default myFunc;