<script lang="ts" setup>
import { nextTick } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { updateMenu, getMenu } from '#/api/sys/menu';
import { getAllMenusApi } from '#/api';

const emit = defineEmits<{
  success: [];
}>();

// 子组件：调用 useVbenModal()（不带 connectedComponent）
// 通过 inject 自动获取父组件（index.vue）提供的 modalApi
// 注意：这里的 onConfirm 会覆盖父组件中的 onConfirm（如果有）
// onOpenChange 事件会在父组件和子组件中都触发
const [Modal, modalApi] = useVbenModal({
  onConfirm: async () => {
    await handleSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // Modal 打开时，填充表单数据
      const formData = modalApi.getData<Record<string, any>>();
      // 调试日志：检查接收到的数据
      console.log('onOpenChange formData:', formData);
      console.log('onOpenChange formData.id:', formData?.id);
      if (formData) {
        // 关键步骤：先设置 types 字段，让依赖系统能够正确响应
        // 这是为了让表单根据 types 值（menu/permission/button）显示/隐藏对应的字段
        if (formData.types) {
          formApi.setFieldValue('types', formData.types);
        }
        
        // 等待依赖系统处理 types 字段的变化
        // 使用多个 nextTick 确保依赖更新完成，所有依赖字段都已显示
        nextTick(() => {
          nextTick(() => {
            // 先设置所有字段值（不包含 types，因为已经设置过了）
            const { types, ...restData } = formData;
            formApi.setValues(restData);
            
            // 特别处理关键字段，确保它们被正确设置
            // 1. is_show：确保类型为 menu 时，状态值被正确设置
            if (formData.is_show !== undefined && formData.is_show !== null) {
              // 确保是数字类型
              const isShowValue = Number(formData.is_show);
              formApi.setFieldValue('is_show', isShowValue);
            }
            
            // 2. permissionCode：确保类型为 button 时，权限标识被正确设置
            if (formData.permissionCode !== undefined) {
              // 即使为空字符串也要设置
              formApi.setFieldValue('permissionCode', formData.permissionCode || '');
            }
            
            // 最后再次确保 types 字段正确设置（防止被覆盖）
            if (formData.types) {
              formApi.setFieldValue('types', formData.types);
            }
          });
        });
      }
    } else {
      // Modal 关闭时，清空表单
      formApi.resetForm();
    }
  },
});

const menuTypeOptions = [
  { label: '菜单', value: 'menu' },
  { label: '权限', value: 'permission' },
  { label: '按钮', value: 'button' },
];

const [BaseForm, formApi] = useVbenForm({
  showDefaultActions: false,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
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
      hide: true, // 隐藏类型标签，但字段值仍然存在用于依赖判断
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
        afterFetch: (data: { name: string; id: number }[]) => {
          return data.map((item: any) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        },
        api: getAllMenusApi,
        autoSelect: 'first',
      },
    },
    {
      component: 'ApiSelect',
      fieldName: 'button_id',
      label: '权限',
      rules: 'required',
      dependencies: {
        show(values) {
          return ['button'].includes(values.types);
        },
        triggerFields: ['types'],
      },
      componentProps: {
        afterFetch: (response: any) => {
          let items: any[] = [];
          
          if (response?.data?.items) {
            items = response.data.items;
          } else if (response?.items) {
            items = response.items;
          } else if (Array.isArray(response)) {
            items = response;
          }
          
          const result: Array<{ label: string; value: number | string }> = [];
          
          items.forEach((item: any) => {
            if (item.permissions && Array.isArray(item.permissions)) {
              item.permissions.forEach((perm: any) => {
                if (perm.title) {
                  result.push({
                    label: perm.title,
                    value: perm.id || perm.title,
                  });
                }
              });
            }
          });
          
          return result;
        },
        api: getMenu,
        autoSelect: 'first',
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: '名称',
      rules: 'required',
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
      label: 'Component',
      componentProps: {
        placeholder: '请输入', // 默认占位符
      },
      dependencies: {
        show(values) {
          return ['button', 'permission'].includes(values.types);
        },
        triggerFields: ['types'],
      },
      rules: 'required',
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
      // 移除 defaultValue，让传入的值优先
      fieldName: 'is_show',
      label: '状态：',
    },
  ],
  wrapperClass: 'grid grid-cols-1 gap-2',
});

async function handleSubmit() {
  const { valid } = await formApi.validate();
  if (valid) {
    modalApi.lock();
    const values = await formApi.getValues();
    const formData = modalApi.getData<{ id?: number; _X_ROW_SEQ?: any; permissionId?: number }>();
    
    // 调试日志：检查 formData 内容
    console.log('handleSubmit formData:', formData);
    console.log('handleSubmit formData.id:', formData?.id);
    
    try {
      if (formData?.id) {
        // 编辑模式 - 准备发送给后端的参数
        const updateParams: any = {
          id: formData.id,
          // 基础字段
          title: values.title,
          icon: values.icon || '',
          // 类型字段（后端可能需要 type 而不是 types）
          type: values.types || 'menu',
          // 根据类型设置不同的字段
          ...(values.types === 'permission' && {
            path: values.path || '',
            component: values.component || '',
            menu: values.menu || undefined,
          }),
          ...(values.types === 'button' && {
            component: values.component || '',
            button_id: values.button_id || undefined,
            permissionId: formData.permissionId || undefined,
          }),
          ...(values.types === 'menu' && {
            sort: values.sort || 0,
            is_show: values.is_show ?? 1,
            path: values.path || '',
          }),
          // 保留其他可能需要的字段
          permissionCode: values.permissionCode || values.component || '',
        };
        
        // 添加内部字段（如果需要）
        if (formData._X_ROW_SEQ !== undefined) {
          updateParams._X_ROW_SEQ = formData._X_ROW_SEQ;
        }
        
        console.log('发送给后端的参数:', updateParams);
        await updateMenu(updateParams);
        message.success('更新成功');
        modalApi.close();
        emit('success');
      } else {
        // 更详细的错误信息
        console.error('handleSubmit: formData is missing id', { formData, values });
        message.error(`缺少ID，无法更新。请检查数据是否正确传递。formData: ${JSON.stringify(formData)}`);
      }
    } catch (error: any) {
      console.error('更新失败:', error);
      message.error(error?.message || '更新失败');
    } finally {
      modalApi.unlock();
    }
  }
}
</script>

<template>
  <Modal title="编辑菜单" class="w-[800px]">
    <BaseForm class="mx-4" />
  </Modal>
</template>

