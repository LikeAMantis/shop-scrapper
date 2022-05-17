import { Page } from "puppeteer";

export interface SelectorStrings {
    itemCard: string;
    categories?: string[];
    nextBtn?: string;
}

export interface PropSelectors {
    name: PropFunc;
    price: PropFunc;
    imgUrl: PropFunc;
    productUrl: PropFunc;
}

export interface ProductProps {
    name: string; 
    price: string; 
    imgUrl: string; 
    productUrl: string;
    categoryId: string;
    shopId: string;
}


type PropFunc = (wrapper: any) => string | number;

export type Wait = (page: Page) => Promise<any>;



export type grocceryCategories =
    "brot & gebäck" |
	"fleisch, wurst & fisch" |
	"getränke" |
	"haushalt" |
	"obst & gemüse" |
    "süßes & salziges" |
	"tiefkühl" |
	"haustier" |
	"pflege" |
	"kühlwaren" |
	"grundnahrungsmittel" |
	"sonstiges";

export interface CategoryReMap {
    [prevCat: string]: grocceryCategories;
}