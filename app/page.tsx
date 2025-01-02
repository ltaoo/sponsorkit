/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { twMerge as cn } from "tailwind-merge";

import {
  CoverLayer,
  CoverLayerTypes,
  SectionPayload,
  SponsorCanvas,
} from "@/biz/sponsors";
import { HttpClientCore } from "@/domains/http_client";
import { connect } from "@/domains/http_client/connect.axios";
import { RequestCore } from "@/domains/request";
import { request_factory } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { textToFile } from "@/utils/browser";

const CoverLayerZIndexMap: Record<CoverLayerTypes, number> = {
  [CoverLayerTypes.Whole]: 0,
  [CoverLayerTypes.Section]: 1,
  [CoverLayerTypes.QRCodeSection]: 1,
  [CoverLayerTypes.Title]: 12,
  [CoverLayerTypes.Sponsor]: 11,
  [CoverLayerTypes.QRCode]: 11,
  [CoverLayerTypes.Margin]: 2,
  [CoverLayerTypes.Padding]: 2,
  [CoverLayerTypes.Gutter]: 3,
};
const CoverLayerColorMap: Record<CoverLayerTypes, string> = {
  [CoverLayerTypes.Whole]: "bg-red-400",
  [CoverLayerTypes.Section]: "bg-blue-400",
  [CoverLayerTypes.QRCodeSection]: "bg-blue-400",
  [CoverLayerTypes.Title]: "bg-green-800",
  [CoverLayerTypes.Sponsor]: "bg-green-800",
  [CoverLayerTypes.QRCode]: "bg-green-800",
  [CoverLayerTypes.Margin]: "bg-red-400",
  [CoverLayerTypes.Padding]: "bg-red-400",
  [CoverLayerTypes.Gutter]: "bg-yellow-800",
};
const CoverLayerBorderColorMap: Record<CoverLayerTypes, string> = {
  [CoverLayerTypes.Whole]: "border-red-400",
  [CoverLayerTypes.Section]: "border-blue-400",
  [CoverLayerTypes.QRCodeSection]: "border-blue-400",
  [CoverLayerTypes.Title]: "border-green-800",
  [CoverLayerTypes.Sponsor]: "border-green-800",
  [CoverLayerTypes.QRCode]: "border-green-800",
  [CoverLayerTypes.Margin]: "border-red-400",
  [CoverLayerTypes.Padding]: "border-red-400",
  [CoverLayerTypes.Gutter]: "border-yellow-800",
};

const $ins = SponsorCanvas({ width: 800, padding: 32 });
const client = new HttpClientCore();
connect(client);
const request = request_factory({
  hostnames: {
    prod: "",
  },
  process<T>(v: Result<{ code: number; msg: string; data: T }>) {
    if (v.error) {
      return Result.Err(v.error.message);
    }
    const { code, msg, data } = v.data;
    if (code !== 0) {
      return Result.Err(msg);
    }
    return Result.Ok(data);
  },
});

const services = {
  fetchConfig: new RequestCore(
    () => {
      return request.get<{ sections: SectionPayload[] }>("/api/config");
    },
    { client }
  ),
  updateConfig: new RequestCore(
    () => {
      return request.get("/api/config");
    },
    { client }
  ),
};

