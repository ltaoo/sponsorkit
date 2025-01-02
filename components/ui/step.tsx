import React, { useState } from "react";

import { useInitialize } from "@/hooks/index";
import { StepCore } from "@/domains/step";

export const StepSwitch = React.memo(
  (props: { store: StepCore; options: Record<number, React.ReactNode> } & React.AllHTMLAttributes<HTMLDivElement>) => {
    const { store, options } = props;

    const [state, setState] = useState(store.state);

    useInitialize(() => {
      store.onStateChange((nextState) => {
        setState(nextState);
      });
    });

    const elm = options[state.value];

    return <>{elm}</>;
  }
);
