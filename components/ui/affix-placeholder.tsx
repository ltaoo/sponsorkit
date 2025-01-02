import React, { useEffect, useState } from "react";

import { AffixCore } from "@/domains/ui/affix";
import { useInitialize } from "@/hooks";

export function AffixPlaceholder(props: { store: AffixCore }) {
  const { store } = props;
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    store.onStateChange((v) => {
      setState(v);
    });
  });
  return state.fixed ? <div style={{ height: state.height }} /> : null;
}
