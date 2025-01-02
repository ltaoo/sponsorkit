/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { twMerge as cn } from "tailwind-merge";

import {
  CoverLayer,
  CoverLayerTypes,
  SectionPayload,
  CanvasPayload,
  SponsorCanvas,
  CardImageShape,
} from "@/biz/sponsors";
import { base, Handler } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client";
import { connect } from "@/domains/http_client/connect.axios";
import { RequestCore } from "@/domains/request";
import { request_factory } from "@/domains/request/utils";
import { Result } from "@/domains/result";
import { ButtonCore, FormCore, InputCore, SelectCore } from "@/domains/ui";
import { SwitchCore } from "@/domains/ui/switch";
import { FormFieldCore } from "@/domains/ui/form/field";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";
import { Button, Input } from "@/components/ui";
import { SectionForm } from "@/components/section-form";
import { textToFileURL } from "@/utils/browser";
import { SponsorForm } from "@/components/sponsor-form";
import { SliderCore } from "@/domains/ui/slider";
import { Switch, SwitchLabel } from "@/components/ui/switch";

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
function PageLogic() {
  const $canvas = SponsorCanvas({ width: 800, padding: 32 });
  const $title = new InputCore({
    defaultValue: "",
    placeholder: "请输入标题",
    allowClear: false,
  });
  const $section_form = FormCore({
    fields: {
      title: new FormFieldCore({
        label: "标题",
        name: "title",
        input: new InputCore({
          defaultValue: "",
          allowClear: false,
        }),
      }),
      num: new FormFieldCore({
        label: "每行卡片数",
        name: "num",
        input: new InputCore({
          defaultValue: 8,
          allowClear: false,
        }),
      }),
      gutter: new FormFieldCore({
        label: "卡片间距",
        name: "gutter",
        input: SliderCore({
          defaultValue: 12,
          min: 4,
          max: 48,
        }),
      }),
      width: new FormFieldCore({
        label: "最大宽度",
        name: "width",
        input: SliderCore({
          defaultValue: 460,
          disabled: true,
          min: 300,
          max: 800,
        }),
      }),
      enableWidth: new FormFieldCore({
        label: "最大宽度开关",
        name: "enableWidth",
        input: SwitchCore({
          id: "enableWidth",
          defaultValue: false,
        }),
      }),
      shape: new FormFieldCore({
        label: "卡片形状",
        name: "shape",
        input: new SelectCore<CardImageShape>({
          defaultValue: "circle",
          options: [
            {
              label: "圆形",
              value: "circle",
            },
            {
              label: "矩形",
              value: "rounded",
            },
          ],
        }),
      }),
      showText: new FormFieldCore({
        label: "展示卡片文本",
        name: "showText",
        input: SwitchCore({
          id: "showText",
          defaultValue: true,
          label: ["隐藏文本", "显示文本"],
        }),
      }),
    },
  });
  const $sponsor_form = FormCore({
    fields: {
      text: new FormFieldCore({
        label: "名称",
        name: "text",
        input: new InputCore({
          defaultValue: "",
          allowClear: false,
        }),
      }),
      href: new FormFieldCore({
        label: "外部链接",
        name: "href",
        help: "外部链接仅在作为 SVG 标签渲染时可点击",
        input: new InputCore({
          defaultValue: "",
          allowClear: false,
        }),
      }),
      image: new FormFieldCore({
        label: "头像",
        name: "image",
        input: ImageUploadCore({ tip: "拖动图片到此处" }),
      }),
    },
  });
  const $section_form_create_btn = new ButtonCore({});
  const $section_form_delete_btn = new ButtonCore({});
  const $sponsor_form_create_btn = new ButtonCore({});
  const $sponsor_form_delete_btn = new ButtonCore({});
  const $preview = SwitchCore({
    id: "preview",
    defaultValue: true,
    label: ["编辑", "预览"],
  });

  let _payload: CanvasPayload = { sections: [] as SectionPayload[] };
  let _nodes: CoverLayer[] = [];
  let _width = $canvas.width;
  let _height = $canvas.padding * 2;
  let _url = "";
  let _node: CoverLayer | null = null;
  // let _section: SectionPayload | null = null;
  const _state = {
    get nodes() {
      return _nodes;
    },
    get width() {
      return _width;
    },
    get height() {
      return _height;
    },
    get url() {
      return _url;
    },
    get node() {
      return _node;
    },
  };

  function refresh() {
    const r2 = $page.ui.$canvas.load(_payload);
    _width = r2.width;
    _height = r2.height;
    _url = textToFileURL(r2.content, "image/svg+xml");
    _nodes = r2.nodes;
    bus.emit(Events.StateChange, { ..._state });
  }
  function load(payload: CanvasPayload) {
    _payload = payload;
    refresh();
  }

  enum Events {
    SelectNode,
    UnSelectNode,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.SelectNode]: CoverLayer;
    [Events.UnSelectNode]: CoverLayer;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  $title.onChange((v) => {
    if (!_node) {
      return;
    }
    if (_node.type === CoverLayerTypes.Section) {
      _node.payload.title = v;
    }
    if (_node.type === CoverLayerTypes.Title) {
      _node.payload.title = v;
    }
    if (_node.type === CoverLayerTypes.Sponsor) {
      _node.payload.text = v;
    }
    refresh();
  });
  $section_form.fields.enableWidth.$input.onChange((v) => {
    if (v) {
      $section_form.fields.width.$input.enable();
      return;
    }
    $section_form.fields.width.$input.disable();
  });
  $section_form.onChange((v) => {
    if (!_node) {
      return;
    }
    if (_node.type === CoverLayerTypes.Section) {
      Object.assign(_node.payload, v);
      refresh();
    }
  });
  $sponsor_form.onChange((v) => {
    if (!_node) {
      return;
    }
    if (_node.type === CoverLayerTypes.Sponsor) {
      Object.assign(_node.payload, v);
      refresh();
    }
  });
  $section_form_create_btn.onClick(() => {
    const values = $section_form.value;
    console.log(values);
    const { title, num, width, gutter, shape, showText, enableWidth } = values;
    _payload.sections.push({
      title,
      num_per_line: num,
      gutter,
      max_width: enableWidth ? width : undefined,
      shape: (shape || "circle") as CardImageShape,
      show_text: showText,
      list: [],
    });
    refresh();
  });
  $sponsor_form_create_btn.onClick(() => {
    const values = $sponsor_form.value;
    if (!_node) {
      return;
    }
    if (_node.type !== CoverLayerTypes.Section) {
      return;
    }
    const { text, image, href } = values;
    console.log("[PAGE]home - before add sponsor", _node.payload.title);
    _node.payload.list.push({
      text,
      image,
      href,
    });
    refresh();
  });
  $section_form_delete_btn.onClick(() => {
    console.log("[PAGE]home - section_form_delete_btn", _node);
    if (!_node || !_node.payload) {
      return;
    }
    if (_node.type === CoverLayerTypes.Section) {
      const data = _node.payload;
      _payload.sections = _payload.sections.filter(
        (sec) => sec.title !== data.title
      );
      refresh();
    }
  });
  $sponsor_form_delete_btn.onClick(() => {
    if (!_node || !_node.payload) {
      return;
    }
    if (_node.type === CoverLayerTypes.Sponsor) {
      const matched = (() => {
        for (let i = 0; i < _payload.sections.length; i += 1) {
          const section = _payload.sections[i];
          for (let j = 0; j < section.list.length; j += 1) {
            const card = section.list[i];
            if (card === _node.payload) {
              return section;
            }
          }
        }
        return null;
      })();
      if (!matched) {
        return;
      }
      matched.list = matched.list.filter((card) => card !== _node?.payload);
      refresh();
    }
  });

  return {
    ui: {
      $preview,
      $canvas,
      $title,
      $section_form,
      $section_form_create_btn,
      $section_form_delete_btn,
      $sponsor_form,
      $sponsor_form_create_btn,
      $sponsor_form_delete_btn,
    },
    state: _state,
    load,
    toggleNode(node: CoverLayer) {
      if (_node === node) {
        this.unSelectNode(node);
        return;
      }
      this.selectNode(node);
    },
    selectNode(node: CoverLayer) {
      if (_node === node) {
        return;
      }
      _node = node;
      if (node.type === CoverLayerTypes.Section) {
        const data = node.payload;
        $section_form.setValue({
          title: data.title,
          num: data.num_per_line,
          gutter: data.gutter,
          width: data.max_width ? data.max_width : 0,
          enableWidth: !!data.max_width,
          shape: data.shape,
          showText: !!data.show_text,
        });
      }
      if (node.type === CoverLayerTypes.Title) {
        const data = node.payload;
        $title.setValue(data.title);
      }
      if (node.type === CoverLayerTypes.Sponsor) {
        const data = node.payload;
        $sponsor_form.setValue({
          text: data.text,
          image: $canvas.exchange(data.image),
          href: data.href,
        });
      }
      bus.emit(Events.SelectNode, node);
      bus.emit(Events.StateChange, { ..._state });
    },
    unSelectNode(node: CoverLayer) {
      _node = null;
      bus.emit(Events.UnSelectNode, node);
      bus.emit(Events.StateChange, { ..._state });
    },
    clearSelectedNode() {
      _node = null;
      bus.emit(Events.StateChange, { ..._state });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
const $page = PageLogic();

export default function Home() {
  const [state, setState] = useState($page.state);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    $page.onStateChange((v) => setState(v));
    $page.ui.$preview.onChange((v) => setPreview(v));
  }, []);

  async function load() {
    const r = await services.fetchConfig.run();
    if (r.error) {
      return;
    }
    const payload = r.data;
    $page.load(payload);
  }

  return (
    <div
      onClick={() => {
        $page.clearSelectedNode();
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
                    $page.ui.$canvas.setWidth(w);
                    load();
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
                      <div className="flex items-center">
                        <Switch store={$page.ui.$preview} />
                        <SwitchLabel
                          className="ml-2"
                          store={$page.ui.$preview}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-[1px] my-4 bg-[#d1d9e0b3]"></div>
                <div className="BorderGrid-row">
                  <div className="BorderGrid-cell">
                    <div className="hide-sm hide-md">
                      <h2 className="mb-3 h4">Component Settings</h2>
                      {(() => {
                        if (!state.node) {
                          return null;
                        }
                        const { id, type } = state.node;
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
                              {id}
                              <div>内边距</div>
                              <div className="mt-8">新增 Section</div>
                              <div className="">
                                <SectionForm store={$page.ui.$section_form} />
                                <Button
                                  className="mt-4"
                                  variant="default"
                                  store={$page.ui.$section_form_create_btn}
                                >
                                  新增
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.Section) {
                          return (
                            <div>
                              {id}
                              <SectionForm store={$page.ui.$section_form} />
                              <Button
                                className="mt-4"
                                variant="destructive"
                                store={$page.ui.$section_form_delete_btn}
                              >
                                删除
                              </Button>
                              <div className="mt-8">新增卡片</div>
                              <div className="">
                                <SponsorForm store={$page.ui.$sponsor_form} />
                                <Button
                                  className="mt-4"
                                  variant="default"
                                  store={$page.ui.$sponsor_form_create_btn}
                                >
                                  新增
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.Title) {
                          return (
                            <div>
                              {id}
                              <Input store={$page.ui.$title} />
                            </div>
                          );
                        }
                        if (type === CoverLayerTypes.Sponsor) {
                          return (
                            <div>
                              {id}
                              <SponsorForm store={$page.ui.$sponsor_form} />
                              <Button
                                className="mt-4"
                                variant="destructive"
                                store={$page.ui.$sponsor_form_delete_btn}
                              >
                                删除
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
      <div className=""></div>
    </div>
  );
}
