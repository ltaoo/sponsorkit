function chunk_array<T>(arr: T[], n: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}
function to_fixed(v: string | number) {
  return parseFloat(Number(v).toFixed(1));
}
export enum CoverLayerTypes {
  Whole,
  Section,
  QRCodeSection,
  Title,
  Sponsor,
  QRCode,
  Padding,
  Margin,
  Gutter,
}
export type CoverLayer = {
  id: number;
  x: number;
  y: number;
  type: CoverLayerTypes;
  width: number;
  height: number;
  payload: unknown;
};
export type CardInSection = {
  text: string;
  image: string;
  href: string;
};
export type ImageShape = "rounded" | "circle";
export type SectionPayload = {
  /** 该 section 标题 */
  title: string;
  /** sponsor 容器的内边距 暂时废弃 */
  // padding: number;
  /** sponsor 之间的间隔 */
  gutter: number;
  /** 每一行展示 sponsor 数量 */
  num_per_line: number;
  /** sponsor 列表 */
  list: CardInSection[];
  /** 是否展示 sponsor 名称 */
  show_text?: boolean;
  /** 该 section 最大宽度 */
  max_width?: number;
  /** sponsor 形状 */
  shape: ImageShape;
  /** 该 section 从垂直线 y 位置处开始绘制  */
  initial_y?: number;
  /** 用于覆盖 node @todo 这个设计不好看怎么优化 */
  override?: { type: CoverLayerTypes };
};
const WECHAT_AVATAR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IldlQ2hhdCIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiIKZmlsbD0iI2ZmZiI+PHBhdGgKZD0ibTAgMEg1MTJWNTEySDAiCmZpbGw9IiMwMGM3MGEiLz48cGF0aCBkPSJNNDAyIDM2OWMyMy0xNyAzOC00MiAzOC03MCAwLTUxLTUwLTkyLTExMS05MnMtMTEwIDQxLTExMCA5MiA0OSA5MiAxMTAgOTJjMTMgMCAyNS0yIDM2LTUgNC0xIDggMCA5IDFsMjUgMTRjMyAyIDYgMCA1LTRsLTYtMjJjMC0zIDItNSA0LTZtLTExMC04NWExNSAxNSAwIDExMC0yOSAxNSAxNSAwIDAxMCAyOW03NCAwYTE1IDE1IDAgMTEwLTI5IDE1IDE1IDAgMDEwIDI5Ii8+PHBhdGggZD0iTTI1MCAxOThhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtLTg5IDBhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtNDQtOTNjNjYgMCAxMjEgNDEgMTMxIDkzLTY0LTQtMTQ3IDQ0LTEyMyAxMjgtMyAwLTI1IDItNTEtNi00LTEtOCAwLTExIDJsLTMwIDE3Yy0zIDEtNy0xLTYtNmw3LTI0YzEtNS0xLTgtNC0xMC0yOC0yMC00NS01MC00NS04MyAwLTYxIDU5LTExMSAxMzItMTExIi8+PC9zdmc+";
const ALIPAY_AVATAR =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzM1NzM0NTIwOTY2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MzEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTEwMjQuMDUxMiA3MDEuMDMwNFYxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDgyNy4xMzYgMEgxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDAgMTk2Ljg2NHY2MzAuMjcyQTE5Ni45MTUyIDE5Ni45MTUyIDAgMCAwIDE5Ni44NjQgMTAyNGg2MzAuMjcyYTE5Ny4xMiAxOTcuMTIgMCAwIDAgMTkzLjg0MzItMTYyLjA5OTJjLTUyLjIyNC0yMi42MzA0LTI3OC41MjgtMTIwLjMyLTM5Ni40NDE2LTE3Ni42NC04OS43MDI0IDEwOC42OTc2LTE4My43MDU2IDE3My45MjY0LTMyNS4zMjQ4IDE3My45MjY0cy0yMzYuMTg1Ni04Ny4yNDQ4LTIyNC44MTkyLTE5NC4wNDhjNy40NzUyLTcwLjA0MTYgNTUuNTUyLTE4NC41NzYgMjY0LjI5NDQtMTY0Ljk2NjQgMTEwLjA4IDEwLjM0MjQgMTYwLjQwOTYgMzAuODczNiAyNTAuMTYzMiA2MC41MTg0IDIzLjE5MzYtNDIuNTk4NCA0Mi40OTYtODkuNDQ2NCA1Ny4xMzkyLTEzOS4yNjRIMjQ4LjA2NHYtMzkuNDI0aDE5Ni45MTUyVjMxMS4xNDI0SDIwNC44VjI2Ny43NzZoMjQwLjEyOFYxNjUuNjMyczIuMTUwNC0xNS45NzQ0IDE5LjgxNDQtMTUuOTc0NGg5OC40NTc2VjI2Ny43NzZoMjU2djQzLjQxNzZoLTI1NlYzODEuOTUyaDIwOC44NDQ4YTgwNS45OTA0IDgwNS45OTA0IDAgMCAxLTg0LjgzODQgMjEyLjY4NDhjNjAuNjcyIDIyLjAxNiAzMzYuNzkzNiAxMDYuMzkzNiAzMzYuNzkzNiAxMDYuMzkzNnpNMjgzLjU0NTYgNzkxLjYwMzJjLTE0OS42NTc2IDAtMTczLjMxMi05NC40NjQtMTY1LjM3Ni0xMzMuOTM5MiA3LjgzMzYtMzkuMzIxNiA1MS4yLTkwLjYyNCAxMzQuNC05MC42MjQgOTUuNTkwNCAwIDE4MS4yNDggMjQuNDczNiAyODQuMDU3NiA3NC41NDcyLTcyLjE5MiA5NC4wMDMyLTE2MC45MjE2IDE1MC4wMTYtMjUzLjA4MTYgMTUwLjAxNnoiIGZpbGw9IiMwMDlGRTgiIHAtaWQ9IjE0MzIiPjwvcGF0aD48L3N2Zz4=";

