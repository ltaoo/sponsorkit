"use client";
import { useState } from "react";
import { twMerge as cn } from "tailwind-merge";

function chunk_array<T>(arr: T[], n: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}
enum CoverLayerTypes {
  Section,
  Title,
  Sponsor,
  Padding,
  Margin,
  Gutter,
}
const CoverLayerZIndexMap: Record<CoverLayerTypes, number> = {
  [CoverLayerTypes.Section]: 1,
  [CoverLayerTypes.Title]: 12,
  [CoverLayerTypes.Sponsor]: 11,
  [CoverLayerTypes.Margin]: 2,
  [CoverLayerTypes.Padding]: 2,
  [CoverLayerTypes.Gutter]: 3,
};
const CoverLayerColorMap: Record<CoverLayerTypes, string> = {
  [CoverLayerTypes.Section]: "bg-blue-400",
  [CoverLayerTypes.Title]: "bg-green-800",
  [CoverLayerTypes.Sponsor]: "bg-green-800",
  [CoverLayerTypes.Margin]: "bg-red-400",
  [CoverLayerTypes.Padding]: "bg-red-400",
  [CoverLayerTypes.Gutter]: "bg-yellow-800",
};
type CoverLayer = {
  x: number;
  y: number;
  type: CoverLayerTypes;
  width: number;
  height: number;
  payload: any;
};

