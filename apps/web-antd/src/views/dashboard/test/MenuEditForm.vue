<script lang="ts" setup>
  import { useVbenModal } from '@vben/common-ui';
  import { useVbenForm } from '#/adapter/form';
  
  const emit = defineEmits<{
    success: [];
  }>();

  const [BaseForm, formApi] = useVbenForm({
    showDefaultActions: false,
    layout: 'horizontal',
    schema: [
      {
        component: 'Input',
        fieldName: 'title',
        label: '名称',
        rules: 'required',
        componentProps: {
          placeholder: '请输入名称',
        },
      },
    ],
  });

  const [Modal, modalApi] = useVbenModal({
    onCancel() {
      modalApi.close();
    },
    onConfirm() {
      console.info('onConfirm');
    },
    onOpenChange(isOpen: boolean) {
      if (isOpen) {
        const formData = modalApi.getData<Record<string, any>>();
        if (formData) {
          formApi.setValues({ title: formData.title || '' });
        }
      } else {
        formApi.resetForm();
      }
    },
  });
</script>
<template>
  <Modal title="编辑菜单" class="w-[800px]">
    <BaseForm class="mx-4" />
  </Modal>
</template>
