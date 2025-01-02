"use client";

import { UserCore } from "@/biz/user";
import { request } from "@/biz/services";
import { SectionPayload } from "@/biz/sponsors";
import { HttpClientCore } from "@/domains/http_client";
import { connect as connectHttpClient } from "@/domains/http_client/connect.axios";
import { Application } from "@/domains/app";
import { connect as connectApplication } from "@/domains/app/connect.web";
import { StorageCore } from "@/domains/storage";
import { RequestCore } from "@/domains/request";
import { BizError } from "@/domains/error";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    token: "",
    avatar: "",
  },
};
const key = "global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: e ? JSON.parse(e) : DEFAULT_CACHE_VALUES,
  client: globalThis.localStorage,
});

export const user = new UserCore(storage.get("user"));
export const app = new Application({ storage });
connectApplication(app);
export const client = new HttpClientCore();
connectHttpClient(client);

function handleError(err: BizError) {
  app.tip({
    text: [err.message],
  });
  if (err.code === 900) {
    user.logout();
    return;
  }
}

export const services = {
  auth: new RequestCore(
    (token: string) => {
      return request.post<{ sections: SectionPayload[] }>("/api/auth", {
        token,
      });
    },
    { client }
  ),
  fetchConfig: new RequestCore(
    () => {
      return request.get<{ sections: SectionPayload[] }>("/api/config");
    },
    { onFailed: handleError, client }
  ),
  updateConfig: new RequestCore(
    (data: SectionPayload) => {
      return request.post("/api/config", data);
    },
    { onFailed: handleError, client }
  ),
};
user.setServices({ auth: services.auth });
request.appendHeaders({
  Authorization: user.token,
});
user.onLogin((v) => {
  storage.set("user", v);
  request.appendHeaders({
    Authorization: user.token,
  });
});
