import { Page } from "puppeteer";

export interface SelectorStrings {
    itemWrappers: string;
    categories?: string[];
    nextBtn?: string;
}

export interface PropSelectors {
    name: PropFunc;
    price: PropFunc;
    imgUrl: PropFunc;
    productUrl: PropFunc;
}

type PropFunc = (wrapper: any) => string | number;

export type Wait = (page: Page) => Promise<any>;

