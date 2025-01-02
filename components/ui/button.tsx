/**
 * @file 按钮
 */
import React, { useState } from "react";
import { VariantProps, cva } from "class-variance-authority";
import { Loader } from "lucide-react";

import { Show } from "@/packages/ui/show";
import { useInitialize } from "@/hooks/index";
import { ButtonCore } from "@/domains/ui/button";
import { cn } from "@/utils/index";

const buttonVariants = cva(
  "active:scale-95 inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800",
  {
    variants: {
      variant: {
        default: "bg-w-brand text-white",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600",
        outline: "bg-transparent border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100",
        subtle: "bg-w-fg-5 text-w-fg-0",
        ghost:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100 dark:hover:text-slate-100 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
        link: "bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent dark:hover:bg-transparent",
      },
      size: {
        default: "py-2 px-4",
        sm: "px-2 text-sm rounded-md",
        lg: "py-2 px-8 text-md font-normal rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.memo(
  (
    props: {
      store: ButtonCore<any>;
    } & VariantProps<typeof buttonVariants> &
      Omit<React.HTMLAttributes<HTMLElement>, "size">
  ) => {
    const { store, variant, size } = props;

    const [state, setState] = useState(store.state);

    useInitialize(() => {
      store.onStateChange((nextState) => {
        setState(nextState);
      });
    });

    const { disabled, loading } = state;
    const c = buttonVariants({ variant, size, class: cn(props.className, "w-full space-x-2") });

    return (
      <button
        className={c}
        role="button"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          store.click();
        }}
      >
        <Show when={loading}>
          <Loader className="w-4 h-4 mr-2 animation animate-spin" />
        </Show>
        {(() => {
          if (props.children) {
            return props.children;
          }
          if (state.text) {
            return state.text;
          }
          return "确定";
        })()}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
