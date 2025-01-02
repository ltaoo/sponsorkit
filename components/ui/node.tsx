/**
 * @file div
 */
import React, { useEffect, useRef, useState } from "react";

import { NodeCore } from "@/domains/ui/node";
import { connect } from "@/domains/ui/node/connect.web";
import { useInitialize } from "@/hooks";

export const Node = React.memo(
  (
    props: {
      store: NodeCore<any>;
    } & React.HTMLAttributes<HTMLDivElement>
  ) => {
    const { store } = props;

    const [state, setState] = useState(store.state);
    const ref = useRef<HTMLDivElement>(null);

    useInitialize(() => {
      store.onStateChange((nextState) => {
        setState(nextState);
      });
    });

    useEffect(() => {
      if (!ref.current) {
        return;
      }
      connect(ref.current, store);
    }, []);

    return (
      <div
        ref={ref}
        className={props.className}
        style={props.style}
        onClick={(event) => {
          // console.log("[DOMAIN]ui/node/index - handleClick");
          if (store.longPressing) {
            event.preventDefault();
            event.stopPropagation();
          }
          store.longPressing = false;
          // store.click();
        }}
        onTouchStart={() => {
          store.handleMouseDown();
        }}
        onTouchEnd={(event) => {
          store.handleMouseUp({
            type: "touch end",
            stopPropagation() {
              event.stopPropagation();
            },
          });
          store.longPressing = false;
        }}
        onMouseDown={() => {
          store.handleMouseDown();
        }}
        onMouseUp={(event) => {
          store.handleMouseUp({
            type: "mouse up",
            stopPropagation() {
              event.stopPropagation();
            },
          });
        }}
        onMouseOut={() => {
          store.handleMouseOut();
        }}
      >
        {props.children}
      </div>
    );
  }
);
