<template>
  <div class="s-frame flex-col">
    <span class="font-bold text-4xl">虚拟机管理</span>
<!--  未开放  -->
    <div v-if="!isOpen && isDefault" role="alert" class="rounded border-s-4 border-info bg-info/10 p-4 mt-4">
      <strong class="block font-bold text-lg">虚拟机当前未开放使用</strong>
      <p class="mt-2 text-sm">
        当前不属于上课时间或教师未分配虚拟机使用，请联系授课老师
      </p>
    </div>
<!--  开放  -->
    <div v-else-if="isDefault" role="alert" class="rounded border-s-4 border-success bg-info/10 p-4 mt-4">
      <strong class="block font-bold text-lg">虚拟机分配成功，请下载后双击打开</strong>
      <p class="mt-4 text-sm">
        <a class="btn btn-info btn-sm px-4">点击下载虚拟机</a> 默认密码为你的学号。
      </p>
    </div>
<!--  数据库实验  -->
    <div v-if="!isDefault" class="grid gap-4 grid-cols-2 items-start">
      <div>
        <div role="alert" class="rounded border-s-4 border-success bg-info/10 p-4 mt-4">
          <strong class="block font-bold text-lg">数据库实验环境创建完成，请下载后双击打开</strong>
          <p class="mt-4">
            <a class="btn btn-info btn-sm px-4">点击下载虚拟机</a> 默认密码为你的学号。
          </p>
        </div>
        <div role="alert" class="rounded border-s-4 border-success bg-info/10 p-4 mt-4">
          <strong class="block font-bold text-lg">虚拟机环境变量</strong>
          <p class="mt-4">
            数据库用户名：root<br>
            数据库密码：123456<br>
            数据库端口：3306<br>
            数据库版本：Mysql 5.7<br>
          </p>
        </div>
      </div>
      <div role="alert" class="rounded border-s-4 border-info bg-info/10 p-4 mt-4">
        <strong class="block font-bold text-lg">实验任务点看板</strong>
        <p class="mt-2">
          任务简介：在虚拟机内通过使用数据库管理软件，完成数据库的创建、表的创建、数据的插入、查询、修改、删除等操作。
        </p>
        <div class="divider font-extrabold">任务要求</div>
        <label class="label cursor-pointer" v-for="k in tasks">
          <span>{{k}}</span>
          <input type="radio" class="radio radio-info" checked />
        </label>
      </div>
    </div>
    <div class="divider">虚拟机控制面板</div>
<!--  控制面板  -->
    <div class="flex justify-between">
      <div class="space-x-2">
        <button class="btn btn-info btn-sm btn-outline">重启</button>
        <button class="btn btn-info btn-sm btn-outline">关机</button>
        <button class="btn btn-info btn-sm btn-outline">重置密码</button>
        <button class="btn btn-info btn-sm btn-outline">故障上报</button>
      </div>
      <div class="shadow-md p-4 w-1/2">
        <div class="text-2xl font-bold text-center">学生虚拟机使用须知</div>
        <div class="divider" />
        <div role="alert" class="rounded border-s-4 border-info bg-info/10 py-2 px-4">
          <strong class="block font-bold text-lg">虚拟机环境禁止课程无关操作，请勿长时间占用虚拟机资源</strong>
        </div>
        <div role="alert" class="rounded border-s-4 border-info bg-info/10 py-2 px-4 mt-4">
          <strong class="block font-bold text-lg">虚拟机内文件重启后自动重置，重要文件请及时转移出去</strong>
        </div>
        <div role="alert" class="rounded border-s-4 border-info bg-info/10 py-2 px-4 mt-4">
          <strong class="block font-bold text-lg">虚拟机长时间（30分钟）无人链接将自动关机，请注意使用时间</strong>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, ref} from "vue";
  import {useRoute} from "vue-router";

  const isOpen = ref(false)
  const route = useRoute()
  const isDefault = computed(() => route.params.id === 'default')
  const tasks = [
      '1.使用管理软件创建名为【work-01】的数据库',
      '2.在【work-01】数据库中创建名为【student】的表，表中包含【学号】、【姓名】、【性别】、【年龄】、【班级】五个字段',
      '3.在【student】表中插入至少5条数据',
  ]
</script>