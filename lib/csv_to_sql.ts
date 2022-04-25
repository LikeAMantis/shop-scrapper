import { readdirSync } from "fs";
import shops from "../data/shops";
import { ProductProps } from "./types";
import { connection } from "E:/Projects/Coding/Web/React/product-finder/lib/sql.js";
const lineReader = require("line-reader");

main();

async function main() {
    // insertShopProductsSQL("billa");
    console.log(readCategories("unimarkt"));
}

// Products
async function insertShopProductsSQL(shop: string) {
    const categories: any[] = shops[shop].categories;

    categories.forEach(async (category) => {
        await insertCategorieProductSQL(shop, category);
    });
    console.log("Finish!");
}

async function insertCategorieProductSQL(
    shop: string,
    category: { name: string; id: string }
) {
    var i = 0;

    await new Promise<void>((res) => {
        lineReader.eachLine(
            `./data/${shop}/${category.name}.csv`,
            function (line, last) {
                const isFirstLine = ++i <= 1;
                if (isFirstLine) return;

                const cells = line.split(",");
                const prodcutProps: ProductProps = {
                    name: cells[1],
                    price: cells[2],
                    imgUrl: cells[3],
                    productUrl: cells[4],
                    categoryId: category.id,
                };
                sendProductToSQL(prodcutProps);
                if (last) {
                    console.log("added products for", shop, "-", category);
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
    ];

    const query =
        "INSERT INTO products (name, price, imgUrl, productUrl, categoryId) VALUES (?)";

    connection.query(query, [data], (err, rows) => {
        if (err) throw err;
        // console.log("inserted ->", productProps.name);
    });
}

// Categories
function insertCategoriesSQL(shopName: string) {
    const categories: any[] = shops[shopName].categories;

    categories.forEach((category) => {
        const query =
            "INSERT INTO categories (categoryId, name, shopId) VALUES (?)";
        const data = [category.id, category.name, shops[shopName].id];

        connection.query(query, [data], (err, rows) => {
            if (err) throw err;
            console.log("inserted ->", category);
        });
    });
}

function readCategories(shop: string): any[] {
    const categories = readdirSync(`data/${shop}`).map((x) =>
        x.replace(".csv", "")
    );
    // return categories.map((categorie) => ({
    //     name: categorie,
    //     id: [...Math.random().toString(16).slice(10)]
    //         .map((x) => (Math.random() > 0.5 ? x.toUpperCase() : x))
    //         .join(""),
    // }));
    return categories;
}
