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
}

type PropFunc = (wrapper: any) => string | number;

export type Wait = (page: Page) => Promise<any>;

