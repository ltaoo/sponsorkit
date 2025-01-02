import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 初始化时
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function useInitialize(fn: Function) {
  const initialized_ref = useRef(false);
  // const [initialized, setInitialized] = useState(false);

  useState(() => {
    if (initialized_ref.current) {
      return;
    }
    initialized_ref.current = true;
    fn();
  });
  // const constructor = () => {
  //   if (initialized_ref.current) {
  //     return;
  //   }
  //   initialized_ref.current = true;
  //   if (fn) {
  //     fn();
  //   }
  // };
  // useMemo(() => {
  //   if (initialized) {
  //     return;
  //   }
  //   // initialized_ref.current = true;
  //   // setInitialized(true);
  //   if (fn) {
  //     fn();
  //   }
  // }, [initialized]);
  // constructor();
}
// export function onUnmount(fn: Function) {
//   useEffect(() => {
//     return () => {
//       fn();
//     };
//   }, []);
// }

// export function onMount(fn: Function) {
//   useEffect(() => {
//     fn();
//   }, []);
// }

export function useLatestValue(v: unknown) {
  const ref = useRef(v);
  useEffect(() => {
    ref.current = v;
  }, [v]);
  return ref;
}

type Factory = () => unknown;
// const _cache: Map<Factory, ReturnType<Factory>> = new Map();
export function useInstance<T extends Factory>(fn: T) {
  const v = useMemo(() => fn(), []) as ReturnType<T>;
  return v;
  // const ref = useRef<ReturnType<T>>(
  //   (() => {
  //     if (_cache.get(fn)) {
  //       const r = _cache.get(fn) as ReturnType<T>;
  //       return r;
  //     }
  //     const resp = fn();
  //     _cache.set(fn, resp);
  //     return resp as ReturnType<T>;
  //   })()
  // );
  // useEffect(() => {
  //   return () => {
  //     _cache.delete(fn);
  //   };
  // }, []);
  // return ref.current;
}

export function useDomainState<
  T extends {
    state: unknown;
    onStateChange: (handler: (v: unknown) => void) => void;
  }
>(domain: T) {
  const [state, setState] = useState(domain.state);

  useEffect(() => {
    domain.onStateChange((nextState) => {
      setState(nextState);
    });
  }, []);

  return state;
}
