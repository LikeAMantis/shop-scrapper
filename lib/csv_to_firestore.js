import { readFile } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import {} from "index.d.ts";

const firebaseConfig = {
    apiKey: "AIzaSyCt0AyCJaxgXuU4ht2AMdjGXG7eCiftH-0",
    authDomain: "product-finder-3cd96.firebaseapp.com",
    projectId: "product-finder-3cd96",
    storageBucket: "product-finder-3cd96.appspot.com",
    messagingSenderId: "882781882490",
    appId: "1:882781882490:web:a71cf7aaf3ea12cc5353c3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addToFirebase(product, colName, id = null) {
    const col = collection(db, colName);

    if (id) {
        await setDoc(doc(col, id), product);
        return;
    }
    await setDoc(doc(col), product);
}

readFile(`./data/spar/test.csv`, "utf8", function (err, fileData) {
    const rows = fileData.split("\n");
    rows.shift();

    const products = parseRows(rows.slice(0, 2));
    products.forEach((product) =>
        addToFirebase(
            { ...product, categoryId: "ueeVHYX2QVOJ0Sh0GtKT" },
            "products"
        )
    );
});

function parseRows(rows) {
    return rows
        .map((x) => x.split(","))
        .map((row) => ({ name: row[1], price: row[2], imgUrl: row[3] }));
}
