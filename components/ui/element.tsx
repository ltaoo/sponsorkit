import React, { useEffect } from "react";

import { ElementCore } from "@/domains/ui/element";

export function Element(
  props: { store: ElementCore } & { children: React.ReactElement }
) {
  const { store } = props;
  useEffect(() => {
    store.mount();
    return () => {
      store.unmount();
    };
  }, []);

  return props.children;
}
