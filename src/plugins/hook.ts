// 似乎只能用来移动 geetest，实际测试效果不如部分 model 不采用 dialog，
// 此外还需要考虑 sse 更新触发的 geetest dom 显示在 dialog 后的问题
// toast 只能放在 dialog 按需重复调用
// const originalOpen = HTMLDialogElement.prototype.showModal;
// const originalClose = HTMLDialogElement.prototype.close;
// HTMLDialogElement.prototype.showModal = function() {
//     const toast = document.querySelector('.toast2') // 偷一个最新的 toast
//     const dialog = document.querySelectorAll<HTMLDialogElement>('dialog')
//     if (dialog?.length && toast) { // 取最后一个 dialog
//         let fakeToast = toast.cloneNode(true) as HTMLElement;
//         fakeToast.className += ' toast3'
//         dialog[dialog.length - 1].appendChild(fakeToast)
//     }
//     originalOpen.call(this);
// };
// HTMLDialogElement.prototype.close = function() {
//     const fakeToast = document.querySelector('.toast3')
//     if (fakeToast) fakeToast.remove()
//     originalClose.call(this);
// };