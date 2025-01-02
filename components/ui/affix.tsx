import React, { useEffect, useState } from "react";

import { useInitialize } from "@/hooks/index";
import { AffixCore } from "@/domains/ui/affix";
import { cn } from "@/utils/index";

export const Affix = React.memo((props: { store: AffixCore } & React.HTMLAttributes<HTMLDivElement>) => {
  const { store, ...restProps } = props;
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => {
      setState(v);
    });
  });
  //   const background = (() => {
  //     if (!backgroundMap) {
  //       return "initial";
  //     }
  //     if (state.fixed) {
  //       return backgroundMap.fixed;
  //     }
  //     return backgroundMap.unfixed;
  //   })();
  const styles: React.CSSProperties = {
    ...restProps.style,
    //     ...state.style,
    position: state.fixed ? "fixed" : "unset",
    top: state.top,
  };
  //   if (background) {
  //     styles.background = background;
  //   }

  return (
    <div className="affix">
      <div
        className={cn("__a", restProps.className)}
        style={styles}
        onAnimationEnd={(event) => {
          const $node = event.currentTarget;
          //   store.setNode($node);
          store.setRect(() => {
            const rect = $node.getBoundingClientRect();
            return {
              top: rect.top,
              height: rect.height,
            };
          });
          const rect = $node.getBoundingClientRect();
          store.handleMounted(rect);
          //   if (!store.needRegisterAgain) {
          //     return;
          //   }
          //   store.register({
          //     top: rect.top,
          //     height: rect.height,
          //   });
        }}
      >
        {props.children}
      </div>
      {state.fixed && <div style={{ height: state.height }} />}
    </div>
  );
});