function CanvasContext(props: { width: number; padding: number }) {
  const { width, padding: global_padding } = props;

  const middle = {
    x: width / 2,
  };
  const _point = { x: 0, y: 0 };
  let uid = 1;

  function move_to(x: number, y: number) {
    _point.x = x;
    _point.y = y;
  }

  return {
    width,
    padding: global_padding,
    renderSection(payload: {
      /** 该 section 标题 */
      title: string;
      /** sponsor 容器的内边距 暂时废弃 */
      padding: number;
      /** sponsor 之间的间隔 */
      gutter: number;
      /** 每一行展示 sponsor 数量 */
      num_per_line: number;
      /** sponsor 列表 */
      list: { name: string; avatar: string; href: string }[];
      /** 是否展示 sponsor 名称 */
      show_name?: boolean;
      /** 该 section 最大宽度 */
      max_width?: number;
      /** 该 section 从垂直线 y 位置处开始绘制  */
      initial_y?: number;
    }) {
      const {
        title,
        padding,
        gutter,
        show_name,
        max_width,
        num_per_line,
        list,
        initial_y = global_padding,
      } = payload;
      console.log("[PAGE]renderSection", { initial_y });

      /** 每个元素的位置 用于交互 */
      const nodes: CoverLayer[] = [];

      move_to(middle.x, initial_y);
      const title_height = 24;
      /** sponsor 名称与头像间的间距 */
      const name_margin_top_to_avatar = show_name ? 4 : 0;
      const name_height = show_name ? 18 : 0;
      /** sponsors 和 section 标题的上边距 */
      const sponsors_margin_top_to_title = 8;
      _point.y += title_height;
      let result = `<text x="${_point.x}" y="${_point.y}" text-anchor="middle" class="sponsorkit-tier-title">${title}</text>`;
      nodes.push({
        type: CoverLayerTypes.Title,
        x: global_padding,
        /** text 的 y 是文字的基线 所以 text 的 y 要减去其高度 */
        y: _point.y - title_height,
        width: width - global_padding * 2,
        height: title_height,
        payload: null,
      });
      _point.y += title_height;
      const avatar_size = (() => {
        const w = max_width || width - global_padding * 2;
        return parseFloat(
          ((w - (num_per_line - 1) * gutter) / num_per_line).toFixed(1)
        );
      })();

      /** 在水平方向上的绘制起点 要根据是否有 max_width 判断 */
      const left = max_width
        ? max_width / 2 - avatar_size / 2
        : global_padding + avatar_size / 2;
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
          avatar_size + name_margin_top_to_avatar + name_height + gutter;
      }

      function renderSponsorsPerLine(
        list: { name: string; avatar: string; href: string }[]
      ) {
        /** 如果一行 sponsor 数量不够一行 那么这些就要居中排列 */
        if (list.length < num_per_line) {
          const w = (list.length - 1) * gutter + list.length * avatar_size;
          const container_width = width;
          const left = container_width / 2 - w / 2 + avatar_size / 2;
          _point.x = left;
        }
        for (let i = 0; i < list.length; i += 1) {
          const { name, avatar, href = "#" } = list[i];
          const avatar_point = {
            x: _point.x - avatar_size / 2,
            y: _point.y,
          };
          const name_point = {
            x: _point.x,
            y: _point.y + avatar_size + name_margin_top_to_avatar + name_height,
          };
          nodes.push({
            type: CoverLayerTypes.Sponsor,
            x: avatar_point.x,
            y: avatar_point.y,
            width: avatar_size,
            // 为什么 *2 我也搞不懂
            height: avatar_size + name_margin_top_to_avatar + name_height,
            payload: list[i],
          });
          const $name = show_name
            ? `<text x="${name_point.x}" y="${name_point.y}" text-anchor="middle" class="sponsorkit-name" fill="currentColor">${name}</text>`
            : "";
          result += `<a href="${href}" class="sponsorkit-link" target="_blank" id="${name}">
        ${$name}
        <clipPath id="c${uid}">
          <rect x="${avatar_point.x}" y="${
            avatar_point.y
          }" width="${avatar_size}" height="${avatar_size}" rx="${
            avatar_size / 2
          }" ry="${avatar_size / 2}" />
        </clipPath>
        <image x="${avatar_point.x}" y="${
            avatar_point.y
          }" width="${avatar_size}" height="${avatar_size}" href="${avatar}" clip-path="url(#c${uid})" />
      </a>`;
          uid += 1;
          _point.x += avatar_size + gutter;
        }
      }

      // nodes.push({
      //   type: CoverLayerTypes.Section,
      //   x: 0,
      //   y: 0,
      //   width,
      //   height: _point.y,
      //   payload: null,
      // });
      return {
        content: result,
        nodes,
        height: _point.y,
        y: _point.y + global_padding,
        rect: {
          x: global_padding,
          y: global_padding,
        },
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
  };
}

const $ins = CanvasContext({ width: 800, padding: 32 });

export default function Home() {
  // const [selectedSection, setSelectedSection] = useState(null);

  // const handleSectionClick = (sectionId) => {
  //   setSelectedSection(sectionId);
  // };

  const WECHAT_AVATAR =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IldlQ2hhdCIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiIKZmlsbD0iI2ZmZiI+PHBhdGgKZD0ibTAgMEg1MTJWNTEySDAiCmZpbGw9IiMwMGM3MGEiLz48cGF0aCBkPSJNNDAyIDM2OWMyMy0xNyAzOC00MiAzOC03MCAwLTUxLTUwLTkyLTExMS05MnMtMTEwIDQxLTExMCA5MiA0OSA5MiAxMTAgOTJjMTMgMCAyNS0yIDM2LTUgNC0xIDggMCA5IDFsMjUgMTRjMyAyIDYgMCA1LTRsLTYtMjJjMC0zIDItNSA0LTZtLTExMC04NWExNSAxNSAwIDExMC0yOSAxNSAxNSAwIDAxMCAyOW03NCAwYTE1IDE1IDAgMTEwLTI5IDE1IDE1IDAgMDEwIDI5Ii8+PHBhdGggZD0iTTI1MCAxOThhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtLTg5IDBhMTggMTggMCAwMDAtMzUgMTggMTggMCAxMDAgMzVtNDQtOTNjNjYgMCAxMjEgNDEgMTMxIDkzLTY0LTQtMTQ3IDQ0LTEyMyAxMjgtMyAwLTI1IDItNTEtNi00LTEtOCAwLTExIDJsLTMwIDE3Yy0zIDEtNy0xLTYtNmw3LTI0YzEtNS0xLTgtNC0xMC0yOC0yMC00NS01MC00NS04MyAwLTYxIDU5LTExMSAxMzItMTExIi8+PC9zdmc+";
  const ALIPAY_AVATAR =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzM1NzM0NTIwOTY2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MzEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTEwMjQuMDUxMiA3MDEuMDMwNFYxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDgyNy4xMzYgMEgxOTYuODY0QTE5Ni45NjY0IDE5Ni45NjY0IDAgMCAwIDAgMTk2Ljg2NHY2MzAuMjcyQTE5Ni45MTUyIDE5Ni45MTUyIDAgMCAwIDE5Ni44NjQgMTAyNGg2MzAuMjcyYTE5Ny4xMiAxOTcuMTIgMCAwIDAgMTkzLjg0MzItMTYyLjA5OTJjLTUyLjIyNC0yMi42MzA0LTI3OC41MjgtMTIwLjMyLTM5Ni40NDE2LTE3Ni42NC04OS43MDI0IDEwOC42OTc2LTE4My43MDU2IDE3My45MjY0LTMyNS4zMjQ4IDE3My45MjY0cy0yMzYuMTg1Ni04Ny4yNDQ4LTIyNC44MTkyLTE5NC4wNDhjNy40NzUyLTcwLjA0MTYgNTUuNTUyLTE4NC41NzYgMjY0LjI5NDQtMTY0Ljk2NjQgMTEwLjA4IDEwLjM0MjQgMTYwLjQwOTYgMzAuODczNiAyNTAuMTYzMiA2MC41MTg0IDIzLjE5MzYtNDIuNTk4NCA0Mi40OTYtODkuNDQ2NCA1Ny4xMzkyLTEzOS4yNjRIMjQ4LjA2NHYtMzkuNDI0aDE5Ni45MTUyVjMxMS4xNDI0SDIwNC44VjI2Ny43NzZoMjQwLjEyOFYxNjUuNjMyczIuMTUwNC0xNS45NzQ0IDE5LjgxNDQtMTUuOTc0NGg5OC40NTc2VjI2Ny43NzZoMjU2djQzLjQxNzZoLTI1NlYzODEuOTUyaDIwOC44NDQ4YTgwNS45OTA0IDgwNS45OTA0IDAgMCAxLTg0LjgzODQgMjEyLjY4NDhjNjAuNjcyIDIyLjAxNiAzMzYuNzkzNiAxMDYuMzkzNiAzMzYuNzkzNiAxMDYuMzkzNnpNMjgzLjU0NTYgNzkxLjYwMzJjLTE0OS42NTc2IDAtMTczLjMxMi05NC40NjQtMTY1LjM3Ni0xMzMuOTM5MiA3LjgzMzYtMzkuMzIxNiA1MS4yLTkwLjYyNCAxMzQuNC05MC42MjQgOTUuNTkwNCAwIDE4MS4yNDggMjQuNDczNiAyODQuMDU3NiA3NC41NDcyLTcyLjE5MiA5NC4wMDMyLTE2MC45MjE2IDE1MC4wMTYtMjUzLjA4MTYgMTUwLjAxNnoiIGZpbGw9IiMwMDlGRTgiIHAtaWQ9IjE0MzIiPjwvcGF0aD48L3N2Zz4=";
  const FAKE1 = [
    {
      name: "Alice Johnson",
      href: "https://example.com/alice",
      avatar: WECHAT_AVATAR,
    },
    {
      name: "Bob Smith",
      href: "https://example.com/bob",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Charlie Brown",
      href: "https://example.com/charlie",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Diana Prince",
      href: "https://example.com/diana",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Ethan Hunt",
      href: "https://example.com/ethan",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Fiona Gallagher",
      href: "https://example.com/fiona",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "George Clooney",
      href: "https://example.com/george",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Hannah Montana",
      href: "https://example.com/hannah",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Ian McKellen",
      href: "https://example.com/ian",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Jessica Jones",
      href: "https://example.com/jessica",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Jessica Jones2",
      href: "https://example.com/jessica",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Hannah Montana",
      href: "https://example.com/hannah",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Ian McKellen",
      href: "https://example.com/ian",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Jessica Jones",
      href: "https://example.com/jessica",
      avatar: ALIPAY_AVATAR,
    },
    {
      name: "Jessica Jones2",
      href: "https://example.com/jessica",
      avatar: ALIPAY_AVATAR,
    },
  ];
  const width = $ins.width;
  let height = 0;
  let svg = "";
  const nodes: CoverLayer[] = [];
  const r0 = $ins.renderSection({
    title: "Special Sponsors",
    padding: 12,
    num_per_line: 5,
    max_width: 460,
    gutter: 28,
    show_name: true,
    list: FAKE1.slice(0, 5),
  });
  svg += r0.content;
  console.log("the height change to", height);
  nodes.push(...r0.nodes);
  const r1 = $ins.renderSection({
    initial_y: r0.y,
    title: "Special Sponsors",
    padding: 12,
    num_per_line: 6,
    max_width: 460,
    gutter: 24,
    show_name: true,
    list: FAKE1.slice(0, 6),
  });
  svg += r1.content;
  console.log("the height change to", height);
  nodes.push(...r1.nodes);
  const r2 = $ins.renderSection({
    initial_y: r1.y,
    title: "Sponsors",
    padding: 12,
    num_per_line: 12,
    gutter: 12,
    list: FAKE1,
    show_name: false,
  });
  svg += r2.content;
  height = r2.height + $ins.padding;
  console.log("the height change to", height);
  nodes.push(...r2.nodes);
  const content = `<svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
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
          ${svg}
        </svg>`;

  return (
    <div className="mt-8 clearfix container-xl px-md-4 px-lg-5 px-3">
      <div>
        <div
          className="Layout Layout--flowRow-until-md react-repos-overview-margin Layout--sidebarPosition-end Layout--sidebarPosition-flowRow-end"
          style={{ maxWidth: "100%" }}
        >
          <div className="flex p-[32px] border-[#d1d9e0] border rounded-[6px] bg-white">
            <div className="relative">
              <div dangerouslySetInnerHTML={{ __html: content }}></div>
              <div className="absolute inset-0">
                {nodes.map((node, i) => {
                  return (
                    <div
                      key={i}
                      className={cn(
                        "absolute opacity-20 cursor-pointer hover:outline",
                        CoverLayerColorMap[node.type]
                      )}
                      style={{
                        zIndex: CoverLayerZIndexMap[node.type],
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        width: `${node.width}px`,
                        height: `${node.height}px`,
                      }}
                      onClick={() => {
                        console.log(node);
                      }}
                    ></div>
                  );
                })}
              </div>
            </div>
            {/* <div className="w-[296px]">
              {selectedSection && <ConfigPanel sectionId={selectedSection} />}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

const ConfigPanel = (props: { sectionId: number }) => {
  const { sectionId } = props;

  const [title, setTitle] = useState("");
  const [layout, setLayout] = useState("small");

  const handleSave = () => {
    // Save the configuration for the section
    console.log(`Section ${sectionId} - Title: ${title}, Layout: ${layout}`);
  };

  return (
    <div className="fixed top-4 right-4 p-[32px] border border-[#d1d9e0] rounded-[6px] bg-white">
      <h2 className="text-lg font-bold mb-4">Configure Section {sectionId}</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Layout
        </label>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="small">Small</option>
          <option value="middle">Middle</option>
          <option value="large">Large</option>
        </select>
      </div>
      <button
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Save
      </button>
    </div>
  );
};
