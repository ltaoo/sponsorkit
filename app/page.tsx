/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { twMerge as cn } from "tailwind-merge";

import { CoverLayerTypes } from "@/biz/sponsors";
import { Button, Input } from "@/components/ui";
import { DragZone } from "@/components/ui/drag-zone";
import { Container } from "@/components/ui/container";
import { SponsorForm } from "@/components/sponsor-form";
import { SectionForm } from "@/components/section-form";
import { Textarea } from "@/components/ui/textarea";
import { Switch, SwitchLabel } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { DragZonePreview } from "@/components/ui/drag-zone-preview";

import { PageLogic } from "./logic";
import { GithubIcon } from "@/components/github-icon";

const CoverLayerZIndexMap: Record<CoverLayerTypes, number> = {
  [CoverLayerTypes.Whole]: 0,
  [CoverLayerTypes.Section]: 1,
  // [CoverLayerTypes.QRCodeSection]: 1,
  [CoverLayerTypes.Title]: 12,
  [CoverLayerTypes.Sponsor]: 11,
  // [CoverLayerTypes.QRCode]: 11,
  [CoverLayerTypes.Margin]: 2,
  [CoverLayerTypes.Padding]: 2,
  [CoverLayerTypes.Gutter]: 3,
};
const CoverLayerColorMap: Record<CoverLayerTypes, string> = {
  [CoverLayerTypes.Whole]: "bg-red-400",
  [CoverLayerTypes.Section]: "bg-blue-400",
  // [CoverLayerTypes.QRCodeSection]: "bg-blue-400",
  [CoverLayerTypes.Title]: "bg-green-800",
  [CoverLayerTypes.Sponsor]: "bg-green-800",
  // [CoverLayerTypes.QRCode]: "bg-green-800",
  [CoverLayerTypes.Margin]: "bg-red-400",
  [CoverLayerTypes.Padding]: "bg-red-400",
  [CoverLayerTypes.Gutter]: "bg-yellow-800",
};
const CoverLayerBorderColorMap: Record<CoverLayerTypes, string> = {
  [CoverLayerTypes.Whole]: "border-red-400",
  [CoverLayerTypes.Section]: "border-blue-400",
  // [CoverLayerTypes.QRCodeSection]: "border-blue-400",
  [CoverLayerTypes.Title]: "border-green-800",
  [CoverLayerTypes.Sponsor]: "border-green-800",
  // [CoverLayerTypes.QRCode]: "border-green-800",
  [CoverLayerTypes.Margin]: "border-red-400",
  [CoverLayerTypes.Padding]: "border-red-400",
  [CoverLayerTypes.Gutter]: "border-yellow-800",
};

const $page = PageLogic();

