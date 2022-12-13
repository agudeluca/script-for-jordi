/* eslint-disable prefer-const */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import util from "util";

import csv from "csv-parser";

import path from "path";

export default function mapCsvHeaders(args: {
  header: string;
  index: number;
}): string | null {
  switch (args.index) {
    case 0:
      return "value";
    case 1:
      return "acc";
    default:
      return null;
  }
}

const CSV_DIRECTORY = path.join(process.cwd(), "/csv");

export const getCSV = async (): Promise<string[]> => {
  const readDir = util.promisify(fs.readdir);
  const directoryFiles = await readDir(CSV_DIRECTORY);

  return directoryFiles
    .filter((file) => file.endsWith(".csv"))
    .map((fileName) => `${CSV_DIRECTORY}/${fileName}`);
};

export const readCSV = async (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    let data: any = [];
    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: mapCsvHeaders }))
      .on("data", (row) => data.push(row))
      .on("end", () => {
        resolve(data);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
const show = (data: any): void => {
  let result: { value: any }[] = [];
  data[0].forEach((item: any) => {
    const { acc, value } = item;
    for (let index = 0; index < acc; index++) {
      result.push({ value });
    }
  });

  // print four items by row
  let count = 0;
  let acc = "";
  result.forEach((item, index) => {
    if (count < 4) {
      acc = !acc ? item.value : `${acc}, ${item.value}`;
      count++;
    }
    if (index === result.length - 1) {
      console.log(acc)
      return
    }
    if (count === 4) {
      console.log(acc)
      acc = '';
      count = 0;
      return;
    };
  });
};

async function init(): Promise<any> {
  const csvFiles = await getCSV();
  const csv = await Promise.all(
    csvFiles.map(async (file) => await readCSV(file))
  );
  show(csv);
}
init();
