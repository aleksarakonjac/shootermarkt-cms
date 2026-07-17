import "@payloadcms/next/css";
import "./payload-theme.css";
import { Barlow_Condensed } from "next/font/google";
import type { ServerFunctionClient } from "payload";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import config from "../../../payload.config";
import { importMap } from "./cms/admin/importMap";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const serverFunction: ServerFunctionClient = async function (args) {
    "use server";
    return handleServerFunctions({ ...args, config, importMap });
  };

  return <RootLayout config={config} htmlProps={{ className: barlowCondensed.variable }} importMap={importMap} serverFunction={serverFunction}>{children}</RootLayout>;
}
