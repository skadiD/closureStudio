import { createApp, h } from "vue";
import DialogWrapper from "./DialogWrapper.vue";

// DialogComponentProps 规定了传入组件必须包含的 props
export interface DialogComponentProps {
  dialogClose: () => void;
}

const showDialog = <T extends DialogComponentProps>(
  Component: new () => { $props: T },
  componentProps: Partial<T> = {}
) => {
  const div = document.createElement("div");
  document.body.appendChild(div);

  const closeDialog = () => {
    app.unmount();
    div.remove();
  };

  // 创建 Vue app
  const app = createApp({
    render() {
      return h(DialogWrapper, {
        component: Component,
        dialogClose: closeDialog, // 将 closeDialog 传递给 DialogWrapper
        componentProps, // 将 `componentProps` 传递给 `DialogWrapper`
      });
    },
  });
  app.mount(div);
};

export default showDialog;
