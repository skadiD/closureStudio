<template>
  <a class="text-3xl mt-2 text-info font-bold">托管详情</a>
  <div class="divider">账号信息</div>
  <div class="w-full grid grid-cols-3 justify-items-center">
    <div class="flex flex-col" v-for="m in 3">
        <span class="text-base-content/70 text-3xl font-bold">{{ ['龙门币', '合成玉', '源石'][m-1] }}</span>
      <span class="text-3xl font-bold text-center mt-2">{{ ['0', '0', '0'][m-1] }}</span>
    </div>
  </div>
  <div class="divider text-info text-lg font-bold"> 理智溢出: 2023-07-30 00:37:15 </div>
  <a class="btn btn-info btn-outline btn-block my-1">托管配置</a>
  <div class="divider">不实时日志</div>
  <div class="h-[calc(100vh-32rem)] overflow-hidden">
    <table class="text-[1rem]" >
      <tbody>
      <tr v-for="k in 10">
        <td class="text-info whitespace-nowrap">07-29 11:13</td>
        <td class="pl-2">[泠夭v2] 下次基建排班将在 2023-07-29 14:13:17 自动进行</td>
      </tr>
      </tbody>
    </table>
  </div>
  <a class="btn btn-block btn-info mt-2">查看托管截图</a>
</template>
