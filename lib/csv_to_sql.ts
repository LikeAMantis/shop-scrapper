import { readdirSync } from "fs";
import categoryReMap from "../data/shops";
import { ProductProps } from "./types";
import { connection } from "E:/Projects/Coding/Web/React/product-finder/lib/sql.js";
const lineReader = require("line-reader");

main();

async function main() {
}

// Products
async function insertShopProductsSQL(shopId: string) {
    const categories: any[] = readCategories(shopId);

    categories.forEach(async (categoryId) => {
        await insertCategorieProductSQL(shopId, categoryId);
    });
    console.log("Finish!");
}

async function insertCategorieProductSQL(shopId: string, categoryId: string) {
    var i = 0;

    await new Promise<void>((res) => {
        lineReader.eachLine(
            `./data/${shopId}/${categoryId}.csv`,
            function (line, last) {
                const isFirstLine = ++i <= 1;
                if (isFirstLine) return;

                const cells = line.split(",");
                const prodcutProps: ProductProps = {
                    name: cells[1],
                    price: cells[2],
                    imgUrl: cells[3],
                    productUrl: cells[4],
                    categoryId: categoryReMap[shopId][categoryId],
                    shopId,
                };

                sendProductToSQL(prodcutProps);
                if (last) {
                    console.log(
                        "added products for",
                        shopId,
                        "-",
                        categoryId,
                        "AS",
                        categoryReMap[shopId][categoryId]
                    );
                    res();
                }
            }
        );
    });
}

function sendProductToSQL(productProps: ProductProps) {
    const data = [
        productProps.name,
        productProps.price,
        productProps.imgUrl,
        productProps.productUrl,
        productProps.categoryId,
        productProps.shopId,
    ];

    const query =
        "INSERT INTO products (name, price, imgUrl, productUrl, categoryId, shopId) VALUES (?)";

    connection.query(query, [data], (err, rows) => {
        if (err) throw err;
    });
}

function readCategories(shopId: string): any[] {
    const categories = readdirSync(`data/${shopId}`).map((x) =>
        x.replace(".csv", "")
    );

    return categories;
}
