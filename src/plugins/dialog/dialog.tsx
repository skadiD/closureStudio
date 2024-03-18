import { createApp } from "vue";
import MyDialog from "./MyDialog.vue";
const showDialog = (title: string, content: string, onClick: () => void) => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const app = createApp(MyDialog, {
        title,
        content,
        onClick() {
            onClick();
            app.unmount();
            div.remove();
        }
    });
    app.mount(div);
};

export default showDialog;
