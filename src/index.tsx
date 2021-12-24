import {
  ActionPanel,
  CopyToClipboardAction,
  List,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
  Icon,
  Color,
} from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import fetch, { AbortError } from "node-fetch";
import crypto from "crypto";
import qs from "querystring";
import { isNotEmpty, readtext } from "./utils/readtxt";


let errorMap = new Map([
  ["-1", "Typing something"],
  ["113", "不能为空"],
  ["108", "测试"]
]); 

let language = new Map([
  ["zh-CHS","Chinese"],
  ["en","English"],
  ["ja","Japanese"],
  ["ko","Korean"],
  ["fr","French"],
  ["es","Spanish"],
  ["pt","Portuguese"],
  ["it","Italian"],
  ["ru","Russian"],
  ["vi","Vietnamese"],
  ["de","German"],
  ["ar","Arabic"],
  ["id","Indonesian"],
  ["af","Afrikaans"],
  ["bs","Bosnian"],
  ["bg","Bulgarian"],
  ["yue","Cantonese"],
  ["ca","Catalan"],
  ["hr","Croatian"],
  ["cs","Czech"],
  ["da","Danish"],
  ["nl","Dutch"],
  ["et","Estonian"],
  ["fj","Fijian"],
  ["fi","Finnish"],
  ["el","Greek"],
  ["ht","Haitian Creole"],
  ["he","Hebrew"],
  ["hi","Hindi"],
  ["hu","Hungarian"],
  ["sw","Swahili"],
  ["lv","Latvian"],
  ["lt","Lithuanian"],
  ["ms","Malay"],
  ["mt","Maltese"],
  ["no","Norwegian"],
  ["fa","Persian"],
  ["pl","Polish"],
  ["ro","Romanian"],
  ["sk","Slovak"],
  ["sl","Slovenian"],
  ["sv","Swedish"],
  ["ty","Tahitian"],
  ["th","Thai"],
  ["to","Tongan"],
  ["tr","Turkish"],
  ["uk","Ukrainian"],
  ["ur","Urdu"],
  ["cy","Welsh"],
  ["sq","Albanian"],
  ["am","Amharic"],
  ["hy","Armenian"],
  ["az","Azerbaijani"],
  ["bn","Bengali"],
  ["eu","Basque"],
  ["be","Belarusian"],
  ["co","Corsican"],
  ["eo","Esperanto"],
  ["tl","Filipino"],
  ["fy","Frisian"],
  ["gl","Galician"],
  ["ka","Georgian"],
  ["ha","Hausa"],
  ["is","Icelandic"],
  ["ig","Igbo"],
  ["ga","Irish"],
  ["jw","Javanese"],
  ["kn","Kannada"],
  ["kk","Kazakh"],
  ["km","Cambodian"],
  ["ku","Kurdish"],
  ["ky","Kirgiz"],
  ["lo","Lao"],
  ["la","Latin"],
  ["lb","Luxembourgish"],
  ["mk","Macedonian"],
  ["mg","Malagasy"],
  ["ml","Malayalam"],
  ["mi","Maori"],
  ["mr","Marathi"],
  ["mn","Mongolian"],
  ["my","Burmese"],
  ["ne","Nepali"],
  ["ny","Chichewa"],
  ["ps","Pashto"],
  ["pa","Punjabi"],
  ["sm","Samoan"],
  ["gd","Scottish Gaelic"],
  ["st","Sesotho"],
  ["sn","Shona"],
  ["sd","Sindhi"],
  ["si","Sinhala"],
  ["so","Somali"],
  ["su","Sundanese"],
  ["tg","Tajik"],
  ["ta","Tamil"],
  ["te","Telugu"],
  ["uz","Uzbek"],
  ["xh","South African Xhosa"],
  ["Yiddish","yi"],
  ["yo","Yoruba"],
  ["zu","Zulu, South Africa"],
  ["haw","Hawaiian"],
  ["ceb","Cebuano"],
  ["yua","Yucatan Maya"],
  ["sr-Cyrl","Serbian-Cyrillic"],
  ["sr-Latn","Serbian-Latin"],
  ["otq","Queretaro Otomi"],
  ["tlh","Klingon"],
  ["mww","Bai Hmong"],
]);


