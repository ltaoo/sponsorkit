import { base, Handler } from "@/domains/base";
import { CanvasPointer } from "@/domains/pointer";

function to_fixed(v: string | number, num = 1) {
  return parseFloat(Number(v).toFixed(num));
}

type SliderCoreProps = {
  defaultValue: number;
  min: number;
  max: number;
  disabled?: boolean;
};

export function SliderCore(props: SliderCoreProps) {
  const { defaultValue, min = 0, max = 100, disabled = false } = props;

  const $pointer = CanvasPointer();

  let _min = min;
  let _max = max;
  let _disabled = disabled;
  let _slider_width = 0;
  // let _thumb_width = 16;
  let _left = ((defaultValue - _min) / (_max - _min)) * 100;
  // console.log(defaultValue - _min, _max - _min);
  let _initial_left = (_left / 100) * _slider_width;

  const _state = {
    get value() {
      return to_fixed(((_max - _min) * _left) / 100 + _min, 0);
    },
    get left() {
      return _left;
    },
    get disabled() {
      return _disabled;
    },
  };

  enum Events {
    Change,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Change]: number;
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  $pointer.onMove(({ dx }) => {
    console.log("[DOMAIN]ui/slider - onMove", _slider_width, dx);
    if (_slider_width === 0) {
      return;
    }
    // const left = (_initial_offset / 100) * _slider_width;
    let offset = parseFloat(
      (((_initial_left + dx) / _slider_width) * 100).toFixed(2)
    );
    if (offset < 0) {
      offset = 0;
    }
    if (offset > 100) {
      offset = 100;
    }
    _left = offset;
    bus.emit(Events.StateChange, { ..._state });
    //     store.updateStop(_stop, { offset });
  });
  $pointer.onPointerUp(() => {
    _initial_left = (_left / 100) * (_max - _min);
  });

  return {
    shape: "slider" as const,
    ui: {
      $pointer,
    },
    state: _state,
    get value() {
      return _state.value;
    },
    setWidth(w: number) {
      console.log("[DOMAIN]ui/slider/index - setWidth", w);
      // _slider_width = w - _thumb_width;
      _slider_width = w;
      _initial_left = (_left / 100) * _slider_width;
    },
    setOffset(v: number) {
      _initial_left = v;
    },
    setMax(v: number) {
      _max = v;
    },
    setMin(v: number) {
      _min = v;
    },
    setValue(v: number) {
      _left = v;
    },
    enable() {
      _disabled = false;
      bus.emit(Events.StateChange, { ..._state });
    },
    disable() {
      _disabled = true;
      bus.emit(Events.StateChange, { ..._state });
    },
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
      return bus.on(Events.Change, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type SliderCore = ReturnType<typeof SliderCore>;
