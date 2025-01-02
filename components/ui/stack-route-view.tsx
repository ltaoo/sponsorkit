/**
 * @file 不销毁的路由视图
 */
import React, { useEffect, useRef, useState } from "react";

import { Show } from "@/packages/ui/show";
import { RouteViewCore } from "@/domains/route_view/index";
import { useInitialize } from "@/hooks/index";
import { cn } from "@/utils/index";

export const StackRouteView = React.memo(
  (
    props: {
      store: RouteViewCore;
      index: number;
    } & React.AllHTMLAttributes<HTMLDivElement>
  ) => {
    const { store, index } = props;

    const container = useRef<HTMLDivElement>(null);
    const [state, setState] = useState(store.$presence.state);
    // const [state, setState] = useState(store.state);

    useInitialize(() => {
      // store.onStateChange((nextState) => {
      //   console.log("[COMPONENT]ui/stack-route-view - store.onStateChange", nextState.visible, store.title);
      //   setState(nextState);
      // });
      // console.log("[COMPONENT]ui/stack-route-view useInitialize");
      store.$presence.onStateChange((v) => {
        // console.log("[COMPONENT]ui/stack-route-view store.$presence.onStateChange", v);
        setState(v);
      });
      store.ready();
    });
    useEffect(() => {
      if (store.mounted) {
        return;
      }
      // store.setMounted();
      store.setShow();
      return () => {
        store.setUnmounted();
        store.destroy();
      };
    }, []);

    // console.log("[COMPONENT]stack-route-view - render", store.title, visible, mounted);

    return (
      <>
        <Show when={state.mounted}>
          <div
            className={cn(
              props.className,
              state.enter && store.animation.in ? `animate-in ${store.animation.in}` : "",
              state.exit && store.animation.out ? `animate-out ${store.animation.out}` : ""
              // "animate",
              // "animate-in duration-500",
              // index !== 0 ? (store.animation.show ? ` ${store.animation.show}` : "") : "",
              // `data-[state=open]:${store.animation.show}`,
              // visible ? `${store.animation.show}` : `${store.animation.hide}`,
              // visible && store.animation.hide
              //   ? `data-[state=closed]:animate-out data-[state=closed]:duration-500 data-[state=closed]:${store.animation.hide}`
              //   : ""
            )}
            style={{
              zIndex: index,
              display: state.visible ? "block" : "none",
            }}
            // data-state={state.visible ? "open" : "closed"}
            data-title={store.title}
            data-href={store.href}
            // onAnimationEnd={() => {
            //   if (store.state.visible) {
            //     return;
            //   }
            //   store.destroy();
            // }}
          >
            {props.children}
          </div>
        </Show>
      </>
    );
  }
);