export default function Command() {
  let emap = errorMap;
  let lang = language;
  const { state, search } = useSearch();

  if (state.results && state.results.errorCode && state.results.errorCode != "0") {
  }
  return (
    <List isLoading={state.isLoading} onSearchTextChange={search} searchBarPlaceholder="Typing translate words or sentence" throttle>
      {state.results.translation ?
          <List.Section title="Translate" subtitle="翻译">
            {state.results.translation.map(
                (item: string, index: number) => (
                    <List.Item key={index} 
                    title={item} 
                    icon={{ source: Icon.Dot, tintColor: Color.Purple }} 
                    subtitle={(state.results.basic && state.results.basic.phonetic ? "[ " +state.results.basic.phonetic + " ]" : null) as string }
                    accessoryTitle={state.results.lang}
                    actions={
                      <TranslateResultActionPanel copy_content={item}
                                                  url={state.results.webdict && state.results.webdict.url ? state.results.webdict.url : undefined} />
                    } />
                )
            )}
          </List.Section> : null}
      {state.results.basic && state.results.basic.phonetic?
          <List.Section title="Phonetic" subtitle="音标">
            {state.results.basic["uk-phonetic"]?
                <List.Item 
                key={state.results.basic["uk-phonetic"]} 
                title={"[ " + state.results.basic["uk-phonetic"] as string + " ]"} 
                icon={{ source: Icon.Dot, tintColor: Color.Green }} 
                subtitle="uk"
                accessoryTitle="英国"
                /> 
                :null}
            {state.results.basic["us-phonetic"]?
              <List.Item 
              key={state.results.basic["us-phonetic"]} 
              title={"[ " + state.results.basic["us-phonetic"] as string + " ]"} 
              icon={{ source: Icon.Dot, tintColor: Color.Green }} 
              subtitle="us"
              accessoryTitle="美国"
              />
              : null
            }
          </List.Section> : null}  
            
      {state.results.basic && state.results.basic.explains && state.results.basic.explains.length > 0 ?
          <List.Section title="Detail" subtitle="详细释义">
            {state.results.basic.explains.map(
                (item: string, index: number) => (
                    <List.Item key={index} title={item}  icon={{ source: Icon.Dot, tintColor: Color.Blue }} actions={
                      <TranslateResultActionPanel copy_content={item}
                                                  url={state.results.webdict && state.results.webdict.url ? state.results.webdict.url : undefined} />
                    } />
                )
            )}
          </List.Section> : null}
  
      {state.results.web && state.results.web.length > 0 ?
          <List.Section title="Web Translate" subtitle="网络释义">
            {(state.results.web).map(
                (item: translateWebResult, index: number) => (
                    <List.Item key={index} title={item.value.join(", ")} icon={{ source: Icon.Dot, tintColor: Color.Yellow }}
                               subtitle={item.key} actions={
                      <TranslateResultActionPanel copy_content={item.value.join(", ")}
                                                  url={state.results.webdict && state.results.webdict.url ? state.results.webdict.url : undefined} />
                    }
                    />
                )
            )}
          </List.Section> : null}
    </List>
  );
}


function TranslateResultActionPanel(props: { copy_content: string, url: string | undefined }) {
  const { copy_content, url } = props;
  return (
      <ActionPanel>
        <CopyToClipboardAction content={copy_content} />
        {url ? <OpenInBrowserAction url={url} /> : null}
      </ActionPanel>
  );
}


function useSearch() {
  const [state, setState] = useState<SearchState>({ results: {translation:[],l:"",isWord:false,basic: {},web:[],webdict:{url:""},errorCode:"",lang:"unkown"}, isLoading: true });
  const cancelRef = useRef<AbortController | null>(null);

  useEffect(() => {
    search("");
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  async function search(searchText: string) {

    cancelRef.current?.abort();
    cancelRef.current = new AbortController();
    try {
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      const results = await performSearch(searchText, cancelRef.current.signal);
      setState((oldState) => ({
        ...oldState,
        results: results,
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof AbortError) {
        return;
      }
      console.error("search error", error);
      showToast(ToastStyle.Failure, "Could not perform search", String(error));
    }
  }

  return {
    state: state,
    search: search,
  };
}

async function performSearch(searchText: string, signal: AbortSignal): Promise<SearchResult> {
  if(searchText.length === 0)
  {
    searchText = await readtext()
    if(searchText.length === 0)
    {
    return {
      translation: [],
      isWord: false,
      basic: {} ,
      l: "unknown",
      web: [],
      webdict: { url: "" },
      errorCode: "-1",
      lang: "unkwon"
    };
    }
  }
  const app_key = "7e97fd90243ce0f0";
  const app_secret = "8VC67MHGg7S0fDER3JhhGlo5qBpawBpf";
  const q = Buffer.from(searchText).toString();
  const salt = Date.now();
  const sign = generateSign(q, salt, app_key, app_secret);
  const query = qs.stringify({ q: q, appKey: app_key, from: "auto", to: "auto", salt, sign });
  const response = await fetch(`https://openapi.youdao.com/api?${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const searchResult = (await response.json()) as SearchResult;

  console.log(searchResult)
  const lan = searchResult.l.split("2");
  if(lan.length === 2) {
    searchResult.lang = language.get(lan[0]) as string + " to " + language.get(lan[1])
  }

  return searchResult; 
}

function generateSign(content: string, salt: number, app_key: string, app_secret: string) {
  const md5 = crypto.createHash("md5");
  md5.update(app_key + content + salt + app_secret);
  const cipher = md5.digest("hex");
  return cipher.slice(0, 32).toUpperCase();
}

interface SearchState {
  results: SearchResult;
  isLoading: boolean;
}

interface SearchResult {
  translation?: Array<string>;
  isWord: boolean;
  basic?: { phonetic?: string, explains?: Array<string>, "uk-phonetic"?: string, "us-phonetic"?: string };
  l: string;
  lang:string;
  web?: Array<translateWebResult>;
  webdict?: { url: string };
  errorCode: string;
}

interface translateWebResult {
  value: Array<string>;
  key: string;
}
