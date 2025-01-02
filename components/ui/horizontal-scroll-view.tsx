/**
 * @file 横向可滚动容器
 */
import React, { useRef, useState } from "react";

import { HorizontalScrollViewCore } from "@/domains/ui/scroll-view/horizontal";
import { useInitialize } from "@/hooks";
import { cn } from "@/utils";

export const HorizontalScrollView = React.memo(
  (
    props: {
      store: HorizontalScrollViewCore;
      wrapClassName?: string;
      contentClassName?: string;
    } & React.HTMLAttributes<HTMLDivElement>
  ) => {
    const { store, className, contentClassName, wrapClassName, style = {}, children, ...restProps } = props;

    // const ref = useRef<HTMLDivElement>(null);
    const [state, setState] = useState(store.state);
    const ref = useRef<HTMLDivElement>(null);

    useInitialize(() => {
      store.onStateChange((nextState) => {
        setState(nextState);
      });
      store.onScroll((pos) => {
        const $node = ref.current;
        if (!$node) {
          return;
        }
        setTimeout(() => {
          $node.scrollTo({ left: pos.x });
        }, 200);
      });
    });

    return (
      <div
        ref={ref}
        className={cn(
          "scroll-view __a overflow-hidden relative w-full h-full max-w-full overflow-x-auto scroll scroll--hidden",
          className
        )}
        style={style}
        onAnimationEnd={(event) => {
          const client = event.currentTarget.getBoundingClientRect();
        }}
        onTouchStart={(event) => {
          event.stopPropagation();
        }}
        onTouchMove={(event) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    );
  }
);