export function SponsorCanvas(props: { width: number; padding: number }) {
  const { width, padding: global_padding } = props;

  let _width = width;

  const _point = { x: 0, y: 0 };
  let uid = 1;
  let uid2 = 1;

  function move_to(x: number, y: number) {
    _point.x = x;
    _point.y = y;
  }

  return {
    width: _width,
    padding: global_padding,
    setWidth(w: number) {
      _width = w;
    },
    renderSection(payload: SectionPayload) {
      const {
        title,
        gutter,
        show_text,
        max_width,
        num_per_line,
        list,
        initial_y = global_padding,
        shape,
        override,
      } = payload;
      console.log(
        "[PAGE]renderSection",
        payload,
        { initial_y },
        { title, override }
      );

      /** 每个元素的位置 用于交互 */
      const nodes: CoverLayer[] = [];

      move_to(_width / 2, initial_y);
      const title_height = 24;
      /** sponsor 名称与头像间的间距 */
      const text_margin_top_to_avatar = show_text ? 4 : 0;
      const text_height = show_text ? 18 : 0;
      /** 由于 text 是从基线开始绘制会导致 中文 渲染不完整 所以加一个 bottom pading */
      const text_bottom_padding = show_text ? 4 : 0;
      /** sponsors 和 section 标题的上边距 */
      const sponsors_margin_top_to_title = 8;
      _point.y += title_height;
      let result = `<text x="${_point.x}" y="${_point.y}" text-anchor="middle" class="sponsorkit-tier-title">${title}</text>`;
      uid2 += 1;
      nodes.push({
        id: uid2,
        type: CoverLayerTypes.Title,
        x: global_padding,
        /** text 的 y 是文字的基线 所以 text 的 y 要减去其高度 */
        y: _point.y - title_height,
        width: _width - global_padding * 2,
        height: title_height,
        payload: null,
      });
      _point.y += title_height;
      const image_size = (() => {
        const w = max_width || _width - global_padding * 2;
        return to_fixed((w - (num_per_line - 1) * gutter) / num_per_line);
      })();

      /** 在水平方向上的绘制起点 要根据是否有 max_width 判断 */
      const left = max_width
        ? max_width / 2 - image_size / 2
        : global_padding + image_size / 2;
      _point.x = left;
      /** 往下移动 准备绘制 sponsors */
      _point.y += sponsors_margin_top_to_title;

      const groups = chunk_array(list, num_per_line);
      for (let i = 0; i < groups.length; i += 1) {
        renderSponsorsPerLine(groups[i]);
        // 一行绘制完毕 水平方向上要恢复初始位置
        _point.x = left;
        // 垂直方向上往下移动 头像高度+名称与头像上边距+名称高度+sponsor间距 开始绘制下一行
        _point.y +=
          image_size +
          text_margin_top_to_avatar +
          text_height +
          (i < groups.length - 1 ? gutter : 0);
      }

      function renderSponsorsPerLine(list: CardInSection[]) {
        /** 如果一行 sponsor 数量不够一行 那么这些就要居中排列 */
        if (list.length <= num_per_line) {
          const w = (list.length - 1) * gutter + list.length * image_size;
          const container_width = _width;
          const left = container_width / 2 - w / 2 + image_size / 2;
          _point.x = left;
        }
        for (let i = 0; i < list.length; i += 1) {
          const { text, image: tmp, href = "#" } = list[i];
          const image = (() => {
            if (tmp === "wechat") {
              return WECHAT_AVATAR;
            }
            if (tmp === "alipay") {
              return ALIPAY_AVATAR;
            }
            return tmp;
          })();
          const image_point = {
            x: _point.x - image_size / 2,
            y: _point.y,
          };
          const text_point = {
            x: _point.x,
            y: _point.y + image_size + text_margin_top_to_avatar + text_height,
          };
          uid2 += 1;
          nodes.push({
            id: uid2,
            type: override ? override.type : CoverLayerTypes.Sponsor,
            x: image_point.x,
            y: image_point.y,
            width: image_size,
            height:
              image_size +
              text_margin_top_to_avatar +
              text_height +
              text_bottom_padding,
            payload: list[i],
          });
          const $name = show_text
            ? `<text x="${text_point.x}" y="${text_point.y}" text-anchor="middle" class="sponsorkit-name" fill="currentColor">${text}</text>`
            : "";
          const inner = `${$name}<clipPath id="c${uid}"><rect x="${
            image_point.x
          }" y="${
            image_point.y
          }" width="${image_size}" height="${image_size}" rx="${
            shape === "circle" ? image_size / 2 : image_size / 8
          }" ry="${
            shape === "circle" ? image_size / 2 : image_size / 8
          }" /></clipPath><image x="${image_point.x}" y="${
            image_point.y
          }" width="${image_size}" height="${image_size}" href="${image}" clip-path="url(#c${uid})" />`;
          result += (() => {
            if (!href || href === "#") {
              return inner;
            }
            return `<a href="${href}" class="sponsorkit-link" target="_blank" id="${text}">${inner}</a>`;
          })();
          uid += 1;
          _point.x += image_size + gutter;
        }
      }
      // console.log("[PAGE]before push Section node", _point.y, initial_y);
      uid2 += 1;
      nodes.push({
        id: uid2,
        type:
          override && override.type === CoverLayerTypes.QRCode
            ? CoverLayerTypes.QRCodeSection
            : CoverLayerTypes.Section,
        x: 0,
        y: initial_y,
        width: _width,
        height: to_fixed(_point.y + text_bottom_padding - initial_y),
        payload: null,
      });
      return {
        content: result,
        nodes,
        height: to_fixed(_point.y + text_bottom_padding),
        y: _point.y + text_bottom_padding + global_padding,
      };

      // <a href="https://github.com/qq2952151753" className="sponsorkit-link" target="_blank" id="qq2952151753">
      //   <text x="200" y="168" text-anchor="middle" className="sponsorkit-name" fill="currentColor">qq2952151753</text>
      //   <clipPath id="c147">
      //     <rect x="175" y="100" width={avatar_size} height={avatar_size} rx="25" ry="25" />
      //   </clipPath>
      //   <image x="175" y="100" width={avatar_size} height={avatar_size} href="data:image/png;base64,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" clip-path="url(#c147)"/>
      // </a>
      // <a href="#" className="sponsorkit-link" target="_blank" id="书杰">
      //   <text x="280" y="168" text-anchor="middle" className="sponsorkit-name" fill="currentColor">书杰</text>
      //   <clipPath id="c146">
      //     <rect x="255" y="100" width="50" height="50" rx="25" ry="25" />
      //   </clipPath>
      //   <image x="255" y="100" width="50" height="50" href="${WECHAT_AVATAR}" clip-path="url(#c146)"/>
      // </a>
    },
    load(payload: { sections: SectionPayload[] }) {
      let height = 0;
      let svg = "";
      const nodes: CoverLayer[] = [];
      let prev_y = undefined;
      for (let i = 0; i < payload.sections.length; i += 1) {
        const {
          title,
          num_per_line,
          max_width,
          gutter,
          show_text,
          list,
          override,
          shape,
        } = payload.sections[i];
        const r = this.renderSection({
          title,
          num_per_line,
          max_width,
          gutter,
          show_text,
          list,
          shape,
          override,
          initial_y: prev_y,
        });
        prev_y = r.y;
        svg += r.content;
        nodes.push(...r.nodes);
        height = r.height + global_padding;
      }
      uid2 += 1;
      nodes.push({
        id: uid2,
        type: CoverLayerTypes.Whole,
        x: 0,
        y: 0,
        width: _width,
        height,
        payload: null,
      });
      const state = {
        content: this.buildContent({ width: _width, height, content: svg }),
        nodes,
        width: _width,
        height,
      };
      return state;
    },
    buildContent(state: { width: number; height: number; content: string }) {
      const content = `<svg
          width="${state.width}"
          height="${state.height}"
          viewBox="0 0 ${state.width} ${state.height}"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
          text {
            font-weight: 300;
            font-size: 14px;
            fill: #777777;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .sponsorkit-link {
            cursor: pointer;
          }
          .sponsorkit-tier-title {
            font-weight: 500;
            font-size: 20px;
          }
          </style>
          ${state.content}
        </svg>`;
      return content;
    },
  };
}
