<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createMenu } from '#/api/sys/menu';
import { getAllMenusApi } from '#/api';
const emit = defineEmits<{
  success: [];
}>();
const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: onSubmit,
  //   try {
  //     loading.value = true;
  //     const values = await formApi.getValues();
  //     await useMenuApi().createMenu(values);
  //     message.success('菜单创建成功');
  //     Drawer.close();
  //   } catch (e) {
  //     message.error(`创建失败: ${e?.message}`);
  //   } finally {
  //     loading.value = false;
  //   }
  // }
});

const menuTypeOptions = [
  { label: '菜单', value: 'menu' },
  { label: '权限', value: 'permission' },
  { label: '按钮', value: 'button' },
];

const [BaseForm, formApi] = useVbenForm({
  // 是否显示提交和重置按钮
  showDefaultActions: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  // handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        class: 'bg-red-500 text-white border-gray-300 checked:bg-red-500',
        optionType: 'button',
        options: menuTypeOptions,
      },
      defaultValue: 'menu',
      fieldName: 'types',
      label: '类型:',
      formItemClass: 'col-span-3 md:col-span-2',
    },
    {
      component: 'ApiSelect',
      fieldName: 'menu',
      label: '上级菜单',
      rules: 'required',
      dependencies: {
        show(values) {
          return ['permission'].includes(values.types);
        },
        triggerFields: ['types'],
      },
      componentProps: {
        // 菜单接口转options格式
        afterFetch: (data: { name: string; id: number }[]) => {
          return data.map((item: any) => {
            return {
              label: item.name,
              value: item.id,  // 保持数字类型
            };
          });
        },
        api: getAllMenusApi,
        autoSelect: 'first',
        //numberToString: true,  // 自动将数字转为字符串
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: '名称',
      rules: 'required',
      // 假设使用 showIf 替代 visibleIf，具体需根据 FormSchema 类型定义调整
      dependencies: {
        show(values) {
          return ['button', 'menu','permission'].includes(values.types);
        },
        triggerFields: ['types'],
      },
      componentProps: {
        placeholder: '请输入菜单|权限|按钮名称',
      },
    },
    {
      component: 'IconPicker',
      componentProps: {
        prefix: 'carbon',
      },
      dependencies: {
        show(values) {
          return ['menu', 'permission'].includes(values.types);
        },
        triggerFields: ['types'],
      },
      fieldName: 'icon',
      label: '图标',
    },
    {
      component: 'Input',
      fieldName: 'permissionCode',
      label: '权限标识',
      dependencies: {
        show: (values) => values.types === 'button',
        triggerFields: ['types'],
      },
      componentProps: {
        placeholder: '请输入权限代码',
      },
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'path',
      label: '路由地址:',
      rules: 'required',
      dependencies: {
        show(values) {
          return values.types === 'permission';
        },
        triggerFields: ['types'],
        required(values) {
          return values.types === 'permission';
        },
      },
      componentProps: {
        placeholder: '请输入路由地址',
      },
    },
    {
      component: 'Input',
      fieldName: 'component',
      label: 'Component:',
      rules: 'required',
      dependencies: {
        show(values) {
          return values.types === 'permission';
        },
        triggerFields: ['types'],
        required(values) {
          return values.types === 'permission';
        },
      },
      componentProps: {
        placeholder: '请输入路由地址',
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '数字小排序靠前',
      },
      fieldName: 'sort',
      label: '排序:',
      rules: 'required',
      dependencies: {
        show(values) {
          return ['menu'].includes(values.types);
        },
        triggerFields: ['types'],
      },
    },  
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
        optionType: 'button',
      },
      dependencies: {
        show: (values) => values.types === 'menu',
        triggerFields: ['types'],
      },
      defaultValue: 1,
      fieldName: 'is_show',
      label: '状态：',
    },
  ],
  wrapperClass: 'grid grid-cols-1 gap-2',
});
// function onSubmit(values: Record<string, any>) {
//   message.success({
//     content: `form values: ${JSON.stringify(values)}`,
//   });
// }
async function onSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    drawerApi.lock();
    const values = await formApi.getValues();
    try {
      // @ts-ignore
      await createMenu(values); // 仅调用新增接口
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  }
}
</script>

<template>
  <Drawer title="新增菜单" class="w-[800px]">
    <BaseForm class="mx-4" />
  </Drawer>
</template>