export default function Home() {
  const [state, setState] = useState($page.state);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    $page.onStateChange((v) => setState(v));
    $page.ui.$preview.onChange((v) => setPreview(v));
    $page.ready();
  }, []);

  return (
    <div
      className="relative"
      onClick={() => {
        $page.clearSelectedNode();
      }}
    >
      <div className="fixed bottom-12 right-12">
        <div className="flex items-center space-x-4">
          <a href="https://github.com/ltaoo/AppIconsHelper" target="_blank">
            <GithubIcon className="text-gray-600 rounded-full shadow-lg hover:text-gray-800 cursor-pointer" />
          </a>
          {/* <div className="w-[56px] h-[56px] flex items-center justify-center rounded-full shadow-lg  text-gray-600 hover:text-gray-800 cursor-pointer">
            <LogOut className="w-[48px] h-[48px]" />
          </div> */}
        </div>
      </div>
      {state.authorized ? (
        <div className="mt-8 pb-12 clearfix container-xl px-md-4 px-lg-5 px-3">
          <div>
            <div className="relative flex" style={{ maxWidth: "100%" }}>
              <div
                className="relative flex"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {!state.loaded ? (
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
                    <Loader className="w-12 h-12 animate-spin" />
                  </div>
                ) : null}
                <div className="flex w-[827px] p-[32px] border-[#d1d9e0] border rounded-[6px] bg-white">
                  <Container
                    className="relative w-full h-full min-h-[120px]"
                    onMount={(node) => {
                      const w = node.clientWidth;
                      $page.ui.$canvas.setWidth(w);
                      $page.ready();
                    }}
                  >
                    {state.url ? (
                      <img className="w-full" src={state.url} alt="sponsors" />
                    ) : null}
                    {!preview ? (
                      <div className="absolute inset-0">
                        {state.nodes.map((node) => {
                          return (
                            <div
                              key={node.id}
                              className={cn(
                                "absolute opacity-20 cursor-pointer border border-2 hover:border-red-600",
                                CoverLayerColorMap[node.type],
                                CoverLayerBorderColorMap[node.type],
                                state.node?.id === node.id
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
                                $page.selectNode(node);
                              }}
                            ></div>
                          );
                        })}
                      </div>
                    ) : null}
                  </Container>
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
                        <h2 className="mb-3 h4">操作</h2>
                        <div className="flex items-center">
                          <Switch store={$page.ui.$preview} />
                          <SwitchLabel
                            className="ml-2"
                            store={$page.ui.$preview}
                          />
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            variant="secondary"
                            store={$page.ui.$export_btn}
                          >
                            导出
                          </Button>
                          <Button
                            variant="secondary"
                            store={$page.ui.$copy_btn}
                          >
                            复制当前数据
                          </Button>
                          {/* <Button
                          variant="secondary"
                          store={$page.ui.$import_btn}
                        >
                          导入
                        </Button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[1px] my-4 bg-[#d1d9e0b3]"></div>
                  <div className="BorderGrid-row">
                    <div className="BorderGrid-cell">
                      <div className="hide-sm hide-md">
                        <h2 className="mb-3 h4">设置</h2>
                        {(() => {
                          if (!state.node) {
                            return null;
                          }
                          const { type } = state.node;
                          // if (type === CoverLayerTypes.QRCode) {
                          //   return (
                          //     <div>
                          //       <input placeholder="" type="file" />
                          //     </div>
                          //   );
                          // }

                          // if (type === CoverLayerTypes.QRCodeSection) {
                          //   return (
                          //     <div>
                          //       <div>标题</div>
                          //       <div>
                          //         <input placeholder="请输入标题" />
                          //       </div>
                          //       <div>新增 QRCode</div>
                          //       <div>每行多少个</div>
                          //       <div>间距</div>
                          //       <div>删除</div>
                          //     </div>
                          //   );
                          // }
                          if (type === CoverLayerTypes.Whole) {
                            return (
                              <div>
                                {/* {id} */}
                                <div className="">
                                  <SectionForm store={$page.ui.$section_form} />
                                  <Button
                                    className="mt-4"
                                    variant="default"
                                    store={$page.ui.$section_form_create_btn}
                                  >
                                    新增块
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                          if (type === CoverLayerTypes.Section) {
                            return (
                              <div>
                                {/* {id} */}
                                <SectionForm store={$page.ui.$section_form} />
                                <Button
                                  className="mt-4"
                                  variant="destructive"
                                  store={$page.ui.$section_form_delete_btn}
                                >
                                  删除块
                                </Button>
                                <div className="h-[1px] my-4 bg-[#d1d9e0b3]"></div>
                                <div className="mt-8">
                                  <SponsorForm store={$page.ui.$sponsor_form} />
                                  <Button
                                    className="mt-4"
                                    variant="default"
                                    store={$page.ui.$sponsor_form_create_btn}
                                  >
                                    新增卡片
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                          if (type === CoverLayerTypes.Title) {
                            return (
                              <div>
                                {/* {id} */}
                                <Input store={$page.ui.$title} />
                              </div>
                            );
                          }
                          if (type === CoverLayerTypes.Sponsor) {
                            return (
                              <div>
                                {/* {id} */}
                                <SponsorForm store={$page.ui.$sponsor_form} />
                                <Button
                                  className="mt-4"
                                  variant="destructive"
                                  store={$page.ui.$sponsor_form_delete_btn}
                                >
                                  删除卡片
                                </Button>
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
      ) : null}
      <Dialog store={$page.ui.$token_dialog}>
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          输入 token 授权
        </h2>
        <div className="mt-4">
          <Textarea store={$page.ui.$token_input} />
        </div>
      </Dialog>
      <Dialog store={$page.ui.$import_dialog}>
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          导入数据文件
        </h2>
        <div className="mt-4">
          <div className="relative w-full h-[120px]">
            <DragZone store={$page.ui.$import_zone}>
              <DragZonePreview store={$page.ui.$import_zone} />
            </DragZone>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
