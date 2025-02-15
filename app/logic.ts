import { saveAs } from "file-saver";

import {
  CoverLayer,
  CoverLayerTypes,
  SectionPayload,
  CanvasPayload,
  SponsorCanvas,
  CardImageShape,
} from "@/biz/sponsors";
import { base, Handler } from "@/domains/base";
import {
  ButtonCore,
  DialogCore,
  FormCore,
  InputCore,
  SelectCore,
} from "@/domains/ui";
import { SwitchCore } from "@/domains/ui/switch";
import { FormFieldCore } from "@/domains/ui/form/field";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";
import { readFileAsArrayBuffer, textToFileURL } from "@/utils/browser";
import { SliderCore } from "@/domains/ui/slider";
import { DragZoneCore } from "@/domains/ui/drag-zone";
import { generate_unique_id, parseJSONStr } from "@/utils";

import { app, services, user } from "./store";

export function PageLogic() {
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
        input: SliderCore({
          defaultValue: 8,
          min: 1,
          max: 24,
        }),
      }),
      gutter: new FormFieldCore({
        label: "卡片间距",
        name: "gutter",
        input: SliderCore({
          defaultValue: 12,
          min: 4,
          max: 120,
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
      from: new FormFieldCore({
        label: "来源",
        name: "from",
        input: new SelectCore<string>({
          defaultValue: "custom",
          options: [
            {
              label: "微信",
              value: "wechat",
            },
            {
              label: "支付宝",
              value: "alipay",
            },
            {
              label: "自定义",
              value: "custom",
            },
          ],
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
  const $export_btn = new ButtonCore({});
  const $import_btn = new ButtonCore();
  const $copy_btn = new ButtonCore();
  const $import_dialog = new DialogCore();
  const $import_zone = new DragZoneCore();
  const $import_input = new InputCore({ defaultValue: "" });
  const $preview = SwitchCore({
    id: "preview",
    defaultValue: false,
    label: ["编辑", "预览"],
  });
  const $token_dialog = new DialogCore();
  const $token_input = new InputCore({ defaultValue: "" });

  let _loaded = false;
  let _authorized = user.isLogin;
  let _payload: CanvasPayload = { sections: [] as SectionPayload[] };
  let _nodes: CoverLayer[] = [];
  let _width = $canvas.width;
  let _height = $canvas.padding * 2;
  let _url = "";
  let _node: CoverLayer | null = null;
  // let _section: SectionPayload | null = null;
  const _state = {
    get authorized() {
      return _authorized;
    },
    get loaded() {
      return _loaded;
    },
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

  async function ready() {
    if (!_authorized) {
      $token_dialog.show();
      return;
    }
    const r = await services.fetchConfig.run();
    if (r.error) {
      return;
    }
    const payload = r.data;
    console.log("before load payload", r);
    load(payload);
  }
  function refresh() {
    const r2 = $canvas.load(_payload);
    _width = r2.width;
    _height = r2.height;
    _url = textToFileURL(r2.content, "image/svg+xml");
    _nodes = r2.nodes;
    _loaded = true;
    bus.emit(Events.StateChange, { ..._state });
  }
  function load(payload: CanvasPayload) {
    _payload = {
      ...payload,
      sections: payload.sections.map((sec, i) => {
        return {
          ...sec,
          id: `sec_${i + 1}_`,
          list: sec.list.map((sponsor, j) => {
            return {
              ...sponsor,
              id: `_sec_${i + 1}_sponsor_${j + 1}`,
            };
          }),
        };
      }),
    };
    console.log("[PAGE]home - load", _payload);
    refresh();
    // bus.emit(Events.StateChange, { ..._state });
  }
  function clearSelectedNode() {
    _node = null;
    bus.emit(Events.StateChange, { ..._state });
  }
  function findMatchedSponsor(node: CoverLayer) {
    const data = node.payload;
    for (let i = 0; i < _payload.sections.length; i += 1) {
      const section = _payload.sections[i];
      for (let j = 0; j < section.list.length; j += 1) {
        const sponsor = section.list[j];
        // console.log(sponsor, data);
        if (sponsor.id === data.id) {
          return {
            section,
            sponsor,
          };
        }
      }
    }
    return null;
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

  $preview.onChange(() => {
    clearSelectedNode();
  });
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
  // $sponsor_form.fields.image.$input.onChange((files) => {
  //   if (files.length === 0) {
  //     return;
  //   }
  //   $sponsor_form.fields.from.setValue("custom");
  // });
  $sponsor_form.fields.from.$input.onChange((v) => {
    if (v === "alipay") {
      $sponsor_form.fields.image.setValue($canvas.exchange(v, ""));
      return;
    }
    if (v === "wechat") {
      $sponsor_form.fields.image.setValue($canvas.exchange(v, ""));
      return;
    }
    if (v === "custom") {
      $sponsor_form.fields.image.setValue("");
      return;
    }
  });
  $section_form.onChange((v) => {
    if (!_node) {
      return;
    }
    if (_node.type === CoverLayerTypes.Section) {
      const data = _node.payload;
      const { title, num, gutter, shape, width, showText } = v;
      const matched = _payload.sections.find((sec) => sec.id === data.id);
      if (!matched) {
        return;
      }
      Object.assign(matched, {
        title,
        max_width: width,
        num_per_line: num,
        gutter,
        shape,
        show_text: showText,
      });
      refresh();
    }
  });
  $sponsor_form.onChange((v) => {
    if (!_node) {
      return;
    }
    if (_node.type === CoverLayerTypes.Sponsor) {
      const { text, image, from, href } = v;
      const matched = findMatchedSponsor(_node);
      if (!matched) {
        return;
      }
      const sponsor = matched.sponsor;
      Object.assign(sponsor, {
        text,
        image,
        href,
        from,
      });
      refresh();
    }
  });
  $section_form_create_btn.onClick(() => {
    const values = $section_form.value;
    // console.log(values);
    const { title, num, width, gutter, shape, showText, enableWidth } = values;
    _payload.sections.push({
      id: generate_unique_id(),
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
    const { text, image, href, from } = values;
    console.log("[PAGE]home - before add sponsor", _node.payload.title);
    _node.payload.list.push({
      id: generate_unique_id(),
      text,
      image,
      href,
      from: from || "custom",
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
      _payload.sections = _payload.sections.filter((sec) => sec.id !== data.id);
      refresh();
      clearSelectedNode();
    }
  });
  $sponsor_form_delete_btn.onClick(() => {
    // console.log(
    //   "[PAGE]home - $sponsor_form_delete_btn click",
    //   _node,
    //   _node?.type
    // );
    if (!_node || !_node.payload) {
      return;
    }
    if (_node.type === CoverLayerTypes.Sponsor) {
      const data = _node.payload;
      const matched = findMatchedSponsor(_node);
      // console.log("matched", matched);
      if (!matched) {
        return;
      }
      const section = matched.section;
      section.list = section.list.filter((card) => card.id !== data.id);
      refresh();
      clearSelectedNode();
    }
  });
  $import_btn.onClick(() => {
    $import_dialog.show();
  });
  $export_btn.onClick(() => {
    const data = JSON.stringify(_payload);
    const blob = new Blob([data], { type: "application/json" });
    saveAs(blob, "sponsors_payload.json");
  });
  $copy_btn.onClick(() => {
    const data = JSON.stringify(_payload);
    app.copy(data);
    app.tip({
      text: ["已复制到粘贴板"],
    });
  });
  $import_dialog.onOk(async () => {
    const content = $import_input.value;
    if (!content) {
      return;
    }
    const r2 = await parseJSONStr<CanvasPayload>(content);
    if (r2.error) {
      return;
    }
    _payload = r2.data;
    refresh();
  });
  $import_zone.onChange(async (files) => {
    const file = files[0];
    if (!file) {
      return;
    }
    if (file.type !== "application/json") {
      $import_zone.setError(new Error("不支持的文件类型"));
      return;
    }
    const r = await readFileAsArrayBuffer(file);
    if (r.error) {
      $import_zone.setError(r.error);
      return;
    }
    const decoder = new TextDecoder("utf-8");
    const content = decoder.decode(r.data);
    $import_input.setValue(content);
  });
  $token_dialog.onOk(async () => {
    const v = $token_input.value;
    if (!v) {
      app.tip({
        text: ["请先输入 token"],
      });
      return;
    }
    $token_dialog.okBtn.setLoading(true);
    const r = await user.authWithToken(v);
    $token_dialog.okBtn.setLoading(false);
    if (r.error) {
      app.tip({
        text: [r.error.message],
      });
      return;
    }
    $token_dialog.hide();
  });
  user.onLogin(() => {
    _authorized = true;
    bus.emit(Events.StateChange, { ..._state });
    ready();
  });
  user.onLogout(() => {
    _authorized = false;
    bus.emit(Events.StateChange, { ..._state });
    $token_dialog.show();
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
      $export_btn,
      $import_btn,
      $copy_btn,
      $import_dialog,
      $import_input,
      $import_zone,
      $token_dialog,
      $token_input,
    },
    state: _state,
    ready,
    load,
    refresh,
    toggleNode(node: CoverLayer) {
      if (_node && _node.payload.id === node.id) {
        this.unSelectNode(node);
        return;
      }
      this.selectNode(node);
    },
    selectNode(node: CoverLayer) {
      if (_node && _node.payload.id === node.id) {
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
          image: $canvas.exchange(data.from, data.image),
          href: data.href,
          from: data.from,
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
    clearSelectedNode,
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
