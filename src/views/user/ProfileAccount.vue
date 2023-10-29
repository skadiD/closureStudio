<template>
  <div class="p-2 grid grid-cols-2 gap-4">
    <div class="s-combo">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">可露希尔通行证 / 账号邮箱</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">注册时间</label>
    </div>
    <div class="s-combo col-span-2">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">当前密码</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">新密码（如需修改）</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">重复新密码</label>
    </div>
    <button class="btn btn-info btn-sm btn-block col-span-2 mt-2">提交修改</button>
  </div>
</template>
<script setup>
</script>