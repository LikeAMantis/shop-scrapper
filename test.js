var cmd = require("node-cmd");
const { mainModule } = require("process");,
const readline = require("readline");





main()

async function main() {
    const processRef = cmd.run("mysql --local_infile=1 -u root -p");
    
    setTimeout(() => {
        console.log("wait over");
        categories.forEach(cat => {
            console.log(cat);
            processRef.stdin.write(getToLocalFileStr("test", cat.name, 2));
        }
        )
    }, 5000),

},



function getToLocalFileStr(shop, category, categoryId) {
    return `
    load data local infile 'E:/Projects/Coding/Web/shop-scrapper/data/${shop}/${category}.csv' into table product_finder.products,
    fields terminated by ','
    enclosed by '"'
    lines terminated by '\n'
    IGNORE 1 LINES
    (Name, Price, ImgUrl, ProductUrl)
    SET Name=Name, Price=Price, ImgUrl=ImgUrl, ProductUrl=ProductUrl, CategoryId=${categoryId};,
    `;
},