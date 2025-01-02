import { FormCore, InputCore } from "@/domains/ui";
import { FormFieldCore } from "@/domains/ui/form/field";
import { ImageUploadCore } from "@/domains/ui/form/image-upload";

import { Input } from "./ui/input";
import { ImageUpload } from "./ui/image-upload";

export function SponsorForm(props: {
  store: FormCore<{
    text: FormFieldCore<InputCore<string>>;
    image: FormFieldCore<ImageUploadCore>;
    href: FormFieldCore<InputCore<string>>;
  }>;
}) {
  const { store } = props;

  const fieldCx = "";
  const labelCx = "text-[14px] color-[#59636e]";
  const inputCx = "mt-1";

  return (
    <div className="flex">
      <ImageUpload
        className="relative mt-8 w-[98px] h-[98px]"
        store={store.fields.image.$input}
      />
      <div className="flex-1 ml-4 space-y-2">
        <div className={fieldCx}>
          <label className={labelCx}>{store.fields.text.label}</label>
          <div className={inputCx}>
            <Input store={store.fields.text.$input} />
          </div>
        </div>
        <div className={fieldCx}>
          <label className={labelCx}>{store.fields.href.label}</label>
          <div className={inputCx}>
            <Input store={store.fields.href.$input} />
          </div>
        </div>
      </div>
    </div>
  );
}