export default function Home() {
  const [state, setState] = useState<{
    content: string;
    nodes: CoverLayer[];
    width: number;
    height: number;
  }>({ content: "", nodes: [], width: $ins.width, height: $ins.padding * 2 });
  const [preview, setPreview] = useState(true);
  const [selectedNode, setNode] = useState<CoverLayer | null>(null);

  async function load() {
    const r = await services.fetchConfig.run();
    if (r.error) {
      return;
    }
    // const payload: { sections: SectionPayload[] } = {
    //   sections: [
    //     {
    //       title: "Thank you for your support",
    //       num_per_line: 2,
    //       max_width: 460,
    //       gutter: 88,
    //       show_text: false,
    //       shape: "rounded",
    //       override: { type: CoverLayerTypes.QRCode },
    //       list: [{ text: "", image: WechatReward, href: "#" }].slice(0, 2),
    //     },
    //     {
    //       title: "Special Sponsors",
    //       num_per_line: 5,
    //       max_width: 460,
    //       gutter: 28,
    //       show_text: true,
    //       shape: "circle",
    //       list: FAKE1.slice(0, 5),
    //     },
    //     {
    //       title: "Special Sponsors",
    //       num_per_line: 6,
    //       max_width: 460,
    //       gutter: 24,
    //       show_text: true,
    //       shape: "circle",
    //       list: FAKE1.slice(0, 6),
    //     },
    //     {
    //       title: "Sponsors",
    //       num_per_line: 12,
    //       gutter: 12,
    //       shape: "circle",
    //       show_text: false,
    //       list: FAKE1,
    //     },
    //   ],
    // };
    const payload = r.data;
    const r2 = $ins.load(payload);
    r2.content = textToFile(r2.content, "image/svg+xml");
    setState(r2);
  }
  useEffect(() => {}, []);

  return (
    <div
      onClick={() => {
        setNode(null);
      }}
    >
      <div className="mt-8 pb-12 clearfix container-xl px-md-4 px-lg-5 px-3">
        <div>
          <div className="flex" style={{ maxWidth: "100%" }}>
            <div
              className="flex"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="flex w-[827px] p-[32px] border-[#d1d9e0] border rounded-[6px] bg-white">
                <div
                  className="__a relative w-full h-full"
                  onAnimationEnd={(event) => {
                    const w = event.currentTarget.clientWidth;
                    $ins.setWidth(w);
                    load();
                  }}
                >
                  {state.content ? (
                    <img
                      className="w-full"
                      src={state.content}
                      alt="sponsors"
                    />
                  ) : null}
                  {!preview ? (
                    <div className="absolute inset-0">
                      {state.nodes.map((node, i) => {
                        return (
                          <div
                            key={i}
                            className={cn(
                              "absolute opacity-20 cursor-pointer border border-2 hover:border-red-600",
                              CoverLayerColorMap[node.type],
                              CoverLayerBorderColorMap[node.type],
                              selectedNode === node
                                ? "outline outline-dashed"
                                : ""
                            )}
                            style={{
                              zIndex: CoverLayerZIndexMap[node.type],
                              left: `${node.x}px`,
                              top: `${node.y}px`,
                              width: `${node.width}px`,
                              height: `${node.height}px`,
                            }}
                            onClick={() => {
                              setNode((prev) => {
                                if (prev?.id === node.id) {
                                  return null;
                                }
                                return node;
                              });
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div
              className="Layout-sidebar ml-8"
              style={{ alignSelf: "flex-start" }}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div className="BorderGrid">
                <div className="BorderGrid-row">
                  <div className="BorderGrid-cell">
                    <div className="hide-sm hide-md">
                      <h2 className="mb-3 h4">Global Settings</h2>
                      <div>
                        <div
                          onClick={() => {
                            setPreview((p) => !p);
                          }}
                        >
                          {preview ? "编辑" : "预览"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="BorderGrid-row">
                  <div className="BorderGrid-cell">
                    <div className="hide-sm hide-md">
                      <h2 className="mb-3 h4">Component Settings</h2>
                      {(() => {
                        if (!selectedNode) {
                          return null;
                        }
                        const { type } = selectedNode;
                        if (type === CoverLayerTypes.QRCode) {
                          return (
                            <div>
                              <input placeholder="" type="file" />
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.Sponsor) {
                          return (
                            <div>
                              <input placeholder="请输入名称" />
                              <input placeholder="请输入链接" />
                              <input placeholder="" type="file" />
                              <div>删除</div>
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.QRCodeSection) {
                          return (
                            <div>
                              <div>标题</div>
                              <div>
                                <input placeholder="请输入标题" />
                              </div>
                              <div>新增 QRCode</div>
                              <div>每行多少个</div>
                              <div>间距</div>
                              <div>删除</div>
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.Section) {
                          return (
                            <div>
                              <div>标题</div>
                              <div>
                                <input placeholder="请输入标题" />
                              </div>
                              <div>展示名称</div>
                              <div>新增 Sponsor</div>
                              <div>每行多少个</div>
                              <div>间距</div>
                              <div>删除</div>
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.Whole) {
                          return (
                            <div>
                              <div>内边距</div>
                              <div></div>
                              <div>新增 Section</div>
                              <div></div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=""></div>
    </div>
  );
}
