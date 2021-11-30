import HerrscherClient from "./client/Herrscher";
import { readFileSync } from "fs";
import { join } from "path";

console.log(readFileSync(join(__dirname, "..", "bigtitle.txt"), "utf8").toString());

const token: string = process.env.DISCORD_TOKEN;
const owners: string[] = (process.env.OWNER_ID || "").split(",");

const client: HerrscherClient = new HerrscherClient({ token, owners });
client.start();